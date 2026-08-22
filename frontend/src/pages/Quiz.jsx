import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

export default function Quiz() {
  const { user, loading: authLoading } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("list"); // list -> confirm -> quiz -> result
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadQuizzes = () => {
    setLoading(true);
    setError("");
    api
      .get("/quiz/active")
      .then((res) => setQuizzes(res.data.data))
      .catch(() => setError("Could not load quizzes right now. Please try again later."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) loadQuizzes();
  }, [user]);

  const selectAnswer = (qIndex, optIndex) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setAnswers({});
    setError("");
    setStage("confirm");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        participantName: user.name,
        participantEmail: user.email,
        answers: Object.entries(answers).map(([qIndex, selectedIndex]) => ({
          questionIndex: Number(qIndex),
          selectedIndex,
        })),
      };
      const res = await api.post(`/quiz/${selectedQuiz._id}/submit`, payload);
      setResult(res.data.data);
      setStage("result");
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadCertificate = () => {
    const baseURL = import.meta.env.VITE_API_URL || "";
    window.open(`${baseURL}/api/quiz/certificate/${result.resultId}`, "_blank");
  };

  const backToList = () => {
    setStage("list");
    setSelectedQuiz(null);
    setAnswers({});
    setResult(null);
    loadQuizzes(); // refetch so the just-completed quiz disappears
  };

  // --- Not logged in: ask them to log in first (required to track which
  // quizzes each person has already completed) ---
  if (!authLoading && !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
        <p className="text-saffron font-semibold">🏆 Test Your Knowledge</p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-navy mt-1 mb-6">
          Independence Day Quiz
        </h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="font-display font-semibold text-xl text-navy mb-2">
            Please log in to continue
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Logging in lets us show you exactly which quizzes you still need to take, and keeps
            quizzes you've already completed out of your way.
          </p>
          <Link to="/login" className="btn-tricolor">
            <span>Log In / Sign Up</span>
          </Link>
        </div>
      </div>
    );
  }

  if (authLoading || loading) return <Loader label="Loading quizzes..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-10">
        <p className="text-saffron font-semibold">🏆 Test Your Knowledge</p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-navy mt-1">
          Independence Day Quiz
        </h1>
      </div>

      {error && stage === "list" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center mb-6">
          {error}
        </div>
      )}

      {/* --- LIST: all quizzes this user hasn't completed yet --- */}
      {stage === "list" && (
        <>
          {quizzes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center animate-fadeSlide">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="font-display font-semibold text-xl text-navy mb-2">
                No quizzes left for you right now!
              </h2>
              <p className="text-gray-500 text-sm">
                You're all caught up — you've completed every available quiz. Check back later,
                new quizzes may be added.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeSlide">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="card-hover bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-display font-semibold text-lg text-navy">{quiz.title}</h3>
                    <p className="text-sm text-gray-500">{quiz.questions.length} questions</p>
                  </div>
                  <button onClick={() => startQuiz(quiz)} className="btn-tricolor text-sm">
                    <span>Start Quiz 🚀</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* --- CONFIRM: quick "ready to start" step, using the logged-in identity --- */}
      {stage === "confirm" && selectedQuiz && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fadeSlide">
          <h2 className="font-display font-semibold text-xl text-navy mb-1">{selectedQuiz.title}</h2>
          <p className="text-sm text-gray-500 mb-6">{selectedQuiz.questions.length} questions</p>
          <p className="text-sm text-gray-600 mb-6">
            Playing as <span className="font-semibold text-navy">{user.name}</span> ({user.email})
          </p>
          <div className="flex gap-3">
            <button onClick={() => setStage("list")} className="btn-outline text-sm">
              ← Back
            </button>
            <button onClick={() => setStage("quiz")} className="btn-tricolor flex-1">
              <span>Start Quiz 🚀</span>
            </button>
          </div>
        </div>
      )}

      {/* --- QUIZ: answer the questions --- */}
      {stage === "quiz" && selectedQuiz && (
        <div className="space-y-6 animate-fadeSlide">
          {selectedQuiz.questions.map((q, qi) => (
            <div key={q._id || qi} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="font-semibold text-navy mb-4">
                {qi + 1}. {q.questionText}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => selectAnswer(qi, oi)}
                    className={`text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      answers[qi] === oi
                        ? "border-saffron bg-saffron/10 text-navy font-semibold"
                        : "border-gray-200 hover:border-saffron/50 hover:bg-saffron/5"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length !== selectedQuiz.questions.length}
            className="btn-tricolor w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{submitting ? "Submitting..." : "Submit Quiz ✅"}</span>
          </button>
        </div>
      )}

      {/* --- RESULT --- */}
      {stage === "result" && result && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-fadeSlide">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-display font-bold text-2xl text-navy mb-2">
            Well Done, {user.name}!
          </h2>
          <p className="text-gray-600 mb-1">
            You scored <span className="font-bold text-indiagreen">{result.score}</span> out of{" "}
            <span className="font-bold">{result.total}</span>
          </p>
          <p className="text-xs text-gray-400 mb-6">Certificate ID: {result.certificateId}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={downloadCertificate} className="btn-tricolor">
              <span>📜 Download Certificate</span>
            </button>
            <button onClick={backToList} className="btn-outline">
              See remaining quizzes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
