const Profile = require("../models/Profile");

const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user._id,
    }).populate("user", "name email dateOfBirth gender isVerified isPremium");

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      profile,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      message: "Unable to load profile",
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const {
      bio,
      profilePhoto,
      photos,
      city,
      country,
      interests,
      profession,
      education,
      height,
      relationshipGoal,
      lifestyle,
      preferences,
    } = req.body;

    const profile = await Profile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    if (bio !== undefined) profile.bio = bio;
    if (profilePhoto !== undefined) profile.profilePhoto = profilePhoto;
    if (photos !== undefined) profile.photos = photos;
    if (city !== undefined) profile.city = city;
    if (country !== undefined) profile.country = country;
    if (interests !== undefined) profile.interests = interests;
    if (profession !== undefined) profile.profession = profession;
    if (education !== undefined) profile.education = education;
    if (height !== undefined) profile.height = height;

    // Don't save empty string into enum field
    if (relationshipGoal !== undefined && relationshipGoal !== "") {
      profile.relationshipGoal = relationshipGoal;
    }

    if (lifestyle !== undefined) {
      profile.lifestyle = {
        ...profile.lifestyle?.toObject?.(),
        ...lifestyle,
      };
    }

    if (preferences !== undefined) {
      profile.preferences = {
        ...profile.preferences?.toObject?.(),
        ...preferences,
      };
    }

    await profile.save();

    const updatedProfile = await Profile.findOne({
      user: req.user._id,
    }).populate("user", "name email dateOfBirth gender isVerified isPremium");

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid profile data",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message: "Unable to update profile",
    });
  }
};

const getProfileStatus = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      return res.json({
        profileComplete: false,
        missingFields: [
          "bio",
          "city",
          "profession",
          "education",
          "relationshipGoal",
          "interests",
        ],
      });
    }

    const missingFields = [];

    if (!profile.bio?.trim()) {
      missingFields.push("bio");
    }

    if (!profile.city?.trim()) {
      missingFields.push("city");
    }

    if (!profile.profession?.trim()) {
      missingFields.push("profession");
    }

    if (!profile.education?.trim()) {
      missingFields.push("education");
    }

    if (!profile.relationshipGoal) {
      missingFields.push("relationshipGoal");
    }

    if (!Array.isArray(profile.interests) || profile.interests.length === 0) {
      missingFields.push("interests");
    }

    return res.json({
      profileComplete: missingFields.length === 0,
      missingFields,
    });
  } catch (error) {
    console.error("GET PROFILE STATUS ERROR:", error);

    return res.status(500).json({
      message: "Unable to check profile status",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getProfileStatus,
};
