const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Course = require("../models/Course");

exports.createAssignment = async (req, res) => {
  const course = await Course.findById(req.body.courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }
  if (String(course.teacher) !== String(req.user._id)) {
    res.status(403);
    throw new Error("You can only add assignments to your own courses");
  }

  const assignment = await Assignment.create({
    title: req.body.title,
    instructions: req.body.instructions,
    dueDate: req.body.dueDate,
    course: course._id,
    teacher: req.user._id,
    attachments: (req.files || []).map((file) => ({
      name: file.originalname,
      filePath: file.path,
    })),
  });

  const populated = await assignment.populate([
    { path: "teacher", select: "firstName lastName email" },
    { path: "course", select: "title filiere" },
  ]);

  res.status(201).json(populated);
};

exports.getAssignments = async (req, res) => {
  const query = {};
  if (req.query.courseId) query.course = req.query.courseId;
  if (req.query.teacherId) query.teacher = req.query.teacherId;

  const assignments = await Assignment.find(query)
    .populate("teacher", "firstName lastName email")
    .populate("course", "title filiere")
    .sort({ createdAt: -1 });

  res.json(assignments);
};

exports.submitAssignment = async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Submission file is required");
  }

  const assignment = await Assignment.findById(req.params.assignmentId);
  if (!assignment) {
    res.status(404);
    throw new Error("Assignment not found");
  }

  const submission = await Submission.findOneAndUpdate(
    { assignment: assignment._id, student: req.user._id },
    {
      assignment: assignment._id,
      student: req.user._id,
      filePath: req.file.path,
      notes: req.body.notes,
      submittedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate("student", "firstName lastName email cin");

  res.status(201).json(submission);
};

exports.gradeSubmission = async (req, res) => {
  const submission = await Submission.findById(req.params.submissionId)
    .populate("assignment")
    .populate("student", "firstName lastName email cin");

  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }

  if (String(submission.assignment.teacher) !== String(req.user._id)) {
    res.status(403);
    throw new Error("You can only grade submissions for your own assignments");
  }

  submission.mark = req.body.mark;
  submission.feedback = req.body.feedback;
  submission.gradedAt = new Date();
  await submission.save();

  res.json(submission);
};

exports.getSubmissionsForAssignment = async (req, res) => {
  const submissions = await Submission.find({ assignment: req.params.assignmentId })
    .populate("student", "firstName lastName email cin")
    .sort({ submittedAt: -1 });

  res.json(submissions);
};
