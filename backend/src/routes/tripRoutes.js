const express = require("express");
const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Destination = require("../models/Destination");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireAllowedOrigin } = require("../middleware/csrfMiddleware");

const router = express.Router();
router.use(requireAuth);

const fields = "name country district category slug imageUrl";
const datePattern = /^(?:\d{4}-\d{2}-\d{2})?$/;
const validId = (value) => mongoose.isValidObjectId(value);
const validDay = (value) => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 60;

function validDates(start, end) {
  if (!datePattern.test(start) || !datePattern.test(end)) return false;
  if (start && end && end < start) return false;
  for (const date of [start, end]) {
    if (!date) continue;
    const time = Date.parse(date + "T00:00:00Z");
    if (Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== date) return false;
  }
  return true;
}

function parseBudget(budget, current = {}) {
  if (budget === undefined) return { ...current };
  if (!budget || typeof budget !== "object" || Array.isArray(budget)) return null;
  const result = {};
  for (const key of ["accommodation", "transport", "food", "activities"]) {
    const number = Number(budget[key] ?? current[key] ?? 0);
    if (!Number.isFinite(number) || number < 0 || number > 100000000) return null;
    result[key] = number;
  }
  return result;
}

async function populated(trip) {
  await trip.populate("items.destination", fields);
  return trip;
}

router.get("/", async (req, res, next) => {
  try {
    const trips = await Trip.find({ user: req.user.sub })
      .sort({ updatedAt: -1 })
      .populate("items.destination", fields);
    res.json({ trips });
  } catch (error) { next(error); }
});

router.post("/", requireAllowedOrigin, async (req, res, next) => {
  try {
    const name = String(req.body?.name || "").trim();
    const startDate = String(req.body?.startDate || "");
    const endDate = String(req.body?.endDate || "");
    if (!name || name.length > 100 || !validDates(startDate, endDate)) {
      return res.status(400).json({ message: "Enter a valid trip name and dates." });
    }
    const trip = await Trip.create({ user: req.user.sub, name, startDate, endDate });
    res.status(201).json({ trip: await populated(trip) });
  } catch (error) { next(error); }
});

router.patch("/:tripId", requireAllowedOrigin, async (req, res, next) => {
  try {
    if (!validId(req.params.tripId)) return res.status(400).json({ message: "Invalid trip ID." });
    const trip = await Trip.findOne({ _id: req.params.tripId, user: req.user.sub });
    if (!trip) return res.status(404).json({ message: "Trip not found." });

    const name = req.body?.name === undefined ? trip.name : String(req.body.name).trim();
    const startDate = req.body?.startDate === undefined ? trip.startDate : String(req.body.startDate || "");
    const endDate = req.body?.endDate === undefined ? trip.endDate : String(req.body.endDate || "");
    const hotelName = req.body?.hotelName === undefined ? trip.hotelName : String(req.body.hotelName || "").trim();
    const budget = parseBudget(req.body?.budget, {
      accommodation: trip.budget?.accommodation ?? 0,
      transport: trip.budget?.transport ?? 0,
      food: trip.budget?.food ?? 0,
      activities: trip.budget?.activities ?? 0
    });
    if (!name || name.length > 100 || hotelName.length > 150 || !validDates(startDate, endDate) || !budget) {
      return res.status(400).json({ message: "Invalid trip details or budget." });
    }
    Object.assign(trip, { name, startDate, endDate, hotelName, budget });
    await trip.save();
    res.json({ trip: await populated(trip) });
  } catch (error) { next(error); }
});

router.post("/:tripId/destinations", requireAllowedOrigin, async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { destinationId, day = 1 } = req.body || {};
    if (!validId(tripId) || !validId(destinationId) || !validDay(day)) {
      return res.status(400).json({ message: "Invalid trip, destination or day." });
    }
    const trip = await Trip.findOne({ _id: tripId, user: req.user.sub });
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    if (!(await Destination.exists({ _id: destinationId }))) {
      return res.status(404).json({ message: "Destination not found." });
    }
    if (trip.items.some((item) => String(item.destination) === destinationId)) {
      return res.status(409).json({ message: "This destination is already in your trip." });
    }
    trip.items.push({ destination: destinationId, day: Number(day) });
    await trip.save();
    res.json({ trip: await populated(trip) });
  } catch (error) { next(error); }
});

router.patch("/:tripId/destinations/:destinationId", requireAllowedOrigin, async (req, res, next) => {
  try {
    const { tripId, destinationId } = req.params;
    if (!validId(tripId) || !validId(destinationId) || !validDay(req.body?.day)) {
      return res.status(400).json({ message: "Invalid destination or day." });
    }
    const trip = await Trip.findOne({ _id: tripId, user: req.user.sub });
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    const item = trip.items.find((entry) => String(entry.destination) === destinationId);
    if (!item) return res.status(404).json({ message: "Destination not in this trip." });
    item.day = Number(req.body.day);
    await trip.save();
    res.json({ trip: await populated(trip) });
  } catch (error) { next(error); }
});

router.delete("/:tripId/destinations/:destinationId", requireAllowedOrigin, async (req, res, next) => {
  try {
    const { tripId, destinationId } = req.params;
    if (!validId(tripId) || !validId(destinationId)) {
      return res.status(400).json({ message: "Invalid trip or destination ID." });
    }
    const trip = await Trip.findOne({ _id: tripId, user: req.user.sub });
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    trip.items = trip.items.filter((item) => String(item.destination) !== destinationId);
    await trip.save();
    res.json({ trip: await populated(trip) });
  } catch (error) { next(error); }
});

router.delete("/:tripId", requireAllowedOrigin, async (req, res, next) => {
  try {
    if (!validId(req.params.tripId)) return res.status(400).json({ message: "Invalid trip ID." });
    const removed = await Trip.findOneAndDelete({ _id: req.params.tripId, user: req.user.sub });
    if (!removed) return res.status(404).json({ message: "Trip not found." });
    res.json({ message: "Trip deleted." });
  } catch (error) { next(error); }
});

module.exports = router;
