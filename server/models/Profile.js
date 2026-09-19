const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    photos: [
      {
        type: String,
      },
    ],

    city: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    interests: [
      {
        type: String,
        trim: true,
      },
    ],

    profession: {
      type: String,
      trim: true,
    },

    education: {
      type: String,
      trim: true,
    },

    height: {
      type: Number,
    },

    relationshipGoal: {
      type: String,
      enum: [
        "serious_relationship",
        "marriage",
        "casual",
        "friendship",
        "not_sure",
      ],
    },

    lifestyle: {
      smoking: {
        type: String,
        enum: ["never", "sometimes", "regularly", "prefer_not_to_say"],
      },

      drinking: {
        type: String,
        enum: ["never", "sometimes", "regularly", "prefer_not_to_say"],
      },

      pets: {
        type: String,
      },
    },

    preferences: {
      minAge: {
        type: Number,
        default: 18,
      },

      maxAge: {
        type: Number,
        default: 50,
      },

      gender: {
        type: String,
      },

      maxDistance: {
        type: Number,
        default: 50,
      },
    },
  },
  {
    timestamps: true,
  },
);

profileSchema.index({
  location: "2dsphere",
});

module.exports = mongoose.model("Profile", profileSchema);
