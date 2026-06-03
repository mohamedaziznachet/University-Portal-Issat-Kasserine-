const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");
const studentController = require("../controllers/studentController");

const router = express.Router();

router.use(protect, authorize("student"));

router.get("/dashboard", asyncHandler(studentController.getStudentDashboard));
router.get("/courses", asyncHandler(studentController.getStudentCourses));
router.get("/courses/:courseId", asyncHandler(studentController.getStudentCourseById));

router.get("/assignments", asyncHandler(studentController.getStudentAssignments));
router.post(
  "/submissions",
  upload.single("submissionFile"),
  asyncHandler(studentController.submitAssignment)
);
router.get("/submissions", asyncHandler(studentController.getSubmissionHistory));

router.get("/grades", asyncHandler(studentController.getStudentGrades));
router.get("/grades/report", asyncHandler(studentController.getGradeReport));

router.get("/absences", asyncHandler(studentController.getStudentAbsences));

router.get("/schedule", asyncHandler(studentController.getStudentSchedule));

router.get("/messages", asyncHandler(studentController.getStudentMessages));
router.post("/messages", asyncHandler(studentController.sendStudentMessage));

router.get("/documents", asyncHandler(studentController.getStudentDocuments));

router.get("/profile", asyncHandler(studentController.getStudentProfile));
router.put(
  "/profile",
  upload.single("studentPhoto"),
  asyncHandler(studentController.updateStudentProfile)
);

router.get("/notifications", asyncHandler(studentController.getStudentNotifications));
router.patch(
  "/notifications/:notificationId/read",
  asyncHandler(studentController.markStudentNotificationRead)
);

module.exports = router;
