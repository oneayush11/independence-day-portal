const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: {
    type: [String],
    validate: (v) => Array.isArray(v) && v.length === 4,
  },
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    topic: { type: String, default: "Indian Independence Movement" },
    generatedBy: { type: String, enum: ["ai", "manual", "local"], default: "manual" },
    questions: [questionSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
