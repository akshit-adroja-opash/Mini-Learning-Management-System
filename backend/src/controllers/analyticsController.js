import Enrollment from "../models/Enrollment.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Course from "../models/Course.js";

export const getAnalytics = async (req, res) => {
  // Find courses owned by this instructor
  const instructorCourses = await Course.find({ instructor: req.user._id }).select("_id title");
  const courseIds = instructorCourses.map(c => c._id);

  // 1. Total Enrollments
  const totalEnrollments = await Enrollment.countDocuments({
    course: { $in: courseIds }
  });

  // 2. Avg Quiz Score
  const quizStats = await QuizAttempt.aggregate([
    { $match: { course: { $in: courseIds } } },
    { $group: { _id: null, avgScore: { $avg: "$score" } } }
  ]);

  // 3. Enrollment Trends (Last 30 Days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const trends = await Enrollment.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  // 4. Per-Course Stats
  const courseStats = await Promise.all(instructorCourses.map(async (course) => {
    const enrollments = await Enrollment.countDocuments({ course: course._id });

    const progressStats = await Enrollment.aggregate([
      { $match: { course: course._id } },
      { $group: { _id: null, avgProgress: { $avg: "$progressPercent" } } }
    ]);

    const passStats = await QuizAttempt.aggregate([
      { $match: { course: course._id } },
      {
        $group: {
          _id: null,
          passed: { $sum: { $cond: ["$passed", 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);

    const passRate = passStats[0]?.total
      ? Math.round((passStats[0].passed / passStats[0].total) * 100)
      : 0;

    return {
      title: course.title,
      enrollments,
      avgProgress: Math.round(progressStats[0]?.avgProgress || 0),
      passRate
    };
  }));

  // 5. Active Learners & Completion Rate
  const activeLearners = await Enrollment.countDocuments({
    course: { $in: courseIds },
    progressPercent: { $gt: 0, $lt: 100 }
  });

  const completedCount = await Enrollment.countDocuments({
    course: { $in: courseIds },
    progressPercent: 100
  });

  const completionRate = totalEnrollments
    ? Math.round((completedCount / totalEnrollments) * 100)
    : 0;

  res.json({
    totalEnrollments,
    averageQuizScore: Math.round(quizStats[0]?.avgScore || 0),
    activeLearners,
    completionRate,
    trends: trends.map(t => ({ date: t._id, count: t.count })),
    courseStats
  });
};

export const getInstructorAnalytics = getAnalytics;
