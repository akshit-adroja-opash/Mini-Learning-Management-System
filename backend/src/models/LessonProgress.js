import mongoose from "mongoose";

const watchedSegmentSchema = new mongoose.Schema(
  {
    startSecond: {
      type: Number,
      required: true,
      min: 0,
    },
    endSecond: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const lessonProgressSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
      index: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    lastPositionSeconds: {
      type: Number,
      min: 0,
      default: 0,
    },
    watchedSeconds: {
      type: Number,
      min: 0,
      default: 0,
    },
    watchedPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    watchedSegments: {
      type: [watchedSegmentSchema],
      default: [],
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ learner: 1, lesson: 1 }, { unique: true });
lessonProgressSchema.index({ learner: 1, course: 1 });

export default mongoose.model("LessonProgress", lessonProgressSchema);
