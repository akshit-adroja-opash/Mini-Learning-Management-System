import Question from "../models/Question.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Enrollment from "../models/Enrollment.js";
import Module from "../models/Module.js";

const isModuleUnlocked = async (learnerId, moduleId) => {
  const module = await Module.findById(moduleId);
  if (!module) return false;

  const previousModule = await Module.findOne({
    course: module.course,
    order: module.order - 1,
  });

  if (!previousModule) return true;

  const previousQuiz = await Quiz.findOne({ module: previousModule._id });
  if (!previousQuiz) return true;

  return Boolean(await QuizAttempt.exists({
    learner: learnerId,
    module: previousModule._id,
    passed: true,
  }));
};

export const submitQuiz = async (req, res) => {
  const { answers } = req.body;

  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ msg: "Quiz not found" });

  const enrollment = await Enrollment.findOne({ learner: req.user._id, course: quiz.course });
  if (!enrollment) return res.status(403).json({ msg: "Enroll before taking quizzes" });

  if (!(await isModuleUnlocked(req.user._id, quiz.module))) {
    return res.status(403).json({ msg: "This quiz is locked until the previous module quiz is passed" });
  }

  const questions = await Question.find({ quiz: quiz._id }).select("+options.isCorrect");

  let score = 0;
  let maxScore = 0;

  questions.forEach((question) => {
    maxScore += question.points || 1;
    const selectedOptionId = answers?.[question._id.toString()];
    const correctOption = question.options.find((option) => option.isCorrect);

    if (correctOption && correctOption._id.toString() === selectedOptionId) {
      score += question.points || 1;
    }
  });

  const percent = maxScore ? (score / maxScore) * 100 : 0;
  const attemptCount = await QuizAttempt.countDocuments({
    learner: req.user._id,
    quiz: quiz._id,
  });

  const attempt = await QuizAttempt.create({
    learner: req.user._id,
    course: quiz.course,
    module: quiz.module,
    quiz: quiz._id,
    score: percent,
    maxScore,
    percentage: percent,
    passed: percent >= quiz.passThreshold,
    attemptNumber: attemptCount + 1,
  });

  res.json(attempt);
};
