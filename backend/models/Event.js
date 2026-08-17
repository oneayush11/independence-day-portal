const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    time: { type: String, required: true }, // e.g. "8:00 AM"
    date: { type: String, default: "15 August" },
    venue: { type: String, default: "Main Auditorium" },
    icon: { type: String, default: "🎉" }, // emoji icon for the schedule item
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
