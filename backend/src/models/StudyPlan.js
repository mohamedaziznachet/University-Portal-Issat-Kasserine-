const mongoose = require("mongoose");

const studyPlanSchema = new mongoose.Schema(
  {
    licenseId: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyPlan", studyPlanSchema);
