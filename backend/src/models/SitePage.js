const mongoose = require("mongoose");

const sitePageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    lang: { type: String, enum: ["fr", "en", "ar"], default: "fr" },
    isPublished: { type: Boolean, default: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SitePage", sitePageSchema);
