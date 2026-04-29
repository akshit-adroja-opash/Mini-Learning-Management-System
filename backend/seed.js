import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Course from "./src/models/Course.js";
import Module from "./src/models/Module.js";
import Lesson from "./src/models/Lesson.js";
import Quiz from "./src/models/Quiz.js";
import Question from "./src/models/Question.js";

import bcrypt from "bcryptjs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany();
    await Course.deleteMany();
    await Module.deleteMany();
    await Lesson.deleteMany();
    await Quiz.deleteMany();
    await Question.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create Admin
    const admin = await User.create({
      name: "System Admin",
      email: "admin@lms.com",
      passwordHash: hashedPassword,
      role: "admin"
    });

    // Create Instructor
    const instructor = await User.create({
      name: "John Instructor",
      email: "instructor@lms.com",
      passwordHash: hashedPassword,
      role: "instructor"
    });

    // Create Learner
    const learner = await User.create({
      name: "Jane Student",
      email: "learner@lms.com",
      passwordHash: hashedPassword,
      role: "learner"
    });

    // Create Course
    const course = await Course.create({
      title: "Mastering MERN Stack",
      description: "Learn MongoDB, Express, React and Node from scratch.",
      slug: "mastering-mern-stack",
      category: "Programming",
      level: "intermediate",
      instructor: instructor._id,
      status: "published"
    });

    // Create Module 1
    const module1 = await Module.create({
      course: course._id,
      title: "Introduction to React",
      order: 1,
      isPublished: true
    });

    // Create Lesson 1
    await Lesson.create({
      course: course._id,
      module: module1._id,
      title: "What is React?",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      durationSeconds: 300,
      order: 1,
      isPublished: true
    });

    // Create Quiz for Module 1
    const quiz1 = await Quiz.create({
      course: course._id,
      module: module1._id,
      title: "React Basics Quiz",
      passThreshold: 70
    });

    // Create Questions for Quiz 1
    await Question.create({
      quiz: quiz1._id,
      prompt: "React is a framework of which language?",
      options: [
        { text: "Python", isCorrect: false },
        { text: "JavaScript", isCorrect: true },
        { text: "Java", isCorrect: false }
      ],
      order: 1
    });

    console.log("Seeding completed successfully!");
    process.exit();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();
