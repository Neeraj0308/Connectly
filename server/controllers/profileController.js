const Profile = require("../models/Profile");
const cloudinary = require("../config/cloudinary");

const profileSelect = "name email dateOfBirth gender isVerified isPremium";

const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate("user", profileSelect);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    return res.json({ profile });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return res.status(500).json({ message: "Unable to load profile" });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { bio, profilePhoto, profilePhotoPublicId, photos, photoPublicIds, city, country, interests, profession, education, height, relationshipGoal, lifestyle, preferences } = req.body;
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    if (profilePhoto !== undefined && profilePhoto !== profile.profilePhoto && profile.profilePhotoPublicId) {
      await cloudinary.uploader.destroy(profile.profilePhotoPublicId, { resource_type: "image" }).catch(() => {});
    }
    if (bio !== undefined) profile.bio = bio;
    if (profilePhoto !== undefined) profile.profilePhoto = profilePhoto;
    if (profilePhotoPublicId !== undefined) profile.profilePhotoPublicId = profilePhotoPublicId;
    if (photos !== undefined) {
      if (!Array.isArray(photos) || photos.length > 5) return res.status(400).json({ message: "You can add up to 5 additional photos." });
      const ids = Array.isArray(photoPublicIds) ? photoPublicIds : [];
      const oldIds = new Set(profile.photoPublicIds || []);
      const newIds = new Set(ids);
      for (const id of oldIds) {
        if (!newIds.has(id)) await cloudinary.uploader.destroy(id, { resource_type: "image" }).catch(() => {});
      }
      profile.photos = photos;
      profile.photoPublicIds = ids;
    }
    if (city !== undefined) profile.city = city;
    if (country !== undefined) profile.country = country;
    if (interests !== undefined) profile.interests = interests;
    if (profession !== undefined) profile.profession = profession;
    if (education !== undefined) profile.education = education;
    if (height !== undefined) profile.height = height;
    if (relationshipGoal !== undefined && relationshipGoal !== "") profile.relationshipGoal = relationshipGoal;
    if (lifestyle !== undefined) profile.lifestyle = { ...profile.lifestyle?.toObject?.(), ...lifestyle };
    if (preferences !== undefined) profile.preferences = { ...profile.preferences?.toObject?.(), ...preferences };

    await profile.save();
    const updatedProfile = await Profile.findOne({ user: req.user._id }).populate("user", profileSelect);
    return res.json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    if (error.name === "ValidationError") return res.status(400).json({ message: "Invalid profile data", errors: Object.values(error.errors).map((item) => item.message) });
    return res.status(500).json({ message: "Unable to update profile" });
  }
};

const getProfileStatus = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.json({ profileComplete: false, missingFields: ["profilePhoto", "bio", "city", "profession", "education", "relationshipGoal", "interests"] });
    const missingFields = [];
    if (!profile.profilePhoto) missingFields.push("profilePhoto");
    if (!profile.bio?.trim()) missingFields.push("bio");
    if (!profile.city?.trim()) missingFields.push("city");
    if (!profile.profession?.trim()) missingFields.push("profession");
    if (!profile.education?.trim()) missingFields.push("education");
    if (!profile.relationshipGoal) missingFields.push("relationshipGoal");
    if (!Array.isArray(profile.interests) || profile.interests.length === 0) missingFields.push("interests");
    return res.json({ profileComplete: missingFields.length === 0, missingFields });
  } catch (error) {
    console.error("GET PROFILE STATUS ERROR:", error);
    return res.status(500).json({ message: "Unable to check profile status" });
  }
};

module.exports = { getMyProfile, updateMyProfile, getProfileStatus };
