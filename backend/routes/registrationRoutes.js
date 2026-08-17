const express = require("express");
const router = express.Router();
const {
  createRegistration,
  getRegistrations,
  getRegistration,
  updateRegistration,
  deleteRegistration,
} = require("../controllers/registrationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", createRegistration);
router.get("/", protect, adminOnly, getRegistrations);
router.get("/:id", protect, adminOnly, getRegistration);
router.put("/:id", protect, adminOnly, updateRegistration);
router.delete("/:id", protect, adminOnly, deleteRegistration);

module.exports = router;
