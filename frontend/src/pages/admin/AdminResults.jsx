import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import DetailRow from "../../components/DetailRow";

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/quiz/results/all")
      .then((res) => setResults(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openView = async (resultId) => {
    const res = await api.get(`/quiz/result/${resultId}`);
    setViewing(res.data.data);
  };

  const remove = async (id) => {
    if (!confirm("Delete this result?")) return;
    await api.delete(`/quiz/result/${id}`);
    setViewing(null);
    load();
  };

  if (loading) return <Loader label="Loading results..." />;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 overflow-x-auto">
      <h3 className="font-display font-semibold text-lg text-navy mb-4">🏅 Quiz Results & Certificates</h3>
      {results.length === 0 ? (
        <p className="text-sm text-gray-500">No quiz attempts yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 pr-4">Participant</th>
              <th className="py-2 pr-4">Quiz</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2 pr-4 font-medium text-navy">{r.participantName}</td>
                <td className="py-2 pr-4 text-gray-600">{r.quiz?.title || "-"}</td>
                <td className="py-2 pr-4 text-gray-600">
                  {r.score}/{r.total}
                </td>
                <td className="py-2 pr-4">
                  <button onClick={() => openView(r._id)} className="btn-view">
                    👁️ View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* VIEW MODAL */}
      {viewing && (
        <Modal title="Result Details" onClose={() => setViewing(null)} wide>
          <div className="divide-y divide-gray-50 mb-4">
            <DetailRow label="Participant" value={viewing.participantName} />
            <DetailRow label="Email" value={viewing.participantEmail} />
            <DetailRow label="Quiz" value={viewing.quiz?.title} />
            <DetailRow label="Score" value={`${viewing.score} / ${viewing.total}`} />
            <DetailRow label="Certificate ID" value={viewing.certificateId} />
            <DetailRow label="Submitted On" value={new Date(viewing.createdAt).toLocaleString("en-IN")} />
          </div>

          {viewing.quiz?.questions && (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Answer Breakdown</p>
              {viewing.quiz.questions.map((q, i) => {
                const given = viewing.answers.find((a) => a.questionIndex === i);
                const isCorrect = given && given.selectedIndex === q.correctIndex;
                return (
                  <div key={i} className="border border-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-navy mb-1">
                      {i + 1}. {q.questionText}
                    </p>
                    <p className={`text-xs ${isCorrect ? "text-indiagreen" : "text-red-600"}`}>
                      {isCorrect ? "✓ Correct" : "✗ Incorrect"} — answered:{" "}
                      {given ? q.options[given.selectedIndex] : "No answer"}
                      {!isCorrect && ` (correct: ${q.options[q.correctIndex]})`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-3">
            <a
              href={`/api/quiz/certificate/${viewing._id}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline text-sm"
            >
              📜 Download Certificate
            </a>
            <button onClick={() => remove(viewing._id)} className="btn-danger">
              🗑️ Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
