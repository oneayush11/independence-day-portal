const Announcement = require("../models/Announcement");

const getAnnouncements = async (req, res) => {
  const items = await Announcement.find().sort({ createdAt: -1 });
  res.json({ success: true, data: items });
};

// @route GET /api/announcements/:id (admin) - view single record
const getAnnouncement = async (req, res) => {
  const item = await Announcement.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: "Announcement not found" });
  res.json({ success: true, data: item });
};

const createAnnouncement = async (req, res) => {
  const { title, message, priority } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: "Title and message required" });
  }
  const item = await Announcement.create({ title, message, priority });
  res.status(201).json({ success: true, data: item });
};

// @route PUT /api/announcements/:id (admin) - update record
const updateAnnouncement = async (req, res) => {
  const item = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ success: false, message: "Announcement not found" });
  res.json({ success: true, data: item });
};

const deleteAnnouncement = async (req, res) => {
  const item = await Announcement.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: "Announcement not found" });
  res.json({ success: true, message: "Announcement deleted" });
};

module.exports = {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
