import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/**
 * UtilitiesControl.jsx — with edit support & safe localStorage sync
 */

const HABITRACK_TENANTS_KEY = "habitrack.tenants";
const HABITRACK_UTILITIES_KEY = "habitrack.utilities";

const TENANTS_FALLBACK_KEYS = [
  HABITRACK_TENANTS_KEY,
  "tenants",
  "habitrack_tenants",
  "habitrack:tenants",
];

const UTILITIES_FALLBACK_KEYS = [
  HABITRACK_UTILITIES_KEY,
  "utilities",
  "habitrack_utilities",
  "habitrack:utilities",
];

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function tryParseJSON(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function loadAndMaybeMigrateArray(fallbackKeys = [], canonicalKey) {
  for (const k of fallbackKeys) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    const parsed = tryParseJSON(raw);
    if (Array.isArray(parsed)) {
      if (k !== canonicalKey) {
        try {
          localStorage.setItem(canonicalKey, JSON.stringify(parsed));
          console.info(`[HabiTrack] Migrated data from "${k}" → "${canonicalKey}"`);
        } catch (err) {
          console.warn("[HabiTrack] migration write failed:", err);
        }
      }
      return parsed;
    }
  }
  return [];
}

function persistIfChanged(key, value) {
  try {
    const existing = localStorage.getItem(key);
    const serialized = JSON.stringify(value || []);
    if (existing !== serialized) {
      localStorage.setItem(key, serialized);
    }
  } catch (err) {
    console.error("[HabiTrack] Error persisting to localStorage:", err);
  }
}

export default function UtilitiesControl() {
  const [utilities, setUtilities] = useState(() =>
    loadAndMaybeMigrateArray(UTILITIES_FALLBACK_KEYS, HABITRACK_UTILITIES_KEY)
  );
  const [tenants, setTenants] = useState(() =>
    loadAndMaybeMigrateArray(TENANTS_FALLBACK_KEYS, HABITRACK_TENANTS_KEY)
  );

  const [formData, setFormData] = useState({
    id: null,
    tenant: "",
    utilityType: "",
    amount: "",
    date: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [chartType, setChartType] = useState("bar");

  // persist changes
  useEffect(() => {
    persistIfChanged(HABITRACK_UTILITIES_KEY, utilities);
  }, [utilities]);

  useEffect(() => {
    persistIfChanged(HABITRACK_TENANTS_KEY, tenants);
  }, [tenants]);

  // cross-tab sync
  useEffect(() => {
    const onStorage = (e) => {
      if (!e.key) return;
      if (UTILITIES_FALLBACK_KEYS.includes(e.key)) {
        const parsed = tryParseJSON(e.newValue);
        setUtilities(Array.isArray(parsed) ? parsed : []);
      }
      if (TENANTS_FALLBACK_KEYS.includes(e.key)) {
        const parsed = tryParseJSON(e.newValue);
        setTenants(Array.isArray(parsed) ? parsed : []);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // add or update record
  const handleAddUtility = (e) => {
    e && e.preventDefault?.();
    if (!formData.tenant || !formData.utilityType || formData.amount === "" || !formData.date) {
      alert("Please fill in all fields!");
      return;
    }

    if (isEditing && formData.id) {
      const updated = utilities.map((u) => (u.id === formData.id ? formData : u));
      setUtilities(updated);
      setIsEditing(false);
    } else {
      const newRecord = { ...formData, id: Date.now() };
      setUtilities([...utilities, newRecord]);
    }

    setFormData({ id: null, tenant: "", utilityType: "", amount: "", date: "" });
  };

  // delete record
  const handleDelete = (id) => {
    if (!window.confirm("Delete this record?")) return;
    const updated = utilities.filter((u) => u.id !== id);
    setUtilities(updated);
  };

  // edit record
  const handleEdit = (record) => {
    setFormData(record);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // filter by month
  const filteredUtilities = selectedMonth
    ? utilities.filter((u) => {
        try {
          const recordMonth = new Date(u.date).toISOString().slice(0, 7);
          return recordMonth === selectedMonth;
        } catch {
          return false;
        }
      })
    : utilities;

  // chart data
  const dailyTotals = filteredUtilities.reduce((acc, record) => {
    const day = (() => {
      try {
        return new Date(record.date).getDate();
      } catch {
        return "unknown";
      }
    })();
    acc[day] = (acc[day] || 0) + Number(record.amount || 0);
    return acc;
  }, {});

  const chartData = Object.keys(dailyTotals).map((day) => ({
    day,
    total: dailyTotals[day],
  }));

  const pieData = tenants
    .map((t) => {
      const total = filteredUtilities
        .filter((u) => u.tenant === t.name)
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);
      return { name: t.name, value: total };
    })
    .filter((p) => p.value > 0);

  const totalUtilities = filteredUtilities.length;
  const totalCost = filteredUtilities.reduce(
    (sum, u) => sum + Number(u.amount || 0),
    0
  );
  const activeTenants = new Set(filteredUtilities.map((u) => u.tenant)).size;

  const monthLabel = selectedMonth
    ? new Date(selectedMonth + "-01").toLocaleString("default", {
        month: "long",
        year: "numeric",
      })
    : "All Time";

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-md space-y-6">
      {/* === Summary === */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-indigo-600 text-white">
          <CardHeader>
            <CardTitle>Total Utilities ({monthLabel})</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-center">
            {totalUtilities}
          </CardContent>
        </Card>
        <Card className="bg-green-600 text-white">
          <CardHeader>
            <CardTitle>Active Tenants</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-center">
            {activeTenants}
          </CardContent>
        </Card>
        <Card className="bg-yellow-500 text-white">
          <CardHeader>
            <CardTitle>Total Cost (Ksh)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-center">
            {Number(totalCost).toLocaleString()}
          </CardContent>
        </Card>
      </div>

      {/* === Form === */}
      <Card className="shadow-lg border-none bg-white">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-indigo-700">Utilities Control</CardTitle>
          <div className="flex items-center gap-3">
            <div>
              <Label className="text-sm text-gray-600 mr-2">Filter by Month</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border rounded p-2"
              />
            </div>
            <Button
              onClick={() => setChartType(chartType === "bar" ? "pie" : "bar")}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {chartType === "bar" ? "Switch to Pie" : "Switch to Bar"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid md:grid-cols-4 gap-4">
          <div>
            <Label>Tenant</Label>
            <select
              name="tenant"
              value={formData.tenant}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="">Select Tenant</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Utility Type</Label>
            <select
              name="utilityType"
              value={formData.utilityType}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="">Select Utility</option>
              <option value="Water">Water</option>
              <option value="Electricity">Electricity</option>
              <option value="Garbage">Garbage</option>
            </select>
          </div>

          <div>
            <Label>Amount (Ksh)</Label>
            <Input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label>Date</Label>
            <Input type="date" name="date" value={formData.date} onChange={handleChange} />
          </div>

          <div className="md:col-span-4 flex justify-end">
            <Button onClick={handleAddUtility} className="bg-indigo-600 hover:bg-indigo-700">
              {isEditing ? "Save Changes" : "Add Record"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* === Chart Section === */}
      <Card className="shadow-lg border-none bg-white">
        <CardHeader>
          <CardTitle>
            {selectedMonth ? `Utilities for ${monthLabel}` : "Monthly Utility Overview"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartType === "bar" ? (
            chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500">No data for selected month.</p>
            )
          ) : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No tenant data available.</p>
          )}
        </CardContent>
      </Card>

      {/* === Records Table === */}
      <Card className="shadow-lg border-none bg-white">
        <CardHeader>
          <CardTitle>Utility Records</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Tenant</th>
                <th className="p-2 text-left">Utility</th>
                <th className="p-2 text-left">Amount (Ksh)</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUtilities.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{u.tenant}</td>
                  <td className="p-2">{u.utilityType}</td>
                  <td className="p-2">{u.amount}</td>
                  <td className="p-2">{new Date(u.date).toLocaleDateString()}</td>
                  <td className="p-2 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={() => handleEdit(u)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(u.id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUtilities.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No records for selected month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
