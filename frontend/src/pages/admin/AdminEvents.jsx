import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import DetailRow from "../../components/DetailRow";

const emptyForm = { title: "", time: "", venue: "", icon: "🎉", description: "", order: 0 };

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/events")
      .then((res) => setEvents(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/events", form);
    setForm(emptyForm);
    load();
  };

  const startEdit = (ev) => {
    setViewing(null);
    setEditing({ ...ev });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/events/${editing._id}`, {
        title: editing.title,
        time: editing.time,
        venue: editing.venue,
        icon: editing.icon,
        description: editing.description,
        order: editing.order,
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
    if (!confirm("Delete this event?")) return;
    await api.delete(`/events/${id}`);
    setViewing(null);
    load();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 grid sm:grid-cols-2 gap-4">
        <h3 className="font-display font-semibold text-lg text-navy sm:col-span-2">➕ Add Schedule Item</h3>
        <input
          required
          placeholder="Title (e.g. Flag Hoisting)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
        />
        <input
          required
          placeholder="Time (e.g. 8:00 AM)"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
        />
        <input
          placeholder="Venue"
          value={form.venue}
          onChange={(e) => setForm({ ...form, venue: e.target.value })}
          className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
        />
        <input
          placeholder="Icon (emoji)"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
        />
        <input
          placeholder="Order (number)"
          type="number"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
        />
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border border-gray-300 rounded-lg px-4 py-2.5 sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-saffron"
        />
        <button type="submit" className="btn-tricolor sm:col-span-2">
          <span>Add to Schedule</span>
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-display font-semibold text-lg text-navy mb-4">Schedule Items ({events.length})</h3>
        {loading ? (
          <Loader label="Loading..." />
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev._id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
                <div>
                  <p className="font-medium text-navy">
                    {ev.icon} {ev.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {ev.time} · {ev.venue}
                  </p>
                </div>
                <button onClick={() => setViewing(ev)} className="btn-view">
                  👁️ View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {viewing && (
        <Modal title="Schedule Item Details" onClose={() => setViewing(null)}>
          <div className="divide-y divide-gray-50">
            <DetailRow label="Icon" value={viewing.icon} />
            <DetailRow label="Title" value={viewing.title} />
            <DetailRow label="Time" value={viewing.time} />
            <DetailRow label="Venue" value={viewing.venue} />
            <DetailRow label="Order" value={viewing.order} />
            <DetailRow label="Description" value={viewing.description || "-"} />
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
        <Modal title="Edit Schedule Item" onClose={() => setEditing(null)}>
          <form onSubmit={saveEdit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-navy">Title</label>
              <input
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-navy">Time</label>
                <input
                  required
                  value={editing.time}
                  onChange={(e) => setEditing({ ...editing, time: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-navy">Venue</label>
                <input
                  value={editing.venue}
                  onChange={(e) => setEditing({ ...editing, venue: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-navy">Icon (emoji)</label>
                <input
                  value={editing.icon}
                  onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-navy">Order</label>
                <input
                  type="number"
                  value={editing.order}
                  onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-navy">Description</label>
              <textarea
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
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
