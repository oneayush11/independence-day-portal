const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ["normal", "high"], default: "normal" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
