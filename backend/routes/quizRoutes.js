const express = require("express");
const router = express.Router();
const {
  generateQuiz,
  getActiveQuizzes,
  getAllQuizzes,
  getQuiz,
  updateQuiz,
  setActiveQuiz,
  deactivateQuiz,
  deleteQuiz,
  submitQuiz,
  getResults,
  getResult,
  deleteResult,
  downloadCertificate,
} = require("../controllers/quizController");
const { protect, adminOnly, optionalAuth } = require("../middleware/authMiddleware");

// Public
router.get("/active", optionalAuth, getActiveQuizzes);
router.post("/:id/submit", protect, submitQuiz);
router.get("/certificate/:resultId", downloadCertificate);

// Admin - results (must come before "/:id" routes)
router.get("/results/all", protect, adminOnly, getResults);
router.get("/result/:resultId", protect, adminOnly, getResult);
router.delete("/result/:resultId", protect, adminOnly, deleteResult);

// Admin - quiz management
router.post("/generate", protect, adminOnly, generateQuiz);
router.get("/", protect, adminOnly, getAllQuizzes);
router.get("/:id", protect, adminOnly, getQuiz);
router.put("/:id", protect, adminOnly, updateQuiz);
router.put("/:id/activate", protect, adminOnly, setActiveQuiz);
router.put("/:id/deactivate", protect, adminOnly, deactivateQuiz);
router.delete("/:id", protect, adminOnly, deleteQuiz);

module.exports = router;