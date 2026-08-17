import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import DetailRow from "../../components/DetailRow";

export default function AdminRegistrations() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null); // record being viewed
  const [editing, setEditing] = useState(null); // record being edited (form state)
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/registrations")
      .then((res) => setRegs(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openView = (reg) => setViewing(reg);

  const startEdit = (reg) => {
    setViewing(null);
    setEditing({ ...reg });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/registrations/${editing._id}`, {
        name: editing.name,
        email: editing.email,
        phone: editing.phone,
        organization: editing.organization,
        category: editing.category,
        eventInterest: editing.eventInterest,
      });
      setEditing(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this registration?")) return;
    await api.delete(`/registrations/${id}`);
    setViewing(null);
    load();
  };

  if (loading) return <Loader label="Loading registrations..." />;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 overflow-x-auto">
      <h3 className="font-display font-semibold text-lg text-navy mb-4">
        Participant Registrations ({regs.length})
      </h3>
      {regs.length === 0 ? (
        <p className="text-sm text-gray-500">No registrations yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {regs.map((r) => (
              <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2 pr-4 font-medium text-navy">{r.name}</td>
                <td className="py-2 pr-4 text-gray-600">{r.email}</td>
                <td className="py-2 pr-4 text-gray-600">{r.category}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-2">
                    <button onClick={() => openView(r)} className="btn-view">
                      👁️ View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* VIEW MODAL */}
      {viewing && (
        <Modal title="Registration Details" onClose={() => setViewing(null)}>
          <div className="divide-y divide-gray-50">
            <DetailRow label="Name" value={viewing.name} />
            <DetailRow label="Email" value={viewing.email} />
            <DetailRow label="Phone" value={viewing.phone} />
            <DetailRow label="Organization" value={viewing.organization || "-"} />
            <DetailRow label="Category" value={viewing.category} />
            <DetailRow label="Interested In" value={viewing.eventInterest} />
            <DetailRow
              label="Registered On"
              value={new Date(viewing.createdAt).toLocaleString("en-IN")}
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => startEdit(viewing)} className="btn-edit">
              ✏️ Edit
            </button>
            <button onClick={() => remove(viewing._id)} className="btn-danger">
              🗑️ Delete
            </button>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <Modal title="Edit Registration" onClose={() => setEditing(null)}>
          <form onSubmit={saveEdit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-navy">Name</label>
              <input
                required
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-navy">Email</label>
                <input
                  required
                  type="email"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-navy">Phone</label>
                <input
                  required
                  value={editing.phone}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-navy">Organization</label>
              <input
                value={editing.organization || ""}
                onChange={(e) => setEditing({ ...editing, organization: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-navy">Category</label>
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                >
                  <option>Student</option>
                  <option>Employee</option>
                  <option>Guest</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-navy">Interested In</label>
                <select
                  value={editing.eventInterest}
                  onChange={(e) => setEditing({ ...editing, eventInterest: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                >
                  <option>General Celebration</option>
                  <option>Quiz Competition</option>
                  <option>Cultural Programs</option>
                  <option>Volunteering</option>
                </select>
              </div>
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
