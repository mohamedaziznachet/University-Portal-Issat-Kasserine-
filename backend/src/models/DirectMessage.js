const mongoose = require("mongoose");

const directMessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, trim: true },
    content: { type: String, required: true, trim: true },
    readAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DirectMessage", directMessageSchema);
