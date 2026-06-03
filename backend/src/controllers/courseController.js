const Course = require("../models/Course");

exports.createCourse = async (req, res) => {
  const course = await Course.create({
    title: req.body.title,
    description: req.body.description,
    filiere: req.body.filiere,
    teacher: req.user._id,
    documents: (req.files || []).map((file) => ({
      name: file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
    })),
  });

  const populated = await course.populate("teacher", "firstName lastName email filiere");
  res.status(201).json(populated);
};

exports.getCourses = async (req, res) => {
  const query = {};
  if (req.query.teacherId) query.teacher = req.query.teacherId;
  if (req.query.filiere) query.filiere = req.query.filiere;

  const courses = await Course.find(query)
    .populate("teacher", "firstName lastName email filiere")
    .sort({ createdAt: -1 });

  res.json(courses);
};

exports.getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id).populate("teacher", "firstName lastName email filiere");
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }
  res.json(course);
};
