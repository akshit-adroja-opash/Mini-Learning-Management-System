import { randomUUID } from "node:crypto";
import Certificate from "../models/Certificate.js";

export const generateCertificate = async (req, res) => {
  const cert = await Certificate.create({
    learner: req.user._id,
    course: req.params.courseId,
    certificateId: randomUUID()
  });

  res.json(cert);
};

export const verifyCertificate = async (req, res) => {
  const cert = await Certificate.findOne({
    certificateId: req.params.certId
  }).populate("learner course");

  if (!cert) return res.status(404).json({ msg: "Invalid certificate" });

  res.json(cert);
};
