const Gallery = require("../models/Gallery");

// The gallery always lives in a single document. This finds it, creating
// an empty one the very first time the app is used.
const getOrCreateGalleryDoc = async () => {
  let doc = await Gallery.findOne();
  if (!doc) {
    doc = await Gallery.create({ photos: [] });
  }
  return doc;
};

const getGallery = async (req, res) => {
  const doc = await getOrCreateGalleryDoc();
  // Newest photo first
  const photos = [...doc.photos].sort((a, b) => b.createdAt - a.createdAt);
  res.json({ success: true, data: photos });
};

// @route GET /api/gallery/:id (admin) - view a single photo (by its
// subdocument _id inside the array)
const getGalleryItem = async (req, res) => {
  const doc = await getOrCreateGalleryDoc();
  const photo = doc.photos.id(req.params.id);
  if (!photo) return res.status(404).json({ success: false, message: "Item not found" });
  res.json({ success: true, data: photo });
};

// Converts an uploaded file (in memory, via multer) into a data URI string
// so it can be stored directly on the photo subdocument.
const fileToDataUri = (file) => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

// @route POST /api/gallery (admin) - pushes a new photo into the SAME
// Gallery document's photos array. No new top-level document is created.
const addGalleryItem = async (req, res) => {
  const { title, caption } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Please choose an image to upload" });
  }

  const doc = await getOrCreateGalleryDoc();
  doc.photos.push({ title, imageUrl: fileToDataUri(req.file), caption });
  await doc.save();

  const newPhoto = doc.photos[doc.photos.length - 1];
  res.status(201).json({ success: true, data: newPhoto });
};

// @route PUT /api/gallery/:id (admin) - edits one photo inside the array;
// a new image file is optional (only replaces the image if one is sent).
const updateGalleryItem = async (req, res) => {
  const doc = await getOrCreateGalleryDoc();
  const photo = doc.photos.id(req.params.id);
  if (!photo) return res.status(404).json({ success: false, message: "Item not found" });

  if (req.body.title !== undefined) photo.title = req.body.title;
  if (req.body.caption !== undefined) photo.caption = req.body.caption;
  if (req.file) photo.imageUrl = fileToDataUri(req.file);

  await doc.save();
  res.json({ success: true, data: photo });
};

// @route DELETE /api/gallery/:id (admin) - removes one photo from the array
const deleteGalleryItem = async (req, res) => {
  const doc = await getOrCreateGalleryDoc();
  const photo = doc.photos.id(req.params.id);
  if (!photo) return res.status(404).json({ success: false, message: "Item not found" });

  doc.photos.pull({ _id: req.params.id });
  await doc.save();
  res.json({ success: true, message: "Gallery item deleted" });
};

module.exports = { getGallery, getGalleryItem, addGalleryItem, updateGalleryItem, deleteGalleryItem };
