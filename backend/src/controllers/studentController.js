const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const User = require("../models/User");
const Notification = require("../models/Notification");
const DirectMessage = require("../models/DirectMessage");

function getPagination(req) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function formatSubmissionStatus(submission, assignment) {
  if (!submission) return "pending";
  if (submission.mark !== undefined && submission.mark !== null) return "graded";
  if (assignment?.dueDate && new Date(submission.submittedAt) > new Date(assignment.dueDate)) return "late";
  return "submitted";
}

exports.getStudentDashboard = async (req, res) => {
  const studentId = req.user._id;

  const enrollments = await Enrollment.find({ student: studentId, status: "active" }).select("course");
  const courseIds = enrollments.map((item) => item.course);
  const assignments = await Assignment.find({ course: { $in: courseIds } }).select("_id dueDate title course createdAt");
  const submissions = await Submission.find({ student: studentId, assignment: { $in: assignments.map((a) => a._id) } })
    .populate("assignment", "title")
    .sort({ submittedAt: -1 });

  const now = new Date();
  const pendingAssignments = assignments.filter(
    (assignment) =>
      !submissions.some((submission) => String(submission.assignment?._id || submission.assignment) === String(assignment._id)) &&
      (!assignment.dueDate || new Date(assignment.dueDate) >= now)
  ).length;

  const graded = submissions.filter((item) => typeof item.mark === "number");
  const averageGrade =
    graded.length > 0 ? Number((graded.reduce((sum, item) => sum + item.mark, 0) / graded.length).toFixed(2)) : null;

  const notifications = await Notification.find({ user: studentId }).sort({ createdAt: -1 }).limit(10);

  const recentActivity = submissions.slice(0, 8).map((item) => ({
    type: item.mark !== undefined && item.mark !== null ? "grade" : "submission",
    title:
      item.mark !== undefined && item.mark !== null
        ? `Note publiée: ${item.assignment?.title || "Devoir"} (${item.mark}/20)`
        : `Soumission envoyée: ${item.assignment?.title || "Devoir"}`,
    date: item.gradedAt || item.submittedAt || item.createdAt,
  }));

  res.json({
    profile: {
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      studentPhoto: req.user.uploads?.studentPhoto || null,
    },
    stats: {
      enrolledCourses: courseIds.length,
      averageGrade,
      pendingAssignments,
    },
    recentActivity,
    notifications,
  });
};

exports.getStudentCourses = async (req, res) => {
  const studentId = req.user._id;
  const enrollments = await Enrollment.find({ student: studentId, status: "active" })
    .populate({
      path: "course",
      populate: { path: "teacher", select: "firstName lastName email filiere" },
    })
    .sort({ createdAt: -1 });

  const courses = await Promise.all(
    enrollments
      .map((item) => item.course)
      .filter(Boolean)
      .map(async (course) => {
        const assignmentIds = (
          await Assignment.find({ course: course._id }).select("_id")
        ).map((assignment) => assignment._id);
        const submittedCount = await Submission.countDocuments({
          student: studentId,
          assignment: { $in: assignmentIds },
        });
        const progress =
          assignmentIds.length > 0 ? Number(((submittedCount / assignmentIds.length) * 100).toFixed(0)) : 0;

        return {
          ...course.toObject(),
          progress,
          assignmentsTotal: assignmentIds.length,
          assignmentsSubmitted: submittedCount,
        };
      })
  );

  res.json(courses);
};

exports.getStudentCourseById = async (req, res) => {
  const studentId = req.user._id;
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: req.params.courseId,
    status: "active",
  });

  if (!enrollment) {
    res.status(404);
    throw new Error("Course not found for this student");
  }

  const course = await Course.findById(req.params.courseId).populate("teacher", "firstName lastName email filiere");
  res.json(course);
};

exports.getStudentAssignments = async (req, res) => {
  const studentId = req.user._id;
  const { page, limit, skip } = getPagination(req);

  const enrolledIds = (
    await Enrollment.find({ student: studentId, status: "active" }).select("course")
  ).map((item) => item.course);

  const query = { course: { $in: enrolledIds } };
  if (req.query.courseId) query.course = req.query.courseId;

  const [total, assignments] = await Promise.all([
    Assignment.countDocuments(query),
    Assignment.find(query)
      .populate("course", "title")
      .populate("teacher", "firstName lastName")
      .sort({ dueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  const submissions = await Submission.find({
    student: studentId,
    assignment: { $in: assignments.map((item) => item._id) },
  });
  const submissionMap = new Map(submissions.map((item) => [String(item.assignment), item]));

  const items = assignments.map((assignment) => {
    const submission = submissionMap.get(String(assignment._id));
    return {
      ...assignment.toObject(),
      submission,
      status: formatSubmissionStatus(submission, assignment),
    };
  });

  res.json({
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
};

exports.submitAssignment = async (req, res) => {
  const studentId = req.user._id;

  const assignment = await Assignment.findById(req.body.assignmentId);
  if (!assignment) {
    res.status(404);
    throw new Error("Assignment not found");
  }

  const needsUpload = !["Oral", "Examen"].includes(assignment.evaluationType || "TP");
  if (needsUpload && !req.file) {
    res.status(400);
    throw new Error("submissionFile is required for this assignment");
  }

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: assignment.course,
    status: "active",
  });
  if (!enrollment) {
    res.status(403);
    throw new Error("You cannot submit to this assignment");
  }

  const filePath = req.file?.path || "";

  const submission = await Submission.findOneAndUpdate(
    { student: studentId, assignment: assignment._id },
    {
      student: studentId,
      assignment: assignment._id,
      filePath,
      notes: req.body.notes,
      submittedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Notification.create({
    user: studentId,
    title: "Soumission reçue",
    message: `Votre soumission pour "${assignment.title}" est enregistrée.`,
    type: "success",
  });

  const io = req.app.locals.io;
  if (io) {
    io.to(`user:${studentId}`).emit("submission:updated", {
      assignmentId: assignment._id,
      title: assignment.title,
    });
  }

  res.status(201).json(submission);
};

exports.getSubmissionHistory = async (req, res) => {
  const studentId = req.user._id;
  const { page, limit, skip } = getPagination(req);
  const query = { student: studentId };

  const [total, items] = await Promise.all([
    Submission.countDocuments(query),
    Submission.find(query)
      .populate({
        path: "assignment",
        select: "title dueDate course",
        populate: { path: "course", select: "title" },
      })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.json({
    items: items.map((item) => ({
      ...item.toObject(),
      status: formatSubmissionStatus(item, item.assignment),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
};

exports.getStudentGrades = async (req, res) => {
  const studentId = req.user._id;
  const items = await Submission.find({
    student: studentId,
    mark: { $ne: null },
  })
    .populate({
      path: "assignment",
      select: "title course",
      populate: { path: "course", select: "title" },
    })
    .sort({ gradedAt: -1 });

  const byCourse = {};
  items.forEach((item) => {
    const courseTitle = item.assignment?.course?.title || "Autre";
    if (!byCourse[courseTitle]) byCourse[courseTitle] = [];
    byCourse[courseTitle].push(item.mark);
  });

  const courses = Object.entries(byCourse).map(([course, marks]) => ({
    course,
    average: Number((marks.reduce((acc, value) => acc + value, 0) / marks.length).toFixed(2)),
  }));

  const overallAverage =
    items.length > 0 ? Number((items.reduce((acc, value) => acc + value.mark, 0) / items.length).toFixed(2)) : null;

  res.json({ items, courses, overallAverage });
};

exports.getGradeReport = async (req, res) => {
  const studentId = req.user._id;
  const submissions = await Submission.find({ student: studentId, mark: { $ne: null } }).populate({
    path: "assignment",
    select: "title course",
    populate: { path: "course", select: "title" },
  });

  const average =
    submissions.length > 0
      ? Number((submissions.reduce((sum, item) => sum + item.mark, 0) / submissions.length).toFixed(2))
      : null;

  const lines = [
    `ISSAT Kasserine - Releve des notes`,
    `Etudiant: ${req.user.firstName} ${req.user.lastName} (${req.user.cin})`,
    `Date: ${new Date().toLocaleDateString("fr-FR")}`,
    "",
    ...submissions.map(
      (item) => `- ${item.assignment?.course?.title || "Cours"} | ${item.assignment?.title || "Devoir"}: ${item.mark}/20`
    ),
    "",
    `Moyenne generale: ${average !== null ? `${average}/20` : "N/A"}`,
  ];

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=grade-report.pdf");
  res.send(Buffer.from(lines.join("\n"), "utf-8"));
};

exports.getStudentSchedule = async (req, res) => {
  res.json({
    slots: [
      { time: "08:30 - 10:00", monday: "JAVA POO", tuesday: "Maths", wednesday: "SE", thursday: "AI", friday: "Libre" },
      { time: "10:10 - 11:40", monday: "Web", tuesday: "JAVA POO TP", wednesday: "AI", thursday: "Maths", friday: "Projet" },
      { time: "13:30 - 15:00", monday: "SE TP", tuesday: "Libre", wednesday: "Web TP", thursday: "Projet", friday: "Conférence" },
      { time: "15:10 - 16:40", monday: "Projet", tuesday: "Anglais", wednesday: "Libre", thursday: "SE", friday: "Web" },
      { time: "16:40 - 18:10", monday: "Libre", tuesday: "Club", wednesday: "Tutorat", thursday: "Libre", friday: "Libre" },
    ],
  });
};

exports.getStudentMessages = async (req, res) => {
  const studentId = req.user._id;
  const { page, limit, skip } = getPagination(req);
  const box = req.query.box === "sent" ? "sent" : "inbox";
  const query = box === "sent" ? { sender: studentId } : { receiver: studentId };

  const [total, items] = await Promise.all([
    DirectMessage.countDocuments(query),
    DirectMessage.find(query)
      .populate("sender", "firstName lastName role")
      .populate("receiver", "firstName lastName role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.json({
    box,
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
};

exports.sendStudentMessage = async (req, res) => {
  const studentId = req.user._id;
  const { receiverId, subject, content } = req.body;
  const receiver = await User.findOne({ _id: receiverId, role: "teacher" });
  if (!receiver) {
    res.status(400);
    throw new Error("Teacher receiver is invalid");
  }

  const message = await DirectMessage.create({
    sender: studentId,
    receiver: receiver._id,
    subject: subject || "",
    content,
  });

  const senderNotification = await Notification.create({
    user: studentId,
    title: "Message envoyé",
    message: `Votre message a été envoyé à ${receiver.firstName} ${receiver.lastName}.`,
    type: "success",
  });

  const teacherNotification = await Notification.create({
    user: receiver._id,
    title: "Nouveau message étudiant",
    message: `${req.user.firstName} ${req.user.lastName} vous a écrit.`,
    type: "info",
  });

  const io = req.app.locals.io;
  if (io) {
    io.to(`user:${studentId}`).emit("notification:new", senderNotification);
    io.to(`user:${receiver._id}`).emit("notification:new", teacherNotification);
    io.to(`user:${receiver._id}`).emit("message:new", message);
  }

  res.status(201).json(message);
};

exports.getStudentDocuments = async (req, res) => {
  const student = await User.findById(req.user._id).select("uploads");
  const enrollments = await Enrollment.find({ student: req.user._id, status: "active" }).populate("course", "title documents");

  const official = [
    { type: "Certificat de scolarite", path: student?.uploads?.studentPhoto || null },
    { type: "Releve bac", path: student?.uploads?.bacTranscript || null },
    { type: "Diplome bac", path: student?.uploads?.bacDiploma || null },
  ];

  const materials = enrollments.flatMap((item) =>
    (item.course?.documents || []).map((doc) => ({
      course: item.course?.title,
      name: doc.name,
      path: doc.filePath,
      mimeType: doc.mimeType,
    }))
  );

  res.json({ official, materials });
};

exports.getStudentProfile = async (req, res) => {
  const student = await User.findById(req.user._id).select("-password");
  res.json(student);
};

exports.updateStudentProfile = async (req, res) => {
  const student = await User.findById(req.user._id);
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  student.firstName = req.body.firstName ?? student.firstName;
  student.lastName = req.body.lastName ?? student.lastName;
  student.email = req.body.email ?? student.email;
  student.phone = req.body.phone ?? student.phone;
  student.postalAddress = req.body.postalAddress ?? student.postalAddress;
  student.filiere = req.body.filiere ?? student.filiere;
  if (req.file) {
    student.uploads = { ...(student.uploads || {}), studentPhoto: req.file.path };
  }

  await student.save();
  res.json({ message: "Profile updated", student });
};

exports.getStudentNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json(notifications);
};

exports.markStudentNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.notificationId, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }
  res.json(notification);
};

const AttendanceRecord = require("../models/AttendanceRecord");

exports.getStudentAbsences = async (req, res) => {
  const studentId = req.user._id;
  const absences = await AttendanceRecord.find({
    absentStudentIds: studentId,
  })
    .populate("teacher", "firstName lastName email")
    .sort({ sessionDate: -1 });

  res.json(absences);
};
