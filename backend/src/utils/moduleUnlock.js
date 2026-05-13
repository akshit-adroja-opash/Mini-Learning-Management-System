import Module from "../models/Module.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";

export const isModuleUnlocked = async (learnerId, moduleId) => {
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