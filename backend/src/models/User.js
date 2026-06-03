const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["student", "teacher", "admin", "visitor"],
      required: true,
      default: "student",
    },
    status: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: "pending",
    },
    gender: {
      type: String,
      enum: ["M", "F"],
    },
    nationality: {
      type: String,
      trim: true,
      default: "Tunisienne",
    },
    cin: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      required() {
        return this.role !== "visitor";
      },
    },
    password: { type: String, required: true, minlength: 6 },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    postalAddress: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    maritalStatus: { type: String, trim: true },
    birthDate: { type: Date },
    birthPlace: { type: String, trim: true },
    parents: {
      father: {
        firstName: String,
        lastName: String,
        profession: String,
      },
      mother: {
        firstName: String,
        lastName: String,
        profession: String,
      },
    },
    diplomas: [{ type: String }],
    bacNature: {
      type: String,
      enum: ["principale", "controle"],
    },
    academicPath: { type: String },
    bacGrade: { type: Number, min: 0, max: 20 },
    filiere: { type: String, trim: true },
    grade: { type: String, trim: true },
    glsiScore: { type: Number, min: 0, max: 20 },
    /** Groupe / classe administrative (ex. GLSI-L2-A). Utilisée pour cours, absences, appels. */
    studyClass: { type: String, trim: true },
    numInscription: { type: String, unique: true, sparse: true },
    acceptedAt: { type: Date },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploads: {
      studentPhoto: String,
      cinFront: String,
      cinBack: String,
      bacDiploma: String,
      bacTranscript: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
