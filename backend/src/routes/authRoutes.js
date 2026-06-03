const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");
const { signup, login, me, requestPasswordReset } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/signup",
  upload.fields([
    { name: "studentPhoto", maxCount: 1 },
    { name: "cinFront", maxCount: 1 },
    { name: "cinBack", maxCount: 1 },
    { name: "bacDiploma", maxCount: 1 },
    { name: "bacTranscript", maxCount: 1 },
  ]),
  asyncHandler(signup)
);
router.post("/login", asyncHandler(login));
router.post("/request-password-reset", asyncHandler(requestPasswordReset));
router.get("/me", protect, asyncHandler(me));

module.exports = router;
