const multer = require("multer");

// Images are stored directly in MongoDB as base64 (no separate file server
// needed for a project this size), so we keep the upload in memory rather
// than writing to disk.
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE_BYTES = 50 * 1024; // 50KB, as requested

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, GIF, or WEBP images are allowed"));
  }
};

const multerUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
});

/**
 * Wraps multer's single-file upload so failures (wrong type, too large)
 * come back as a normal JSON error response instead of an unhandled
 * exception. Expects the file to be sent under the field name "image".
 */
const uploadSingleImage = (req, res, next) => {
  multerUpload.single("image")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Image must be smaller than 50KB. Please choose a smaller image or compress it first.",
        });
      }
      return res.status(400).json({ success: false, message: err.message || "Image upload failed" });
    }
    next();
  });
};

module.exports = uploadSingleImage;
