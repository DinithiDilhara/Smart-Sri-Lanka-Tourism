const jwt = require("jsonwebtoken");

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

module.exports = { requireAuth };
