const path = require("node:path");
const dns = require("node:dns");
const mongoose = require("mongoose");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const Destination = require("../src/models/Destination");

const data = {
  "Sri Lanka": [
    ["nine-arch-bridge", "Nine Arch Bridge", "Badulla", "Nature"],
    ["sigiriya", "Sigiriya", "Matale", "Heritage"],
    ["galle", "Galle", "Galle", "Beach"],
    ["mirissa", "Mirissa", "Matara", "Beach"],
    ["temple-of-tooth-relic", "Temple of the Tooth Relic", "Kandy", "Heritage"]
  ],
  India: [
    ["goa", "Goa", "Goa", "Beach"],
    ["hawa-mahal", "Hawa Mahal", "Jaipur", "Heritage"],
    ["kerala-backwaters", "Kerala Backwaters", "Kerala", "Nature"],
    ["taj-mahal", "Taj Mahal", "Agra", "Heritage"],
    ["varanasi", "Varanasi", "Varanasi", "Culture"]
  ],
  Indonesia: [
    ["bali-ubud-tegallalang-rice-terraces", "Bali Ubud Tegallalang Rice Terraces", "Bali", "Nature"],
    ["borobudur", "Borobudur Temple", "Central Java", "Heritage"],
    ["mount-bromo", "Mount Bromo", "East Java", "Adventure"],
    ["nusa-penida-kelingking-beach", "Nusa Penida Kelingking Beach", "Bali", "Beach"],
    ["raja-ampat-islands", "Raja Ampat Islands", "Southwest Papua", "Nature"]
  ],
  Nepal: [
    ["annapurna-range", "Annapurna Range", "Gandaki", "Adventure"],
    ["kathmandu-boudhanath-stupa", "Kathmandu Boudhanath Stupa", "Kathmandu", "Heritage"],
    ["lumbini", "Lumbini", "Rupandehi", "Heritage"],
    ["phewa-lake-serenity", "Phewa Lake Serenity", "Pokhara", "Nature"],
    ["everest", "Everest", "Solukhumbu", "Adventure"]
  ],
  Thailand: [
    ["bangkok-wat-arun", "Bangkok Wat Arun", "Bangkok", "Heritage"],
    ["chiang-mai-doi-suthep", "Chiang Mai Doi Suthep", "Chiang Mai", "Heritage"],
    ["krabi-railay-beach", "Krabi Railay Beach", "Krabi", "Beach"],
    ["phi-phi-islands", "Phi Phi Islands", "Krabi", "Beach"],
    ["phuket-patong-beach", "Phuket Patong Beach", "Phuket", "Beach"]
  ]
};

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  await mongoose.connect(process.env.MONGO_URI);

  let inserted = 0;
  let existing = 0;

  for (const [country, places] of Object.entries(data)) {
    for (const [slug, name, district, category] of places) {
      const result = await Destination.updateOne(
        { country, slug },
        {
          $setOnInsert: {
            name,
            slug,
            country,
            district,
            category,
            description: `Discover ${name}, a remarkable destination in ${country}.`,
            imageUrl: ""
          }
        },
        { upsert: true }
      );

      if (result.upsertedCount) inserted++;
      else existing++;
    }
  }

  console.log(`Inserted: ${inserted}`);
  console.log(`Already existing: ${existing}`);
  console.log(`Total in database: ${await Destination.countDocuments()}`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
