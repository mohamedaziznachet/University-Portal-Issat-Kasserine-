const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");
const teacherController = require("../controllers/teacherController");

const router = express.Router();

router.use(protect, authorize("teacher"));

router.get("/dashboard", asyncHandler(teacherController.getDashboardOverview));

router.get("/classes/summary", asyncHandler(teacherController.getTeachingClassesOverview));
router.get("/classes/:studyClass/roster", asyncHandler(teacherController.getClassRoster));
router.post("/attendance", asyncHandler(teacherController.saveAttendance));

router
  .route("/courses")
  .get(asyncHandler(teacherController.getTeacherCourses))
  .post(upload.array("documents", 10), asyncHandler(teacherController.createTeacherCourse));

router
  .route("/courses/:courseId")
  .put(upload.array("documents", 10), asyncHandler(teacherController.updateTeacherCourse))
  .delete(asyncHandler(teacherController.deleteTeacherCourse));

router.post("/courses/:courseId/students", asyncHandler(teacherController.assignStudentsToCourse));
router.get("/courses/:courseId/students", asyncHandler(teacherController.getCourseStudents));
router.get("/students/:studentId", asyncHandler(teacherController.getStudentProfile));

router
  .route("/assignments")
  .get(asyncHandler(teacherController.getTeacherAssignments))
  .post(upload.array("attachments", 10), asyncHandler(teacherController.createTeacherAssignment));

router.get("/assignments/:assignmentId/submissions", asyncHandler(teacherController.getAssignmentSubmissions));

router.get("/grades", asyncHandler(teacherController.getGrades));
router.patch("/grades/:submissionId", asyncHandler(teacherController.gradeSubmissionByTeacher));
router.get("/grades/export/csv", asyncHandler(teacherController.exportGradesCsv));

router.get("/messages", asyncHandler(teacherController.getTeacherMessages));
router.post("/messages", asyncHandler(teacherController.sendMessageToStudents));

router.get("/notifications", asyncHandler(teacherController.getTeacherNotifications));
router.patch("/notifications/:notificationId/read", asyncHandler(teacherController.markNotificationRead));

module.exports = router;
