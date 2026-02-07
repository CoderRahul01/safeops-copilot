const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/safeops";

async function connect() {
  try {
    // Force database name 'safeops' if not present in URI
    const options = {
      dbName: 'safeops',
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    };

    console.log("🍃 Attempting MongoDB connection [Database: safeops]...");
    
    // Register connection listeners before connecting
    mongoose.connection.on('connected', () => {
      console.log("✅ MongoDB Protocol: UP - Connected to safeops cluster.");
    });

    mongoose.connection.on('error', (err) => {
      console.log("❌ MongoDB Protocol: DOWN - Connection error:", err.message);
    });

    await mongoose.connect(MONGODB_URI, options);
    
  } catch (error) {
    console.error("❌ MongoDB INITIALIZATION FAILURE:", error.message);
    console.warn("⚠️  SYSTEM DEGRADED: Continuing without transactional persistence (Intents/Audit).");
    
    // In production, we might want to exit if transactional integrity is critical
    if (process.env.NODE_ENV === "production" && process.env.STRICT_DB === "true") {
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
