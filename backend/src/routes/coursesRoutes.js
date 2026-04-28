import express from "express";
import { createCourse, getCourse, getCourses } from "../controllers/coursesController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public
router.get("/", asyncHandler(getCourses));
router.get("/:id", asyncHandler(getCourse));

// Instructor only
router.post("/", protect, authorize("instructor", "admin"), asyncHandler(createCourse));

export default router;
