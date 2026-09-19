const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reason: {
      type: String,
      enum: [
        "fake_profile",
        "harassment",
        "spam",
        "inappropriate_content",
        "scam",
        "underage",
        "other",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

reportSchema.index({
  reporter: 1,
  reportedUser: 1,
});

module.exports = mongoose.model("Report", reportSchema);
