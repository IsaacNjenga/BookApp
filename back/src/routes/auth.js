import express from "express";
import UserModel from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 12) {
      return res
        .status(400)
        .json({ message: "Password must be at least 12 characters long" });
    }

    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "User under this email already exists" });
    }
    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ message: "User under this username already exists" });
    }

    //random avatar generation logic
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    const newUser = new UserModel({ ...req.body, avatar });
    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        avatar: newUser.avatar,
        email: newUser.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credentials are invalid" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Credentials are invalid" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
