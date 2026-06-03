const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studyClass: { type: String, required: true, trim: true },
    sessionDate: { type: Date, default: Date.now },
    absentStudentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

attendanceSchema.index({ teacher: 1, studyClass: 1, sessionDate: -1 });
attendanceSchema.index({ teacher: 1, sessionDate: -1 });

module.exports = mongoose.model("AttendanceRecord", attendanceSchema);
