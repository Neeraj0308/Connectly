const crypto = require("crypto");

const razorpay = require("../config/razorpay");
const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");
const User = require("../models/User");

const PLANS = {
  monthly: {
    amount: 29900,
    durationDays: 30,
  },

  yearly: {
    amount: 199900,
    durationDays: 365,
  },
};

const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        message: "Razorpay is not configured yet",
      });
    }

    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({
        message: "Invalid subscription plan",
      });
    }

    const existingSubscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (existingSubscription) {
      return res.status(400).json({
        message: "You already have an active Premium subscription",
      });
    }

    const selectedPlan = PLANS[plan];

    const receipt = `connectly_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: selectedPlan.amount,
      currency: "INR",
      receipt,
      notes: {
        userId: req.user._id.toString(),
        plan,
      },
    });

    await Payment.create({
      user: req.user._id,
      plan,
      amount: selectedPlan.amount,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.status(201).json({
      success: true,
      order,
      plan,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      message: "Unable to create payment order",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        message: "Razorpay is not configured yet",
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "Missing payment information",
      });
    }

    const paymentRecord = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id,
    });

    if (!paymentRecord) {
      return res.status(404).json({
        message: "Payment order not found",
      });
    }

    if (paymentRecord.status === "paid") {
      const subscription = await Subscription.findById(
        paymentRecord.subscription,
      );

      return res.json({
        success: true,
        message: "Payment already verified",
        subscription,
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const signaturesMatch =
      generatedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature),
      );

    if (!signaturesMatch) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

    if (razorpayPayment.order_id !== razorpay_order_id) {
      return res.status(400).json({
        message: "Payment does not belong to this order",
      });
    }

    if (Number(razorpayPayment.amount) !== Number(paymentRecord.amount)) {
      return res.status(400).json({
        message: "Payment amount mismatch",
      });
    }

    let finalPayment = razorpayPayment;

    if (razorpayPayment.status === "authorized") {
      finalPayment = await razorpay.payments.capture(
        razorpay_payment_id,
        paymentRecord.amount,
        "INR",
      );
    }

    if (finalPayment.status !== "captured") {
      return res.status(400).json({
        message: "Payment has not been captured",
      });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);

    if (paymentRecord.plan === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = await Subscription.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        plan: paymentRecord.plan,
        status: "active",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: paymentRecord.amount,
        currency: "INR",
        startDate,
        endDate,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    paymentRecord.subscription = subscription._id;
    paymentRecord.razorpayPaymentId = razorpay_payment_id;
    paymentRecord.razorpaySignature = razorpay_signature;
    paymentRecord.status = "paid";
    paymentRecord.paidAt = new Date();

    await paymentRecord.save();

    await User.findByIdAndUpdate(
      req.user._id,
      {
        isPremium: true,
      },
      {
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Premium activated successfully",
      subscription,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return res.status(500).json({
      message: "Unable to verify payment",
    });
  }
};

const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
    });

    if (!subscription) {
      return res.json({
        isPremium: false,
        subscription: null,
      });
    }

    const now = new Date();

    /*
     * Automatically expire Premium.
     */
    if (subscription.status === "active" && subscription.endDate <= now) {
      subscription.status = "expired";

      await subscription.save();

      await User.findByIdAndUpdate(req.user._id, {
        isPremium: false,
      });
    }

    const isPremium =
      subscription.status === "active" && subscription.endDate > now;

    /*
     * Keep User.isPremium synchronized.
     */
    if (req.user.isPremium !== isPremium) {
      await User.findByIdAndUpdate(req.user._id, {
        isPremium,
      });
    }

    return res.json({
      isPremium,
      subscription,
    });
  } catch (error) {
    console.error("GET SUBSCRIPTION ERROR:", error);

    return res.status(500).json({
      message: "Unable to load subscription",
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getMySubscription,
};
