const Interaction = require("../models/Interaction");
const Subscription = require("../models/Subscription");

const FREE_DAILY_LIKE_LIMIT = 10;

const getStartOfToday = () => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
};

const getDailyLikeCount = async (userId) => {
  const count = await Interaction.countDocuments({
    sender: userId,
    type: {
      $in: ["like", "super_like"],
    },
    createdAt: {
      $gte: getStartOfToday(),
    },
  });

  return count;
};

const isPremiumUser = async (userId) => {
  const subscription = await Subscription.findOne({
    user: userId,
    status: "active",
    endDate: {
      $gt: new Date(),
    },
  });

  return !!subscription;
};

const checkLikeLimit = async (userId) => {
  const premium = await isPremiumUser(userId);

  if (premium) {
    return {
      allowed: true,
      premium: true,
      used: 0,
      limit: null,
    };
  }

  const used = await getDailyLikeCount(userId);

  return {
    allowed: used < FREE_DAILY_LIKE_LIMIT,
    premium: false,
    used,
    limit: FREE_DAILY_LIKE_LIMIT,
    remaining: Math.max(FREE_DAILY_LIKE_LIMIT - used, 0),
  };
};

module.exports = {
  checkLikeLimit,
  getDailyLikeCount,
  FREE_DAILY_LIKE_LIMIT,
};
