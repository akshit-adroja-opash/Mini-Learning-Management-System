import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./config/db.js";
import coursesRoutes from "./routes/coursesRoutes.js";
import enrollmentsRoutes from "./routes/enrollmentsRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import quizzesRoutes from "./routes/quizzesRoutes.js";
import discussionsRoutes from "./routes/discussionsRoutes.js";
import certificatesRoutes from "./routes/certificatesRoutes.js";
import { verifyCertificate } from "./controllers/certificatesController.js";
import analyticRoutes from "./routes/analyticsRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import asyncHandler from "./middleware/asyncHandler.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure uploads directory exists
const uploadsDir = resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

dotenv.config({ path: resolve(__dirname, "../../.env") });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}, express.static(resolve(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quizzes", quizzesRoutes);
app.use("/api/discussions", discussionsRoutes);
app.use("/api/analytics", analyticRoutes);
app.use("/api/certificates", certificatesRoutes);
app.get("/verify/:certId", asyncHandler(verifyCertificate));
app.use("/api/modules", moduleRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// connectDB
connectDB()

// error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
