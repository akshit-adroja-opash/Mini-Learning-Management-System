import express from "express";
import {
  downloadCertificatePdf,
  generateCertificate,
  getMyCertificates,
  verifyCertificate,
} from "../controllers/certificatesController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/me", protect, authorize("learner"), asyncHandler(getMyCertificates));
router.post("/:courseId", protect, authorize("learner"), asyncHandler(generateCertificate));

router.get("/:certId.pdf", asyncHandler(downloadCertificatePdf));
router.get("/verify/:certId", asyncHandler(verifyCertificate));

export default router;
