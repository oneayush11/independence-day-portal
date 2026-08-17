/**
 * One-time migration: merges OLD-format gallery photos (each stored as its
 * own top-level document with title/imageUrl/caption) into the NEW
 * single-document structure (one Gallery document holding a `photos` array).
 *
 * Safe to run even if you have no old-format photos — it will just do
 * nothing in that case. Safe to run more than once (won't duplicate).
 *
 * Run with:  node utils/migrateGalleryToSingleDoc.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Gallery = require("../models/Gallery");

const run = async () => {
  await connectDB();

  // Read the RAW collection directly (bypassing the new schema) so we can
  // see old-format documents that don't have a `photos` field at all.
  const rawDocs = await mongoose.connection.db.collection("galleries").find({}).toArray();

  const oldFormatDocs = rawDocs.filter((d) => !Array.isArray(d.photos) && d.imageUrl);

  if (oldFormatDocs.length === 0) {
    console.log("ℹ️  No old-format gallery photos found — nothing to migrate.");
    await mongoose.connection.close();
    process.exit(0);
  }

  console.log(`Found ${oldFormatDocs.length} old-format photo document(s). Migrating...`);

  // Ensure the single new-format document exists
  let doc = await Gallery.findOne({ photos: { $exists: true } });
  if (!doc) {
    doc = await Gallery.create({ photos: [] });
  }

  for (const old of oldFormatDocs) {
    doc.photos.push({
      title: old.title || "",
      imageUrl: old.imageUrl,
      caption: old.caption || "",
    });
  }
  await doc.save();

  // Remove the old top-level documents now that they've been copied in
  const oldIds = oldFormatDocs.map((d) => d._id);
  await mongoose.connection.db.collection("galleries").deleteMany({ _id: { $in: oldIds } });

  console.log(`✅ Migrated ${oldFormatDocs.length} photo(s) into the single gallery document.`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
