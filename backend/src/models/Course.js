const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filiere: { type: String, trim: true },
    /** Classe cible lors de la publication : les étudiants de ce groupe sont inscrits automatiquement. */
    studyClass: { type: String, trim: true },
    documents: [
      {
        name: String,
        filePath: String,
        mimeType: String,
      },
    ],
    videoLinks: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
