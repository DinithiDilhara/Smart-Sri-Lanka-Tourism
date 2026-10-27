const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getToken(req) {
  return req.cookies?.explore_world_session;
}

function requireAuth(req, res, next) {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Authentication required" });
  }
}

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user.sub).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Administrator access required" });
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { requireAuth, requireAdmin };
