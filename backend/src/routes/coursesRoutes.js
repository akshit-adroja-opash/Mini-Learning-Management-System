import express from "express";
import { createCourse, getCourse, getCourses, getInstructorCourses, updateCourse, deleteCourse } from "../controllers/coursesController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { optionalProtect, protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Specific routes first
router.get("/instructor", protect, authorize("instructor", "admin"), asyncHandler(getInstructorCourses));

// Public routes
router.get("/", asyncHandler(getCourses));

// Parameterized routes last
router.get("/:id", optionalProtect, asyncHandler(getCourse));
router.post("/", protect, authorize("instructor", "admin"), asyncHandler(createCourse));
router.put("/:id", protect, authorize("instructor", "admin"), asyncHandler(updateCourse));
router.delete("/:id", protect, authorize("instructor", "admin"), asyncHandler(deleteCourse));

export default router;
