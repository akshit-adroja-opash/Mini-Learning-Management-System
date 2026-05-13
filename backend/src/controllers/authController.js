import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );
};

const toAuthUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const requestedRole = ["learner", "instructor"].includes(role) ? role : "learner";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ msg: "Name, email, and password are required" });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ msg: "Please provide a valid email address" });
    }

    if (password.length < 8) {
      return res.status(400).json({ msg: "Password must be at least 8 characters long" });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash: hashed,
      role: requestedRole
    });

    res.status(201).json({ token: generateToken(user), user: toAuthUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    res.json({ token: generateToken(user), user: toAuthUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: toAuthUser(req.user) });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ msg: "User not found" });

    if (email && email !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(400).json({ msg: "Email already taken" });
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();
    res.json({
      token: generateToken(updatedUser),
      user: toAuthUser(updatedUser),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
