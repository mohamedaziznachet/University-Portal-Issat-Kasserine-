const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PasswordResetRequest = require("../models/PasswordResetRequest");
const { jwtSecret } = require("../config/env");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: "7d" });
}

function mapSignupUploads(files = {}) {
  const getRel = (field) => {
    const f = files[field] && files[field][0];
    if (!f) return undefined;
    // f.path is absolute, but we want fieldname/filename
    return `${f.fieldname}/${f.filename}`;
  };
  return {
    studentPhoto: getRel("studentPhoto"),
    cinFront: getRel("cinFront"),
    cinBack: getRel("cinBack"),
    bacDiploma: getRel("bacDiploma"),
    bacTranscript: getRel("bacTranscript"),
  };
}

exports.signup = async (req, res) => {
  const existing = await User.findOne({
    $or: [{ cin: req.body.cin }, { email: req.body.email }],
  });

  if (existing) {
    res.status(400);
    throw new Error("User with this CIN or email already exists");
  }

  const user = await User.create({
    role: req.body.role || "student",
    cin: req.body.cin,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    postalAddress: req.body.postalAddress,
    phone: req.body.phone,
    email: req.body.email,
    gender: req.body.gender,
    nationality: req.body.nationality,
    maritalStatus: req.body.maritalStatus,
    birthDate: req.body.birthDate,
    birthPlace: req.body.birthPlace,
    parents: {
      father: {
        firstName: req.body.fatherFirstName,
        lastName: req.body.fatherLastName,
        profession: req.body.fatherProfession,
      },
      mother: {
        firstName: req.body.motherFirstName,
        lastName: req.body.motherLastName,
        profession: req.body.motherProfession,
      },
    },
    diplomas: req.body.diplomas ? [req.body.diplomas] : [],
    bacNature: req.body.bacNature,
    academicPath: req.body.academicPath,
    bacGrade: req.body.bacGrade,
    glsiScore: req.body.glsiScore,
    filiere: req.body.filiere,
    uploads: mapSignupUploads(req.files),
  });

  res.status(201).json({
    message: "Inscription réussie. Votre compte est en attente d'approbation.",
    user: {
      id: user._id,
      role: user.role,
      cin: user.cin,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
    },
  });
};

exports.login = async (req, res) => {
  const { cin, password, role } = req.body;
  const user = await User.findOne({ cin });

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid CIN or password");
  }

  if (user.status === "blocked") {
    res.status(403);
    throw new Error("Votre compte a été bloqué par l'administration.");
  }

  if (role && user.role !== role) {
    res.status(403);
    throw new Error("Role mismatch");
  }

  res.json({
    token: signToken(user),
    user: {
      id: user._id,
      role: user.role,
      cin: user.cin,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
    },
  });
};

exports.me = async (req, res) => {
  res.json(req.user);
};

exports.requestPasswordReset = async (req, res) => {
  const { cin, email } = req.body;

  const user = await User.findOne({ cin, email });
  if (!user) {
    res.status(404);
    throw new Error("Aucun utilisateur trouvé avec ce CIN et cet email.");
  }

  // Check if there is already a pending request
  const existing = await PasswordResetRequest.findOne({ user: user._id, status: "pending" });
  if (existing) {
    return res.json({ message: "Une demande de réinitialisation est déjà en cours." });
  }

  await PasswordResetRequest.create({
    user: user._id,
    cin,
    email
  });

  res.json({ message: "Votre demande de réinitialisation a été envoyée à l'administration." });
};
