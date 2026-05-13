import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import Certificate from '../models/Certificate.js';
import Enrollment from '../models/Enrollment.js';
import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';

const createSignature = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET || "dev-secret", { expiresIn: "10y" });

const getCompletion = async (learnerId, courseId) => {
    const totalLessonCount = await Lesson.countDocuments({ course: courseId });
    const completedLessonCount = await LessonProgress.countDocuments({
        learner: learnerId,
        course: courseId,
        isCompleted: true,
    });

    const progressPercent = totalLessonCount
        ? Math.min(100, Math.round((completedLessonCount / totalLessonCount) * 100))
        : 0;

    return {
        totalLessonCount,
        completedLessonCount,
        progressPercent,
    };
};

const escapePdfText = (value = "", maxLength = 160) =>
    String(value).replace(/[\\()]/g, "\\$&").slice(0, maxLength);

const hexToRgb = (hex) => {
    const value = hex.replace("#", "");
    return [
        parseInt(value.slice(0, 2), 16) / 255,
        parseInt(value.slice(2, 4), 16) / 255,
        parseInt(value.slice(4, 6), 16) / 255,
    ];
};

const rgb = (hex, operator = "rg") => `${hexToRgb(hex).map((n) => n.toFixed(3)).join(" ")} ${operator}`;

const approxTextWidth = (text, fontSize) => String(text).length * fontSize * 0.52;

const fitText = (text, fontSize, maxWidth) => {
    const value = String(text || "");
    if (approxTextWidth(value, fontSize) <= maxWidth) return value;

    const maxChars = Math.max(8, Math.floor(maxWidth / (fontSize * 0.52)) - 3);
    return `${value.slice(0, maxChars).trimEnd()}...`;
};

const text = (value, x, y, size = 14, font = "F1", color = "#111827", options = {}) => {
    const textValue = fitText(value, size, options.maxWidth || 700);
    const alignX = options.align === "center"
        ? x - approxTextWidth(textValue, size) / 2
        : options.align === "right"
            ? x - approxTextWidth(textValue, size)
            : x;

    return `BT /${font} ${size} Tf ${rgb(color)} ${alignX.toFixed(2)} ${y.toFixed(2)} Td (${escapePdfText(textValue, options.maxLength || 180)}) Tj ET`;
};

const rect = (x, y, width, height, fill, stroke = null, strokeWidth = 1) => {
    const commands = ["q"];
    if (fill) commands.push(rgb(fill));
    if (stroke) {
        commands.push(rgb(stroke, "RG"));
        commands.push(`${strokeWidth} w`);
    }
    commands.push(`${x} ${y} ${width} ${height} re ${fill && stroke ? "B" : fill ? "f" : "S"}`);
    commands.push("Q");
    return commands.join("\n");
};

const line = (x1, y1, x2, y2, color = "#111827", width = 1) =>
    `q ${rgb(color, "RG")} ${width} w ${x1} ${y1} m ${x2} ${y2} l S Q`;

const circle = (cx, cy, radius, fill, stroke = null, strokeWidth = 1) => {
    const c = radius * 0.5522847498;
    const commands = [
        "q",
        fill ? rgb(fill) : "",
        stroke ? rgb(stroke, "RG") : "",
        stroke ? `${strokeWidth} w` : "",
        `${cx} ${cy + radius} m`,
        `${cx + c} ${cy + radius} ${cx + radius} ${cy + c} ${cx + radius} ${cy} c`,
        `${cx + radius} ${cy - c} ${cx + c} ${cy - radius} ${cx} ${cy - radius} c`,
        `${cx - c} ${cy - radius} ${cx - radius} ${cy - c} ${cx - radius} ${cy} c`,
        `${cx - radius} ${cy + c} ${cx - c} ${cy + radius} ${cx} ${cy + radius} c`,
        `${fill && stroke ? "B" : fill ? "f" : "S"}`,
        "Q",
    ];
    return commands.filter(Boolean).join("\n");
};

const buildCertificatePdf = ({ certId, learnerName, courseTitle, issuedAt }) => {
    const issuedDate = new Date(issuedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const pageWidth = 792;
    const pageHeight = 612;
    const centerX = pageWidth / 2;

    const content = [
        rect(0, 0, pageWidth, pageHeight, "#f8fafc"),
        rect(24, 24, 744, 564, null, "#7c3aed", 3),
        rect(36, 36, 720, 540, null, "#d946ef", 1),
        rect(48, 505, 696, 4, "#7c3aed"),
        rect(48, 497, 696, 2, "#d946ef"),
        rect(48, 68, 696, 2, "#d946ef"),
        rect(48, 60, 696, 4, "#7c3aed"),

        circle(96, 532, 26, "#7c3aed"),
        "q 1 1 1 rg 81 535 m 96 542 l 111 535 l 96 528 l h f Q",
        line(96, 528, 96, 519, "#ffffff", 2),
        line(84, 532, 84, 523, "#ffffff", 1.5),
        line(108, 532, 108, 523, "#ffffff", 1.5),
        line(84, 523, 108, 523, "#ffffff", 1.5),
        text("LMS", 132, 539, 20, "F2", "#111827"),
        text("Pro", 178, 539, 20, "F2", "#6366f1"),
        text("Verified Certificate", 660, 541, 13, "F2", "#6366f1", { align: "right" }),
        text("LMS Pro Learning", 660, 521, 10, "F1", "#64748b", { align: "right" }),

        text("Certificate of Completion", centerX, 445, 38, "F2", "#111827", { align: "center" }),
        line(276, 427, 516, 427, "#d946ef", 1.5),
        text("This certificate is proudly presented to", centerX, 392, 14, "F1", "#64748b", { align: "center" }),
        text(learnerName, centerX, 342, 34, "F3", "#111827", { align: "center", maxWidth: 560 }),
        line(198, 326, 594, 326, "#cbd5e1", 1),
        text("for successfully completing the course", centerX, 292, 14, "F1", "#64748b", { align: "center" }),
        text(courseTitle, centerX, 252, 24, "F2", "#4f46e5", { align: "center", maxWidth: 610 }),

        rect(102, 150, 588, 72, "#eef2ff", "#c7d2fe", 1),
        text(`Issued on ${issuedDate}`, 128, 196, 12, "F2", "#334155"),
        text("Issuer: LMS Pro Learning", 128, 176, 11, "F1", "#475569"),
        text(`Certificate ID: ${certId}`, 128, 158, 9, "F1", "#64748b", { maxWidth: 330 }),
        text("Status: Verified", 666, 196, 12, "F2", "#16a34a", { align: "right" }),
        text("Certificate of Completion", 666, 176, 11, "F1", "#475569", { align: "right" }),

        line(102, 118, 284, 118, "#94a3b8", 1),
        text("LMS Pro Learning", 193, 98, 11, "F2", "#111827", { align: "center" }),
        text("Authorized Issuer", 193, 82, 9, "F1", "#64748b", { align: "center" }),
        circle(594, 114, 42, "#ffffff", "#7c3aed", 2),
        circle(594, 114, 32, null, "#d946ef", 1),
        text("LMS", 594, 120, 15, "F2", "#7c3aed", { align: "center" }),
        text("PRO", 594, 102, 10, "F2", "#d946ef", { align: "center" }),
    ].join("\n");

    const objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>",
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

const withCertificateUrls = (cert) => {
    if (!cert) return null;

    const certificate = cert.toObject ? cert.toObject() : cert;
    return {
        ...certificate,
        verificationUrl: `/verify/${certificate.certificateId}`,
        pdfUrl: `/api/certificates/${certificate.certificateId}.pdf`,
    };
};

export const getMyCertificates = async (req, res) => {
    const enrollments = await Enrollment.find({
        learner: req.user._id,
        status: { $ne: "unenrolled" },
    })
        .populate("course", "title description thumbnailUrl category")
        .sort("-completedAt -updatedAt");

    const completedEnrollments = [];

    for (const enrollment of enrollments) {
        if (!enrollment.course) continue;

        const completion = await getCompletion(req.user._id, enrollment.course._id);

        if (
            enrollment.progressPercent !== completion.progressPercent ||
            enrollment.completedLessonCount !== completion.completedLessonCount ||
            enrollment.totalLessonCount !== completion.totalLessonCount
        ) {
            enrollment.progressPercent = completion.progressPercent;
            enrollment.completedLessonCount = completion.completedLessonCount;
            enrollment.totalLessonCount = completion.totalLessonCount;
            enrollment.status = completion.progressPercent >= 100 ? "completed" : "in_progress";
            if (completion.progressPercent >= 100) {
                enrollment.completedAt = enrollment.completedAt || new Date();
            }
            await enrollment.save();
        }

        if (completion.progressPercent >= 100) {
            completedEnrollments.push(enrollment);
        }
    }

    const courseIds = completedEnrollments.map((enrollment) => enrollment.course._id);
    const certificates = await Certificate.find({
        learner: req.user._id,
        course: { $in: courseIds },
    });

    const certificateByCourse = new Map(
        certificates.map((cert) => [cert.course.toString(), withCertificateUrls(cert)])
    );

    res.json(completedEnrollments.map((enrollment) => ({
        course: enrollment.course,
        completedAt: enrollment.completedAt,
        progressPercent: enrollment.progressPercent,
        certificate: certificateByCourse.get(enrollment.course._id.toString()) || null,
    })));
};

export const generateCertificate = async (req, res) => {
    const completion = await getCompletion(req.user._id, req.params.courseId);
    if (completion.progressPercent < 100) {
        return res.status(403).json({ msg: 'Complete all lessons before claiming a certificate' });
    }

    const existingCert = await Certificate.findOne({ learner: req.user._id, course: req.params.courseId });
    if (existingCert) {
        return res.json(withCertificateUrls(existingCert));
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
    res.json(withCertificateUrls(cert));
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

    const pdf = buildCertificatePdf({
        certId: cert.certificateId,
        learnerName: cert.learner.name,
        courseTitle: cert.course.title,
        issuedAt: cert.issuedAt,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="certificate-${cert.certificateId}.pdf"`);
    res.send(pdf);
};
