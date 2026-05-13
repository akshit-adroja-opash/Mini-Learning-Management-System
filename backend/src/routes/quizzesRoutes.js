import express from "express";
import { submitQuiz } from "../controllers/quizzesController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Course from "../models/Course.js";

const router = express.Router();

// ─── Instructor Routes ───────────────────────────────────────────────

// Create quiz
router.post("/", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  // Verify instructor owns the course
  const course = await Course.findById(req.body.course);
  if (!course) return res.status(404).json({ msg: "Course not found" });
  if (course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({ msg: "Unauthorized: You do not own this course" });
  }
  const quiz = await Quiz.create(req.body);
  res.status(201).json(quiz);
}));

// Update quiz
router.put("/:id", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ msg: "Quiz not found" });
  // Verify instructor owns the course
  const course = await Course.findById(quiz.course);
  if (!course) return res.status(404).json({ msg: "Course not found" });
  if (course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({ msg: "Unauthorized: You do not own this course" });
  }
  const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json(updatedQuiz);
}));

// Delete quiz (and its questions)
router.delete("/:id", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ msg: "Quiz not found" });
  // Verify instructor owns the course
  const course = await Course.findById(quiz.course);
  if (!course) return res.status(404).json({ msg: "Course not found" });
  if (course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({ msg: "Unauthorized: You do not own this course" });
  }
  await Quiz.findByIdAndDelete(req.params.id);
  await Question.deleteMany({ quiz: req.params.id });
  res.json({ msg: "Quiz and its questions deleted" });
}));

// Add question to quiz
router.post("/:id/questions", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  if (!req.body.order) {
    const count = await Question.countDocuments({ quiz: req.params.id });
    req.body.order = count + 1;
  }
  const question = await Question.create({ ...req.body, quiz: req.params.id });
  res.status(201).json(question);
}));

// Get questions for a quiz (instructor view – includes isCorrect)
router.get("/:id/questions", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  const questions = await Question.find({ quiz: req.params.id }).select("+options.isCorrect").sort("order");
  res.json(questions);
}));

// Update a question
router.put("/questions/:qid", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndUpdate(req.params.qid, req.body, { new: true, runValidators: true });
  if (!question) return res.status(404).json({ msg: "Question not found" });
  res.json(question);
}));

// Delete a question
router.delete("/questions/:qid", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.qid);
  if (!question) return res.status(404).json({ msg: "Question not found" });
  res.json({ msg: "Question deleted" });
}));

// ─── Shared / Learner Routes ─────────────────────────────────────────

// Get module quiz status for learner
router.get("/course/:courseId/status", protect, asyncHandler(async (req, res) => {
  const quizAttempts = await QuizAttempt.find({ learner: req.user._id, course: req.params.courseId, passed: true });
  const passedModules = quizAttempts.reduce((acc, attempt) => {
    if (attempt.module) acc[attempt.module.toString()] = true;
    return acc;
  }, {});
  res.json({ passedModules });
}));

// Get quiz by module (learner view – no isCorrect)
router.get("/module/:moduleId", protect, asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ module: req.params.moduleId });
  if (quiz) {
    const questions = await Question.find({ quiz: quiz._id });
    return res.json({ ...quiz.toObject(), questions });
  }
  res.json(null);
}));

// Get quiz by id (learner view)
router.get("/:id", protect, asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ msg: "Quiz not found" });
  const questions = await Question.find({ quiz: req.params.id });
  res.json({ ...quiz.toObject(), questions });
}));

// Submit quiz attempt
router.post("/:id/submit", protect, authorize("learner"), asyncHandler(submitQuiz));

export default router;

