import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
      select: false,
    },
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["single"],
      default: "single",
      required: true,
    },
    options: {
      type: [optionSchema],
      validate: {
        validator(options) {
          return options.length >= 2 && options.some((option) => option.isCorrect);
        },
        message: "A question needs at least two options and one correct answer.",
      },
    },
    explanation: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1500,
      select: false,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    points: {
      type: Number,
      min: 1,
      default: 1,
    },
  },
  { timestamps: true }
);

questionSchema.index({ quiz: 1, order: 1 }, { unique: true });

export default mongoose.model("Question", questionSchema);
