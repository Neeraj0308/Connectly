const express = require("express");

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 
router.get("/", authMiddleware, getNotifications);

router.patch("/read-all", authMiddleware, markAllAsRead);

router.patch("/:id/read", authMiddleware, markAsRead);

router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;
