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

const TENANTS_KEY = "habitrack.tenants";
const UTILITIES_KEY = "habitrack.utilities";
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function UtilitiesControl() {
  const [utilities, setUtilities] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [formData, setFormData] = useState({
    tenant: "",
    utilityType: "",
    amount: "",
    date: "",
  });
  const [selectedMonth, setSelectedMonth] = useState("");
  const [chartType, setChartType] = useState("bar");

  // Load tenants and utilities on mount
  useEffect(() => {
    try {
      const storedTenants = JSON.parse(localStorage.getItem(TENANTS_KEY)) || [];
      setTenants(Array.isArray(storedTenants) ? storedTenants : []);
      console.log("Loaded tenants:", storedTenants);
    } catch (err) {
      console.error("Error reading tenants:", err);
    }

    try {
      const storedUtilities =
        JSON.parse(localStorage.getItem(UTILITIES_KEY)) || [];
      setUtilities(Array.isArray(storedUtilities) ? storedUtilities : []);
      console.log("Loaded utilities:", storedUtilities);
    } catch (err) {
      console.error("Error reading utilities:", err);
    }
  }, []);

  // Save utilities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(UTILITIES_KEY, JSON.stringify(utilities));
  }, [utilities]);

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add new utility record
  const handleAddUtility = (e) => {
    e.preventDefault();
    if (
      !formData.tenant ||
      !formData.utilityType ||
      !formData.amount ||
      !formData.date
    ) {
      alert("Please fill in all fields!");
      return;
    }

    const newRecord = { ...formData, id: Date.now() };
    const updatedUtilities = [...utilities, newRecord];

    // ✅ Update state and persist instantly
    setUtilities(updatedUtilities);
    localStorage.setItem(UTILITIES_KEY, JSON.stringify(updatedUtilities));

    console.log("Added new record:", newRecord);
    setFormData({ tenant: "", utilityType: "", amount: "", date: "" });
  };

  // Delete a record
  const handleDelete = (id) => {
    if (window.confirm("Delete this record?")) {
      const updated = utilities.filter((u) => u.id !== id);
      setUtilities(updated);
      localStorage.setItem(UTILITIES_KEY, JSON.stringify(updated));
    }
  };

  // Filter utilities by selected month
  const filteredUtilities = selectedMonth
    ? utilities.filter((u) => {
        const recordMonth = new Date(u.date).toISOString().slice(0, 7);
        return recordMonth === selectedMonth;
      })
    : utilities;

  // Prepare chart data
  const dailyTotals = filteredUtilities.reduce((acc, record) => {
    const day = new Date(record.date).getDate();
    acc[day] = (acc[day] || 0) + parseFloat(record.amount);
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
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
      return { name: t.name, value: total };
    })
    .filter((p) => p.value > 0);

  // Summary values
  const totalUtilities = filteredUtilities.length;
  const totalCost = filteredUtilities.reduce(
    (sum, u) => sum + parseFloat(u.amount || 0),
    0
  );
  const activeTenants = new Set(filteredUtilities.map((u) => u.tenant)).size;

  // Format month name if selected
  const monthLabel = selectedMonth
    ? new Date(selectedMonth + "-01").toLocaleString("default", {
        month: "long",
        year: "numeric",
      })
    : "All Time";

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-md space-y-6">
      {/* === Summary Bar === */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-indigo-600 text-white shadow-md border-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Total Utilities ({monthLabel})
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-center">
            {totalUtilities}
          </CardContent>
        </Card>

        <Card className="bg-green-600 text-white shadow-md border-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Active Tenants
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-center">
            {activeTenants}
          </CardContent>
        </Card>

        <Card className="bg-yellow-500 text-white shadow-md border-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Total Cost (Ksh)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-center">
            {totalCost.toLocaleString()}
          </CardContent>
        </Card>
      </div>

      {/* === Add Record Form === */}
      <Card className="shadow-lg border-none bg-white">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-indigo-700">
            Utilities Control
          </CardTitle>

          <div className="flex items-center gap-3">
            <div>
              <Label className="text-sm text-gray-600 mr-2">
                Filter by Month
              </Label>
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
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-4 flex justify-end">
            <Button
              onClick={handleAddUtility}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Add Record
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* === Chart Section === */}
      <Card className="shadow-lg border-none bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            {selectedMonth
              ? `Utilities for ${monthLabel}`
              : "Monthly Utility Overview"}
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
              <p className="text-center text-gray-500">
                No data for selected month.
              </p>
            )
          ) : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">
              No tenant data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* === Records Table === */}
      <Card className="shadow-lg border-none bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Utility Records
          </CardTitle>
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
                  <td className="p-2">
                    {new Date(u.date).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-right">
                    <Button
                      onClick={() => handleDelete(u.id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1"
                    >
                      Delete
                    </Button>
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
