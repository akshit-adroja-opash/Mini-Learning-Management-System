import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import LessonProgress from "../models/LessonProgress.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Certificate from "../models/Certificate.js";
import Discussion from "../models/Discussion.js";

export const getUsers = async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;

  const regex = { $regex: search, $options: "i" };
  const query = {
    $or: [
      { email: regex },
      { name: regex }
    ]
  };

  const users = await User.find(query)
    .select("-password")
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await User.countDocuments(query);

  res.json({
    users,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit)
  });
};

export const updateUserRole = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  ).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Cleanup user-related data
  await Enrollment.deleteMany({ learner: userId });
  await LessonProgress.deleteMany({ learner: userId });
  await QuizAttempt.deleteMany({ learner: userId });
  await Certificate.deleteMany({ learner: userId });
  await Discussion.deleteMany({ author: userId });

  await User.findByIdAndDelete(userId);
  res.json({ message: "User and all associated data deleted" });
};

export const getAdminCourses = async (req, res) => {
  const courses = await Course.find().populate("instructor", "name email");
  res.json(courses);
};

export const deleteCourse = async (req, res) => {
  const courseId = req.params.id;
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // Find all related entities to delete their sub-entities
  const quizzes = await Quiz.find({ course: courseId });
  const quizIds = quizzes.map(q => q._id);

  // Cascading deletes
  await Question.deleteMany({ quiz: { $in: quizIds } });
  await QuizAttempt.deleteMany({ quiz: { $in: quizIds } });
  await Quiz.deleteMany({ course: courseId });

  await Discussion.deleteMany({ lesson: { $in: await Lesson.find({ course: courseId }).distinct("_id") } });
  await LessonProgress.deleteMany({ course: courseId });
  await Lesson.deleteMany({ course: courseId });
  await Module.deleteMany({ course: courseId });
  await Enrollment.deleteMany({ course: courseId });
  await Certificate.deleteMany({ course: courseId });

  await Course.findByIdAndDelete(courseId);

  res.json({ message: "Course and all associated content deleted successfully" });
};

export const getAdminAnalytics = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalCourses = await Course.countDocuments();
  const totalEnrollments = await Enrollment.countDocuments();

  const monthlyEnrollments = await Enrollment.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  res.json({
    totalUsers,
    totalCourses,
    totalEnrollments,
    monthlyEnrollments
  });
};
