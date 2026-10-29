const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    hotelName: { type: String, trim: true, maxlength: 150, default: "" },
    budget: {
      accommodation: { type: Number, min: 0, default: 0 },
      transport: { type: Number, min: 0, default: 0 },
      food: { type: Number, min: 0, default: 0 },
      activities: { type: Number, min: 0, default: 0 }
    },
    items: [
      {
        destination: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Destination",
          required: true
        },
        day: { type: Number, min: 1, max: 60, default: 1 }
      }
    ]
  },
  { timestamps: true }
);

tripSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model("Trip", tripSchema);
