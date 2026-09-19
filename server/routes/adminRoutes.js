const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getUsers,
  getUserById,
  deactivateUser,
  activateUser,
  getReports,
  getReportById,
  updateReportStatus,
  deleteUser,
} = require("../controllers/adminController");

const { getAnalytics } = require("../controllers/adminAnalyticsController");

const router = express.Router();

router.get("/test", authMiddleware, adminMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin access verified",
    admin: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

router.get("/users", authMiddleware, adminMiddleware, getUsers);

router.get("/users/:userId", authMiddleware, adminMiddleware, getUserById);

router.patch(
  "/users/:userId/deactivate",
  authMiddleware,
  adminMiddleware,
  deactivateUser,
);

router.patch(
  "/users/:userId/activate",
  authMiddleware,
  adminMiddleware,
  activateUser,
);

router.get("/reports", authMiddleware, adminMiddleware, getReports);

router.get(
  "/reports/:reportId",
  authMiddleware,
  adminMiddleware,
  getReportById,
);

router.patch(
  "/reports/:reportId/status",
  authMiddleware,
  adminMiddleware,
  updateReportStatus,
);

router.delete("/users/:userId", authMiddleware, adminMiddleware, deleteUser);

router.get("/analytics", authMiddleware, adminMiddleware, getAnalytics);

module.exports = router;
