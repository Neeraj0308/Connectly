const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const { register, verifyRegistration, resendRegistrationOtp, login, requestPasswordReset, resetPassword } = require("../controllers/authController");

router.post("/register", register);
router.get("/registration-photo-signature", (req, res) => {
  try {
    const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env;
    if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
      return res.status(503).json({ message: "Photo uploads are not configured. Please contact support." });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "connectly/pending-registration";
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, CLOUDINARY_API_SECRET);
    return res.json({ signature, timestamp, cloudName: CLOUDINARY_CLOUD_NAME, apiKey: CLOUDINARY_API_KEY, folder });
  } catch (error) {
    console.error("REGISTRATION PHOTO SIGNATURE ERROR:", error);
    return res.status(500).json({ message: "Unable to prepare photo upload." });
  }
});
router.post("/verify-registration", verifyRegistration);
router.post("/resend-registration-otp", resendRegistrationOtp);
router.post("/login", login);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
module.exports = router;
