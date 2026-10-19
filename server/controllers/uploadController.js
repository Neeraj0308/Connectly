const cloudinary = require("../config/cloudinary");

const getUploadSignature = async (req, res) => {
  try {
    const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env;
    if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
      return res.status(503).json({ message: "Photo uploads are not configured. Please contact support." });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = `connectly/profiles/${req.user._id}`;
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, CLOUDINARY_API_SECRET);
    return res.json({ signature, timestamp, cloudName: CLOUDINARY_CLOUD_NAME, apiKey: CLOUDINARY_API_KEY, folder });
  } catch (error) {
    console.error("CLOUDINARY SIGNATURE ERROR:", error);
    return res.status(500).json({ message: "Unable to generate upload signature" });
  }
};

module.exports = { getUploadSignature };
