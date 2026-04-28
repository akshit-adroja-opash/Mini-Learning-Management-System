import Course from "../models/Course.js";

export const createCourse = async (req, res) => {
  const course = await Course.create({
    ...req.body,
    instructor: req.user._id
  });

  res.json(course);
};

export const getCourses = async (req, res) => {
  const courses = await Course.find().populate("instructor", "name email");

  res.json(courses);
};

export const getCourse = async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate("instructor", "name email");

  res.json(course);
};
