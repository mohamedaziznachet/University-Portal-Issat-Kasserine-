const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");
const { createCourse, getCourses, getCourseById } = require("../controllers/courseController");

const router = express.Router();

router.get("/", asyncHandler(getCourses));
router.get("/:id", asyncHandler(getCourseById));
router.post("/", protect, authorize("teacher", "admin"), upload.array("documents", 10), asyncHandler(createCourse));

module.exports = router;
