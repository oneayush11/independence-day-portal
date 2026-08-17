import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import DetailRow from "../../components/DetailRow";

// Fixed list of selectable topics — matches backend/utils/aiQuizGenerator.js
// ALLOWED_TOPICS exactly. Keeping this as a dropdown (not free text) means
// the admin can never submit an unsupported/random topic.
const TOPIC_OPTIONS = [
  "Indian Independence Movement",
  "Indian Freedom Fighters",
  "National Symbols of India",
  "Constitution & Government of India",
];

export default function AdminQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ topic: TOPIC_OPTIONS[0], count: 5, title: "" });
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);
  const [viewing, setViewing] = useState(null); // full quiz object being viewed
  const [editing, setEditing] = useState(null); // full quiz object being edited
  const [saving, setSaving] = useState(false);

  const loadQuizzes = () => {
    setLoading(true);
    api
      .get("/quiz")
      .then((res) => setQuizzes(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadQuizzes, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setMessage(null);
    try {
      const res = await api.post("/quiz/generate", form);
      setMessage({
        type: "success",
        text: `Quiz created using ${res.data.source === "ai" ? "AI (Claude)" : "local generator"}! Activate it below to make it live.`,
      });
      setForm({ topic: TOPIC_OPTIONS[0], count: 5, title: "" });
      loadQuizzes();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Generation failed" });
    } finally {
      setGenerating(false);
    }
  };

  const openView = async (id) => {
    const res = await api.get(`/quiz/${id}`);
    setViewing(res.data.data);
  };

  const startEdit = () => {
    setEditing(JSON.parse(JSON.stringify(viewing))); // deep clone
    setViewing(null);
  };

  const updateQuestionField = (qIndex, field, value) => {
    const updated = { ...editing };
    updated.questions[qIndex][field] = value;
    setEditing(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = { ...editing };
    updated.questions[qIndex].options[optIndex] = value;
    setEditing(updated);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/quiz/${editing._id}`, {
        title: editing.title,
        topic: editing.topic,
        questions: editing.questions,
      });
      setEditing(null);
      loadQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const activate = async (id) => {
    await api.put(`/quiz/${id}/activate`);
    loadQuizzes();
  };

  const deactivate = async (id) => {
    await api.put(`/quiz/${id}/deactivate`);
    loadQuizzes();
  };

  const remove = async (id) => {
    if (!confirm("Delete this quiz?")) return;
    await api.delete(`/quiz/${id}`);
    setViewing(null);
    loadQuizzes();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-display font-semibold text-lg text-navy mb-1 flex items-center gap-2">
          ✨ AI-Based Quiz Generator
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Pick a topic from the list — the app uses your Anthropic API key (if set in backend/.env) to
          generate MCQs for that topic, or falls back to a built-in local question bank (in English) if
          no key is configured.
        </p>
        <form onSubmit={handleGenerate} className="grid sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-navy">Topic</label>
            <select
              required
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron bg-white"
            >
              {TOPIC_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-navy"># Questions</label>
            <input
              type="number"
              min="3"
              max="15"
              value={form.count}
              onChange={(e) => setForm({ ...form, count: Number(e.target.value) })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-navy">Quiz Title (optional)</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
            />
          </div>
          <button type="submit" disabled={generating} className="btn-tricolor sm:col-span-3 disabled:opacity-50">
            <span>{generating ? "Generating..." : "🪄 Generate Quiz"}</span>
          </button>
        </form>
        {message && (
          <p className={`text-sm mt-3 ${message.type === "error" ? "text-red-600" : "text-indiagreen"}`}>
            {message.text}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-display font-semibold text-lg text-navy mb-1">All Quizzes</h3>
        <p className="text-xs text-gray-400 mb-4">
          Multiple quizzes can be Active at the same time — logged-in users will see all of them
          until they complete each one.
        </p>
        {loading ? (
          <Loader label="Loading quizzes..." />
        ) : quizzes.length === 0 ? (
          <p className="text-sm text-gray-500">No quizzes yet. Generate one above!</p>
        ) : (
          <div className="space-y-3">
            {quizzes.map((q) => (
              <div key={q._id} className="flex flex-wrap items-center justify-between gap-3 border border-gray-100 rounded-xl p-4">
                <div>
                  <p className="font-medium text-navy">
                    {q.title}{" "}
                    {q.isActive && (
                      <span className="text-xs bg-indiagreen/10 text-indiagreen px-2 py-0.5 rounded-full ml-2">Active</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {q.questions.length} questions · Source: {q.generatedBy}
                  </p>
                </div>
                <button onClick={() => openView(q._id)} className="btn-view">
                  👁️ View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIEW MODAL - shows questions WITH correct answers */}
      {viewing && (
        <Modal title="Quiz Details" onClose={() => setViewing(null)} wide>
          <div className="divide-y divide-gray-50 mb-4">
            <DetailRow label="Title" value={viewing.title} />
            <DetailRow label="Topic" value={viewing.topic} />
            <DetailRow label="Generated By" value={viewing.generatedBy} />
            <DetailRow label="Status" value={viewing.isActive ? "Active (live on site)" : "Inactive"} />
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {viewing.questions.map((q, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-3">
                <p className="text-sm font-medium text-navy mb-2">
                  {i + 1}. {q.questionText}
                </p>
                <div className="grid sm:grid-cols-2 gap-1.5">
                  {q.options.map((opt, oi) => (
                    <span
                      key={oi}
                      className={`text-xs px-2.5 py-1.5 rounded ${
                        oi === q.correctIndex
                          ? "bg-indiagreen/10 text-indiagreen font-semibold"
                          : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {oi === q.correctIndex ? "✓ " : ""}
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            {!viewing.isActive ? (
              <button
                onClick={() => {
                  activate(viewing._id);
                  setViewing(null);
                }}
                className="btn-outline text-sm"
              >
                Set Active
              </button>
            ) : (
              <button
                onClick={() => {
                  deactivate(viewing._id);
                  setViewing(null);
                }}
                className="btn-outline text-sm"
              >
                Deactivate
              </button>
            )}
            <button onClick={startEdit} className="btn-edit">
              ✏️ Edit
            </button>
            <button onClick={() => remove(viewing._id)} className="btn-danger">
              🗑️ Delete
            </button>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL - edit title/topic + each question's text/options/correct answer */}
      {editing && (
        <Modal title="Edit Quiz" onClose={() => setEditing(null)} wide>
          <form onSubmit={saveEdit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-navy">Title</label>
                <input
                  required
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-navy">Topic</label>
                <input
                  value={editing.topic}
                  onChange={(e) => setEditing({ ...editing, topic: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {editing.questions.map((q, qi) => (
                <div key={qi} className="border border-gray-100 rounded-lg p-3">
                  <label className="text-xs font-semibold text-gray-500">Question {qi + 1}</label>
                  <input
                    value={q.questionText}
                    onChange={(e) => updateQuestionField(qi, "questionText", e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron"
                  />
                  <div className="grid sm:grid-cols-2 gap-2 mt-2">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={q.correctIndex === oi}
                          onChange={() => updateQuestionField(qi, "correctIndex", oi)}
                          title="Mark as correct answer"
                        />
                        <input
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron"
                        />
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Select the radio button next to the correct option</p>
                </div>
              ))}
            </div>

            <button type="submit" disabled={saving} className="btn-tricolor w-full disabled:opacity-50">
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}