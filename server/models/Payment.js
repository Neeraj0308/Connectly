const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },

    plan: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
      index: true,
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({
  user: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Payment", paymentSchema);
