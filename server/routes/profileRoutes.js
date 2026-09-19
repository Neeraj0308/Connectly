const express = require("express");

const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  getProfileStatus,
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/me", getMyProfile);

router.get("/me/status", getProfileStatus);

router.put("/me", updateMyProfile);

module.exports = router;
