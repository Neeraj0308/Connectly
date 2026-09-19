const mongoose = require("mongoose");

const Match = require("../models/Match");
const Message = require("../models/Message");
const Block = require("../models/Block");

const areUsersBlocked = async (userId1, userId2) => {
  const block = await Block.findOne({
    $or: [
      {
        blocker: userId1,
        blockedUser: userId2,
      },
      {
        blocker: userId2,
        blockedUser: userId1,
      },
    ],
  }).select("_id");

  return !!block;
};

const isMatchParticipant = async (matchId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(matchId)) {
    return null;
  }

  return Match.findOne({
    _id: matchId,
    isActive: true,
    $or: [{ user1: userId }, { user2: userId }],
  })
    .populate("user1", "name")
    .populate("user2", "name");
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const matches = await Match.find({
      isActive: true,
      $or: [{ user1: userId }, { user2: userId }],
    })
      .sort({ updatedAt: -1 })
      .populate("user1", "name")
      .populate("user2", "name");

    const conversations = [];

    for (const match of matches) {
      const otherUser =
        String(match.user1._id) === String(userId) ? match.user2 : match.user1;

      const blocked = await areUsersBlocked(userId, otherUser._id);

      if (blocked) {
        continue;
      }

      conversations.push({
        matchId: match._id,
        user: otherUser,
        updatedAt: match.updatedAt,
      });
    }

    return res.status(200).json({
      conversations,
    });
  } catch (error) {
    console.error("GET CONVERSATIONS ERROR:", error);

    return res.status(500).json({
      message: "Unable to load conversations",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({
        message: "Invalid match ID",
      });
    }

    const match = await isMatchParticipant(matchId, userId);

    if (!match) {
      return res.status(403).json({
        message: "You are not a participant in this match",
      });
    }

    const receiverId =
      String(match.user1._id) === String(userId)
        ? match.user2._id
        : match.user1._id;

    const blocked = await areUsersBlocked(userId, receiverId);

    if (blocked) {
      return res.status(403).json({
        message: "You cannot access this conversation",
      });
    }

    const messages = await Message.find({
      match: matchId,
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name")
      .populate("receiver", "name");

    return res.status(200).json({
      match,
      messages,
    });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);

    return res.status(500).json({
      message: "Unable to load messages",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { text } = req.body;
    const senderId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({
        message: "Invalid match ID",
      });
    }

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    const match = await isMatchParticipant(matchId, senderId);

    if (!match) {
      return res.status(403).json({
        message: "You are not a participant in this match",
      });
    }

    const receiverId =
      String(match.user1._id) === String(senderId)
        ? match.user2._id
        : match.user1._id;

    const blocked = await areUsersBlocked(senderId, receiverId);

    if (blocked) {
      return res.status(403).json({
        message: "You cannot send messages to this user",
      });
    }

    const newMessage = await Message.create({
      match: matchId,
      sender: senderId,
      receiver: receiverId,
      text: text.trim(),
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name")
      .populate("receiver", "name");

    const io = req.app.get("io");

    if (io) {
      io.to(`match:${matchId}`).emit("new_message", populatedMessage);
    }

    return res.status(201).json({
      message: populatedMessage,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR STACK:", error.stack);

    return res.status(500).json({
      message: "Unable to send message",
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
};
