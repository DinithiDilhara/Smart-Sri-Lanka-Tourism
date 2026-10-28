const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: "Sri Lanka"
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

destinationSchema.index({ country: 1, slug: 1 });

module.exports = mongoose.model("Destination", destinationSchema);
