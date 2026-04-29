import { enroll, unenroll, getMyEnrollments } from "../controllers/enrollmentsController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.get("/me", protect, asyncHandler(getMyEnrollments));
router.post("/:courseId", protect, asyncHandler(enroll));
router.delete("/:courseId", protect, asyncHandler(unenroll));

export default router;
