const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const cookieName = "explore_world_session";

function setSessionCookie(res, user) {
  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 2 * 60 * 60 * 1000,
    path: "/"
  });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password || password.length < 8) {
    return res.status(400).json({ message: "Name, email, and a password of at least 8 characters are required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).select("_id");
    if (existingUser) {
      return res.status(409).json({ message: "Unable to create account with those details" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });
    setSessionCookie(res, user);
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Unable to create account with those details" });
    }
    return res.status(500).json({ message: "Unable to create account" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    setSessionCookie(res, user);
    return res.json({ user: publicUser(user) });
  } catch {
    return res.status(500).json({ message: "Unable to sign in" });
  }
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(401).json({ message: "Authentication required" });
  return res.json({ user: publicUser(user) });
};

exports.logout = (req, res) => {
  res.clearCookie(cookieName, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", path: "/" });
  return res.status(204).send();
};
