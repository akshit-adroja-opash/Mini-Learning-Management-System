import Enrollment from "../models/Enrollment.js";
import QuizAttempt from "../models/QuizAttempt.js";

export const getAnalytics = async (req, res) => {
  const enrollments = await Enrollment.aggregate([
    {
      $group: {
        _id: "$course",
        totalEnrollments: { $sum: 1 }
      }
    }
  ]);

  const quizStats = await QuizAttempt.aggregate([
    {
      $group: {
        _id: "$quiz",
        avgScore: { $avg: "$score" }
      }
    }
  ]);

  res.json({ enrollments, quizStats });
};

export const getInstructorAnalytics = getAnalytics;
