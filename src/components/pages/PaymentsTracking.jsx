import React, { useState, useEffect } from "react";
import { DollarSign, Users, CreditCard, PlusCircle } from "lucide-react";

const TENANTS_KEY = "habitrack.tenants";
const PAYMENTS_KEY = "habitrack.payments";

export default function PaymentTracking() {
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState({
    tenant: "",
    amount: "",
    date: "",
    method: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Load Data from localStorage (only once)
  useEffect(() => {
    const storedTenants = JSON.parse(localStorage.getItem(TENANTS_KEY)) || [];
    const storedPayments = JSON.parse(localStorage.getItem(PAYMENTS_KEY)) || [];

    setTenants(storedTenants);
    setPayments(storedPayments);
  }, []);

  // ✅ Listen for changes from other tabs/pages (sync ManageTenants updates)
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === TENANTS_KEY) {
        const updatedTenants = JSON.parse(event.newValue) || [];
        setTenants(updatedTenants);
      }
      if (event.key === PAYMENTS_KEY) {
        const updatedPayments = JSON.parse(event.newValue) || [];
        setPayments(updatedPayments);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ✅ Save payments whenever they change
  useEffect(() => {
    if (payments.length > 0) {
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    }
  }, [payments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.tenant || !form.amount || !form.date || !form.method) {
      alert("Please fill all fields");
      return;
    }

    const newPayment = { id: Date.now(), ...form };
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(updatedPayments));
    setForm({ tenant: "", amount: "", date: "", method: "" });
  };

  const filteredPayments = payments.filter((p) =>
    p.tenant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Summary values
  const totalPayments = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );
  const totalTenants = tenants.length;

  return (
    <div className="p-6 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <h2 className="text-3xl font-bold text-green-700 flex items-center gap-2">
          <DollarSign size={30} /> Payment Tracking
        </h2>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <input
            type="text"
            placeholder="Search by tenant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 outline-none"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-100 to-green-200 p-5 rounded-2xl shadow hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-green-800">Total Tenants</h3>
            <Users className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">{totalTenants}</p>
        </div>

        <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-5 rounded-2xl shadow hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-blue-800">Total Payments</h3>
            <CreditCard className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">Ksh {totalPayments}</p>
        </div>

        <div className="bg-gradient-to-r from-amber-100 to-amber-200 p-5 rounded-2xl shadow hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-amber-800">Payment Records</h3>
            <PlusCircle className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-2">{payments.length}</p>
        </div>
      </div>

      {/* Payment Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg border rounded-2xl p-6 max-w-4xl mx-auto space-y-4 hover:shadow-xl transition"
      >
        <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
          <PlusCircle className="text-green-600" /> Add New Payment
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 outline-none"
            value={form.tenant}
            onChange={(e) => setForm({ ...form, tenant: e.target.value })}
          >
            <option value="">Select tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name} ({t.unit})
              </option>
            ))}
          </select>

          <input
            className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 outline-none"
            placeholder="Amount (Ksh)"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <input
            className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 outline-none"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <select
            className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 outline-none"
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
          >
            <option value="">Select payment method</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="M-Pesa">M-Pesa</option>
          </select>
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow transition"
          >
            Add Payment
          </button>
        </div>
      </form>

      {/* Payment Table */}
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
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    No payments recorded yet.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t hover:bg-green-50 transition duration-150"
                  >
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
