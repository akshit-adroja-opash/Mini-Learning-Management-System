import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["enrolled", "in_progress", "completed", "unenrolled"],
      default: "enrolled",
      index: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    unenrolledAt: {
      type: Date,
      default: null,
    },
    progressPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    completedLessonCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalLessonCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ learner: 1, course: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
