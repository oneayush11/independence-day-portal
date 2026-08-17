const Registration = require("../models/Registration");

const createRegistration = async (req, res) => {
  try {
    const { name, email, phone, organization, category, eventInterest } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: "Name, email, phone required" });
    }
    const registration = await Registration.create({
      name,
      email,
      phone,
      organization,
      category,
      eventInterest,
      user: req.user ? req.user._id : null,
    });
    res.status(201).json({ success: true, data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRegistrations = async (req, res) => {
  const registrations = await Registration.find().sort({ createdAt: -1 });
  res.json({ success: true, count: registrations.length, data: registrations });
};

// @route GET /api/registrations/:id (admin) - view single record
const getRegistration = async (req, res) => {
  const reg = await Registration.findById(req.params.id);
  if (!reg) return res.status(404).json({ success: false, message: "Registration not found" });
  res.json({ success: true, data: reg });
};

// @route PUT /api/registrations/:id (admin) - update record
const updateRegistration = async (req, res) => {
  const reg = await Registration.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!reg) return res.status(404).json({ success: false, message: "Registration not found" });
  res.json({ success: true, data: reg });
};

const deleteRegistration = async (req, res) => {
  const reg = await Registration.findByIdAndDelete(req.params.id);
  if (!reg) return res.status(404).json({ success: false, message: "Registration not found" });
  res.json({ success: true, message: "Registration deleted" });
};

module.exports = {
  createRegistration,
  getRegistrations,
  getRegistration,
  updateRegistration,
  deleteRegistration,
};
