function requireAllowedOrigin(req, res, next) {
  const origin = req.get("origin");
  if (!origin) return next();

  const allowedOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((value) => value.trim());

  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ message: "Request origin is not allowed" });
  }

  return next();
}

module.exports = { requireAllowedOrigin };
