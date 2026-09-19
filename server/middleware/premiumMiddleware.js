const Subscription = require("../models/Subscription");

const premiumMiddleware = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
    });

    if (!subscription) {
      return res.status(403).json({
        message: "Premium membership required",
        code: "PREMIUM_REQUIRED",
      });
    }

    if (subscription.endDate <= new Date()) {
      subscription.status = "expired";
      await subscription.save();

      return res.status(403).json({
        message: "Your Premium membership has expired",
        code: "PREMIUM_EXPIRED",
      });
    }

    next();
  } catch (error) {
    console.error("PREMIUM MIDDLEWARE ERROR:", error);

    return res.status(500).json({
      message: "Unable to verify Premium membership",
    });
  }
};

module.exports = premiumMiddleware;
