
const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Destination = require("../models/Destination");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireAllowedOrigin } = require("../middleware/csrfMiddleware");

const router = express.Router();

// All favorites endpoints require login.
router.use(requireAuth);

// GET - Fetch the logged-in user's favorites.
router.get("/", async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub).select("favorites");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      favorites: (user.favorites || []).map(String)
    });
  } catch (error) {
    next(error);
  }
});

// POST - Add a destination to Favorites.
router.post("/:destinationId", requireAllowedOrigin, async (req, res, next) => {
  try {
    const { destinationId } = req.params;

    if (!mongoose.isValidObjectId(destinationId)) {
      return res.status(400).json({ message: "Invalid destination ID" });
    }

    const destination = await Destination.exists({ _id: destinationId });

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { $addToSet: { favorites: destinationId } },
      { new: true, runValidators: true }
    ).select("favorites");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      message: "Destination added to Favorites",
      favorites: user.favorites.map(String)
    });
  } catch (error) {
    next(error);
  }
});

// DELETE - Remove a destination from Favorites.
router.delete("/:destinationId", requireAllowedOrigin, async (req, res, next) => {
  try {
    const { destinationId } = req.params;

    if (!mongoose.isValidObjectId(destinationId)) {
      return res.status(400).json({ message: "Invalid destination ID" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { $pull: { favorites: destinationId } },
      { new: true }
    ).select("favorites");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      message: "Destination removed from Favorites",
      favorites: user.favorites.map(String)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
