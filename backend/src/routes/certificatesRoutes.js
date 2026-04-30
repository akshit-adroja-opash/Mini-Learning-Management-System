import express from "express";
import {
  downloadCertificatePdf,
  generateCertificate,
  verifyCertificate,
} from "../controllers/certificatesController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:courseId", protect, asyncHandler(generateCertificate));

router.get("/:certId.pdf", asyncHandler(downloadCertificatePdf));
router.get("/verify/:certId", asyncHandler(verifyCertificate));

export default router;
