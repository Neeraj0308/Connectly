const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      unique: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({
  participants: 1,
});

module.exports = mongoose.model("Conversation", conversationSchema);
