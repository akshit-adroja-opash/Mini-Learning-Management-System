import express from "express";
import Lesson from "../models/Lesson.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  const { module: moduleId } = req.body;
  if (!req.body.order) {
    const count = await Lesson.countDocuments({ module: moduleId });
    req.body.order = count + 1;
  }
  const lesson = await Lesson.create(req.body);
  res.status(201).json(lesson);
}));

router.get("/module/:moduleId", asyncHandler(async (req, res) => {
  const lessons = await Lesson.find({ module: req.params.moduleId }).sort("order");
  res.json(lessons);
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  res.json(lesson);
}));

router.put("/:id", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(lesson);
}));

router.delete("/:id", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  await Lesson.findByIdAndDelete(req.params.id);
  res.json({ message: "Lesson deleted" });
}));

export default router;