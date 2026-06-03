const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filePath: { type: String, default: "" },
    notes: { type: String, trim: true },
    /** Note synthétique (/20). Si vide, peut être dérivée des composantes lors de la notation. */
    mark: { type: Number, min: 0, max: 20 },
    /** Composantes facultatives pour la grille type GLSI. */
    markTp: { type: Number, min: 0, max: 20 },
    markDs: { type: Number, min: 0, max: 20 },
    markOral: { type: Number, min: 0, max: 20 },
    markExamen: { type: Number, min: 0, max: 20 },
    feedback: { type: String, trim: true },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date },
  },
  { timestamps: true }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
