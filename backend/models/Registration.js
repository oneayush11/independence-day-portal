const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    organization: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Student", "Employee", "Guest", "Other"],
      default: "Student",
    },
    eventInterest: { type: String, default: "General Celebration" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Registration", registrationSchema);
