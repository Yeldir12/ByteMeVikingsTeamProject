const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/mydb"); // or your Atlas URL
    console.log("🍃 MongoDB connected!");
  } catch (err) {
    console.error("Connection fail:", err);
  }
}

module.exports = connectDB;
