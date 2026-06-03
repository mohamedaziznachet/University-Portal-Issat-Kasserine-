const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { clientUrl } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const publicRoutes = require("./routes/publicRoutes");
const adminRoutes = require("./routes/adminRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const VisitorLog = require("./models/VisitorLog");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use((req, res, next) => {
  // Lightweight visitor/activity log (including visitors without auth)
  VisitorLog.create({
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    path: req.path,
    method: req.method,
    referrer: req.headers.referer,
  }).catch(() => null);
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
