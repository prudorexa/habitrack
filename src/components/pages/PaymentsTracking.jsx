import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  CreditCard,
  PlusCircle,
  Trash2,
  Edit3,
  Check,
  X,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const TENANTS_KEY = "habitrack.tenants";
const PAYMENTS_KEY = "habitrack.payments";

// ✅ Safe localStorage read/write helpers
const safeGet = (key, fallback = []) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Failed to save:", err);
  }
};

export default function PaymentTracking() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [payments, setPayments] = useState(() => safeGet(PAYMENTS_KEY, []));
  const [tenants, setTenants] = useState(() => safeGet(TENANTS_KEY, []));
  const [form, setForm] = useState({
    tenant: "",
    amount: "",
    date: "",
    method: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [editing, setEditing] = useState(null);

  // ✅ Sync with localStorage every time payments or tenants change
  useEffect(() => {
    safeSet(PAYMENTS_KEY, payments);
  }, [payments]);

  useEffect(() => {
    safeSet(TENANTS_KEY, tenants);
  }, [tenants]);

  // ✅ Load updates from other tabs or components
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === PAYMENTS_KEY) setPayments(safeGet(PAYMENTS_KEY, []));
      if (e.key === TENANTS_KEY) setTenants(safeGet(TENANTS_KEY, []));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ✅ Add / Edit payment
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.tenant || !form.amount || !form.date || !form.method) {
      alert("Please fill all fields");
      return;
    }

    let updated;
    if (editing) {
      updated = payments.map((p) =>
        p.id === editing.id ? { ...p, ...form } : p
      );
      setEditing(null);
    } else {
      updated = [...payments, { id: Date.now(), ...form }];
    }
    setPayments(updated);
    safeSet(PAYMENTS_KEY, updated);
    setForm({ tenant: "", amount: "", date: "", method: "" });
  };

  const handleDelete = (id) => {
    const filtered = payments.filter((p) => p.id !== id);
    setPayments(filtered);
    safeSet(PAYMENTS_KEY, filtered);
  };

  // ✅ Filtering
  const filteredPayments = payments.filter((p) => {
    const matchesTenant = p.tenant
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDate =
      (!dateRange.start || new Date(p.date) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(p.date) <= new Date(dateRange.end));
    return matchesTenant && matchesDate;
  });

  const totalPayments = filteredPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const totalsByMethod = filteredPayments.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + Number(p.amount);
    return acc;
  }, {});

  const chartData = Object.values(
    filteredPayments.reduce((acc, p) => {
      const month = new Date(p.date).toLocaleString("default", {
        month: "short",
      });
      if (!acc[month]) acc[month] = { month, total: 0 };
      acc[month].total += Number(p.amount);
      return acc;
    }, {})
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h2 className="text-3xl font-bold text-green-700 flex items-center gap-2">
          <DollarSign size={28} /> Payment Tracking
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
          <input
            type="text"
            placeholder="Search by tenant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 outline-none"
          />
        </div>
      </div>

      {/* Date Filters */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <label>Start:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            className="border p-2 rounded-lg focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <label>End:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
            className="border p-2 rounded-lg focus:ring-2 focus:ring-green-400"
          />
        </div>
        <button
          onClick={() => setDateRange({ start: "", end: "" })}
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
        >
          Clear
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-green-100 p-5 rounded-2xl shadow">
          <h3 className="text-sm font-semibold text-green-800">
            Total Collected
          </h3>
          <p className="text-2xl font-bold text-green-900 mt-2">
            Ksh {totalPayments.toLocaleString()}
          </p>
        </div>
        {Object.entries(totalsByMethod).map(([method, total]) => (
          <div
            key={method}
            className="bg-blue-100 p-5 rounded-2xl shadow hover:shadow-md transition"
          >
            <h3 className="text-sm font-semibold text-blue-800">{method}</h3>
            <p className="text-2xl font-bold text-blue-900 mt-2">
              Ksh {total.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white border rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-green-600" />
          <h3 className="text-lg font-semibold text-gray-700">
            Monthly Payment Summary
          </h3>
        </div>
        {chartData.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No payment data yet to display.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Add Payment */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg border rounded-2xl p-6 max-w-4xl mx-auto space-y-4"
      >
        <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
          <PlusCircle className="text-green-600" />
          {editing ? "Edit Payment" : "Add New Payment"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={form.tenant}
            onChange={(e) => setForm({ ...form, tenant: e.target.value })}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
          >
            <option value="">Select tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name} ({t.unit})
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount (Ksh)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
          />

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
          />

          <select
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
          >
            <option value="">Select method</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="M-Pesa">M-Pesa</option>
          </select>
        </div>

        <div className="text-right flex gap-2 justify-end">
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ tenant: "", amount: "", date: "", method: "" });
              }}
              className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            {editing ? "Save Changes" : "Add Payment"}
          </button>
        </div>
      </form>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-lg border mt-8">
        <div className="p-4 border-b">
          <h4 className="text-lg font-semibold text-gray-700">
            Payment Records
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-3 text-left">Tenant</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Method</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No payments found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t hover:bg-green-50 transition"
                  >
                    <td className="p-3">{p.tenant}</td>
                    <td className="p-3">Ksh {p.amount}</td>
                    <td className="p-3">{p.date}</td>
                    <td className="p-3">{p.method}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setForm(p);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* 🔍 Filter Bar */}
          <div className="flex flex-wrap gap-3 justify-end items-center mb-4 px-4">
            <label className="text-sm font-semibold text-gray-600">
              Filter:
            </label>
            {["all", "owing", "cleared", "overpaid"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1 rounded-full border text-sm font-medium transition ${
                  filterStatus === status
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {status === "all"
                  ? "All"
                  : status === "owing"
                  ? "Owing"
                  : status === "cleared"
                  ? "Cleared"
                  : "Overpaid"}
              </button>
            ))}
          </div>

          {/* 🧾 Tenant Payment Summary */}
          <div className="bg-white rounded-2xl shadow-lg border mt-10">
            <div className="p-4 border-b flex items-center gap-2">
              <Users className="text-green-600" />
              <h4 className="text-lg font-semibold text-gray-700">
                Tenant Payment Summary
              </h4>
            </div>

            {tenants.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                No tenants added yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {tenants
                  .filter((tenant) => {
                    const tenantPayments = payments.filter(
                      (p) => p.tenant === tenant.name
                    );
                    const totalPaid = tenantPayments.reduce(
                      (sum, p) => sum + Number(p.amount || 0),
                      0
                    );
                    const rentAmount = tenant.rentAmount || 0;
                    const balance = rentAmount - totalPaid;

                    if (filterStatus === "owing") return balance > 0;
                    if (filterStatus === "cleared") return balance === 0;
                    if (filterStatus === "overpaid") return balance < 0;
                    return true; // all
                  })
                  .map((tenant) => {
                    const tenantPayments = payments.filter(
                      (p) => p.tenant === tenant.name
                    );
                    const totalPaid = tenantPayments.reduce(
                      (sum, p) => sum + Number(p.amount || 0),
                      0
                    );
                    const rentAmount = tenant.rentAmount || 0;
                    const balance = rentAmount - totalPaid;

                    return (
                      <div
                        key={tenant.id}
                        className={`p-4 rounded-xl border shadow-md hover:shadow-lg transition bg-white ${
                          balance > 0
                            ? "border-red-300 bg-red-50"
                            : balance < 0
                            ? "border-green-300 bg-green-50"
                            : "border-blue-300 bg-blue-50"
                        }`}
                      >
                        <h3 className="text-lg font-semibold text-gray-800">
                          {tenant.name} ({tenant.unit})
                        </h3>
                        <p className="text-sm text-gray-600">
                          Rent:{" "}
                          <span className="font-medium">Ksh {rentAmount}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Paid:{" "}
                          <span className="font-medium text-green-700">
                            Ksh {totalPaid}
                          </span>
                        </p>
                        <p
                          className={`font-semibold ${
                            balance > 0
                              ? "text-red-600"
                              : balance < 0
                              ? "text-green-700"
                              : "text-blue-700"
                          }`}
                        >
                          {balance > 0
                            ? `Balance Due: Ksh ${balance}`
                            : balance < 0
                            ? `Overpaid: Ksh ${Math.abs(balance)}`
                            : "Cleared ✅"}
                        </p>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
