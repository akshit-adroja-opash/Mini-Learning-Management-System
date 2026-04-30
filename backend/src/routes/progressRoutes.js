import express from "express";
import { getProgress, saveProgress } from "../controllers/progressController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Save (debounced every 10s)
router.post("/", protect, authorize("learner"), asyncHandler(saveProgress));

// Specific routes MUST come before wildcard routes
// Batch Progress for Course
router.get("/course/:courseId", protect, authorize("learner"), asyncHandler(async (req, res) => {
  const LessonProgress = (await import("../models/LessonProgress.js")).default;
  const progress = await LessonProgress.find({
    learner: req.user._id,
    course: req.params.courseId
  });
  res.json(progress);
}));

// Progress for specific lesson (used by useProgress hook)
router.get("/course/:courseId/lesson/:lessonId", protect, authorize("learner"), asyncHandler(getProgress));

// Generic resume by lessonId (wildcard - must be LAST)
router.get("/:lessonId", protect, authorize("learner"), asyncHandler(getProgress));

export default router;
