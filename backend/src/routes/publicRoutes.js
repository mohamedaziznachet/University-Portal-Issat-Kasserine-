const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const {
  getPosts,
  getPostBySlug,
  getPageBySlug,
  getGallery,
  createContactMessage,
  getStudyPlans,
  getTeachers,
  getEmplois,
} = require("../controllers/publicController");

const router = express.Router();

router.get("/posts", asyncHandler(getPosts));
router.get("/posts/:slug", asyncHandler(getPostBySlug));
router.get("/pages/:slug", asyncHandler(getPageBySlug));
router.get("/gallery", asyncHandler(getGallery));
router.post("/contact", asyncHandler(createContactMessage));
router.get("/study-plans", asyncHandler(getStudyPlans));
router.get("/teachers", asyncHandler(getTeachers));
router.get("/emplois", asyncHandler(getEmplois));

module.exports = router;
