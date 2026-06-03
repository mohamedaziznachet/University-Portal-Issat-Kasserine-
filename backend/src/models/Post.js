const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["news", "scientific_event", "professional_event", "agenda", "tender", "notice"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    summary: { type: String, trim: true },
    content: { type: String, trim: true },
    lang: { type: String, enum: ["fr", "en", "ar"], default: "fr" },
    isPublished: { type: Boolean, default: true },
    publishDate: { type: Date, default: Date.now },
    attachments: [
      {
        name: String,
        filePath: String,
        mimeType: String,
      },
    ],
    meta: {
      tenderCode: String,
      closingDate: Date,
      location: String,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

postSchema.index({ type: 1, publishDate: -1 });

module.exports = mongoose.model("Post", postSchema);
