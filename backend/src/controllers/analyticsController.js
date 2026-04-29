import Enrollment from "../models/Enrollment.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Course from "../models/Course.js";

export const getAnalytics = async (req, res) => {
  // Find courses owned by this instructor
  const instructorCourses = await Course.find({ instructor: req.user._id }).select("_id");
  const courseIds = instructorCourses.map(c => c._id);

  const enrollments = await Enrollment.countDocuments({
    course: { $in: courseIds }
  });

  const quizStats = await QuizAttempt.aggregate([
    {
      $match: {
        course: { $in: courseIds }
      }
    },
    {
      $group: {
        _id: null,
        avgScore: { $avg: "$score" }
      }
    }
  ]);

  res.json({ 
    totalEnrollments: enrollments, 
    avgQuizScore: quizStats[0]?.avgScore || 0,
    lessonDropOff: 0 // Placeholder for now
  });
};

export const getInstructorAnalytics = getAnalytics;
