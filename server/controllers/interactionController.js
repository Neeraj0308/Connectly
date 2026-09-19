const mongoose = require("mongoose");

const User = require("../models/User");
const Profile = require("../models/Profile");
const Interaction = require("../models/Interaction");
const Match = require("../models/Match");
const Block = require("../models/Block");

const { checkLikeLimit } = require("../utils/likeLimit");
const createNotification = require("../utils/createNotification");


const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

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

const discoverProfiles = async (req, res) => {
  try {
    const currentUser = req.user;

    const currentProfile = await Profile.findOne({
      user: currentUser._id,
    });

    if (!currentProfile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    const minAge = currentProfile.preferences?.minAge || 18;
    const maxAge = currentProfile.preferences?.maxAge || 50;

    const today = new Date();

    const minimumBirthDate = new Date(
      today.getFullYear() - maxAge,
      today.getMonth(),
      today.getDate(),
    );

    const maximumBirthDate = new Date(
      today.getFullYear() - minAge,
      today.getMonth(),
      today.getDate(),
    );

    const blocks = await Block.find({
      $or: [
        {
          blocker: currentUser._id,
        },
        {
          blockedUser: currentUser._id,
        },
      ],
    }).select("blocker blockedUser");

    const blockedUserIds = new Set();

    blocks.forEach((block) => {
      blockedUserIds.add(block.blocker.toString());
      blockedUserIds.add(block.blockedUser.toString());
    });

    // Remove current user from blocked list if present.
    blockedUserIds.delete(currentUser._id.toString());

    const blockedObjectIds = Array.from(blockedUserIds)
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    // =========================================================
    // GET USERS WITHIN AGE RANGE
    // =========================================================

    const users = await User.find({
      _id: {
        $ne: currentUser._id,
        $nin: blockedObjectIds,
      },

      isActive: true,

      dateOfBirth: {
        $gte: minimumBirthDate,
        $lte: maximumBirthDate,
      },
    }).select("name dateOfBirth gender isPremium isVerified lastActiveAt");

    const userIds = users.map((user) => user._id);

    // =========================================================
    // GET PROFILES
    // =========================================================

    const profiles = await Profile.find({
      user: {
        $in: userIds,
      },
    });

    // =========================================================
    // GET PEOPLE ALREADY INTERACTED WITH
    // =========================================================

    const interactions = await Interaction.find({
      sender: currentUser._id,
      receiver: {
        $in: userIds,
      },
    }).select("receiver");

    const interactedIds = new Set(
      interactions.map((interaction) => interaction.receiver.toString()),
    );

    // =========================================================
    // CREATE PROFILE MAP
    // =========================================================

    const profileMap = new Map();

    profiles.forEach((profile) => {
      profileMap.set(profile.user.toString(), profile);
    });

    const currentAge = calculateAge(currentUser.dateOfBirth);
    const currentGender = currentUser.gender;

    const results = [];

    // =========================================================
    // BUILD DISCOVERY RESULTS
    // =========================================================

    for (const user of users) {
      const userId = user._id.toString();

      // Extra safety check.
      if (blockedUserIds.has(userId)) {
        continue;
      }

      if (interactedIds.has(userId)) {
        continue;
      }

      const profile = profileMap.get(userId);

      if (!profile) {
        continue;
      }

      // =========================================================
      // CURRENT USER'S GENDER PREFERENCE
      // =========================================================

      const preferredGender = currentProfile.preferences?.gender;

      if (
        preferredGender &&
        preferredGender !== "any" &&
        user.gender !== preferredGender
      ) {
        continue;
      }

      // =========================================================
      // TARGET USER'S PREFERENCES
      // =========================================================

      const targetPreferences = profile.preferences || {};

      if (
        targetPreferences.gender &&
        targetPreferences.gender !== "any" &&
        targetPreferences.gender !== currentGender
      ) {
        continue;
      }

      if (targetPreferences.minAge && currentAge < targetPreferences.minAge) {
        continue;
      }

      if (targetPreferences.maxAge && currentAge > targetPreferences.maxAge) {
        continue;
      }

      // =========================================================
      // COMPATIBILITY SCORE
      // =========================================================

      let score = 0;

      const currentInterests = currentProfile.interests || [];
      const targetInterests = profile.interests || [];

      const commonInterests = currentInterests.filter((interest) =>
        targetInterests
          .map((item) => item.toLowerCase())
          .includes(interest.toLowerCase()),
      );

      score += commonInterests.length * 10;

      if (
        currentProfile.relationshipGoal &&
        currentProfile.relationshipGoal === profile.relationshipGoal
      ) {
        score += 20;
      }

      // =========================================================
      // ACTIVE WITHIN LAST 24 HOURS
      // =========================================================

      if (
        user.lastActiveAt &&
        Date.now() - new Date(user.lastActiveAt).getTime() < 24 * 60 * 60 * 1000
      ) {
        score += 10;
      }

      // =========================================================
      // RESULT
      // =========================================================

      results.push({
        user: {
          id: user._id,
          name: user.name,
          age: calculateAge(user.dateOfBirth),
          gender: user.gender,
          isPremium: user.isPremium,
          isVerified: user.isVerified,
        },

        profile: {
          bio: profile.bio,
          profilePhoto: profile.profilePhoto,
          photos: profile.photos,
          city: profile.city,
          country: profile.country,
          interests: profile.interests,
          profession: profile.profession,
          education: profile.education,
          height: profile.height,
          relationshipGoal: profile.relationshipGoal,
        },

        commonInterests,
        score,
      });
    }

    results.sort((a, b) => b.score - a.score);

    return res.json({
      count: results.length,
      profiles: results.slice(0, 20),
    });
  } catch (error) {
    console.error("DISCOVER ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =========================================================
// LIKE USER
// POST /api/interactions/:userId/like
// =========================================================

const likeUser = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({
        message: "You cannot like yourself",
      });
    }

    // =========================================================
    // BLOCK CHECK
    // =========================================================

    const blocked = await areUsersBlocked(senderId, receiverId);

    if (blocked) {
      return res.status(403).json({
        message: "You cannot interact with this user",
      });
    }

    // =========================================================
    // CHECK DAILY LIKE LIMIT
    // =========================================================

    const likeStatus = await checkLikeLimit(req.user._id);

    if (!likeStatus.allowed) {
      return res.status(403).json({
        message: "You have reached your daily like limit.",
        code: "LIKE_LIMIT_REACHED",
        used: likeStatus.used,
        limit: likeStatus.limit,
        remaining: 0,
      });
    }

    // =========================================================
    // FIND RECEIVER
    // =========================================================

    const receiver = await User.findOne({
      _id: receiverId,
      isActive: true,
    });

    if (!receiver) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // =========================================================
    // CHECK BLOCK AGAIN
    // =========================================================

    const blockedAfterUserCheck = await areUsersBlocked(senderId, receiverId);

    if (blockedAfterUserCheck) {
      return res.status(403).json({
        message: "You cannot interact with this user",
      });
    }

    // =========================================================
    // CHECK DUPLICATE INTERACTION
    // =========================================================

    const existingInteraction = await Interaction.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existingInteraction) {
      return res.status(400).json({
        message: "You have already interacted with this user",
      });
    }

    // =========================================================
    // CREATE LIKE
    // =========================================================

    await Interaction.create({
      sender: senderId,
      receiver: receiverId,
      type: "like",
    });

    const io = req.app.get("io");

    // =========================================================
    // LIKE NOTIFICATION
    // =========================================================

    await createNotification({
      recipient: receiverId,
      sender: senderId,
      type: "like",
      title: "New like ❤️",
      message: `${req.user.name} liked your profile`,
      io,
    });

    // =========================================================
    // CHECK MUTUAL LIKE
    // =========================================================

    const mutualLike = await Interaction.findOne({
      sender: receiverId,
      receiver: senderId,
      type: {
        $in: ["like", "super_like"],
      },
    });

    if (mutualLike) {
      // Final block protection before creating a match.
      const blockedBeforeMatch = await areUsersBlocked(senderId, receiverId);

      if (blockedBeforeMatch) {
        return res.json({
          message: "Like sent",
          matched: false,
        });
      }

      const users = [senderId.toString(), receiverId].sort();

      const user1 = users[0];
      const user2 = users[1];

      const match = await Match.findOneAndUpdate(
        {
          user1,
          user2,
        },
        {
          user1,
          user2,
          isActive: true,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      );

      // =========================================================
      // MATCH NOTIFICATIONS
      // =========================================================

      await createNotification({
        recipient: senderId,
        sender: receiverId,
        type: "match",
        title: "It's a match! 💕",
        message: `You matched with ${receiver.name}`,
        matchId: match._id,
        io,
      });

      await createNotification({
        recipient: receiverId,
        sender: senderId,
        type: "match",
        title: "It's a match! 💕",
        message: `You matched with ${req.user.name}`,
        matchId: match._id,
        io,
      });

      return res.json({
        message: "It's a match!",
        matched: true,
        matchId: match._id,
      });
    }

    return res.json({
      message: "Like sent",
      matched: false,
    });
  } catch (error) {
    console.error("LIKE ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =========================================================
// GET LIKE STATUS
// GET /api/interactions/like-status
// =========================================================

const getLikeStatus = async (req, res) => {
  try {
    const status = await checkLikeLimit(req.user._id);

    return res.json(status);
  } catch (error) {
    console.error("GET LIKE STATUS ERROR:", error);

    return res.status(500).json({
      message: "Unable to get like status",
    });
  }
};

// =========================================================
// PASS USER
// POST /api/interactions/:userId/pass
// =========================================================

const passUser = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({
        message: "Invalid user",
      });
    }

    // =========================================================
    // BLOCK CHECK
    // =========================================================

    const blocked = await areUsersBlocked(senderId, receiverId);

    if (blocked) {
      return res.status(403).json({
        message: "You cannot interact with this user",
      });
    }

    const receiver = await User.findOne({
      _id: receiverId,
      isActive: true,
    });

    if (!receiver) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // =========================================================
    // CHECK DUPLICATE INTERACTION
    // =========================================================

    const existingInteraction = await Interaction.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existingInteraction) {
      return res.status(400).json({
        message: "You have already interacted with this user",
      });
    }

    await Interaction.create({
      sender: senderId,
      receiver: receiverId,
      type: "pass",
    });

    return res.json({
      message: "Profile passed",
    });
  } catch (error) {
    console.error("PASS ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =========================================================
// WHO LIKED ME
// GET /api/interactions/who-liked-me
// =========================================================

const getWhoLikedMe = async (req, res) => {
  try {
    const likes = await Interaction.find({
      receiver: req.user._id,
      type: {
        $in: ["like", "super_like"],
      },
    })
      .sort({
        createdAt: -1,
      })
      .populate("sender", "name dateOfBirth gender isVerified");

    const results = [];

    for (const interaction of likes) {
      if (!interaction.sender) {
        continue;
      }

      // =========================================================
      // BLOCK CHECK
      // =========================================================

      const blocked = await areUsersBlocked(
        req.user._id,
        interaction.sender._id,
      );

      if (blocked) {
        continue;
      }

      const profile = await Profile.findOne({
        user: interaction.sender._id,
      }).select(
        "bio profilePhoto photos city profession education interests relationshipGoal",
      );

      if (!profile) {
        continue;
      }

      results.push({
        interactionId: interaction._id,

        type: interaction.type,

        likedAt: interaction.createdAt,

        user: interaction.sender,

        profile,
      });
    }

    return res.json({
      likes: results,
    });
  } catch (error) {
    console.error("WHO LIKED ME ERROR:", error);

    return res.status(500).json({
      message: "Unable to load people who liked you",
    });
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  discoverProfiles,
  likeUser,
  getLikeStatus,
  passUser,
  getWhoLikedMe,
};
