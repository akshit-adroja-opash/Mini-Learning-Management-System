import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { getMe, login, register, updateProfile } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", protect, asyncHandler(getMe));
router.put("/profile", protect, asyncHandler(updateProfile));

export default router;
