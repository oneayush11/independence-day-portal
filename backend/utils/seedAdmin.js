/**
 * Run: npm run seed
 * Creates a default admin user (agar already nahi hai) so you can login
 * to the Admin Dashboard turant.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Event = require("../models/Event");
const Announcement = require("../models/Announcement");
const Gallery = require("../models/Gallery");

const run = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({ role: "admin" });
  if (!existingAdmin) {
    await User.create({
      name: "Admin",
      email: "admin@idportal.com",
      password: "admin123",
      role: "admin",
    });
    console.log("✅ Default admin created -> email: admin@idportal.com | password: admin123");
  } else {
    console.log("ℹ️  Admin already exists:", existingAdmin.email);
  }

  const eventCount = await Event.countDocuments();
  if (eventCount === 0) {
    await Event.insertMany([
      { title: "Flag Hoisting Ceremony", time: "8:00 AM", venue: "Main Ground", icon: "🇮🇳", order: 1 },
      { title: "National Anthem", time: "8:15 AM", venue: "Main Ground", icon: "🎵", order: 2 },
      { title: "Chief Guest Address", time: "8:30 AM", venue: "Main Auditorium", icon: "🎤", order: 3 },
      { title: "Cultural Programs", time: "9:30 AM", venue: "Main Auditorium", icon: "💃", order: 4 },
      { title: "Independence Day Quiz Competition", time: "11:00 AM", venue: "Room 204", icon: "🏆", order: 5 },
      { title: "Prize Distribution", time: "12:30 PM", venue: "Main Auditorium", icon: "🏅", order: 6 },
      { title: "Sweet Distribution & Refreshments", time: "1:00 PM", venue: "Courtyard", icon: "🍬", order: 7 },
    ]);
    console.log("✅ Sample event schedule seeded");
  }

  const announceCount = await Announcement.countDocuments();
  if (announceCount === 0) {
    await Announcement.create({
      title: "Welcome to the Independence Day Portal!",
      message:
        "Registration is now open for the 15th August celebration. Don't forget to participate in the Quiz Competition for exciting prizes and certificates!",
      priority: "high",
    });
    console.log("✅ Sample announcement seeded");
  }

  // Gallery lives in a single document (see models/Gallery.js). These sample
  // photos become REAL, permanent entries in that document's `photos` array —
  // not placeholders — so they behave exactly like anything the admin
  // uploads: visible, editable, deletable, and never auto-hidden. Checked
  // one by one (by title) so this is safe to run even after you've already
  // uploaded your own photos — it only adds what's missing, never duplicates.
  let galleryDoc = await Gallery.findOne();
  if (!galleryDoc) {
    galleryDoc = await Gallery.create({ photos: [] });
  }

  const samplePhotos = [
    { title: "Celebration Moment 1", imageUrl: "/images/slide1-flag.jpg", caption: "" },
    { title: "Celebration Moment 2", imageUrl: "/images/slide2-chakra.jpg", caption: "" },
    { title: "Celebration Moment 3", imageUrl: "/images/slide3-fireworks.jpg", caption: "" },
    { title: "Celebration Moment 4", imageUrl: "/images/slide4-tricolor.jpg", caption: "" },
    { title: "Celebration Moment 5", imageUrl: "/images/slide5-students.jpg", caption: "" },
  ];

  const existingTitles = new Set(galleryDoc.photos.map((p) => p.title));
  const missingPhotos = samplePhotos.filter((p) => !existingTitles.has(p.title));

  if (missingPhotos.length > 0) {
    galleryDoc.photos.push(...missingPhotos);
    await galleryDoc.save();
    console.log(`✅ Added ${missingPhotos.length} sample gallery photo(s) (now real, permanent entries)`);
  } else {
    console.log("ℹ️  Sample gallery photos already present — nothing to add");
  }

  console.log("🎉 Seeding complete.");
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
