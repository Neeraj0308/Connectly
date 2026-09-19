const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// =========================================================
// GET NOTIFICATIONS
// GET /api/notifications
// =========================================================

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "name");

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      message: "Unable to load notifications",
    });
  }
};

// =========================================================
// MARK ONE AS READ
// PATCH /api/notifications/:id/read
// =========================================================

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        recipient: req.user._id,
      },
      {
        isRead: true,
      },
      {
        new: true,
      },
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);

    return res.status(500).json({
      message: "Unable to mark notification as read",
    });
  }
};

// =========================================================
// MARK ALL AS READ
// PATCH /api/notifications/read-all
// =========================================================

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    return res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);

    return res.status(500).json({
      message: "Unable to mark notifications as read",
    });
  }
};

// =========================================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// =========================================================

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);

    return res.status(500).json({
      message: "Unable to delete notification",
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
