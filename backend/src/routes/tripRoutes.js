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

// Validate stored calculator inputs; preserve older trips until the user enables it.
function parseCalculator(input, current = {}) {
  if (input === undefined) return { ...current };
  if (!input || typeof input !== "object" || Array.isArray(input) || typeof input.enabled !== "boolean") return null;
  const values = {
    travelers: Number(input.travelers),
    rooms: Number(input.rooms),
    hotelPerNight: Number(input.hotelPerNight),
    foodPerPersonDay: Number(input.foodPerPersonDay)
  };
  if (!Number.isInteger(values.travelers) || values.travelers < 1 || values.travelers > 30 ||
      !Number.isInteger(values.rooms) || values.rooms < 1 || values.rooms > 20 ||
      !Number.isFinite(values.hotelPerNight) || values.hotelPerNight < 0 || values.hotelPerNight > 1000000 ||
      !Number.isFinite(values.foodPerPersonDay) || values.foodPerPersonDay < 0 || values.foodPerPersonDay > 1000000) return null;
  return { enabled: input.enabled, ...values };
}

function countNights(start, end) {
  if (!start || !end) return null;
  const days = Math.round((Date.parse(end + "T00:00:00Z") - Date.parse(start + "T00:00:00Z")) / 86400000);
  return days >= 0 ? days : null;
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

// One-tap, account-specific draft. Repeating the request never deletes previous stops.
router.post("/ideas", requireAllowedOrigin, async (req, res, next) => {
  try {
    const destinationId = req.body?.destinationId;
    if (!validId(destinationId)) {
      return res.status(400).json({ message: "Invalid destination ID." });
    }
    if (!(await Destination.exists({ _id: destinationId }))) {
      return res.status(404).json({ message: "Destination not found." });
    }
    let trip = await Trip.findOne({ user: req.user.sub, isDraft: true })
      .sort({ createdAt: 1 });
    if (!trip) {
      trip = await Trip.create({
        user: req.user.sub,
        name: "My Travel Ideas",
        isDraft: true
      });
    }
    if (!trip.items.some((item) => String(item.destination) === destinationId)) {
      trip.items.push({ destination: destinationId, day: 1 });
      await trip.save();
    }
    res.json({ trip: await populated(trip) });
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
    const budgetCalculator = parseCalculator(req.body?.budgetCalculator, {
      enabled: trip.budgetCalculator?.enabled ?? false,
      travelers: trip.budgetCalculator?.travelers ?? 1,
      rooms: trip.budgetCalculator?.rooms ?? 1,
      hotelPerNight: trip.budgetCalculator?.hotelPerNight ?? 0,
      foodPerPersonDay: trip.budgetCalculator?.foodPerPersonDay ?? 0
    });
    if (!name || name.length > 100 || hotelName.length > 150 || !validDates(startDate, endDate) || !budget || !budgetCalculator) {
      return res.status(400).json({ message: "Invalid trip details or budget." });
    }
    if (budgetCalculator.enabled) {
      const nights = countNights(startDate, endDate);
      if (nights === null) {
        return res.status(400).json({ message: "Select start and end dates to calculate a budget." });
      }
      budget.accommodation = Math.round((nights * budgetCalculator.rooms * budgetCalculator.hotelPerNight + Number.EPSILON) * 100) / 100;
      budget.food = Math.round(((nights + 1) * budgetCalculator.travelers * budgetCalculator.foodPerPersonDay + Number.EPSILON) * 100) / 100;
      if (budget.accommodation > 100000000 || budget.food > 100000000) {
        return res.status(400).json({ message: "Budget estimate is too large." });
      }
    }
    Object.assign(trip, { name, startDate, endDate, hotelName, budget, budgetCalculator });
    // Explicitly saving trip details turns a draft into a normal trip.
    trip.isDraft = false;
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

// Personal trip stops are private to the user, not added to the public destination catalog.
router.post("/:tripId/custom-stops", requireAllowedOrigin, async (req, res, next) => {
  try {
    if (!validId(req.params.tripId)) return res.status(400).json({ message: "Invalid trip ID." });
    const name = String(req.body?.name || "").trim();
    const country = String(req.body?.country || "").trim();
    const region = String(req.body?.region || "").trim();
    const day = Number(req.body?.day ?? 1);
    if (!name || name.length > 120 || !country || country.length > 100 ||
        region.length > 120 || !validDay(day)) {
      return res.status(400).json({ message: "Enter a valid place, country and day." });
    }
    const trip = await Trip.findOne({ _id: req.params.tripId, user: req.user.sub });
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    trip.customStops.push({ name, country, region, day });
    await trip.save();
    res.json({ trip: await populated(trip) });
  } catch (error) { next(error); }
});

router.patch("/:tripId/custom-stops/:stopId", requireAllowedOrigin, async (req, res, next) => {
  try {
    if (!validId(req.params.tripId) || !validId(req.params.stopId) || !validDay(req.body?.day)) {
      return res.status(400).json({ message: "Invalid trip, stop or day." });
    }
    const trip = await Trip.findOne({ _id: req.params.tripId, user: req.user.sub });
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    const stop = trip.customStops.id(req.params.stopId);
    if (!stop) return res.status(404).json({ message: "Personal stop not found." });
    stop.day = Number(req.body.day);
    await trip.save();
    res.json({ trip: await populated(trip) });
  } catch (error) { next(error); }
});

router.delete("/:tripId/custom-stops/:stopId", requireAllowedOrigin, async (req, res, next) => {
  try {
    if (!validId(req.params.tripId) || !validId(req.params.stopId)) {
      return res.status(400).json({ message: "Invalid trip or stop ID." });
    }
    const trip = await Trip.findOne({ _id: req.params.tripId, user: req.user.sub });
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    const stop = trip.customStops.id(req.params.stopId);
    if (!stop) return res.status(404).json({ message: "Personal stop not found." });
    trip.customStops.pull(req.params.stopId);
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
