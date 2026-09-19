const express = require("express");
const router = express.Router();

const profileCompletionMiddleware = require("../middleware/profileCompletionMiddleware");

const {
  getConversations,
  getMessages,
  sendMessage,
} = require("../controllers/chatController");

const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.use(profileCompletionMiddleware);

router.get("/conversations", getConversations);

router.get("/:matchId/messages", getMessages);

router.post("/:matchId/messages", sendMessage);

module.exports = router;
