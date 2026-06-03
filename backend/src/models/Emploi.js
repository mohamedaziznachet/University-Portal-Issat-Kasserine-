const mongoose = require("mongoose");

const emploiSchema = new mongoose.Schema(
  {
    studyClass: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Emploi", emploiSchema);
