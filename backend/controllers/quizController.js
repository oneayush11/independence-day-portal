
const crypto = require("crypto");
const Quiz = require("../models/Quiz");
const Result = require("../models/Result");
const { generateQuizQuestions, ALLOWED_TOPICS } = require("../utils/aiQuizGenerator");
const { streamCertificate } = require("../utils/generateCertificate");

// @route POST /api/quiz/generate (admin) - AI or local generation
const generateQuiz = async (req, res) => {
  try {
    const { topic, count, title } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: "Topic is required" });
    if (!ALLOWED_TOPICS.includes(topic)) {
      return res.status(400).json({
        success: false,
        message: `Invalid topic. Please choose one of: ${ALLOWED_TOPICS.join(", ")}`,
      });
    }

    const { questions, source } = await generateQuizQuestions({ topic, count: count || 5 });

    const quiz = await Quiz.create({
      title: title || `Independence Day Quiz: ${topic}`,
      topic,
      generatedBy: source,
      questions,
    });

    res.status(201).json({ success: true, data: quiz, source });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/quiz/active - returns ALL currently-active quizzes.
// If the request is authenticated (optionalAuth), quizzes this user has
// already completed (matched by account or by the email they submitted
// with) are excluded from the list. Anonymous requests get the full list,
// since there's no reliable identity to filter by.
const getActiveQuizzes = async (req, res) => {
  const quizzes = await Quiz.find({ isActive: true }).sort({ createdAt: -1 });

  let completedQuizIds = [];
  if (req.user) {
    const results = await Result.find({
      $or: [{ user: req.user._id }, { participantEmail: req.user.email }],
    }).select("quiz");
    completedQuizIds = results.map((r) => r.quiz.toString());
  }

  const available = quizzes.filter((q) => !completedQuizIds.includes(q._id.toString()));

  const safeQuizzes = available.map((quiz) => ({
    _id: quiz._id,
    title: quiz.title,
    topic: quiz.topic,
    questions: quiz.questions.map((q) => ({
      questionText: q.questionText,
      options: q.options,
      _id: q._id,
    })),
  }));

  res.json({ success: true, data: safeQuizzes, isLoggedIn: !!req.user });
};

const getAllQuizzes = async (req, res) => {
  const quizzes = await Quiz.find().sort({ createdAt: -1 });
  res.json({ success: true, data: quizzes });
};

// @route GET /api/quiz/:id (admin) - view single quiz WITH correct answers
const getQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
  res.json({ success: true, data: quiz });
};

// @route PUT /api/quiz/:id (admin) - update quiz title/topic/questions
const updateQuiz = async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
  res.json({ success: true, data: quiz });
};

// Marks a quiz as active WITHOUT touching any other quiz — multiple quizzes
// can be active (assigned) to users at the same time.
const setActiveQuiz = async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
  if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
  res.json({ success: true, data: quiz });
};

// @route PUT /api/quiz/:id/deactivate (admin) - takes a quiz off the public list
const deactivateQuiz = async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
  res.json({ success: true, data: quiz });
};

const deleteQuiz = async (req, res) => {
  const quiz = await Quiz.findByIdAndDelete(req.params.id);
  if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
  res.json({ success: true, message: "Quiz deleted" });
};

// @route POST /api/quiz/:id/submit - public
const submitQuiz = async (req, res) => {
  try {
    const { participantName, participantEmail, answers } = req.body;
    if (!participantName || !participantEmail || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Missing submission data" });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    let score = 0;
    answers.forEach((a) => {
      const q = quiz.questions[a.questionIndex];
      if (q && q.correctIndex === a.selectedIndex) score += 1;
    });

    const certificateId = `IDP-${Date.now().toString(36).toUpperCase()}-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    const result = await Result.create({
      quiz: quiz._id,
      participantName,
      participantEmail,
      user: req.user ? req.user._id : null,
      score,
      total: quiz.questions.length,
      answers,
      certificateId,
    });

    res.status(201).json({
      success: true,
      data: {
        score,
        total: quiz.questions.length,
        certificateId: result.certificateId,
        resultId: result._id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getResults = async (req, res) => {
  const results = await Result.find().populate("quiz", "title topic").sort({ score: -1, createdAt: 1 });
  res.json({ success: true, count: results.length, data: results });
};

// @route GET /api/quiz/result/:resultId (admin) - view single result in detail
const getResult = async (req, res) => {
  const result = await Result.findById(req.params.resultId).populate("quiz", "title topic questions");
  if (!result) return res.status(404).json({ success: false, message: "Result not found" });
  res.json({ success: true, data: result });
};

// @route DELETE /api/quiz/result/:resultId (admin)
const deleteResult = async (req, res) => {
  const result = await Result.findByIdAndDelete(req.params.resultId);
  if (!result) return res.status(404).json({ success: false, message: "Result not found" });
  res.json({ success: true, message: "Result deleted" });
};

// @route GET /api/quiz/certificate/:resultId - downloads PDF
const downloadCertificate = async (req, res) => {
  const result = await Result.findById(req.params.resultId).populate("quiz", "title");
  if (!result) return res.status(404).json({ success: false, message: "Result not found" });

  streamCertificate(res, {
    name: result.participantName,
    score: result.score,
    total: result.total,
    certificateId: result.certificateId,
    quizTitle: result.quiz ? result.quiz.title : "Independence Day Quiz",
  });
};

module.exports = {
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
};