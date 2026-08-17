const express = require("express");
const router = express.Router();
const {
  getGallery,
  getGalleryItem,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} = require("../controllers/galleryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const uploadSingleImage = require("../middleware/uploadMiddleware");

router.get("/", getGallery);
router.post("/", protect, adminOnly, uploadSingleImage, addGalleryItem);
router.get("/:id", protect, adminOnly, getGalleryItem);
router.put("/:id", protect, adminOnly, uploadSingleImage, updateGalleryItem);
router.delete("/:id", protect, adminOnly, deleteGalleryItem);

module.exports = router;