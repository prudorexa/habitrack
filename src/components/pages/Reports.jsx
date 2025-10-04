import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart as BarIcon, Download } from "lucide-react";

export default function Reports() {
  const [reportSummary, setReportSummary] = useState({
    revenue: 0,
    occupancyRate: 0,
  });

  useEffect(() => {
    setReportSummary({
      revenue: 320000,
      occupancyRate: 88,
    });
  }, []);

  const revenueData = [
    { month: "Jun", revenue: 45000 },
    { month: "Jul", revenue: 55000 },
    { month: "Aug", revenue: 60000 },
    { month: "Sep", revenue: 50000 },
    { month: "Oct", revenue: 70000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-900">Reports & Analytics</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-amber-400 text-gray-800 rounded-lg hover:bg-amber-300 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-5 bg-white rounded-2xl shadow-md">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-xl font-bold">KES {reportSummary.revenue.toLocaleString()}</p>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-md">
          <p className="text-sm text-gray-500">Occupancy Rate</p>
          <p className="text-xl font-bold">{reportSummary.occupancyRate}%</p>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-md">
          <p className="text-sm text-gray-500">Top Performing Unit</p>
          <p className="text-xl font-bold">Unit A3</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-bold mb-4 text-blue-900">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#2563EB" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
