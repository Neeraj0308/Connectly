const Match = require("../models/Match");
const Profile = require("../models/Profile");
const User = require("../models/User");

const getMyMatches = async (req, res) => {
  try {
    const userId = req.user._id;

    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("user1", "name dateOfBirth gender isVerified isPremium")
      .populate("user2", "name dateOfBirth gender isVerified isPremium");

    const results = [];

    for (const match of matches) {
      const otherUser =
        match.user1._id.toString() === userId.toString()
          ? match.user2
          : match.user1;

      if (!otherUser) continue;

      const profile = await Profile.findOne({
        user: otherUser._id,
      }).select(
        "bio profilePhoto photos city country interests profession education relationshipGoal",
      );

      const today = new Date();
      const birthDate = new Date(otherUser.dateOfBirth);

      let age = today.getFullYear() - birthDate.getFullYear();

      const monthDifference = today.getMonth() - birthDate.getMonth();

      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      results.push({
        matchId: match._id,
        matchedAt: match.createdAt,

        user: {
          id: otherUser._id,
          name: otherUser.name,
          age,
          gender: otherUser.gender,
          isVerified: otherUser.isVerified,
          isPremium: otherUser.isPremium,
        },

        profile,
      });
    }

    return res.status(200).json({
      count: results.length,
      matches: results,
    });
  } catch (error) {
    console.error("GET MATCHES ERROR:", error);

    return res.status(500).json({
      message: "Unable to load matches",
    });
  }
};

module.exports = {
  getMyMatches,
};
