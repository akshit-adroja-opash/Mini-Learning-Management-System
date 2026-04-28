import Question from "../models/Question.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";

export const submitQuiz = async (req, res) => {
  const { answers } = req.body;

  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) return res.status(404).json({ msg: "Quiz not found" });

  const questions = await Question.find({ quiz: quiz._id }).select("+options.isCorrect");

  let score = 0;
  let maxScore = 0;

  questions.forEach((question) => {
    maxScore += question.points;
    const selectedOption = answers?.[question._id.toString()];
    const correctOption = question.options.find((option) => option.isCorrect);

    if (correctOption && correctOption._id.toString() === selectedOption) {
      score += question.points;
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
