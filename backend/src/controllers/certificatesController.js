import { randomUUID } from 'node:crypto';
import Certificate from '../models/Certificate.js';
import Enrollment from '../models/Enrollment.js';

export const generateCertificate = async (req, res) => {
    const existingCert = await Certificate.findOne({ learner: req.user._id, course: req.params.courseId });
    if (existingCert) return res.json(existingCert);

    const cert = await Certificate.create({
        learner: req.user._id,
        course: req.params.courseId,
        certificateId: randomUUID()
    });
    res.json(cert);
};

export const verifyCertificate = async (req, res) => {
    const cert = await Certificate.findOne({ certificateId: req.params.certId })
        .populate('learner course'); 
    if (!cert) return res.status(404).json({ msg: 'Invalid certificate' });

    const enrollment = await Enrollment.findOne({
        learner: cert.learner,
        course: cert.course
    });

    if (!enrollment || enrollment.progressPercent < 100) {
        return res.status(400).json({ msg: 'Course not yet completed' });
    }

    res.json({ cert, url: `https://example.com/certificate/${cert.certificateId}` });
};
