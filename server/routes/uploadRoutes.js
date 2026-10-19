const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getUploadSignature } = require("../controllers/uploadController");

router.use(authMiddleware);

router.get("/signature", getUploadSignature);

module.exports = router;
