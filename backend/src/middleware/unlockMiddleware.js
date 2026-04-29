const { Lesson, Module, Quiz } = require("../models");
const authMiddleware = require("./authMiddleware");

async function unlockMiddleware(req, res, next) {
  try {
    // Check previous module passed (for linear paths)
    if (!req.params.moduleId) return next();
    const module = await Module.findById(req.params.moduleId);
    const previousModule = module
      ? await Module.findOne({ course: module.course, order: module.order - 1 })
      : null;
    if (previousModule) {
      const previousModuleProg = await Lesson.findOne({
        module: previousModule._id,
        course: module.course,
        completedBy: req.user.id,
      });
      if (!previousModuleProg) {
        return res.status(403).json({ message: "Locked" });
      }
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
module.exports = authMiddleware(unlockMiddleware);