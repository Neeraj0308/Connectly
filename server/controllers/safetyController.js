const mongoose = require("mongoose");

const User = require("../models/User");
const Report = require("../models/Report");
const Block = require("../models/Block");
const Interaction = require("../models/Interaction");
const Match = require("../models/Match");

const reportUser = async (req, res) => {
  try {
    const reporterId = req.user._id;
    const reportedUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(reportedUserId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (reporterId.toString() === reportedUserId) {
      return res.status(400).json({
        message: "You cannot report yourself",
      });
    }

    const { reason, description = "" } = req.body;

    const validReasons = [
      "fake_profile",
      "harassment",
      "spam",
      "inappropriate_content",
      "scam",
      "underage",
      "other",
    ];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        message: "Invalid report reason",
      });
    }

    const reportedUser = await User.findById(reportedUserId);

    if (!reportedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingReport = await Report.findOne({
      reporter: reporterId,
      reportedUser: reportedUserId,
      status: "pending",
    });

    if (existingReport) {
      return res.status(409).json({
        message: "You have already reported this user",
      });
    }

    const report = await Report.create({
      reporter: reporterId,
      reportedUser: reportedUserId,
      reason,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.error("REPORT USER ERROR:", error);

    return res.status(500).json({
      message: "Unable to submit report",
    });
  }
};

const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({
      reporter: req.user._id,
    })
      .populate("reportedUser", "name")
      .sort({ createdAt: -1 });

    return res.json({
      reports,
    });
  } catch (error) {
    console.error("GET MY REPORTS ERROR:", error);

    return res.status(500).json({
      message: "Unable to load reports",
    });
  }
};

const blockUser = async (req, res) => {
  try {
    const blockerId = req.user._id;
    const blockedUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(blockedUserId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (blockerId.toString() === blockedUserId) {
      return res.status(400).json({
        message: "You cannot block yourself",
      });
    }

    const blockedUser = await User.findById(blockedUserId);

    if (!blockedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingBlock = await Block.findOne({
      blocker: blockerId,
      blockedUser: blockedUserId,
    });

    if (existingBlock) {
      return res.status(409).json({
        message: "User is already blocked",
      });
    }

    await Block.create({
      blocker: blockerId,
      blockedUser: blockedUserId,
    });

    /*
     * Remove interactions in both directions.
     */
    await Interaction.deleteMany({
      $or: [
        {
          sender: blockerId,
          receiver: blockedUserId,
        },
        {
          sender: blockedUserId,
          receiver: blockerId,
        },
      ],
    });

    /*
     * Deactivate an existing match.
     */
    const users = [blockerId.toString(), blockedUserId.toString()].sort();

    await Match.findOneAndUpdate(
      {
        user1: users[0],
        user2: users[1],
      },
      {
        isActive: false,
      },
    );

    return res.json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    console.error("BLOCK USER ERROR:", error);

    return res.status(500).json({
      message: "Unable to block user",
    });
  }
};

const unblockUser = async (req, res) => {
  try {
    const blockedUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(blockedUserId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const block = await Block.findOneAndDelete({
      blocker: req.user._id,
      blockedUser: blockedUserId,
    });

    if (!block) {
      return res.status(404).json({
        message: "User is not blocked",
      });
    }

    return res.json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    console.error("UNBLOCK USER ERROR:", error);

    return res.status(500).json({
      message: "Unable to unblock user",
    });
  }
};

const getBlockedUsers = async (req, res) => {
  try {
    const blocks = await Block.find({
      blocker: req.user._id,
    })
      .populate("blockedUser", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      blocks,
    });
  } catch (error) {
    console.error("GET BLOCKED USERS ERROR:", error);

    return res.status(500).json({
      message: "Unable to load blocked users",
    });
  }
};

module.exports = {
  reportUser,
  getMyReports,
  blockUser,
  unblockUser,
  getBlockedUsers,
};
