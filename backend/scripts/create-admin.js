require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

async function main() {
  const adminName = getRequiredEnv("ADMIN_NAME");
  const adminEmail = getRequiredEnv("ADMIN_EMAIL").toLowerCase();
  const adminPassword = getRequiredEnv("ADMIN_PASSWORD");

  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters long.");
  }

  await connectDB();

  const existingUser = await User.findOne({ email: adminEmail }).select("+passwordHash");

  if (existingUser) {
    existingUser.name = adminName;
    existingUser.role = "admin";
    existingUser.passwordHash = await bcrypt.hash(adminPassword, 12);
    await existingUser.save();

    console.log(`Promoted existing user to admin: ${existingUser.email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const createdUser = await User.create({
    name: adminName,
    email: adminEmail,
    passwordHash,
    role: "admin"
  });

  console.log(`Created admin account: ${createdUser.email}`);
}

main()
  .catch((error) => {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
