import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  UserPlus,
  Search,
  Trash2,
  Edit2,
  Upload,
  Download,
} from "lucide-react";

const STORAGE_KEY = "habitrack.tenants";
const STATUSES = ["Active", "Vacated", "Pending"];

export default function ManageTenants() {
  // --- initialize from localStorage synchronously to avoid mount-race overwrite
  const [tenants, setTenants] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("Error parsing tenants from localStorage:", err);
      return [];
    }
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    unit: "",
    contact: "",
    email: "",
    rent: "",
    status: "Active",
    dateJoined: "",
  });

  // Persist tenants whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
    } catch (err) {
      console.error("Error saving tenants to localStorage:", err);
    }
  }, [tenants]);

  const todayISO = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

  // Open Add modal
  const handleAddTenant = () => {
    setEditingId(null);
    setForm({
      name: "",
      unit: "",
      contact: "",
      email: "",
      rent: "",
      status: "Active",
      dateJoined: todayISO(),
    });
    setModalOpen(true);
  };

  // Open Edit modal
  const handleEditTenant = (tenant) => {
    setEditingId(tenant.id);
    setForm({
      name: tenant.name ?? "",
      unit: tenant.unit ?? "",
      contact: tenant.contact ?? "",
      email: tenant.email ?? "",
      rent: tenant.rent ?? "",
      status: tenant.status ?? "Active",
      dateJoined: tenant.dateJoined ?? todayISO(),
    });
    setModalOpen(true);
  };

  const handleDeleteTenant = (id) => {
    if (!window.confirm("Delete this tenant?")) return;
    setTenants((prev) => prev.filter((t) => t.id !== id));
  };

  // Save (add or update)
  const handleSaveTenant = (e) => {
    e.preventDefault();
    if (!form.name || !form.unit || !form.contact) {
      alert("Please fill in all required fields.");
      return;
    }

    // Normalize rent to number (optional)
    const normalized = { ...form, rent: form.rent ? Number(form.rent) : 0 };

    if (editingId) {
      setTenants((prev) =>
        prev.map((t) =>
          t.id === editingId ? { ...normalized, id: editingId } : t
        )
      );
    } else {
      const newTenant = { ...normalized, id: Date.now() };
      setTenants((prev) => [...prev, newTenant]);
    }

    // reset form + close modal
    setForm({
      name: "",
      unit: "",
      contact: "",
      email: "",
      rent: "",
      status: "Active",
      dateJoined: "",
    });
    setEditingId(null);
    setModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const header = [
      "id",
      "name",
      "unit",
      "contact",
      "email",
      "rent",
      "status",
      "dateJoined",
    ];
    const rows = tenants.map((t) =>
      header.map((k) => JSON.stringify(t[k] ?? "")).join(",")
    );
    const csvContent = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tenants_backup.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import CSV (simple parser)
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const [headerLine, ...lines] = text.split("\n").filter(Boolean);
      if (!headerLine) return;
      const headers = headerLine.split(",").map((h) => h.trim());
      const imported = lines.map((line) => {
        const values = line.split(",");
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] ? values[i].replace(/^"|"$/g, "").trim() : "";
        });
        obj.id =
          Number(obj.id) || Date.now() + Math.floor(Math.random() * 1000);
        // ensure rent numeric
        obj.rent = obj.rent ? Number(obj.rent) : 0;
        return obj;
      });
      // merge (append) and persist
      setTenants((prev) => {
        // optional: avoid duplicate ids by creating a map
        const combined = [...prev, ...imported];
        return combined;
      });
      e.target.value = null;
      alert("Tenants imported successfully!");
    };
    reader.readAsText(file);
  };

  // Filter + search
  const filteredTenants = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tenants
      .filter((t) =>
        statusFilter === "All" ? true : t.status === statusFilter
      )
      .filter((t) => {
        if (!q) return true;
        return (
          (t.name || "").toLowerCase().includes(q) ||
          (t.unit || "").toLowerCase().includes(q) ||
          (t.contact || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [tenants, search, statusFilter]);

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-slate-50 min-h-screen">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">Manage Tenants</h1>
        <div className="flex gap-3">
          <Button
            onClick={handleAddTenant}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add Tenant
          </Button>
          <Button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImportCSV}
            />
          </label>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm flex-grow">
          <Search className="text-slate-400 mr-2" />
          <Input
            placeholder="Search by name, unit, or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none flex-grow focus:ring-0"
          />
        </div>
        <select
          className="border p-2 rounded-md"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="shadow-md overflow-hidden">
        <CardHeader>
          <CardTitle className="text-indigo-600">Tenant List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-indigo-100 text-indigo-700">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Unit</th>
                  <th className="p-3 text-left">Contact</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Rent</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date Joined</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-slate-500 py-6">
                      No tenants found
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b hover:bg-indigo-50 transition"
                    >
                      <td className="p-3">{t.name}</td>
                      <td className="p-3">{t.unit}</td>
                      <td className="p-3">{t.contact}</td>
                      <td className="p-3">{t.email}</td>
                      <td className="p-3">Ksh {t.rent}</td>
                      <td className="p-3">{t.status}</td>
                      <td className="p-3">{t.dateJoined}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleEditTenant(t)}
                          className="p-2 rounded hover:bg-indigo-100 mr-2"
                        >
                          <Edit2 className="w-4 h-4 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteTenant(t.id)}
                          className="p-2 rounded hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-lg font-semibold text-indigo-600">
                {editingId ? "Edit Tenant" : "Add Tenant"}
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingId(null);
                }}
                className="text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleSaveTenant}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full Name"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="e.g., A-101"
                />
              </div>
              <div>
                <Label>Contact</Label>
                <Input
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                  placeholder="+254 7xx xxx xxx"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label>Rent (Ksh)</Label>
                <Input
                  type="number"
                  value={form.rent}
                  onChange={(e) => setForm({ ...form, rent: e.target.value })}
                  placeholder="e.g., 20000"
                />
              </div>
              <div>
                <Label>Status</Label>
                <select
                  className="border p-2 rounded-md w-full"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Date Joined</Label>
                <Input
                  type="date"
                  value={form.dateJoined}
                  onChange={(e) =>
                    setForm({ ...form, dateJoined: e.target.value })
                  }
                />
              </div>
              <input
                type="number"
                placeholder="Monthly Rent (Ksh)"
                className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 outline-none"
                value={form.rentAmount || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    rentAmount: Number(e.target.value),
                  }))
                }
              />

              <div className="md:col-span-2 flex justify-end mt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingId(null);
                  }}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {editingId ? "Save Changes" : "Add Tenant"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
