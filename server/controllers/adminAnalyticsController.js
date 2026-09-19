const User = require("../models/User");
const Interaction = require("../models/Interaction");
const Match = require("../models/Match");
const Message = require("../models/Message");
const Report = require("../models/Report");

const getAnalytics = async (req, res) => {
  try {
    const now = new Date();

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      activeUsers,
      premiumUsers,
      totalMatches,
      totalLikes,
      totalMessages,
      totalReports,
      pendingReports,
      newUsers7Days,
      newUsers30Days,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isPremium: true }),
      Match.countDocuments({ isActive: true }),
      Interaction.countDocuments({ type: "like" }),
      Message.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      User.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      }),
      User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      }),
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          premium: premiumUsers,
          free: totalUsers - premiumUsers,
        },
        engagement: {
          matches: totalMatches,
          likes: totalLikes,
          messages: totalMessages,
        },
        safety: {
          totalReports,
          pendingReports,
        },
        growth: {
          newUsers7Days,
          newUsers30Days,
        },
      },
    });
  } catch (error) {
    console.error("ADMIN ANALYTICS ERROR:", error);
    return res.status(500).json({
      message: "Unable to load analytics",
    });
  }
};

module.exports = {
  getAnalytics,
};
