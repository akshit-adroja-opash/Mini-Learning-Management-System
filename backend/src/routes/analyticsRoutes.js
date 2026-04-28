import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("instructor", "admin"), asyncHandler(getAnalytics));

export default router;
