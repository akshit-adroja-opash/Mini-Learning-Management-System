import Discussion from "../models/Discussion.js";

export const addComment = async (req, res) => {
  const comment = await Discussion.create({
    lesson: req.params.lessonId,
    author: req.user._id,
    body: req.body.body || req.body.text,
    parent: req.body.parent || null,
  });

  const populated = await comment.populate("author", "name role");
  res.json(populated);
};

export const getComments = async (req, res) => {
  const comments = await Discussion.find({ lesson: req.params.lessonId })
    .populate("author", "name role")
    .sort({ isPinned: -1, createdAt: 1 });

  res.json(comments);
};

export const togglePinComment = async (req, res) => {
  const comment = await Discussion.findById(req.params.id);
  if (!comment) return res.status(404).json({ msg: "Comment not found" });

  // Only instructor/admin can pin
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    return res.status(403).json({ msg: "Not authorized" });
  }

  comment.isPinned = !comment.isPinned;
  await comment.save();
  res.json(comment);
};
