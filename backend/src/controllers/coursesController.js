import Course from "../models/Course.js";
import mongoose from "mongoose";

export const createCourse = async (req, res) => {
  const { title, thumbnailUrl } = req.body;
  
  const slug = title.toLowerCase().split(' ').join('-') + '-' + Date.now();

  const course = await Course.create({
    ...req.body,
    status: req.body.status || 'published',
    slug,
    instructor: req.user._id
  });

  res.json(course);
};

export const getCourses = async (req, res) => {
  const courses = await Course.aggregate([
    { $match: { status: 'published' } },
    {
      $lookup: {
        from: 'modules',
        localField: '_id',
        foreignField: 'course',
        as: 'modules'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'instructor',
        foreignField: '_id',
        as: 'instructor'
      }
    },
    { $unwind: '$instructor' },
    {
      $addFields: {
        moduleCount: { $size: '$modules' }
      }
    },
    {
      $project: {
        modules: 0,
        'instructor.password': 0
      }
    }
  ]);

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
    {
      $lookup: {
        from: "quizzes",
        localField: "modules._id",
        foreignField: "module",
        as: "modules.quiz"
      }
    },
    { $unwind: { path: "$modules.quiz", preserveNullAndEmptyArrays: true } },
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
    { $unwind: "$instructor" }
  ]);

  if (!results.length) return res.status(404).json({ msg: "Course not found" });
  
  const finalCourse = results[0];
  if (finalCourse.instructor) {
    delete finalCourse.instructor.passwordHash;
  }
  finalCourse.modules = (finalCourse.modules || [])
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((module) => ({
      ...module,
      lessons: (module.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0)),
    }));
  
  if (userId && finalCourse.modules) {
    const QuizAttempt = mongoose.model("QuizAttempt");
    const LessonProgress = mongoose.model("LessonProgress");

    // Get all passed quizzes for this user and course
    const passedQuizzes = await QuizAttempt.find({
      learner: userId,
      course: courseId,
      passed: true
    }).select("module");

    const passedModuleIds = new Set(passedQuizzes.map(q => q.module.toString()));

    // Get all lesson progress for this user and course
    const progressRecords = await LessonProgress.find({
      learner: userId,
      course: courseId
    });

    const progressMap = new Map(progressRecords.map(p => [p.lesson.toString(), p]));

    let prevModulePassed = true; // First module is always unlocked

    for (let i = 0; i < finalCourse.modules.length; i++) {
      const mod = finalCourse.modules[i];
      
      // A module is locked if the previous one wasn't "completed"
      // For simplicity: Module 1 is open. Module N is open if Module N-1 is passed.
      mod.isLocked = !prevModulePassed;
      
      // Check if this module is "passed" (has a passed quiz or no quiz)
      const hasQuiz = !!mod.quiz;
      const quizPassed = hasQuiz ? passedModuleIds.has(mod._id.toString()) : true;
      
      // Update prevModulePassed for next iteration
      prevModulePassed = quizPassed;

      // Attach progress to lessons
      if (mod.lessons) {
        for (let lesson of mod.lessons) {
          lesson.progress = progressMap.get(lesson._id.toString()) || { isCompleted: false, watchedPercent: 0 };
        }
      }

      const completedLessons = (mod.lessons || []).filter((lesson) => lesson.progress?.isCompleted).length;
      mod.completedLessonCount = completedLessons;
      mod.totalLessonCount = mod.lessons?.length || 0;
      mod.isCompleted = mod.totalLessonCount > 0 && completedLessons === mod.totalLessonCount && quizPassed;
    }

    const allLessons = finalCourse.modules.flatMap((mod) => mod.lessons || []);
    const completedLessons = allLessons.filter((lesson) => lesson.progress?.isCompleted).length;
    finalCourse.progress = {
      completedLessons,
      totalLessons: allLessons.length,
      percent: allLessons.length ? Math.round((completedLessons / allLessons.length) * 100) : 0,
    };
  }

  res.json(finalCourse);
};

export const getInstructorCourses = async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id });

  res.json(courses);
};

export const updateCourse = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ msg: 'Invalid Course ID' });
  }

  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ msg: 'Course not found' });

  // Only the instructor who owns it or an admin can update
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized to update this course' });
  }

  const allowedFields = ['title', 'description', 'category', 'level', 'thumbnailUrl', 'promoVideoUrl', 'status', 'price'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) course[field] = req.body[field];
  });

  // Regenerate slug if title changed
  if (req.body.title) {
    course.slug = req.body.title.toLowerCase().split(' ').join('-') + '-' + Date.now();
  }

  await course.save();
  res.json(course);
};

export const deleteCourse = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ msg: 'Invalid Course ID' });
  }

  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ msg: 'Course not found' });

  // Only the instructor who owns it or an admin can delete
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized to delete this course' });
  }

  const Module = mongoose.model('Module');
  const Lesson = mongoose.model('Lesson');
  const Enrollment = mongoose.model('Enrollment');

  // Cascade: get all module IDs
  const modules = await Module.find({ course: course._id }).select('_id');
  const moduleIds = modules.map((m) => m._id);

  // Delete all lessons in those modules
  if (moduleIds.length) {
    await Lesson.deleteMany({ module: { $in: moduleIds } });
  }

  // Delete all modules
  await Module.deleteMany({ course: course._id });

  // Delete all enrollments
  await Enrollment.deleteMany({ course: course._id });

  // Delete the course itself
  await Course.findByIdAndDelete(course._id);

  res.json({ msg: 'Course and all related data deleted successfully' });
};
