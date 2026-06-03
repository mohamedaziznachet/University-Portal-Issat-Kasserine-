const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");
const {
  createPost,
  upsertPage,
  createGalleryItem,
  getContactMessages,
  updateContactStatus,
  enrollStudent,
  getUsers,
  createEmploi,
  getEmplois,
  getPosts,
  updatePost,
  createStudyPlan,
  getStudyPlans,
  getAdminStats,
  updateUserStatus,
  resetUserPassword,
  getPasswordResetRequests,
  resolvePasswordResetRequest,
  deletePost,
  deleteEmploi,
  deleteStudyPlan,
  updateEmploi,
  updateStudyPlan,
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect, authorize("admin"));

router.post("/posts", upload.array("attachments", 10), asyncHandler(createPost));
router.put("/pages", asyncHandler(upsertPage));
router.post("/gallery", upload.single("image"), asyncHandler(createGalleryItem));
router.get("/contact-messages", asyncHandler(getContactMessages));
router.patch("/contact-messages/:id", asyncHandler(updateContactStatus));
router.post("/enrollments", asyncHandler(enrollStudent));

router.get("/stats", asyncHandler(getAdminStats));
router.get("/users", asyncHandler(getUsers));
router.patch("/users/:id/status", asyncHandler(updateUserStatus));
router.post("/users/:id/reset-password", asyncHandler(resetUserPassword));
router.get("/password-reset-requests", asyncHandler(getPasswordResetRequests));
router.post("/password-reset-requests/:requestId/resolve", asyncHandler(resolvePasswordResetRequest));
router.post("/emplois", upload.single("file"), asyncHandler(createEmploi));
router.get("/emplois", asyncHandler(getEmplois));
router.get("/posts", asyncHandler(getPosts));
router.put("/posts/:id", upload.array("attachments", 10), asyncHandler(updatePost));

router.post("/study-plans", upload.single("file"), asyncHandler(createStudyPlan));
router.get("/study-plans", asyncHandler(getStudyPlans));

router.delete("/posts/:id", asyncHandler(deletePost));
router.delete("/emplois/:id", asyncHandler(deleteEmploi));
router.delete("/study-plans/:id", asyncHandler(deleteStudyPlan));

router.put("/emplois/:id", upload.single("file"), asyncHandler(updateEmploi));
router.put("/study-plans/:id", upload.single("file"), asyncHandler(updateStudyPlan));

module.exports = router;
