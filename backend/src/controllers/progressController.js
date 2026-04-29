import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";

export const saveProgress = async (req, res) => {
  const { lessonId, watchedSeconds, duration } = req.body;
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) return res.status(404).json({ msg: "Lesson not found" });

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
      lastPositionSeconds: watchedSeconds,
    });
  } else {
    progress.watchedSeconds = watchedSeconds;
    progress.lastPositionSeconds = watchedSeconds;
  }

  // Completion logic (>= 90%)
  const totalDuration = duration || lesson.durationSeconds;
  progress.watchedPercent = Math.min((watchedSeconds / totalDuration) * 100, 100);
  if (progress.watchedPercent >= 90) {
    progress.isCompleted = true;
    progress.completedAt = progress.completedAt || new Date();
  }

  await progress.save();

  res.json(progress);
};

export const markLessonComplete = async (req, res) => {
  const { lessonId } = req.body;

  const lesson = await Lesson.findById(lessonId);
  if(!lesson) return res.status(404).json({message: "Lesson not found"});

  let progress = await LessonProgress.findOne({
    learner: req.user._id,
    lesson: lessonId
  });

  if(!progress) {
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
