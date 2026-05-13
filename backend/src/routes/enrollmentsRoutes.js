import { enroll, unenroll, getMyEnrollments, getEnrollmentByCourse } from "../controllers/enrollmentsController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import express from "express";

const router = express.Router();

router.get("/me", protect, authorize("learner"), asyncHandler(getMyEnrollments));
router.get("/course/:courseId", protect, authorize("learner"), asyncHandler(getEnrollmentByCourse));
router.post("/:courseId", protect, authorize("learner"), asyncHandler(enroll));
router.post("/", protect, authorize("learner"), asyncHandler(async (req, res) => {
  const { courseId, course } = req.body;
  const id = courseId || course;
  if (!id) return res.status(400).json({ msg: "Course ID is required" });
  req.params.courseId = id;
  return enroll(req, res);
}));
router.delete("/:courseId", protect, authorize("learner"), asyncHandler(unenroll));

export default router;
