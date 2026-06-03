const mongoose = require("mongoose");

const visitorLogSchema = new mongoose.Schema(
  {
    ip: String,
    userAgent: String,
    path: String,
    method: String,
    referrer: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("VisitorLog", visitorLogSchema);
