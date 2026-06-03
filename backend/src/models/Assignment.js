const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    instructions: { type: String, trim: true },
    dueDate: { type: Date },
    /** Nature de l'évaluation (affichée dans le fil devoir et les notifications). */
    evaluationType: {
      type: String,
      enum: ["TP", "DS", "Oral", "Examen"],
      default: "TP",
    },
    /** Barème maximal pour ce devoir (sur 20 par défaut). */
    maxScore: { type: Number, default: 20, min: 0, max: 40 },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    attachments: [
      {
        name: String,
        filePath: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
