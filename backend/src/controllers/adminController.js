const Post = require("../models/Post");
const SitePage = require("../models/SitePage");
const GalleryItem = require("../models/GalleryItem");
const ContactMessage = require("../models/ContactMessage");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const Emploi = require("../models/Emploi");
const StudyPlan = require("../models/StudyPlan");
const PasswordResetRequest = require("../models/PasswordResetRequest");

exports.createPost = async (req, res) => {
  const post = await Post.create({
    type: req.body.type,
    title: req.body.title,
    slug: req.body.slug,
    summary: req.body.summary,
    content: req.body.content,
    lang: req.body.lang || "fr",
    isPublished: req.body.isPublished !== false,
    publishDate: req.body.publishDate || new Date(),
    author: req.user._id,
    meta: {
      tenderCode: req.body.tenderCode,
      closingDate: req.body.closingDate,
      location: req.body.location,
    },
    attachments: (req.files || []).map((file) => ({
      name: file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
    })),
  });
  res.status(201).json(post);
};

exports.updatePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  post.type = req.body.type || post.type;
  post.title = req.body.title || post.title;
  post.slug = req.body.slug || post.slug;
  post.summary = req.body.summary !== undefined ? req.body.summary : post.summary;
  post.content = req.body.content !== undefined ? req.body.content : post.content;
  post.isPublished = req.body.isPublished !== undefined ? req.body.isPublished === "true" || req.body.isPublished === true : post.isPublished;
  if (req.body.publishDate) post.publishDate = new Date(req.body.publishDate);
  
  if (req.files && req.files.length > 0) {
    post.attachments = req.files.map((file) => ({
      name: file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
    }));
  }

  const updatedPost = await post.save();
  res.json(updatedPost);
};

exports.upsertPage = async (req, res) => {
  const page = await SitePage.findOneAndUpdate(
    { slug: req.body.slug },
    {
      title: req.body.title,
      content: req.body.content,
      lang: req.body.lang || "fr",
      isPublished: req.body.isPublished !== false,
      author: req.user._id,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json(page);
};

exports.createGalleryItem = async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Image is required");
  }
  const item = await GalleryItem.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category || "general",
    eventDate: req.body.eventDate,
    imagePath: req.file.path,
    author: req.user._id,
  });
  res.status(201).json(item);
};

exports.getContactMessages = async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
};

exports.updateContactStatus = async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }
  res.json(message);
};

exports.enrollStudent = async (req, res) => {
  const enrollment = await Enrollment.create({
    student: req.body.studentId,
    course: req.body.courseId,
    academicYear: req.body.academicYear,
    status: req.body.status || "active",
  });
  res.status(201).json(enrollment);
};

exports.getUsers = async (req, res) => {
  const { role, search, status } = req.query;
  let query = {};
  if (role && role !== "all") query.role = role;
  if (status && status !== "all") query.status = status;
  if (search) {
    query.$or = [
      { firstName: new RegExp(search, "i") },
      { lastName: new RegExp(search, "i") },
      { cin: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
    ];
  }
  const users = await User.find(query).select("-password").sort({ createdAt: -1 });
  res.json(users);
};

exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["pending", "active", "blocked"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const oldStatus = user.status;
  user.status = status;

  if (status === "active" && oldStatus !== "active") {
    user.acceptedAt = new Date();
    user.acceptedBy = req.user._id;

    // Generate numInscription for students if not present
    if (user.role === "student" && !user.numInscription) {
      const year = new Date().getFullYear().toString().slice(-2);
      const count = await User.countDocuments({ role: "student", numInscription: new RegExp(`^${year}`) });
      user.numInscription = `${year}${(count + 1).toString().padStart(4, '0')}`;
    }
  }

  await user.save();
  res.json({ 
    message: "Statut mis à jour", 
    user: { 
      id: user._id, 
      status: user.status,
      numInscription: user.numInscription,
      acceptedAt: user.acceptedAt
    } 
  });
};

exports.resetUserPassword = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  
  // Set password to CIN, or a default if no CIN
  const newPassword = user.cin || "123456";
  user.password = newPassword;
  await user.save();
  
  // Mark any pending reset requests for this user as resolved
  await PasswordResetRequest.updateMany(
    { user: user._id, status: "pending" },
    { status: "resolved", resolvedBy: req.user._id, resolvedAt: new Date() }
  );

  res.json({ message: "Mot de passe réinitialisé", newPassword });
};

exports.getPasswordResetRequests = async (req, res) => {
  const requests = await PasswordResetRequest.find({ status: "pending" })
    .populate("user", "firstName lastName cin email role")
    .sort({ createdAt: -1 });
  res.json(requests);
};

exports.resolvePasswordResetRequest = async (req, res) => {
  const { requestId } = req.params;
  const request = await PasswordResetRequest.findById(requestId).populate("user");
  
  if (!request) {
    res.status(404);
    throw new Error("Demande non trouvée");
  }

  const user = request.user;
  if (!user) {
    res.status(404);
    throw new Error("Utilisateur associé non trouvé");
  }

  // Reset password to CIN
  const newPassword = user.cin || "123456";
  user.password = newPassword;
  await user.save();

  request.status = "resolved";
  request.resolvedBy = req.user._id;
  request.resolvedAt = new Date();
  await request.save();

  res.json({ message: "Mot de passe réinitialisé et demande résolue", newPassword });
};

exports.createEmploi = async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Un fichier PDF ou image est requis");
  }
  const emploi = await Emploi.create({
    studyClass: req.body.studyClass,
    semester: req.body.semester,
    academicYear: req.body.academicYear,
    fileUrl: req.file.path,
    uploadedBy: req.user._id,
  });
  res.status(201).json(emploi);
};

exports.getEmplois = async (req, res) => {
  const emplois = await Emploi.find().populate("uploadedBy", "firstName lastName").sort({ createdAt: -1 });
  res.json(emplois);
};

exports.getPosts = async (req, res) => {
  const posts = await Post.find().populate("author", "firstName lastName").sort({ publishDate: -1 });
  res.json(posts);
};

exports.createStudyPlan = async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Un fichier PDF est requis");
  }
  const studyPlan = await StudyPlan.findOneAndUpdate(
    { licenseId: req.body.licenseId },
    {
      title: req.body.title,
      fileUrl: req.file.path,
      uploadedBy: req.user._id,
    },
    { new: true, upsert: true }
  );
  res.status(201).json(studyPlan);
};

exports.updateEmploi = async (req, res) => {
  const { studyClass, semester, academicYear } = req.body;
  const emploi = await Emploi.findById(req.params.id);
  if (!emploi) {
    res.status(404);
    throw new Error("Emploi not found");
  }
  
  emploi.studyClass = studyClass || emploi.studyClass;
  emploi.semester = semester || emploi.semester;
  emploi.academicYear = academicYear || emploi.academicYear;
  
  if (req.file) {
    emploi.fileUrl = req.file.path.replace(/\\/g, "/");
  }
  
  await emploi.save();
  res.json(emploi);
};

exports.updateStudyPlan = async (req, res) => {
  const { licenseId, title } = req.body;
  const plan = await StudyPlan.findById(req.params.id);
  if (!plan) {
    res.status(404);
    throw new Error("Plan not found");
  }
  
  plan.licenseId = licenseId || plan.licenseId;
  plan.title = title || plan.title;
  
  if (req.file) {
    plan.fileUrl = req.file.path.replace(/\\/g, "/");
  }
  
  await plan.save();
  res.json(plan);
};

exports.getStudyPlans = async (req, res) => {
  const plans = await StudyPlan.find().populate("uploadedBy", "firstName lastName").sort({ createdAt: -1 });
  res.json(plans);
};

exports.deletePost = async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  res.json({ message: "Publication supprimée" });
};

exports.deleteEmploi = async (req, res) => {
  const emploi = await Emploi.findByIdAndDelete(req.params.id);
  if (!emploi) {
    res.status(404);
    throw new Error("Emploi not found");
  }
  res.json({ message: "Emploi supprimé" });
};

exports.deleteStudyPlan = async (req, res) => {
  const plan = await StudyPlan.findByIdAndDelete(req.params.id);
  if (!plan) {
    res.status(404);
    throw new Error("Plan not found");
  }
  res.json({ message: "Plan d'étude supprimé" });
};

exports.getAdminStats = async (req, res) => {
  const [
    studentsTotal, studentsActive, studentsPending,
    teachersTotal, teachersActive, teachersPending,
    adminsTotal,
    pendingInscriptions,
    pendingResets,
    recentPosts
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "student", status: "active" }),
    User.countDocuments({ role: "student", status: "pending" }),
    User.countDocuments({ role: "teacher" }),
    User.countDocuments({ role: "teacher", status: "active" }),
    User.countDocuments({ role: "teacher", status: "pending" }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ status: "pending" }),
    PasswordResetRequest.countDocuments({ status: "pending" }),
    Post.find().sort({ createdAt: -1 }).limit(5).populate("author", "firstName lastName")
  ]);

  res.json({
    users: [
      { role: "Étudiants", total: studentsTotal, active: studentsActive, pending: studentsPending },
      { role: "Enseignants", total: teachersTotal, active: teachersActive, pending: teachersPending },
      { role: "Administrateurs", total: adminsTotal, active: adminsTotal },
    ],
    pendingCounts: {
      inscriptions: pendingInscriptions,
      resets: pendingResets
    },
    moderationQueue: recentPosts.map(p => ({
      item: p.title,
      type: p.type === "news" ? "Actualité" : p.type === "notice" ? "Annonce" : p.type,
      owner: p.author ? `${p.author.firstName} ${p.author.lastName}` : "Inconnu",
      date: p.createdAt
    }))
  });
};
