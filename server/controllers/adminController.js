const mongoose = require("mongoose");

const User = require("../models/User");
const Profile = require("../models/Profile");
const Report = require("../models/Report");

const getUsers = async (req, res) => {
  try {
    const {
      search = "",
      status = "all",
      premium = "all",
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    if (status === "active") {
      query.isActive = true;
    }

    if (status === "inactive") {
      query.isActive = false;
    }

    if (premium === "premium") {
      query.isPremium = true;
    }

    if (premium === "free") {
      query.isPremium = false;
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * perPage;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select(
          "name email dateOfBirth gender role isVerified isActive isPremium lastActiveAt createdAt",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage),

      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page: currentPage,
        limit: perPage,
        totalUsers,
        totalPages: Math.ceil(totalUsers / perPage),
      },
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
    const { status = "all", page = 1, limit = 20 } = req.query;

    const query = {};

    if (["pending", "reviewed", "resolved", "dismissed"].includes(status)) {
      query.status = status;
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * perPage;

    const [reports, totalReports] = await Promise.all([
      Report.find(query)
        .populate("reporter", "name email isActive")
        .populate("reportedUser", "name email isActive isPremium")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage),

      Report.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      reports,
      pagination: {
        page: currentPage,
        limit: perPage,
        totalReports,
        totalPages: Math.ceil(totalReports / perPage),
      },
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
