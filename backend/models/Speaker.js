const mongoose = require("mongoose");

const speakerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, default: "" },
    organization: { type: String, default: "" },
    bio: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    isChiefGuest: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Speaker", speakerSchema);
