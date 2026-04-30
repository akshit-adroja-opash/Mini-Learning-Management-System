import express from "express";
import { addComment, getComments, togglePinComment } from "../controllers/discussionsController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:lessonId", protect, asyncHandler(addComment));
router.get("/:lessonId", protect, asyncHandler(getComments));
router.put("/:id/pin", protect, asyncHandler(togglePinComment));

export default router;
