const Post = require("../models/Post");
const User = require("../models/User");
const SitePage = require("../models/SitePage");
const GalleryItem = require("../models/GalleryItem");
const ContactMessage = require("../models/ContactMessage");
const StudyPlan = require("../models/StudyPlan");

exports.getPosts = async (req, res) => {
  const query = { isPublished: true };
  if (req.query.type) query.type = req.query.type;
  if (req.query.lang) query.lang = req.query.lang;

  const posts = await Post.find(query).sort({ publishDate: -1, createdAt: -1 });
  res.json(posts);
};

exports.getPostBySlug = async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, isPublished: true });
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  res.json(post);
};

exports.getPageBySlug = async (req, res) => {
  const page = await SitePage.findOne({ slug: req.params.slug, isPublished: true });
  if (!page) {
    res.status(404);
    throw new Error("Page not found");
  }
  res.json(page);
};

exports.getGallery = async (req, res) => {
  const query = { isPublished: true };
  if (req.query.category) query.category = req.query.category;
  const items = await GalleryItem.find(query).sort({ eventDate: -1, createdAt: -1 });
  res.json(items);
};

exports.createContactMessage = async (req, res) => {
  const message = await ContactMessage.create({
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    subject: req.body.subject,
    message: req.body.message,
  });
  res.status(201).json(message);
};

exports.getStudyPlans = async (req, res) => {
  const plans = await StudyPlan.find();
  res.json(plans);
};

exports.getTeachers = async (req, res) => {
  const teachers = await User.find({ role: "teacher", status: "active" })
    .select("firstName lastName email grade filiere uploads.studentPhoto")
    .sort({ lastName: 1 });
  res.json(teachers);
};

exports.getEmplois = async (req, res) => {
  const Emploi = require("../models/Emploi");
  const emplois = await Emploi.find().sort({ createdAt: -1 });
  res.json(emplois);
};
