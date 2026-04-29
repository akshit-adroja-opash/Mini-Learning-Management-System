import Course from "../models/Course.js";
import mongoose from "mongoose";

export const createCourse = async (req, res) => {
  const { title } = req.body;
  const slug = title.toLowerCase().split(' ').join('-') + '-' + Date.now();

  const course = await Course.create({
    ...req.body,
    slug,
    instructor: req.user._id
  });

  res.json(course);
};

export const getCourses = async (req, res) => {
  const courses = await Course.find().populate("instructor", "name email");

  res.json(courses);
};

export const getCourse = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ msg: "Invalid Course ID" });
  }
  const courseId = new mongoose.Types.ObjectId(req.params.id);
  const userId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;
  
  const results = await Course.aggregate([
    { $match: { _id: courseId } },
    {
      $lookup: {
        from: "modules",
        localField: "_id",
        foreignField: "course",
        as: "modules"
      }
    },
    { $unwind: { path: "$modules", preserveNullAndEmptyArrays: true } },
    { $sort: { "modules.order": 1 } },
    {
      $lookup: {
        from: "lessons",
        localField: "modules._id",
        foreignField: "module",
        as: "modules.lessons"
      }
    },
    // Quiz Lookup
    {
      $lookup: {
        from: "quizzes",
        localField: "modules._id",
        foreignField: "module",
        as: "modules.quiz"
      }
    },
    { $unwind: { path: "$modules.quiz", preserveNullAndEmptyArrays: true } },
    // Group back to course
    { $group: { _id: "$_id", root: { $first: "$$ROOT" }, modules: { $push: "$modules" } } },
    {
      $addFields: {
        modules: {
          $filter: {
            input: "$modules",
            as: "m",
            cond: { $gt: [{ $type: "$$m._id" }, "missing"] }
          }
        }
      }
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$root", { modules: "$modules" }]
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "instructor",
        foreignField: "_id",
        as: "instructor"
      }
    },
    { $unwind: "$instructor" },
    {
      $project: {
        "instructor.passwordHash": 0,
        "instructor.role": 0,
        "instructor.__v": 0
      }
    }
  ]);

  if (!results.length) return res.status(404).json({ msg: "Course not found" });
  
  const finalCourse = results[0];
  
  // Progress Logic (Simplified for now, can be expanded to aggregation if needed)
  if (userId && finalCourse.modules) {
    for (let mod of finalCourse.modules) {
       // Mocking isLocked logic for now: first module is open
       mod.isLocked = mod.order > 1; 
    }
  }

  res.json(finalCourse);
};

export const getInstructorCourses = async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id });

  res.json(courses);
}
