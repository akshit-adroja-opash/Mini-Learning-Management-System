import express from "express";
import { submitQuiz } from "../controllers/quizzesController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:quizId/submit", protect, asyncHandler(submitQuiz));

export default router;
