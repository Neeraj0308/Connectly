const Notification = require("../models/Notification");

const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  matchId = null,
  io = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      matchId,
    });

    const populatedNotification = await Notification.findById(
      notification._id,
    ).populate("sender", "name");

    // Send real-time notification
    if (io) {
      io.to(`user:${recipient.toString()}`).emit(
        "new_notification",
        populatedNotification,
      );
    }

    return populatedNotification;
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);

    // Notification failure should NOT break
    // the main like/match/chat operation.
    return null;
  }
};

module.exports = createNotification;
