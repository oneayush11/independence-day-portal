const express = require("express");
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getSpeakers,
  getSpeaker,
  createSpeaker,
  updateSpeaker,
  deleteSpeaker,
} = require("../controllers/eventController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// IMPORTANT: speaker routes must come before "/:id" so "speakers" isn't treated as an id
router.get("/speakers/all", getSpeakers);
router.post("/speakers", protect, adminOnly, createSpeaker);
router.get("/speakers/:id", protect, adminOnly, getSpeaker);
router.put("/speakers/:id", protect, adminOnly, updateSpeaker);
router.delete("/speakers/:id", protect, adminOnly, deleteSpeaker);

router.get("/", getEvents);
router.post("/", protect, adminOnly, createEvent);
router.get("/:id", protect, adminOnly, getEvent);
router.put("/:id", protect, adminOnly, updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);

module.exports = router;
