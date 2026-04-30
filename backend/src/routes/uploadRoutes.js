import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { isCloudinaryConfigured, uploadBufferToCloudinary } from "../config/cloudinary.js";

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

const saveLocalFallback = async (file) => {
  const uploadDir = resolve(__dirname, "../../uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const ext = path.extname(file.originalname);
  const filename = `${file.fieldname}-${Date.now()}-${randomUUID()}${ext}`;
  await fs.writeFile(path.join(uploadDir, filename), file.buffer);
  return `/uploads/${filename}`;
};

router.post("/", protect, upload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  if (isCloudinaryConfigured()) {
    const result = await uploadBufferToCloudinary(req.file, "mini-lms/course-media");
    return res.json({
      url: result.secure_url,
      provider: "cloudinary",
      publicId: result.public_id,
      resourceType: result.resource_type,
    });
  }

  const url = await saveLocalFallback(req.file);
  res.json({ url, provider: "local" });
}));

export default router;
