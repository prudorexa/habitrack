import React, { useState, useEffect } from "react";
import { Users, UserPlus, Edit, Trash2 } from "lucide-react";

const STORAGE_KEY = "habitrack.tenants";

export default function ManageTenants() {
  // Read storage once when initializing state (guaranteed to run only on first render)
  const [tenants, setTenants] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      console.warn("Invalid tenants data in localStorage, resetting.");
      return [];
    } catch (err) {
      console.error("Error reading tenants from localStorage:", err);
      return [];
    }
  });

  const [form, setForm] = useState({ name: "", unit: "", contact: "" });
  const [editingId, setEditingId] = useState(null);

  // Save tenants whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
      console.log(`[HabiTrack] Saved ${tenants.length} tenants to ${STORAGE_KEY}`);
    } catch (err) {
      console.error("Error saving tenants to localStorage:", err);
    }
  }, [tenants]);

  // Helpers
  const resetForm = () => {
    setForm({ name: "", unit: "", contact: "" });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.unit.trim() || !form.contact.trim()) {
      alert("Please fill all fields.");
      return;
    }

    if (editingId) {
      // update
      setTenants((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...form } : t))
      );
    } else {
      // add
      const newTenant = { ...form, id: Date.now() }; // simple unique id
      setTenants((prev) => [...prev, newTenant]);
    }

    resetForm();
  };

  const startEdit = (tenant) => {
    setForm({ name: tenant.name, unit: tenant.unit, contact: tenant.contact });
    setEditingId(tenant.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this tenant?")) return;
    setTenants((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-blue-700 flex items-center gap-3">
          <Users size={28} /> Manage Tenants
        </h2>
        <div className="text-sm text-gray-500">Saved to key: <code>{STORAGE_KEY}</code></div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-100 p-4 rounded-xl shadow text-center">
          <p className="text-gray-600">Total Tenants</p>
          <p className="text-3xl font-bold">{tenants.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-xl shadow text-center">
          <p className="text-gray-600">Occupied Units</p>
          <p className="text-3xl font-bold">{tenants.length}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-xl shadow text-center">
          <p className="text-gray-600">Vacant Units</p>
          <p className="text-3xl font-bold">{Math.max(0, 10 - tenants.length)}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-xl shadow text-center">
          <p className="text-gray-600">Recent Added</p>
          <p className="text-3xl font-bold">{tenants.length ? tenants[tenants.length - 1].name : "—"}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <UserPlus /> {editingId ? "Edit Tenant" : "Add Tenant"}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={() => { resetForm(); }}
              className="text-sm text-gray-600 hover:underline"
            >
              Cancel edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            className="border p-3 rounded"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="border p-3 rounded"
            placeholder="Unit (e.g., A-02)"
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          />
          <input
            className="border p-3 rounded sm:col-span-2"
            placeholder="Contact (phone or email)"
            value={form.contact}
            onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
          />
        </div>

        <div className="text-right mt-4">
          <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded">
            {editingId ? "Save changes" : "Add tenant"}
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border">
        <div className="p-4 border-b">
          <h4 className="text-lg font-semibold">Tenant list</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Unit</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr><td colSpan="4" className="p-6 text-center text-gray-500">No tenants yet.</td></tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{t.name}</td>
                    <td className="p-3">{t.unit}</td>
                    <td className="p-3">{t.contact}</td>
                    <td className="p-3 space-x-2">
                      <button onClick={() => startEdit(t)} className="text-blue-600"><Edit /></button>
                      <button onClick={() => handleDelete(t.id)} className="text-red-600"><Trash2 /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
