const mongoose = require("mongoose");

// One photo entry, stored as a subdocument inside the single Gallery
// document's `photos` array (see below) — not its own top-level document.
const photoSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    imageUrl: { type: String, required: true },
    caption: { type: String, default: "" },
  },
  { timestamps: true }
);

// Only ONE Gallery document ever exists in the collection. Every uploaded
// photo is pushed into its `photos` array instead of creating a brand new
// top-level document each time.
const gallerySchema = new mongoose.Schema(
  {
    photos: { type: [photoSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);
