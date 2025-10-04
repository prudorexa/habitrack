import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Home, CreditCard, Wrench } from "lucide-react";

export default function Overview({ role }) {
  const [summary, setSummary] = useState({
    tenants: 0,
    properties: 0,
    payments: 0,
    maintenance: 0,
  });

  useEffect(() => {
    // Dummy Data (Later you’ll fetch this from the backend)
    if (role === "landlord") {
      setSummary({
        tenants: 12,
        properties: 5,
        payments: 48,
        maintenance: 2,
      });
    } else {
      setSummary({
        tenants: 1,
        properties: 1,
        payments: 10,
        maintenance: 0,
      });
    }
  }, [role]);

  const barData = [
    { month: "Jun", rent: 400 },
    { month: "Jul", rent: 600 },
    { month: "Aug", rent: 700 },
    { month: "Sep", rent: 500 },
    { month: "Oct", rent: 800 },
  ];

  const pieData = [
    { name: "Occupied", value: 80 },
    { name: "Vacant", value: 20 },
  ];

  const COLORS = ["#2563EB", "#F59E0B"];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-blue-900">
        Dashboard Overview
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 bg-white rounded-2xl shadow-md flex items-center gap-4">
          <Users className="w-10 h-10 text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Tenants</p>
            <p className="text-xl font-bold">{summary.tenants}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-md flex items-center gap-4">
          <Home className="w-10 h-10 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Properties</p>
            <p className="text-xl font-bold">{summary.properties}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-md flex items-center gap-4">
          <CreditCard className="w-10 h-10 text-amber-500" />
          <div>
            <p className="text-sm text-gray-500">Payments</p>
            <p className="text-xl font-bold">{summary.payments}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-md flex items-center gap-4">
          <Wrench className="w-10 h-10 text-red-500" />
          <div>
            <p className="text-sm text-gray-500">Maintenance</p>
            <p className="text-xl font-bold">{summary.maintenance}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rent Collection Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-bold mb-4 text-blue-900">
            Rent Collection Trend
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rent" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Status */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-bold mb-4 text-blue-900">
            Occupancy Status
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
