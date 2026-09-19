const Profile = require("../models/Profile");

const profileCompletionMiddleware = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      return res.status(403).json({
        message: "Please complete your profile first",
        profileComplete: false,
      });
    }

    const profileComplete =
      Boolean(profile.bio?.trim()) &&
      Boolean(profile.city?.trim()) &&
      Boolean(profile.profession?.trim()) &&
      Boolean(profile.education?.trim()) &&
      Boolean(profile.relationshipGoal) &&
      Array.isArray(profile.interests) &&
      profile.interests.length > 0;

    if (!profileComplete) {
      return res.status(403).json({
        message: "Please complete your profile first",
        profileComplete: false,
      });
    }

    next();
  } catch (error) {
    console.error("PROFILE COMPLETION ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = profileCompletionMiddleware;
