
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const dns = require("node:dns");

if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const connectDB = require("./config/db");
const destinationRoutes = require("./routes/destinationRoutes");
const authRoutes = require("./routes/authRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

const app = express();

const allowedOrigins = (
  process.env.FRONTEND_ORIGINS ||
  "http://localhost:5173,http://127.0.0.1:5173"
).split(",");

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    message: "Sri Lanka Tourism API is running",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected"
  });
});

// Destination CRUD endpoints
app.use("/api/destinations", destinationRoutes);

// Authentication endpoints
app.use("/api/auth", authRoutes);

// Favorites endpoints
app.use("/api/favorites", favoriteRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error("MONGO_URI and JWT_SECRET are required in .env");
    process.exit(1);
  }

  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
