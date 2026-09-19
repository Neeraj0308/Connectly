const express = require("express");

const router = express.Router();

const {
  discoverProfiles,
  likeUser,
  getLikeStatus,
  passUser,
  getWhoLikedMe,
} = require("../controllers/interactionController");

const authMiddleware = require("../middleware/authMiddleware");
const premiumMiddleware = require("../middleware/premiumMiddleware");
const profileCompletionMiddleware = require("../middleware/profileCompletionMiddleware");

router.use(authMiddleware);

/* Profile MUST be completed before dating features */

router.get("/discover", profileCompletionMiddleware, discoverProfiles);

router.get("/like-status", profileCompletionMiddleware, getLikeStatus);

router.post("/:userId/like", profileCompletionMiddleware, likeUser);

router.post("/:userId/pass", profileCompletionMiddleware, passUser);

router.get(
  "/who-liked-me",
  profileCompletionMiddleware,
  premiumMiddleware,
  getWhoLikedMe,
);

module.exports = router;
