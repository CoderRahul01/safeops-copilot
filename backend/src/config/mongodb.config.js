const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/safeops";

async function connect() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("🍃 MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // In production, we might want to exit, but in dev we might keep trying
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
}

async function close() {
  try {
    await mongoose.connection.close();
    console.log("🔒 MongoDB connection closed");
  } catch (error) {
    console.error("❌ Error closing MongoDB:", error);
  }
}

module.exports = {
  connect,
  close,
  connection: mongoose.connection,
};
