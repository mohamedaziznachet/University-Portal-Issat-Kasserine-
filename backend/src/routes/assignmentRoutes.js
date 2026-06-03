const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");
const {
  createAssignment,
  getAssignments,
  submitAssignment,
  gradeSubmission,
  getSubmissionsForAssignment,
} = require("../controllers/assignmentController");

const router = express.Router();

router.get("/", asyncHandler(getAssignments));
router.post("/", protect, authorize("teacher", "admin"), upload.array("attachments", 10), asyncHandler(createAssignment));
router.post(
  "/:assignmentId/submissions",
  protect,
  authorize("student"),
  upload.single("submissionFile"),
  asyncHandler(submitAssignment)
);
router.get("/:assignmentId/submissions", protect, authorize("teacher", "admin"), asyncHandler(getSubmissionsForAssignment));
router.patch(
  "/submissions/:submissionId/grade",
  protect,
  authorize("teacher", "admin"),
  asyncHandler(gradeSubmission)
);

module.exports = router;
