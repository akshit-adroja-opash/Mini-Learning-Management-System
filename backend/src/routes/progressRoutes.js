import express from "express";
import { getProgress, saveProgress } from "../controllers/progressController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Save (debounced every 10s)
router.post("/", protect, asyncHandler(saveProgress));

// Resume
router.get("/:lessonId", protect, asyncHandler(getProgress));

export default router;
