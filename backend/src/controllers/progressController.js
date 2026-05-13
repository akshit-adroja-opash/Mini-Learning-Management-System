import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";
import Enrollment from "../models/Enrollment.js";
import Module from "../models/Module.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { isModuleUnlocked } from "../utils/moduleUnlock.js";


const syncEnrollmentProgress = async (learnerId, courseId, lastAccessedLesson) => {
  const totalLessonCount = await Lesson.countDocuments({ course: courseId });
  const completedLessonCount = await LessonProgress.countDocuments({
    learner: learnerId,
    course: courseId,
    isCompleted: true,
  });
  const progressPercent = totalLessonCount
    ? Math.min(100, Math.round((completedLessonCount / totalLessonCount) * 100))
    : 0;

  await Enrollment.findOneAndUpdate(
    { learner: learnerId, course: courseId },
    {
      lastAccessedLesson,
      totalLessonCount,
      completedLessonCount,
      progressPercent,
      status: progressPercent >= 100 ? "completed" : "in_progress",
      startedAt: new Date(),
      ...(progressPercent >= 100 ? { completedAt: new Date() } : {}),
    },
    { new: true }
  );
};

export const saveProgress = async (req, res) => {
  // Accept both 'lesson'/'lessonId' and 'duration'/'totalDuration' for compatibility
  const lessonId = req.body.lessonId || req.body.lesson;
  const watchedSeconds = req.body.watchedSeconds || 0;
  const lastPositionSeconds = req.body.lastPositionSeconds ?? watchedSeconds;
  const duration = req.body.duration || req.body.totalDuration;
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) return res.status(404).json({ msg: "Lesson not found" });

  const enrollment = await Enrollment.findOne({ learner: req.user._id, course: lesson.course });
  if (!enrollment) return res.status(403).json({ msg: "Enroll before tracking progress" });

  if (!(await isModuleUnlocked(req.user._id, lesson.module))) {
    return res.status(403).json({ msg: "This module is locked until the previous quiz is passed" });
  }

  let progress = await LessonProgress.findOne({
    learner: req.user._id,
    lesson: lessonId
  });

  if (!progress) {
    progress = new LessonProgress({
      learner: req.user._id,
      course: lesson.course,
      module: lesson.module,
      lesson: lessonId,
      watchedSeconds,
      lastPositionSeconds,
    });
  } else {
    progress.watchedSeconds = Math.max(progress.watchedSeconds || 0, watchedSeconds);
    progress.lastPositionSeconds = lastPositionSeconds;
  }

  // Completion logic (>= 90%)
  const totalDuration = duration || lesson.durationSeconds;
  progress.watchedPercent = Math.min((progress.watchedSeconds / totalDuration) * 100, 100);
  if (progress.watchedPercent >= 90) {
    progress.isCompleted = true;
    progress.completedAt = progress.completedAt || new Date();
  }

  await progress.save();

  await syncEnrollmentProgress(req.user._id, lesson.course, lessonId);

  res.json(progress);
};

export const markLessonComplete = async (req, res) => {
  const { lessonId } = req.body;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });

  let progress = await LessonProgress.findOne({
    learner: req.user._id,
    lesson: lessonId
  });

  if (!progress) {
    progress = new LessonProgress({
      learner: req.user._id,
      course: lesson.course,
      module: lesson.module,
      lesson: lessonId,
      watchedSeconds: lesson.durationSeconds,
      watchedPercent: 100,
      isCompleted: true,
      completedAt: new Date()
    });
  } else {
    progress.isCompleted = true;
    progress.completedAt = progress.completedAt || new Date();
  }

  await progress.save();
  await syncEnrollmentProgress(req.user._id, lesson.course, lessonId);

  res.json(progress);
};

// Resume video
export const getProgress = async (req, res) => {
  const progress = await LessonProgress.findOne({
    learner: req.user._id,
    lesson: req.params.lessonId
  });

  res.json(progress || { watchedSeconds: 0 });
};
