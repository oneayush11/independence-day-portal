const Event = require("../models/Event");
const Speaker = require("../models/Speaker");

const getEvents = async (req, res) => {
  const events = await Event.find().sort({ order: 1, time: 1 });
  res.json({ success: true, data: events });
};

// @route GET /api/events/:id (admin) - view single record
const getEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: "Event not found" });
  res.json({ success: true, data: event });
};

const createEvent = async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json({ success: true, data: event });
};

const updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!event) return res.status(404).json({ success: false, message: "Event not found" });
  res.json({ success: true, data: event });
};

const deleteEvent = async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: "Event not found" });
  res.json({ success: true, message: "Event deleted" });
};

// Speakers
const getSpeakers = async (req, res) => {
  const speakers = await Speaker.find().sort({ isChiefGuest: -1, createdAt: 1 });
  res.json({ success: true, data: speakers });
};

// @route GET /api/events/speakers/:id (admin) - view single record
const getSpeaker = async (req, res) => {
  const speaker = await Speaker.findById(req.params.id);
  if (!speaker) return res.status(404).json({ success: false, message: "Speaker not found" });
  res.json({ success: true, data: speaker });
};

const createSpeaker = async (req, res) => {
  const speaker = await Speaker.create(req.body);
  res.status(201).json({ success: true, data: speaker });
};

// @route PUT /api/events/speakers/:id (admin) - update record
const updateSpeaker = async (req, res) => {
  const speaker = await Speaker.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!speaker) return res.status(404).json({ success: false, message: "Speaker not found" });
  res.json({ success: true, data: speaker });
};

const deleteSpeaker = async (req, res) => {
  const speaker = await Speaker.findByIdAndDelete(req.params.id);
  if (!speaker) return res.status(404).json({ success: false, message: "Speaker not found" });
  res.json({ success: true, message: "Speaker deleted" });
};

module.exports = {
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
};
