import express from "express";
import { createCourse, getCourse, getCourses, getInstructorCourses } from "../controllers/coursesController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Specific routes first
router.get("/instructor", protect, authorize("instructor", "admin"), asyncHandler(getInstructorCourses));

// Public routes
router.get("/", asyncHandler(getCourses));

// Parameterized routes last
router.get("/:id", protect, asyncHandler(getCourse));
router.post("/", protect, authorize("instructor", "admin"), asyncHandler(createCourse));

export default router;
