import React, { useEffect, useMemo, useState } from "react";
import {
  Zap,
  Droplet,
  Trash2,
  Edit,
  Search,
  User,
  ChevronDown,
  Plus,
} from "lucide-react";

/**
 * UtilitiesControl.jsx
 * - Reads tenants from localStorage key: "habitrack.tenants"
 * - Persists utility records to localStorage key: "habitrack.utilities"
 * - Features: add / edit / delete, search/filter, tenant card, summary cards,
 *   calendar date input, utility type selector, notes, unique visual styling.
 */

const TENANTS_KEY = "habitrack.tenants";
const UTILITIES_KEY = "habitrack.utilities";

const UTILITY_TYPES = [
  { key: "electricity", label: "Electricity", icon: Zap, accent: "bg-yellow-100", text: "text-yellow-700" },
  { key: "water", label: "Water", icon: Droplet, accent: "bg-blue-100", text: "text-blue-700" },
  { key: "other", label: "Other", icon: User, accent: "bg-purple-100", text: "text-purple-700" },
];

function fmtNumber(v) {
  if (v === "" || v === null || v === undefined) return "—";
  const n = Number(v);
  if (isNaN(n)) return v;
  return n.toLocaleString();
}

export default function UtilitiesControl() {
  // tenants (read from ManageTenants)
  const [tenants, setTenants] = useState([]);

  // utilities records (persisted)
  const [records, setRecords] = useState(() => {
    try {
      const raw = localStorage.getItem(UTILITIES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // form
  const [form, setForm] = useState({
    id: null,
    tenant: "",
    type: "electricity",
    amount: "",
    date: "",
    notes: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // UI helpers
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | largest

  // load tenants
  const loadTenantsFromStorage = () => {
    try {
      const raw = localStorage.getItem(TENANTS_KEY);
      if (!raw) {
        setTenants([]);
        return;
      }
      const parsed = JSON.parse(raw);
      setTenants(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.error("Error loading tenants:", err);
      setTenants([]);
    }
  };

  // initialize tenants and listen to storage events for cross-tab updates
  useEffect(() => {
    loadTenantsFromStorage();
    const onStorage = (e) => {
      if (e.key === TENANTS_KEY) loadTenantsFromStorage();
      if (e.key === UTILITIES_KEY) {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : [];
          setRecords(Array.isArray(parsed) ? parsed : []);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist records
  useEffect(() => {
    try {
      localStorage.setItem(UTILITIES_KEY, JSON.stringify(records));
    } catch (err) {
      console.error("Error saving utilities:", err);
    }
  }, [records]);

  // derived stats
  const totals = useMemo(() => {
    const totalAmount = records.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const byType = UTILITY_TYPES.reduce((acc, t) => ({ ...acc, [t.key]: 0 }), {});
    records.forEach((r) => {
      const k = r.type || "other";
      byType[k] = (byType[k] || 0) + (Number(r.amount) || 0);
    });
    const avg = records.length ? totalAmount / records.length : 0;
    return { totalAmount, byType, avg, count: records.length };
  }, [records]);

  // filtered view
  const filtered = useMemo(() => {
    let list = records.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          (r.tenant || "").toLowerCase().includes(q) ||
          (r.notes || "").toLowerCase().includes(q)
      );
    }
    if (filterType !== "all") list = list.filter((r) => r.type === filterType);
    if (sortBy === "newest") list = list.sort((a, b) => b.id - a.id);
    if (sortBy === "oldest") list = list.sort((a, b) => a.id - b.id);
    if (sortBy === "largest") list = list.sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0));
    return list;
  }, [records, query, filterType, sortBy]);

  // helpers
  const startEdit = (rec) => {
    setForm({
      id: rec.id,
      tenant: rec.tenant,
      type: rec.type || "other",
      amount: rec.amount,
      date: rec.date,
      notes: rec.notes || "",
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm({ id: null, tenant: "", type: "electricity", amount: "", date: "", notes: "" });
    setIsEditing(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this utility record?")) return;
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.tenant || !form.date || form.amount === "") {
      alert("Please fill tenant, date and amount.");
      return;
    }
    // ensure tenant exists (fallback)
    const tenantExists = tenants.some((t) => t.name === form.tenant);
    if (!tenantExists) {
      alert("Selected tenant not found. Please select a valid tenant.");
      return;
    }

    if (isEditing && form.id) {
      setRecords((prev) => prev.map((r) => (r.id === form.id ? { ...form } : r)));
    } else {
      setRecords((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    resetForm();
  };

  // add quick-select tenant when clicking a tenant card
  const handleTenantQuickSelect = (t) => {
    setForm((f) => ({ ...f, tenant: t.name }));
  };

  // small UI pieces
  const UtilityBadge = ({ typeKey }) => {
    const type = UTILITY_TYPES.find((t) => t.key === typeKey) || UTILITY_TYPES[2];
    const Icon = type.icon;
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${type.accent}`}>
        <Icon className={`${type.text}`} size={16} />
        <span className={`${type.text} text-sm`}>{type.label}</span>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* header with soft gradient */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-sky-50 via-emerald-50 to-emerald-100 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/60 backdrop-blur-sm shadow">
              <Zap className="text-yellow-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Utilities Control</h1>
              <p className="text-sm text-slate-600">Track and manage water & electricity per tenant</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-500">Average bill</p>
              <p className="text-lg font-semibold">Ksh {fmtNumber(totals.avg.toFixed(2))}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Records</p>
              <p className="text-lg font-semibold">{totals.count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* cards + controls row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-4 shadow">
          <h3 className="text-sm text-slate-500 mb-2">Quick Tenants</h3>
          <div className="flex flex-wrap gap-2">
            {tenants.length === 0 && <p className="text-sm text-gray-400">No tenants yet</p>}
            {tenants.slice(0, 12).map((t) => (
              <button
                key={t.id}
                onClick={() => handleTenantQuickSelect(t)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                title="Quick select tenant"
              >
                <User className="text-slate-500" size={16} />
                <div className="text-sm text-slate-700">{t.name}</div>
                <ChevronDown size={14} className="text-slate-300" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow">
          <h3 className="text-sm text-slate-500 mb-2">Totals (by type)</h3>
          <div className="flex flex-col gap-3">
            {UTILITY_TYPES.map((t) => (
              <div key={t.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <t.icon className="text-slate-600" size={18} />
                  <div>
                    <div className="text-sm text-slate-600">{t.label}</div>
                    <div className="text-lg font-semibold">Ksh {fmtNumber(totals.byType[t.key] || 0)}</div>
                  </div>
                </div>
                <div className="text-sm text-slate-400">{/* placeholder */}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow">
          <h3 className="text-sm text-slate-500 mb-2">Find & Filter</h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tenant or notes..."
                className="w-full border rounded-lg p-2 pl-10"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="p-2 border rounded-lg">
              <option value="all">All</option>
              {UTILITY_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="p-2 border rounded-lg">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="largest">Largest amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* main form - unique card style */}
      <div className="bg-gradient-to-r from-white to-slate-50 rounded-2xl p-6 shadow-md border">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="text-sm text-slate-600">Tenant</label>
            <select
              className="w-full p-2 border rounded-lg"
              value={form.tenant}
              onChange={(e) => handleTenantSelect(e.target.value)}
            >
              <option value="">Select tenant</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.unit || t.house || "—"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600">Utility Type</label>
            <select className="w-full p-2 border rounded-lg" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {UTILITY_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600">Amount (Ksh)</label>
            <input className="w-full p-2 border rounded-lg" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          </div>

          <div>
            <label className="text-sm text-slate-600">Date</label>
            <input className="w-full p-2 border rounded-lg" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>

          <div className="md:col-span-3">
            <label className="text-sm text-slate-600">Notes (optional)</label>
            <input className="w-full p-2 border rounded-lg" placeholder="e.g. meter reading or note" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>

          <div className="text-right">
            <button type="button" onClick={resetForm} className="px-4 py-2 mr-2 border rounded-lg">Clear</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2">
              <Plus size={16} /> {isEditing ? "Update" : "Add Record"}
            </button>
          </div>
        </form>
      </div>

      {/* tenant summary card (if selected) */}
      {form.tenant && (
        <div className="bg-white rounded-2xl p-4 shadow-md flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-full">
            <User className="text-emerald-600" />
          </div>
          <div>
            <div className="text-sm text-slate-500">Selected Tenant</div>
            <div className="text-lg font-semibold">{form.tenant}</div>
            {tenants.find((t) => t.name === form.tenant) && (
              <div className="text-sm text-slate-600">
                Unit: {tenants.find((t) => t.name === form.tenant).unit || "—"} • Contact: {tenants.find((t) => t.name === form.tenant).contact || "—"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* records table */}
      <div className="bg-white rounded-2xl shadow border">
        <div className="p-4 border-b flex items-center justify-between">
          <h4 className="text-lg font-semibold">Utility Records</h4>
          <div className="text-sm text-slate-500">Showing {filtered.length} of {records.length}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
              <tr>
                <th className="p-3 text-left">Tenant</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Notes</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">No records match your filters.</td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const typeMeta = UTILITY_TYPES.find((t) => t.key === r.type) || UTILITY_TYPES[2];
                  const Icon = typeMeta.icon;
                  return (
                    <tr key={r.id} className="border-t hover:bg-slate-50">
                      <td className="p-3">{r.tenant}</td>
                      <td className="p-3 flex items-center gap-2">
                        <Icon size={16} className="text-slate-600" />
                        <span className="text-sm">{typeMeta.label}</span>
                      </td>
                      <td className="p-3">Ksh {fmtNumber(r.amount)}</td>
                      <td className="p-3">{r.date}</td>
                      <td className="p-3">{r.notes || "—"}</td>
                      <td className="p-3 flex gap-3">
                        <button onClick={() => startEdit(r)} className="text-sky-600 hover:text-sky-800"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
