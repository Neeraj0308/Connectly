const mongoose = require("mongoose");

const PORT = process.env.MONGO_URI || 5000;
const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
