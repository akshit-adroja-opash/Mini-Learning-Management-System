import express from "express";
import {
  downloadCertificatePdf,
  generateCertificate,
  getMyCertificates,
  verifyCertificate,
} from "../controllers/certificatesController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, authorize("learner"), asyncHandler(getMyCertificates));
router.post("/:courseId", protect, authorize("learner"), asyncHandler(generateCertificate));

router.get("/:certId.pdf", asyncHandler(downloadCertificatePdf));
router.get("/verify/:certId", asyncHandler(verifyCertificate));

export default router;
