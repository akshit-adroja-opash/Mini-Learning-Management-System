import express from "express";
import { submitQuiz } from "../controllers/quizzesController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

const router = express.Router();

// Instructor Routes
router.post("/", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  const quiz = await Quiz.create(req.body);
  res.status(201).json(quiz);
}));

router.post("/:id/questions", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  if (!req.body.order) {
    const count = await Question.countDocuments({ quiz: req.params.id });
    req.body.order = count + 1;
  }
  const question = await Question.create({ ...req.body, quiz: req.params.id });
  res.status(201).json(question);
}));

router.get("/module/:moduleId", protect, asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ module: req.params.moduleId });
  if (quiz) {
    const questions = await Question.find({ quiz: quiz._id });
    return res.json({ ...quiz.toObject(), questions });
  }
  res.json(null);
}));

// Learner Routes
router.get("/:id", protect, asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ msg: "Quiz not found" });
  const questions = await Question.find({ quiz: req.params.id });
  res.json({ ...quiz.toObject(), questions });
}));

router.post("/:id/submit", protect, authorize("learner"), asyncHandler(submitQuiz));

export default router;
