const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(
      "   Make sure MongoDB is running locally (mongod) or MONGO_URI in .env points to a valid Atlas cluster."
    );
    process.exit(1);
  }
};

module.exports = connectDB;
