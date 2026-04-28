import Discussion from "../models/Discussion.js";

export const addComment = async (req, res) => {
  const comment = await Discussion.create({
    lesson: req.params.lessonId,
    author: req.user._id,
    body: req.body.body || req.body.text,
    parent: req.body.parent || null,
  });

  res.json(comment);
};

export const getComments = async (req, res) => {
  const comments = await Discussion.find({ lesson: req.params.lessonId })
    .populate("author", "name role")
    .sort({ createdAt: 1 });

  res.json(comments);
};
