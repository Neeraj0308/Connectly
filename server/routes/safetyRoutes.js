const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  reportUser,
  getMyReports,
  blockUser,
  unblockUser,
  getBlockedUsers,
} = require("../controllers/safetyController");

const router = express.Router();

router.use(authMiddleware);

router.post("/reports/:userId", reportUser);

router.get("/reports/me", getMyReports);

router.post("/blocks/:userId", blockUser);

router.delete("/blocks/:userId", unblockUser);

router.get("/blocks", getBlockedUsers);

module.exports = router;
