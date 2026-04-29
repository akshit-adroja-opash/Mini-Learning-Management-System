import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import Module from "../models/Module.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  const { course, title, order } = req.body;
  const module = await Module.create({ course, title, order });
  res.status(201).json(module);
}));

router.get("/course/:courseId", asyncHandler(async (req, res) => {
  const modules = await Module.find({ course: req.params.courseId }).sort("order");
  res.json(modules);
}));

router.put("/:id", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(module);
}));

router.delete("/:id", protect, authorize("instructor"), asyncHandler(async (req, res) => {
  await Module.findByIdAndDelete(req.params.id);
  res.json({ message: "Module deleted" });
}));

export default router;