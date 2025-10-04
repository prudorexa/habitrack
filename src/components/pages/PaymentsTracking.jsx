import React, { useState, useEffect } from "react";
import { DollarSign, User } from "lucide-react";

const TENANTS_KEY = "habitrack.tenants";
const PAYMENTS_KEY = "habitrack.payments";

export default function PaymentTracking() {
  const [payments, setPayments] = useState(() => {
    try {
      const data = localStorage.getItem(PAYMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [form, setForm] = useState({
    tenant: "",
    amount: "",
    date: "",
    method: "",
  });

  const loadTenants = () => {
    try {
      const data = localStorage.getItem(TENANTS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) setTenants(parsed);
      }
    } catch (err) {
      console.error("Error reading tenants:", err);
    }
  };

  useEffect(() => {
    loadTenants();

    const handleStorageChange = (e) => {
      if (e.key === TENANTS_KEY) {
        loadTenants();
        console.log("[HabiTrack] Tenants list updated from storage");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  }, [payments]);

  const handleTenantSelect = (tenantName) => {
    setForm((f) => ({ ...f, tenant: tenantName }));
    const tenant = tenants.find((t) => t.name === tenantName);
    setSelectedTenant(tenant || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.tenant || !form.amount || !form.date || !form.method) {
      alert("Please fill all fields");
      return;
    }

    const newPayment = {
      id: Date.now(),
      ...form,
    };
    setPayments((prev) => [...prev, newPayment]);
    setForm({ tenant: "", amount: "", date: "", method: "" });
    setSelectedTenant(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h2 className="text-3xl font-bold text-green-700 flex items-center gap-3">
        <DollarSign size={28} /> Payment Tracking
      </h2>

      {/* Payment Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-6 max-w-3xl mx-auto border space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tenant selection */}
          <select
            className="border p-3 rounded"
            value={form.tenant}
            onChange={(e) => handleTenantSelect(e.target.value)}
          >
            <option value="">Select tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name} ({t.unit})
              </option>
            ))}
          </select>

          <input
            className="border p-3 rounded"
            placeholder="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          />

          <input
            className="border p-3 rounded"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />

          <select
            className="border p-3 rounded"
            value={form.method}
            onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
          >
            <option value="">Select method</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="M-Pesa">M-Pesa</option>
          </select>
        </div>

        {/* ✅ Selected Tenant Summary Card */}
        {selectedTenant && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-4 shadow-sm transition">
            <div className="bg-green-100 p-3 rounded-full">
              <User className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                {selectedTenant.name}
              </h3>
              <p className="text-sm text-gray-600">
                Unit: {selectedTenant.unit}
              </p>
              {selectedTenant.contact && (
                <p className="text-sm text-gray-600">
                  Contact: {selectedTenant.contact}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="text-right">
          <button
            type="submit"
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
          >
            Add Payment
          </button>
        </div>
      </form>

      {/* Payment Table */}
      <div className="bg-white rounded-xl shadow border mt-6">
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
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    No payments recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{p.tenant}</td>
                    <td className="p-3">{p.amount}</td>
                    <td className="p-3">{p.date}</td>
                    <td className="p-3">{p.method}</td>
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
