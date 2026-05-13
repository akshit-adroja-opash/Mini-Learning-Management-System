import Enrollment from "../models/Enrollment.js";
import LessonProgress from "../models/LessonProgress.js";

export const enroll = async (req, res) => {
  const exists = await Enrollment.findOne({
    learner: req.user._id,
    course: req.params.courseId
  });

  if (exists) return res.status(400).json({ msg: 'Already enrolled' });

  const enrollment = await Enrollment.create({
    learner: req.user._id,
    course: req.params.courseId,
    progressPercent: 0
  });

  res.json(enrollment);
};

export const unenroll = async (req, res) => {
  const enrollment = await Enrollment.findOne({
    learner: req.user._id,
    course: req.params.courseId
  });

  if (!enrollment) return res.status(404).json({ msg: "Enrollment not found" });

  const hasStarted =
    enrollment.status !== "enrolled" ||
    enrollment.progressPercent > 0 ||
    (await LessonProgress.exists({ learner: req.user._id, course: req.params.courseId }));

  if (hasStarted) {
    return res.status(400).json({ msg: "You can only unenroll before starting the course" });
  }

  await enrollment.deleteOne();

  res.json({ msg: 'Unenrolled' });
};
export const getMyEnrollments = async (req, res) => {
  const enrollments = await Enrollment.find({ learner: req.user._id })
    .populate("course", "title description thumbnailUrl category")
    .sort("-createdAt");

  // Filter out enrollments where the course was deleted but the enrollment remains
  const validEnrollments = enrollments.filter(e => e.course !== null);
  const courseIds = validEnrollments.map((e) => e.course._id);

  const lessonCounts = await Lesson.aggregate([
    { $match: { course: { $in: courseIds } } },
    { $group: { _id: "$course", totalLessons: { $sum: 1 } } },
  ]);

  const completedCounts = await LessonProgress.aggregate([
    {
      $match: {
        learner: req.user._id,
        course: { $in: courseIds },
        isCompleted: true,
      },
    },
    { $group: { _id: "$course", completedLessons: { $sum: 1 } } },
  ]);

  const totalMap = Object.fromEntries(lessonCounts.map((item) => [item._id.toString(), item.totalLessons]));
  const completedMap = Object.fromEntries(completedCounts.map((item) => [item._id.toString(), item.completedLessons]));

  const enrichedEnrollments = await Promise.all(validEnrollments.map(async (enrollment) => {
    const courseId = enrollment.course._id.toString();
    const totalLessons = totalMap[courseId] || 0;
    const completedLessons = completedMap[courseId] || 0;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    if (enrollment.progressPercent !== progressPercent) {
      enrollment.progressPercent = progressPercent;
      await enrollment.save();
    }

    return enrollment;
  }));

  res.json(enrichedEnrollments);
};

export const getEnrollmentByCourse = async (req, res) => {
  const enrollment = await Enrollment.findOne({
    learner: req.user._id,
    course: req.params.courseId
  }).populate("course", "title description");

  if (!enrollment) return res.status(200).json(null);
  res.json(enrollment);
};
