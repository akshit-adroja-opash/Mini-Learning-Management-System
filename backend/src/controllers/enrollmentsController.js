import Enrollment from "../models/Enrollment.js";

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
  await Enrollment.deleteOne({
    learner: req.user._id,
    course: req.params.courseId
  });

  res.json({ msg: 'Unenrolled' });
};
