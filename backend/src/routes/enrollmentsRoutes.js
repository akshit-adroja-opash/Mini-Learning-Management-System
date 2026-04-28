import express from "express";
import { enroll, unenroll } from "../controllers/enrollmentsController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:courseId", protect, asyncHandler(enroll));
router.delete("/:courseId", protect, asyncHandler(unenroll));

export default router;
