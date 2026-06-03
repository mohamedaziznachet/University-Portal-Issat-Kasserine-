const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const User = require("../models/User");
const Notification = require("../models/Notification");
const DirectMessage = require("../models/DirectMessage");
const AttendanceRecord = require("../models/AttendanceRecord");

function parseVideoLinks(raw = "") {
  return String(raw)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

const EVALUATION_LABELS_FR = {
  TP: "TP (Travail pratique)",
  DS: "DS (Devoir surveillé)",
  Oral: "Oral",
  Examen: "Examen",
};

function evaluationFromBody(raw) {
  const upper = String(raw || "").trim().toUpperCase();
  if (upper === "TP" || raw === "TP") return "TP";
  if (upper === "DS" || raw === "DS") return "DS";
  if (upper === "ORAL" || raw === "Oral") return "Oral";
  if (upper === "EXAMEN" || raw === "Examen") return "Examen";
  return "TP";
}

function computeGlsiFinal(ds, tp, oral, exam) {
  const num = [ds, tp, oral, exam].map(Number);
  if (num.some((x) => Number.isNaN(x))) return null;
  return Number((0.1 * num[0] + 0.1 * num[1] + 0.1 * num[2] + 0.7 * num[3]).toFixed(2));
}

function applyOptionalNumericMark(submission, key, reqKey) {
  if (req.body[reqKey] === undefined) return;
  const v = req.body[reqKey];
  if (v === "" || v === null) {
    submission[key] = undefined;
    return;
  }
  const x = Number(v);
  if (Number.isNaN(x)) return;
  submission[key] = Math.min(20, Math.max(0, x));
}

async function enrollStudentsByStudyClass(course, academicYear) {
  if (!course.studyClass) return 0;
  const students = await User.find({
    role: "student",
    studyClass: course.studyClass,
  }).select("_id");

  await Promise.all(
    students.map((student) =>
      Enrollment.findOneAndUpdate(
        { course: course._id, student: student._id },
        {
          course: course._id,
          student: student._id,
          academicYear: academicYear || "2025-2026",
          status: "active",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  return students.length;
}

async function getEnrolledDistinctStudentsForClass(teacherId, studyClass) {
  const courseIds = (await Course.find({ teacher: teacherId }).select("_id")).map((c) => c._id);
  const enrollments = await Enrollment.find({ course: { $in: courseIds }, status: "active" }).populate({
    path: "student",
    select: "cin firstName lastName email studyClass",
  });

  const byId = new Map();
  enrollments.forEach((en) => {
    const s = en.student;
    if (!s) return;
    const scTrim = String(s.studyClass || "").trim();

    let include = false;
    if (studyClass === "(Sans groupe)") include = !scTrim;
    else include = scTrim === studyClass;

    if (!include) return;
    if (!byId.has(String(s._id))) byId.set(String(s._id), s);
  });

  return [...byId.values()].sort((a, b) =>
    `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`, "fr")
  );
}

exports.getTeachingClassesOverview = async (req, res) => {
  const teacherId = req.user._id;
  const courseIds = (await Course.find({ teacher: teacherId }).select("_id")).map((c) => c._id);
  const enrollments = await Enrollment.find({ course: { $in: courseIds }, status: "active" }).populate(
    "student",
    "studyClass"
  );

  const aggregated = new Map();
  enrollments.forEach((en) => {
    const s = en.student;
    if (!s) return;
    const sc = (s.studyClass && String(s.studyClass).trim()) ? s.studyClass.trim() : "(Sans groupe)";
    if (!aggregated.has(sc)) {
      aggregated.set(sc, new Set());
    }
    aggregated.get(sc).add(String(s._id));
  });

  const list = [...aggregated.entries()].map(([studyClassKey, ids]) => ({
    studyClass: studyClassKey,
    studentCount: ids.size,
  }));
  list.sort((a, b) => a.studyClass.localeCompare(b.studyClass, "fr"));
  res.json(list);
};

exports.getClassRoster = async (req, res) => {
  const studyClass = decodeURIComponent(req.params.studyClass || "").trim();

  if (!studyClass) {
    res.status(400);
    throw new Error("studyClass required");
  }

  const roster = await getEnrolledDistinctStudentsForClass(req.user._id, studyClass);

  const lastAttendance = await AttendanceRecord.findOne({
    teacher: req.user._id,
    studyClass,
  }).sort({ sessionDate: -1 });

  res.json({
    studyClass,
    students: roster,
    lastAttendanceAt: lastAttendance?.sessionDate || null,
  });
};

exports.saveAttendance = async (req, res) => {
  const raw = typeof req.body.studyClass === "string" ? req.body.studyClass.trim() : "";
  const studyClassDecoded = raw || "(Sans groupe)";

  const absentIds = Array.isArray(req.body.absentStudentIds) ? req.body.absentStudentIds : [];
  const roster = await getEnrolledDistinctStudentsForClass(req.user._id, studyClassDecoded);
  const rosterSet = new Set(roster.map((s) => String(s._id)));
  const validAbsent = [...new Set(absentIds)].filter((id) => rosterSet.has(String(id)));

  const attendance = await AttendanceRecord.create({
    teacher: req.user._id,
    studyClass: studyClassDecoded,
    sessionDate: req.body.sessionDate ? new Date(req.body.sessionDate) : new Date(),
    absentStudentIds: validAbsent,
  });

  await Notification.create({
    user: req.user._id,
    title: "Appel enregistré",
    message: `${validAbsent.length} absence(s) enregistrée(s) pour la classe ${studyClassDecoded}.`,
    type: "info",
  });

  // Notify absent students
  if (validAbsent.length > 0) {
    const io = req.app.locals.io;
    const teacherName = `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim();
    
    await Promise.all(validAbsent.map(async (studentId) => {
      const notif = await Notification.create({
        user: studentId,
        title: "Absence signalée",
        message: `M./Mme ${teacherName} a signalé votre absence lors de la séance du ${new Date(req.body.sessionDate || Date.now()).toLocaleDateString("fr-FR")}.`,
        type: "warning",
      });
      if (io) io.to(`user:${studentId}`).emit("notification:new", notif);
    }));
  }

  res.status(201).json(attendance);
};

function toCsv(rows) {
  const headers = ["Student CIN", "Student Name", "Assignment", "Course", "Grade", "Submitted At"];
  const lines = rows.map((row) =>
    [
      row.student?.cin || "",
      `${row.student?.firstName || ""} ${row.student?.lastName || ""}`.trim(),
      row.assignment?.title || "",
      row.assignment?.course?.title || "",
      row.mark ?? "",
      row.submittedAt ? new Date(row.submittedAt).toISOString() : "",
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [headers.join(","), ...lines].join("\n");
}

exports.getDashboardOverview = async (req, res) => {
  const teacherId = req.user._id;
  const courses = await Course.find({ teacher: teacherId }).select("_id title");
  const courseIds = courses.map((course) => course._id);

  const [studentsCount, notifications, recentCourses, recentAssignments, recentSubmissions] = await Promise.all([
    Enrollment.distinct("student", { course: { $in: courseIds } }).then((students) => students.length),
    Notification.find({ user: teacherId }).sort({ createdAt: -1 }).limit(8),
    Course.find({ teacher: teacherId }).sort({ updatedAt: -1 }).limit(5).select("title updatedAt"),
    Assignment.find({ teacher: teacherId }).sort({ createdAt: -1 }).limit(5).select("title createdAt"),
    Submission.find()
      .populate({
        path: "assignment",
        match: { teacher: teacherId },
        select: "title",
      })
      .populate("student", "firstName lastName")
      .sort({ submittedAt: -1 })
      .limit(10),
  ]);

  const recentActivity = [
    ...recentCourses.map((item) => ({
      type: "course",
      title: `Cours mis à jour: ${item.title}`,
      date: item.updatedAt,
    })),
    ...recentAssignments.map((item) => ({
      type: "assignment",
      title: `Devoir publié: ${item.title}`,
      date: item.createdAt,
    })),
    ...recentSubmissions
      .filter((item) => item.assignment)
      .map((item) => ({
        type: "submission",
        title: `Soumission reçue de ${item.student?.firstName || "Étudiant"} ${item.student?.lastName || ""}`,
        date: item.submittedAt,
      })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  res.json({
    overview: {
      totalCourses: courses.length,
      totalStudents: studentsCount,
      totalNotifications: notifications.length,
    },
    notifications,
    recentActivity,
  });
};

exports.getTeacherCourses = async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id }).sort({ createdAt: -1 });
  res.json(courses);
};

exports.createTeacherCourse = async (req, res) => {
  const studyClass =
    typeof req.body.studyClass === "string" ? req.body.studyClass.trim() : "";

  const course = await Course.create({
    title: req.body.title,
    description: req.body.description,
    filiere: req.body.filiere,
    studyClass: studyClass || undefined,
    teacher: req.user._id,
    videoLinks: parseVideoLinks(req.body.videoLinks),
    documents: (req.files || []).map((file) => ({
      name: file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
    })),
  });

  const enrolledCount = await enrollStudentsByStudyClass(course, req.body.academicYear);

  await Notification.create({
    user: req.user._id,
    title: "Nouveau cours",
    message: studyClass
      ? `Le cours "${course.title}" est publié pour la classe ${studyClass}${enrolledCount ? ` (${enrolledCount} étudiant(s))` : ""}.`
      : `Le cours "${course.title}" a été créé. Choisissez une classe lors de la publication ou assignez des étudiants manuellement.`,
    type: "success",
  });

  const coursePayload = await Course.findById(course._id).lean();
  res.status(201).json({ ...coursePayload, enrolledViaClassCount: enrolledCount });
};

exports.updateTeacherCourse = async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, teacher: req.user._id });
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  course.title = req.body.title ?? course.title;
  course.description = req.body.description ?? course.description;
  course.filiere = req.body.filiere ?? course.filiere;
  if (req.body.studyClass !== undefined) {
    course.studyClass =
      typeof req.body.studyClass === "string" && req.body.studyClass.trim()
        ? req.body.studyClass.trim()
        : undefined;
  }
  if (req.body.videoLinks !== undefined) {
    course.videoLinks = parseVideoLinks(req.body.videoLinks);
  }
  if ((req.files || []).length) {
    course.documents = [
      ...(course.documents || []),
      ...(req.files || []).map((file) => ({
        name: file.originalname,
        filePath: file.path,
        mimeType: file.mimetype,
      })),
    ];
  }

  await course.save();

  let enrolledViaClassCount = 0;
  if (course.studyClass) {
    enrolledViaClassCount = await enrollStudentsByStudyClass(course, req.body.academicYear);
  }

  const courseLean = await Course.findById(course._id).lean();
  res.json({ ...courseLean, enrolledViaClassCount });
};

exports.deleteTeacherCourse = async (req, res) => {
  const course = await Course.findOneAndDelete({ _id: req.params.courseId, teacher: req.user._id });
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  await Promise.all([
    Enrollment.deleteMany({ course: course._id }),
    Assignment.deleteMany({ course: course._id }),
  ]);

  res.json({ message: "Course deleted" });
};

exports.assignStudentsToCourse = async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, teacher: req.user._id });
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const studentIds = Array.isArray(req.body.studentIds) ? req.body.studentIds : [];
  const students = await User.find({ _id: { $in: studentIds }, role: "student" }).select("_id");

  await Promise.all(
    students.map((student) =>
      Enrollment.findOneAndUpdate(
        { course: course._id, student: student._id },
        { course: course._id, student: student._id, academicYear: req.body.academicYear || "2025-2026", status: "active" },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  res.json({ message: "Students assigned successfully", assigned: students.length });
};

exports.getCourseStudents = async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, teacher: req.user._id });
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const enrollments = await Enrollment.find({ course: course._id })
    .populate("student", "cin firstName lastName email filiere phone uploads")
    .sort({ createdAt: -1 });

  const q = (req.query.q || "").toLowerCase().trim();
  const students = enrollments
    .map((item) => item.student)
    .filter(Boolean)
    .filter((student) => {
      if (!q) return true;
      return [student.cin, student.firstName, student.lastName, student.email].some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(q)
      );
    });

  res.json(students);
};

exports.getStudentProfile = async (req, res) => {
  const student = await User.findOne({ _id: req.params.studentId, role: "student" }).select("-password");
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  res.json(student);
};

exports.getTeacherAssignments = async (req, res) => {
  const assignments = await Assignment.find({ teacher: req.user._id })
    .populate("course", "title")
    .sort({ createdAt: -1 });
  res.json(assignments);
};

exports.createTeacherAssignment = async (req, res) => {
  const course = await Course.findOne({ _id: req.body.courseId, teacher: req.user._id });
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const evaluationType = evaluationFromBody(req.body.evaluationType);
  const maxScoreRaw = req.body.maxScore != null ? Number(req.body.maxScore) : NaN;
  const maxScore = Number.isFinite(maxScoreRaw) ? Math.min(40, Math.max(1, maxScoreRaw)) : 20;

  const assignment = await Assignment.create({
    title: req.body.title,
    instructions: req.body.instructions,
    dueDate: req.body.dueDate,
    evaluationType,
    maxScore,
    course: course._id,
    teacher: req.user._id,
    attachments: (req.files || []).map((file) => ({
      name: file.originalname,
      filePath: file.path,
    })),
  });

  const teacherLabel =
    `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || "enseignant";

  await Notification.create({
    user: req.user._id,
    title: "Nouveau devoir",
    message: `[${evaluationType}] ${EVALUATION_LABELS_FR[evaluationType]} • « ${assignment.title} » (barème /${maxScore}) — cours ${course.title}.`,
    type: "info",
  });

  const enrolledStudents = await Enrollment.find({ course: course._id, status: "active" }).select("student");
  const studentIds = enrolledStudents.map((item) => String(item.student));
  if (studentIds.length) {
    const notifications = await Notification.insertMany(
      studentIds.map((studentId) => ({
        user: studentId,
        title: `Nouveau devoir (${evaluationType})`,
        message: `${teacherLabel} a publié « ${assignment.title} » (${EVALUATION_LABELS_FR[evaluationType]}, barème /${maxScore}). Consultez vos devoirs.`,
        type: "info",
      }))
    );
    const io = req.app.locals.io;
    if (io) {
      notifications.forEach((notification) => {
        io.to(`user:${notification.user}`).emit("notification:new", notification);
      });
    }
  }

  res.status(201).json(assignment);
};

exports.getAssignmentSubmissions = async (req, res) => {
  const assignment = await Assignment.findOne({ _id: req.params.assignmentId, teacher: req.user._id });
  if (!assignment) {
    res.status(404);
    throw new Error("Assignment not found");
  }

  const submissions = await Submission.find({ assignment: assignment._id })
    .populate("student", "cin firstName lastName email")
    .sort({ submittedAt: -1 });

  res.json(submissions);
};

exports.gradeSubmissionByTeacher = async (req, res) => {
  const submission = await Submission.findById(req.params.submissionId).populate({
    path: "assignment",
    select: "teacher title",
  });
  if (!submission || !submission.assignment) {
    res.status(404);
    throw new Error("Submission not found");
  }
  if (String(submission.assignment.teacher) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Forbidden");
  }

  const assignmentTitle = submission.assignment.title || "Devoir";

  applyOptionalNumericMark(submission, "markDs", "ds");
  applyOptionalNumericMark(submission, "markTp", "tp");
  applyOptionalNumericMark(submission, "markOral", "oral");
  applyOptionalNumericMark(submission, "markExamen", "examen");

  submission.feedback = req.body.feedback !== undefined ? req.body.feedback : submission.feedback || "";

  const has =
    submission.markDs != null &&
    submission.markTp != null &&
    submission.markOral != null &&
    submission.markExamen != null;
  const synthesized = has ? computeGlsiFinal(submission.markDs, submission.markTp, submission.markOral, submission.markExamen) : null;

  if (req.body.mark !== undefined && req.body.mark !== "") {
    const m = Number(req.body.mark);
    if (!Number.isNaN(m)) submission.mark = Math.min(20, Math.max(0, m));
  } else if (synthesized !== null) {
    submission.mark = synthesized;
  }

  submission.gradedAt = new Date();
  await submission.save();

  if (submission.student) {
    const markStr =
      submission.mark != null ? `${Number(submission.mark).toFixed(2)}` : "—";
    const notif = await Notification.create({
      user: submission.student,
      title: "Notation mise à jour",
      message:
        synthesized != null && (req.body.mark === undefined || req.body.mark === "")
          ? `Résultat (DS/TP/Oral/Examen) pour « ${assignmentTitle} » : ${markStr}/20.`
          : `Vos notes ont été mises à jour pour « ${assignmentTitle} » (note affichée : ${markStr}/20).`,
      type: "success",
    });
    const io = req.app.locals.io;
    if (io) io.to(`user:${submission.student}`).emit("notification:new", notif);
  }

  const populated = await Submission.findById(submission._id)
    .populate("student", "cin firstName lastName email")
    .populate({ path: "assignment", select: "title evaluationType maxScore teacher" })
    .lean();

  res.json(populated);
};

exports.getGrades = async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id }).select("_id");
  const courseIds = courses.map((course) => course._id);
  const assignments = await Assignment.find({ course: { $in: courseIds } }).select("_id");
  const assignmentIds = assignments.map((assignment) => assignment._id);

  const query = { assignment: { $in: assignmentIds } };
  if (req.query.courseId) {
    const filteredAssignments = await Assignment.find({
      teacher: req.user._id,
      course: req.query.courseId,
    }).select("_id");
    query.assignment = { $in: filteredAssignments.map((item) => item._id) };
  }

  const grades = await Submission.find(query)
    .populate({
      path: "assignment",
      select: "title course",
      populate: { path: "course", select: "title" },
    })
    .populate("student", "cin firstName lastName")
    .sort({ gradedAt: -1, submittedAt: -1 });

  const grouped = {};
  grades.forEach((item) => {
    if (!item.student) return;
    const key = String(item.student._id);
    if (!grouped[key]) {
      grouped[key] = { student: item.student, values: [] };
    }
    if (typeof item.mark === "number") {
      grouped[key].values.push(item.mark);
    }
  });

  const averages = Object.values(grouped).map((entry) => {
    const average =
      entry.values.length > 0
        ? Number((entry.values.reduce((acc, value) => acc + value, 0) / entry.values.length).toFixed(2))
        : null;
    return { student: entry.student, average };
  });

  res.json({ grades, averages });
};

exports.exportGradesCsv = async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id }).select("_id");
  const assignments = await Assignment.find({ course: { $in: courses.map((item) => item._id) } }).select("_id");
  const grades = await Submission.find({ assignment: { $in: assignments.map((item) => item._id) } })
    .populate({
      path: "assignment",
      select: "title course",
      populate: { path: "course", select: "title" },
    })
    .populate("student", "cin firstName lastName");

  const csv = toCsv(grades);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=teacher-grades.csv");
  res.status(200).send(csv);
};

exports.getTeacherMessages = async (req, res) => {
  const teacherId = req.user._id;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;
  
  const box = req.query.box === "sent" ? "sent" : "inbox";
  const query = box === "sent" ? { sender: teacherId } : { receiver: teacherId };

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

exports.sendMessageToStudents = async (req, res) => {
  const studentIds = Array.isArray(req.body.studentIds) ? req.body.studentIds : [];
  let students = [];
  
  // if no studentIds provided, maybe receiverId is provided for single message
  if (req.body.receiverId) {
    const s = await User.findOne({ _id: req.body.receiverId, role: "student" }).select("_id firstName lastName");
    if (s) students = [s];
  } else if (studentIds.length > 0) {
    students = await User.find({ _id: { $in: studentIds }, role: "student" }).select("_id firstName lastName");
  }

  if (!students.length) {
    res.status(400);
    throw new Error("No valid students selected");
  }

  const messages = await Promise.all(
    students.map((student) =>
      DirectMessage.create({
        sender: req.user._id,
        receiver: student._id,
        subject: req.body.subject,
        content: req.body.content,
      })
    )
  );

  await Notification.create({
    user: req.user._id,
    title: "Message envoyé",
    message: `${students.length} étudiant(s) ont reçu votre message.`,
    type: "success",
  });

  const studentNotifications = await Notification.insertMany(
    students.map((student) => ({
      user: student._id,
      title: "Nouveau message enseignant",
      message: `${req.user.firstName} ${req.user.lastName} vous a envoyé un message.`,
      type: "info",
    }))
  );
  const io = req.app.locals.io;
  if (io) {
    studentNotifications.forEach((notification) => {
      io.to(`user:${notification.user}`).emit("notification:new", notification);
    });
    // emit message to each student
    messages.forEach((msg, idx) => {
      io.to(`user:${students[idx]._id}`).emit("message:new", msg);
    });
  }

  res.status(201).json({ message: "Messages sent", recipients: students.length });
};

exports.getTeacherNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);
  res.json(notifications);
};

exports.markNotificationRead = async (req, res) => {
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
