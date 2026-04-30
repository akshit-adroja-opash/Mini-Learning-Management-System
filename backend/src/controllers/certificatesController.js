import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import Certificate from '../models/Certificate.js';
import Enrollment from '../models/Enrollment.js';
import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';

const createSignature = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET || "dev-secret", { expiresIn: "10y" });

const getCompletion = async (learnerId, courseId) => {
    const totalLessonCount = await Lesson.countDocuments({ course: courseId, isPublished: true });
    const completedLessonCount = await LessonProgress.countDocuments({
        learner: learnerId,
        course: courseId,
        isCompleted: true,
    });

    return {
        totalLessonCount,
        completedLessonCount,
        progressPercent: totalLessonCount
            ? Math.round((completedLessonCount / totalLessonCount) * 100)
            : 0,
    };
};

const escapePdfText = (value = "") =>
    String(value).replace(/[\\()]/g, "\\$&").slice(0, 120);

const buildCertificatePdf = ({ certId, learnerName, courseTitle, issuedAt, verifyUrl }) => {
    const lines = [
        "Certificate of Completion",
        `Awarded to: ${learnerName}`,
        `Course: ${courseTitle}`,
        `Issued: ${new Date(issuedAt).toLocaleDateString("en-US")}`,
        `Certificate ID: ${certId}`,
        `Verify: ${verifyUrl}`,
    ];
    const content = `BT /F1 22 Tf 72 740 Td (${escapePdfText(lines[0])}) Tj /F1 14 Tf 0 -44 Td (${escapePdfText(lines[1])}) Tj 0 -28 Td (${escapePdfText(lines[2])}) Tj 0 -28 Td (${escapePdfText(lines[3])}) Tj 0 -28 Td (${escapePdfText(lines[4])}) Tj 0 -28 Td (${escapePdfText(lines[5])}) Tj ET`;
    const objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object, index) => {
        offsets.push(Buffer.byteLength(pdf));
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = Buffer.byteLength(pdf);
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
        pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(pdf);
};

export const generateCertificate = async (req, res) => {
    const completion = await getCompletion(req.user._id, req.params.courseId);
    if (completion.progressPercent < 100) {
        return res.status(403).json({ msg: 'Complete all lessons before claiming a certificate' });
    }

    const existingCert = await Certificate.findOne({ learner: req.user._id, course: req.params.courseId });
    if (existingCert) {
        return res.json({
            ...existingCert.toObject(),
            verificationUrl: `/verify/${existingCert.certificateId}`,
            pdfUrl: `/api/certificates/${existingCert.certificateId}.pdf`,
        });
    }

    const certificateId = randomUUID();

    const cert = await Certificate.create({
        learner: req.user._id,
        course: req.params.courseId,
        certificateId,
        signature: createSignature({
            certId: certificateId,
            learner: req.user._id.toString(),
            course: req.params.courseId,
        }),
    });
    res.json({
        ...cert.toObject(),
        verificationUrl: `/verify/${cert.certificateId}`,
        pdfUrl: `/api/certificates/${cert.certificateId}.pdf`,
    });
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

    try {
        jwt.verify(cert.signature, process.env.JWT_SECRET || "dev-secret");
    } catch {
        return res.status(400).json({ msg: 'Certificate signature is invalid' });
    }

    res.json({
        cert,
        verificationUrl: `/verify/${cert.certificateId}`,
        pdfUrl: `/api/certificates/${cert.certificateId}.pdf`,
    });
};

export const downloadCertificatePdf = async (req, res) => {
    const cert = await Certificate.findOne({ certificateId: req.params.certId })
        .populate('learner course');
    if (!cert) return res.status(404).json({ msg: 'Invalid certificate' });

    try {
        jwt.verify(cert.signature, process.env.JWT_SECRET || "dev-secret");
    } catch {
        return res.status(400).json({ msg: 'Certificate signature is invalid' });
    }

    const verifyUrl = `${req.protocol}://${req.get('host')}/verify/${cert.certificateId}`;
    const pdf = buildCertificatePdf({
        certId: cert.certificateId,
        learnerName: cert.learner.name,
        courseTitle: cert.course.title,
        issuedAt: cert.issuedAt,
        verifyUrl,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="certificate-${cert.certificateId}.pdf"`);
    res.send(pdf);
};
