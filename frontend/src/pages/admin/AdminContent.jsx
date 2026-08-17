import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Modal from "../../components/Modal";
import DetailRow from "../../components/DetailRow";

/* ---------------------------- GALLERY MANAGER ---------------------------- */
const MAX_IMAGE_BYTES = 50 * 1024; // 50KB limit, enforced client-side too

function GalleryManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", caption: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editFileError, setEditFileError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    api
      .get("/gallery")
      .then((res) => setItems(res.data.data || []))
      .catch((err) => console.error("Failed to load gallery items:", err));

  useEffect(() => {
    load();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.size > MAX_IMAGE_BYTES) {
      setFileError(
        `That image is ${Math.round(selected.size / 1024)}KB — please choose one under 50KB.`
      );
      setFile(null);
      setPreview(null);
      return;
    }
    setFileError("");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      setFileError("Please choose an image to upload.");
      return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("image", file);
      data.append("title", form.title);
      data.append("caption", form.caption);
      await api.post("/gallery", data);
      setForm({ title: "", caption: "" });
      setFile(null);
      setPreview(null);
      load();
    } catch (err) {
      setFileError(err.response?.data?.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this photo?")) return;
    await api.delete(`/gallery/${id}`);
    setViewing(null);
    load();
  };

  const startEdit = (item) => {
    setViewing(null);
    setEditing({ ...item });
    setEditFile(null);
    setEditPreview(null);
    setEditFileError("");
  };

  const handleEditFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.size > MAX_IMAGE_BYTES) {
      setEditFileError(
        `That image is ${Math.round(selected.size / 1024)}KB — please choose one under 50KB.`
      );
      setEditFile(null);
      setEditPreview(null);
      return;
    }
    setEditFileError("");
    setEditFile(selected);
    setEditPreview(URL.createObjectURL(selected));
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append("title", editing.title || "");
      data.append("caption", editing.caption || "");
      if (editFile) data.append("image", editFile);
      await api.put(`/gallery/${editing._id}`, data);
      setEditing(null);
      setEditFile(null);
      setEditPreview(null);
      load();
    } catch (err) {
      setEditFileError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-display font-semibold text-lg text-navy mb-4">📸 Gallery</h3>
      <form onSubmit={submit} className="grid sm:grid-cols-3 gap-3 mb-5 items-start">
        <div>
          <input
            required
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-saffron/10 file:text-saffron file:text-xs file:font-semibold"
          />
          <p className="text-[11px] text-gray-400 mt-1">Max size: 50KB</p>
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-2 w-20 h-20 object-cover rounded-lg border border-gray-200"
            />
          )}
          {fileError && <p className="text-xs text-red-600 mt-1">{fileError}</p>}
        </div>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron h-fit"
        />
        <input
          placeholder="Caption"
          value={form.caption}
          onChange={(e) => setForm({ ...form, caption: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron h-fit"
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn-tricolor text-sm sm:col-span-3 disabled:opacity-50"
        >
          <span>{submitting ? "Uploading..." : "Add Photo"}</span>
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((it) => (
          <button
            key={it._id}
            onClick={() => setViewing(it)}
            className="relative group text-left card-hover rounded-lg overflow-hidden"
          >
            <img src={it.imageUrl} alt={it.title} className="w-full h-24 object-cover" />
            <span className="absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition-colors flex items-center justify-center text-white text-xs font-semibold opacity-0 group-hover:opacity-100">
              👁️ View
            </span>
          </button>
        ))}
      </div>

      {viewing && (
        <Modal title="Photo Details" onClose={() => setViewing(null)}>
          <img
            src={viewing.imageUrl}
            alt={viewing.title}
            className="w-full h-56 object-cover rounded-xl mb-4"
          />
          <div className="divide-y divide-gray-50">
            <DetailRow label="Title" value={viewing.title || "-"} />
            <DetailRow label="Caption" value={viewing.caption || "-"} />
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

      {editing && (
        <Modal title="Edit Photo" onClose={() => setEditing(null)}>
          <form onSubmit={saveEdit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-navy">Current Image</label>
              <img
                src={editPreview || editing.imageUrl}
                alt={editing.title}
                className="mt-1 w-24 h-24 object-cover rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy">Replace Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleEditFileChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-saffron/10 file:text-saffron file:text-xs file:font-semibold"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Max size: 50KB. Leave empty to keep the current image.
              </p>
              {editFileError && (
                <p className="text-xs text-red-600 mt-1">{editFileError}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-navy">Title</label>
              <input
                value={editing.title || ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy">Caption</label>
              <input
                value={editing.caption || ""}
                onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-tricolor w-full disabled:opacity-50"
            >
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ------------------------- ANNOUNCEMENT MANAGER -------------------------- */
function AnnouncementManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", message: "", priority: "normal" });
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/announcements").then((res) => setItems(res.data.data));
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/announcements", form);
    setForm({ title: "", message: "", priority: "normal" });
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    await api.delete(`/announcements/${id}`);
    setViewing(null);
    load();
  };

  const startEdit = (item) => {
    setViewing(null);
    setEditing({ ...item });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/announcements/${editing._id}`, {
        title: editing.title,
        message: editing.message,
        priority: editing.priority,
      });
      setEditing(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-display font-semibold text-lg text-navy mb-4">📢 Announcements</h3>
      <form onSubmit={submit} className="space-y-3 mb-5">
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron"
        />
        <textarea
          required
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron"
        />
        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron"
        >
          <option value="normal">Normal</option>
          <option value="high">High Priority</option>
        </select>
        <button type="submit" className="btn-tricolor text-sm w-full">
          <span>Post Announcement</span>
        </button>
      </form>

      <div className="space-y-2">
        {items.map((it) => (
          <div
            key={it._id}
            className="flex items-center justify-between border border-gray-100 rounded-lg p-3 text-sm"
          >
            <span className="font-medium text-navy">{it.title}</span>
            <button onClick={() => setViewing(it)} className="btn-view">
              👁️ View
            </button>
          </div>
        ))}
      </div>

      {viewing && (
        <Modal title="Announcement Details" onClose={() => setViewing(null)}>
          <div className="divide-y divide-gray-50">
            <DetailRow label="Title" value={viewing.title} />
            <DetailRow label="Message" value={viewing.message} />
            <DetailRow label="Priority" value={viewing.priority} />
            <DetailRow
              label="Posted On"
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

      {editing && (
        <Modal title="Edit Announcement" onClose={() => setEditing(null)}>
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
            <div>
              <label className="text-sm font-medium text-navy">Message</label>
              <textarea
                required
                value={editing.message}
                onChange={(e) => setEditing({ ...editing, message: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy">Priority</label>
              <select
                value={editing.priority}
                onChange={(e) => setEditing({ ...editing, priority: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
              >
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-tricolor w-full disabled:opacity-50"
            >
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ----------------------------- SPEAKER MANAGER ---------------------------- */
function SpeakerManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    designation: "",
    organization: "",
    bio: "",
    isChiefGuest: false,
  });
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.get("/events/speakers/all").then((res) => setItems(res.data.data));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/events/speakers", form);
    setForm({
      name: "",
      designation: "",
      organization: "",
      bio: "",
      isChiefGuest: false,
    });
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this speaker?")) return;
    await api.delete(`/events/speakers/${id}`);
    setViewing(null);
    load();
  };

  const startEdit = (item) => {
    setViewing(null);
    setEditing({ ...item });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/events/speakers/${editing._id}`, {
        name: editing.name,
        designation: editing.designation,
        organization: editing.organization,
        bio: editing.bio,
        isChiefGuest: editing.isChiefGuest,
      });
      setEditing(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-display font-semibold text-lg text-navy mb-4">
        🎤 Speakers / Chief Guest
      </h3>
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3 mb-5">
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron"
        />
        <input
          placeholder="Designation"
          value={form.designation}
          onChange={(e) => setForm({ ...form, designation: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron"
        />
        <input
          placeholder="Organization"
          value={form.organization}
          onChange={(e) => setForm({ ...form, organization: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron"
        />
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={form.isChiefGuest}
            onChange={(e) => setForm({ ...form, isChiefGuest: e.target.checked })}
          />
          Chief Guest
        </label>
        <textarea
          placeholder="Short bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-saffron"
        />
        <button type="submit" className="btn-tricolor text-sm sm:col-span-2">
          <span>Add Speaker</span>
        </button>
      </form>

      <div className="space-y-2">
        {items.map((it) => (
          <div
            key={it._id}
            className="flex items-center justify-between border border-gray-100 rounded-lg p-3 text-sm"
          >
            <span className="font-medium text-navy">
              {it.name} {it.isChiefGuest && "⭐"}
            </span>
            <button onClick={() => setViewing(it)} className="btn-view">
              👁️ View
            </button>
          </div>
        ))}
      </div>

      {viewing && (
        <Modal title="Speaker Details" onClose={() => setViewing(null)}>
          <div className="divide-y divide-gray-50">
            <DetailRow label="Name" value={viewing.name} />
            <DetailRow label="Designation" value={viewing.designation || "-"} />
            <DetailRow label="Organization" value={viewing.organization || "-"} />
            <DetailRow
              label="Chief Guest"
              value={viewing.isChiefGuest ? "Yes ⭐" : "No"}
            />
            <DetailRow label="Bio" value={viewing.bio || "-"} />
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

      {editing && (
        <Modal title="Edit Speaker" onClose={() => setEditing(null)}>
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
                <label className="text-sm font-medium text-navy">Designation</label>
                <input
                  value={editing.designation || ""}
                  onChange={(e) => setEditing({ ...editing, designation: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-navy">Organization</label>
                <input
                  value={editing.organization || ""}
                  onChange={(e) => setEditing({ ...editing, organization: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={editing.isChiefGuest}
                onChange={(e) => setEditing({ ...editing, isChiefGuest: e.target.checked })}
              />
              Chief Guest
            </label>
            <div>
              <label className="text-sm font-medium text-navy">Bio</label>
              <textarea
                value={editing.bio || ""}
                onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-tricolor w-full disabled:opacity-50"
            >
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default function AdminContent() {
  return (
    <div className="space-y-8">
      <GalleryManager />
      <AnnouncementManager />
      <SpeakerManager />
    </div>
  );
}