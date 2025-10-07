import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";

const TENANTS_KEY = "habitrack.tenants";
const PAYMENTS_KEY = "habitrack.payments";
const UTILITIES_KEY = "habitrack.utilities";

const COLORS = ["#2563EB", "#06B6D4", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function Reports() {
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [utilities, setUtilities] = useState([]);

  // filters & search
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [monthFilter, setMonthFilter] = useState(""); // YYYY-MM

  const [chartType, setChartType] = useState("monthly"); // 'monthly' or 'methods' or 'utilities'
  const reportRef = useRef(null);

  // Load from localStorage on mount and on storage events
  useEffect(() => {
    const loadAll = () => {
      try {
        const t = JSON.parse(localStorage.getItem(TENANTS_KEY)) || [];
        const p = JSON.parse(localStorage.getItem(PAYMENTS_KEY)) || [];
        const u = JSON.parse(localStorage.getItem(UTILITIES_KEY)) || [];
        setTenants(Array.isArray(t) ? t : []);
        setPayments(Array.isArray(p) ? p : []);
        setUtilities(Array.isArray(u) ? u : []);
      } catch (err) {
        console.error("Reports load error:", err);
      }
    };

    loadAll();
    const onStorage = (e) => {
      if ([TENANTS_KEY, PAYMENTS_KEY, UTILITIES_KEY].includes(e.key)) loadAll();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // helper: check if a date string is within range filters
  const inRange = (isoDate) => {
    if (!isoDate) return false;
    const d = new Date(isoDate);
    if (dateFrom) {
      const start = new Date(dateFrom + "T00:00:00");
      if (d < start) return false;
    }
    if (dateTo) {
      const end = new Date(dateTo + "T23:59:59");
      if (d > end) return false;
    }
    if (monthFilter) {
      // compare YYYY-MM
      const mm = d.toISOString().slice(0, 7);
      if (mm !== monthFilter) return false;
    }
    return true;
  };

  // Filtered lists for table & charts
  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        if (search) {
          const q = search.toLowerCase();
          return (
            (p.tenant || "").toLowerCase().includes(q) ||
            (p.method || "").toLowerCase().includes(q)
          );
        }
        return true;
      })
      .filter((p) => (dateFrom || dateTo || monthFilter ? inRange(p.date) : true))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments, search, dateFrom, dateTo, monthFilter]);

  const filteredUtilities = useMemo(() => {
    return utilities
      .filter((u) => {
        if (search) {
          const q = search.toLowerCase();
          return (u.tenant || "").toLowerCase().includes(q) || (u.utilityType || "").toLowerCase().includes(q);
        }
        return true;
      })
      .filter((u) => (dateFrom || dateTo || monthFilter ? inRange(u.date) : true))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [utilities, search, dateFrom, dateTo, monthFilter]);

  // Calculations for table: for each tenant, sum payments in the selected period
  const tenantRecords = useMemo(() => {
    return tenants.map((t) => {
      // tenant fields assumed: { id, name, unit, contact, rent, lastPaymentDate }
      const tenantName = t.name || "—";
      // sum payments for tenant within filter (if no filter, consider all)
      const paid = filteredPayments
        .filter((p) => p.tenant === tenantName)
        .reduce((s, p) => s + Number(p.amount || 0), 0);

      // sum utilities for tenant within filter (for showing utilities totals per tenant)
      const util = filteredUtilities
        .filter((u) => u.tenant === tenantName)
        .reduce((s, u) => s + Number(u.amount || 0), 0);

      const monthlyRent = Number(t.rent || 0);
      // define balance = expected (monthlyRent) - paid for month if monthFilter set else expected for no filter: monthly rent
      // For overdue detection: if monthFilter specified, check if paid < monthlyRent for that month; else if no filter, check lastPaymentDate
      let balance = monthlyRent - paid;
      if (!monthFilter && !dateFrom && !dateTo) {
        // if no filter, compute lastPaymentDate and check months since last payment
        if (t.lastPaymentDate) {
          // if lastPaymentDate is in the current month, treat as paid (balance 0), else show monthly rent as balance
          const lastMonth = new Date(t.lastPaymentDate).toISOString().slice(0, 7);
          const nowMonth = new Date().toISOString().slice(0, 7);
          balance = lastMonth === nowMonth ? 0 : monthlyRent;
        } else {
          balance = monthlyRent;
        }
      }
      const lastPayment = t.lastPaymentDate || "-";
      const status =
        (balance > 0 && (monthFilter || (!monthFilter && balance === monthlyRent))) ? "Overdue" : "Paid";

      return {
        id: t.id,
        name: tenantName,
        unit: t.unit || "—",
        monthlyRent,
        paid,
        utilities: util,
        balance,
        lastPayment,
        status,
      };
    });
  }, [tenants, filteredPayments, filteredUtilities, monthFilter, dateFrom, dateTo]);

  // Summary values
  const totalTenants = tenants.length;
  const totalPaid = filteredPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalUtilitiesCost = filteredUtilities.reduce((s, u) => s + Number(u.amount || 0), 0);
  // total expected rent = sum of monthly rent of tenants (if monthFilter applied we assume we check that month)
  const totalExpectedRent = tenants.reduce((s, t) => s + Number(t.rent || 0), 0);
  const totalOverdueCount = tenantRecords.filter((r) => r.status === "Overdue" && r.balance > 0).length;

  // Chart data: monthly income (payments aggregated by YYYY-MM)
  const monthlyIncome = useMemo(() => {
    const map = {};
    const source = monthFilter ? filteredPayments : payments;
    source.forEach((p) => {
      try {
        const key = new Date(p.date).toISOString().slice(0, 7);
        map[key] = (map[key] || 0) + Number(p.amount || 0);
      } catch {
        // ignore invalid date
      }
    });
    return Object.keys(map)
      .sort()
      .map((k) => ({ month: k, total: map[k] }));
  }, [payments, filteredPayments, monthFilter]);

  // Payment method breakdown (counts or amounts — we'll use amounts)
  const paymentMethodBreakdown = useMemo(() => {
    const map = {};
    payments.forEach((p) => {
      const method = p.method || "Unknown";
      map[method] = (map[method] || 0) + Number(p.amount || 0);
    });
    return Object.keys(map).map((k) => ({ name: k, value: map[k] }));
  }, [payments]);

  // Utilities breakdown
  const utilitiesBreakdown = useMemo(() => {
    const map = {};
    utilities.forEach((u) => {
      const typ = u.utilityType || u.type || "Other";
      map[typ] = (map[typ] || 0) + Number(u.amount || 0);
    });
    return Object.keys(map).map((k) => ({ name: k, value: map[k] }));
  }, [utilities]);

  // CSV export
  const exportCSV = () => {
    const header = ["Type", "Tenant", "Amount", "Method/Type", "Date"];
    const rows = [
      ...filteredPayments.map((p) => ["Payment", p.tenant, p.amount, p.method || "", p.date]),
      ...filteredUtilities.map((u) => ["Utility", u.tenant, u.amount, u.utilityType || "", u.date]),
    ];
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habitrack_report_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF export: capture the reportRef area as image then append table via autoTable
  const exportPDF = async () => {
    if (!reportRef.current) return;
    const doc = new jsPDF("p", "mm", "a4");
    // capture DOM
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdfWidth = doc.internal.pageSize.getWidth() - 20; // margins
    const imgProps = doc.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    doc.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);

    const startY = pdfHeight + 15;
    const body = [
      ...filteredPayments.map((p) => ["Payment", p.tenant, p.amount, p.method || "", p.date]),
      ...filteredUtilities.map((u) => ["Utility", u.tenant, u.amount, u.utilityType || "", u.date]),
    ];

    doc.autoTable({
      head: [["Type", "Tenant", "Amount (Ksh)", "Method/Type", "Date"]],
      body,
      startY,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`habitrack_report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // reset filters
  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setMonthFilter("");
  };

  // Small responsive layout + styling
  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 to-slate-50">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Reports — Overview</h1>
          <p className="text-sm text-slate-500">Rent, payments & utilities analysis</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search tenants, methods..."
            className="border rounded px-3 py-2 w-64 md:w-80"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <input
            type="month"
            className="border rounded px-3 py-2"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />
          <button
            onClick={() => setChartType(chartType === "monthly" ? "methods" : "monthly")}
            className="bg-slate-700 text-white px-3 py-2 rounded"
          >
            Toggle Chart
          </button>
          <button onClick={exportCSV} className="bg-indigo-600 text-white px-3 py-2 rounded">CSV</button>
          <button onClick={exportPDF} className="bg-rose-600 text-white px-3 py-2 rounded">Download PDF</button>
          <button onClick={resetFilters} className="border px-3 py-2 rounded">Reset</button>
        </div>
      </div>

      {/* Report area that will be captured for PDF */}
      <div ref={reportRef} className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-slate-500">Total tenants</div>
            <div className="text-2xl font-bold text-slate-800">{totalTenants}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-slate-500">Total Paid (filtered)</div>
            <div className="text-2xl font-bold text-slate-800">Ksh {totalPaid.toLocaleString()}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-slate-500">Total Utilities (filtered)</div>
            <div className="text-2xl font-bold text-slate-800">Ksh {totalUtilitiesCost.toLocaleString()}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-slate-500">Total Expected Rent</div>
            <div className="text-2xl font-bold text-slate-800">Ksh {totalExpectedRent.toLocaleString()}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-slate-500">Overdue Tenants</div>
            <div className="text-2xl font-bold text-red-600">{totalOverdueCount}</div>
          </div>
        </div>

        {/* Charts area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold text-slate-800 mb-3">Monthly Income</h3>
            {monthlyIncome.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyIncome}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#2563EB" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-slate-500">No payments found for selected filters.</div>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold text-slate-800 mb-3">Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-500 mb-2">Payments by Method</div>
                {paymentMethodBreakdown.length ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={paymentMethodBreakdown} dataKey="value" nameKey="name" outerRadius={60} label>
                        {paymentMethodBreakdown.map((entry, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-sm text-slate-500">No payments yet.</div>
                )}
              </div>

              <div>
                <div className="text-sm text-slate-500 mb-2">Utilities by Type</div>
                {utilitiesBreakdown.length ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={utilitiesBreakdown} dataKey="value" nameKey="name" outerRadius={60} label>
                        {utilitiesBreakdown.map((entry, idx) => (
                          <Cell key={idx} fill={COLORS[(idx+1) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-sm text-slate-500">No utilities recorded.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table: tenant rows with rent vs paid vs balance */}
        <div className="bg-white rounded-lg p-4 shadow overflow-x-auto">
          <h3 className="font-semibold mb-3 text-slate-800">Tenant Balances</h3>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-2 text-left">Tenant</th>
                <th className="p-2 text-left">Unit</th>
                <th className="p-2 text-left">Monthly Rent (Ksh)</th>
                <th className="p-2 text-left">Paid (filtered)</th>
                <th className="p-2 text-left">Utilities (filtered)</th>
                <th className="p-2 text-left">Balance</th>
                <th className="p-2 text-left">Last Payment</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {tenantRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-slate-500">No tenants available.</td>
                </tr>
              ) : (
                tenantRecords.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{r.name}</td>
                    <td className="p-2">{r.unit}</td>
                    <td className="p-2">Ksh {r.monthlyRent.toLocaleString()}</td>
                    <td className="p-2">Ksh {r.paid.toLocaleString()}</td>
                    <td className="p-2">Ksh {r.utilities.toLocaleString()}</td>
                    <td className={`p-2 ${r.balance > 0 ? "text-red-600" : "text-green-700"}`}>
                      Ksh {Number(r.balance).toLocaleString()}
                    </td>
                    <td className="p-2">{r.lastPayment}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${r.status === "Overdue" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* footer */}
      <div className="text-sm text-right text-slate-500">
        Report generated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
