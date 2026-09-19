const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["like", "pass", "super_like"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// One interaction per user pair
interactionSchema.index(
  {
    sender: 1,
    receiver: 1,
  },
  {
    unique: true,
  },
);

interactionSchema.index({
  receiver: 1,
  type: 1,
});

module.exports = mongoose.model("Interaction", interactionSchema);
