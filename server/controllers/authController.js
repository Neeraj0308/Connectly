const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Profile = require("../models/Profile");
const generateToken = require("../utils/generateToken");

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) {
    return -1;
  }

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    return -1;
  }

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, gender } = req.body;

    if (!name || !email || !password || !dateOfBirth || !gender) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const age = calculateAge(dateOfBirth);

    if (age < 18) {
      return res.status(400).json({
        message: "You must be at least 18 years old to create an account",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      dateOfBirth,
      gender,
    });

    await Profile.create({
      user: user._id,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    user.lastActiveAt = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  register,
  login,
};
