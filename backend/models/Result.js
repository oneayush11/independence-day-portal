const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    participantName: { type: String, required: true },
    participantEmail: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    answers: [{ questionIndex: Number, selectedIndex: Number }],
    certificateId: { type: String, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
