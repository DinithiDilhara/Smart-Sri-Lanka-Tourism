
const mongoose = require("mongoose");
const Destination = require("../models/Destination");

// CREATE a destination
exports.createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json(destination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ all destinations
exports.getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ createdAt: -1 });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ one destination
exports.getDestinationById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid destination ID" });
    }

    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    res.json(destination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a destination
exports.updateDestination = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid destination ID" });
    }

    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    res.json(destination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE a destination
exports.deleteDestination = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid destination ID" });
    }

    const destination = await Destination.findByIdAndDelete(req.params.id);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    res.json({ message: "Destination deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
