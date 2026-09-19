const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createOrder,
  verifyPayment,
  getMySubscription,
} = require("../controllers/paymentController");

router.use(authMiddleware);

router.post("/create-order", createOrder);

router.post("/verify", verifyPayment);

router.get("/subscription", getMySubscription);

module.exports = router;
