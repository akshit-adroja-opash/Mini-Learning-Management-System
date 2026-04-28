import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./config/db.js";
import coursesRoutes from "./routes/coursesRoutes.js";
import enrollmentsRoutes from "./routes/enrollmentsRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import quizzesRoutes from "./routes/quizzesRoutes.js";
import discussionsRoutes from "./routes/discussionsRoutes.js";
import certificatesRoutes from "./routes/certificatesRoutes.js";
import analyticRoutes from "./routes/analyticsRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(__dirname, "../../.env") });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quizzes", quizzesRoutes);
app.use("/api/discussions", discussionsRoutes);
app.use("/api/analytics", analyticRoutes);
app.use("/api/certificates", certificatesRoutes);

// Server
connectDB()

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

