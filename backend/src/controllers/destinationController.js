
const mongoose = require("mongoose");
const Destination = require("../models/Destination");

// Keep these limits in sync with the destination edit form.
const limits = { name: 120, country: 100, district: 120, category: 100, description: 3000, imageUrl: 2048 };
const requiredFields = ["name", "country", "district", "category", "description"];

function validImageUrl(value) {
  if (!value) return true;
  if (/[\s<>"\\]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) && Boolean(parsed.hostname);
  } catch { return false; }
}

function validateDestinationPayload(body, create) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Provide valid destination details." };
  }
  const values = {};
  for (const [field, max] of Object.entries(limits)) {
    if (body[field] === undefined) {
      if (create && requiredFields.includes(field)) return { error: `${field} is required.` };
      continue;
    }
    if (typeof body[field] !== "string") return { error: `${field} must be text.` };
    const value = body[field].trim();
    if (requiredFields.includes(field) && !value) return { error: `${field} is required.` };
    if (value.length > max) return { error: `${field} is too long (maximum ${max} characters).` };
    if (field === "imageUrl" && !validImageUrl(value)) return { error: "Image must be an HTTP(S) URL or a local /path." };
    values[field] = value;
  }
  if (Object.keys(values).length === 0) return { error: "No destination fields provided." };
  return { values };
}

// CREATE a destination
exports.createDestination = async (req, res) => {
  const validated = validateDestinationPayload(req.body, true);
  if (validated.error) return res.status(400).json({ message: validated.error });
  try {
    const destination = await Destination.create(validated.values);
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
  const validated = validateDestinationPayload(req.body, false);
  if (validated.error) return res.status(400).json({ message: validated.error });
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid destination ID" });
    }

    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      validated.values,
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
