const mongoose = require("mongoose");

const User = require("../models/User");
const Profile = require("../models/Profile");
const Report = require("../models/Report");

//Get User By Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("ADMIN GET USERS ERROR:", error);

    return res.status(500).json({
      message: "Unable to load users",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const profile = await Profile.findOne({
      user: userId,
    }).lean();

    return res.status(200).json({
      user,
      profile,
    });
  } catch (error) {
    console.error("ADMIN GET USER ERROR:", error);

    return res.status(500).json({
      message: "Unable to load user",
    });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (String(req.user._id) === String(userId)) {
      return res.status(400).json({
        message: "You cannot deactivate your own admin account",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isActive: false,
      },
      {
        new: true,
      },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      user,
    });
  } catch (error) {
    console.error("ADMIN DEACTIVATE USER ERROR:", error);

    return res.status(500).json({
      message: "Unable to deactivate user",
    });
  }
};

const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isActive: true,
      },
      {
        new: true,
      },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User activated successfully",
      user,
    });
  } catch (error) {
    console.error("ADMIN ACTIVATE USER ERROR:", error);

    return res.status(500).json({
      message: "Unable to activate user",
    });
  }
};

const getReports = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) {
      const allowedStatuses = ["pending", "reviewed", "resolved", "dismissed"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid report status",
        });
      }

      filter.status = status;
    }

    const reports = await Report.find(filter)
      .populate("reporter", "name email isActive")
      .populate("reportedUser", "name email isActive")
      .sort({ createdAt: -1 })
      .limit(200);

    const pendingCount = await Report.countDocuments({
      status: "pending",
    });

    return res.status(200).json({
      count: reports.length,
      pendingCount,
      reports,
    });
  } catch (error) {
    console.error("ADMIN GET REPORTS ERROR:", error);

    return res.status(500).json({
      message: "Unable to load reports",
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        message: "Invalid report ID",
      });
    }

    const report = await Report.findById(reportId)
      .populate("reporter", "name email isActive")
      .populate("reportedUser", "name email isActive");

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    return res.status(200).json({
      report,
    });
  } catch (error) {
    console.error("ADMIN GET REPORT ERROR:", error);

    return res.status(500).json({
      message: "Unable to load report",
    });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        message: "Invalid report ID",
      });
    }

    const allowedStatuses = ["pending", "reviewed", "resolved", "dismissed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid report status",
      });
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("reporter", "name email isActive")
      .populate("reportedUser", "name email isActive");

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Report marked as ${status}`,
      report,
    });
  } catch (error) {
    console.error("ADMIN UPDATE REPORT ERROR:", error);

    return res.status(500).json({
      message: "Unable to update report",
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  deactivateUser,
  activateUser,
  getReports,
  getReportById,
  updateReportStatus,
};
