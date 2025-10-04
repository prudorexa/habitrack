import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bell,
  LogOut,
  Home,
  Menu,
  X,
  CreditCard,
  FileText,
  User,
  Users,
  BarChart3,
  Zap,
} from "lucide-react";

import Overview from "./pages/Overview";
import ManageTenants from "./pages/ManageTenants";
import PaymentsTracking from "./pages/PaymentsTracking";
import UtilitiesControl from "./pages/UtilitiesControl";
import Reports from "./pages/Reports";

function Dashboard() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("overview");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      navigate("/login");
    } else if (user.role !== role) {
      navigate(`/dashboard/${user.role}`);
    }
  }, [role, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const renderContent = () => {
    switch (activePage) {
      case "overview":
        return <Overview role={role} />;
      case "tenants":
        return <ManageTenants />;
      case "payments":
        return <PaymentsTracking />;
      case "utilities":
        return <UtilitiesControl />;
      case "reports":
        return <Reports />;
      default:
        return (
          <div className="text-gray-500 text-center py-10">
            <p>Page under construction...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-blue-900 text-white p-6 space-y-6 
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 z-40 md:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex justify-between items-center md:block">
          <h2 className="text-xl font-bold">Dashboard</h2>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="space-y-3 mt-6">
          <button
            onClick={() => setActivePage("overview")}
            className={`flex w-full items-center gap-2 px-2 py-2 rounded-md ${
              activePage === "overview" ? "bg-blue-700" : "hover:bg-blue-800"
            }`}
          >
            <Home className="w-5 h-5" /> Overview
          </button>

          {role === "tenant" ? (
            <>
              <button
                onClick={() => setActivePage("payments")}
                className="flex w-full items-center gap-2 px-2 py-2 rounded-md hover:bg-blue-800"
              >
                <CreditCard className="w-5 h-5" /> My Payments
              </button>
              <button
                onClick={() => setActivePage("statements")}
                className="flex w-full items-center gap-2 px-2 py-2 rounded-md hover:bg-blue-800"
              >
                <FileText className="w-5 h-5" /> Mpesa Statements
              </button>
              <button
                onClick={() => setActivePage("notifications")}
                className="flex w-full items-center gap-2 px-2 py-2 rounded-md hover:bg-blue-800"
              >
                <Bell className="w-5 h-5" /> Notifications
              </button>
              <button
                onClick={() => setActivePage("profile")}
                className="flex w-full items-center gap-2 px-2 py-2 rounded-md hover:bg-blue-800"
              >
                <User className="w-5 h-5" /> Profile
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActivePage("tenants")}
                className={`flex w-full items-center gap-2 px-2 py-2 rounded-md ${
                  activePage === "tenants" ? "bg-blue-700" : "hover:bg-blue-800"
                }`}
              >
                <Users className="w-5 h-5" /> Manage Tenants
              </button>

              <button
                onClick={() => setActivePage("payments")}
                className={`flex w-full items-center gap-2 px-2 py-2 rounded-md ${
                  activePage === "payments" ? "bg-blue-700" : "hover:bg-blue-800"
                }`}
              >
                <CreditCard className="w-5 h-5" /> Payments Tracking
              </button>

              <button
                onClick={() => setActivePage("utilities")}
                className={`flex w-full items-center gap-2 px-2 py-2 rounded-md ${
                  activePage === "utilities" ? "bg-blue-700" : "hover:bg-blue-800"
                }`}
              >
                <Zap className="w-5 h-5" /> Utilities Control
              </button>

              <button
                onClick={() => setActivePage("reports")}
                className={`flex w-full items-center gap-2 px-2 py-2 rounded-md ${
                  activePage === "reports" ? "bg-blue-700" : "hover:bg-blue-800"
                }`}
              >
                <BarChart3 className="w-5 h-5" /> Reports
              </button>
            </>
          )}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="flex justify-between items-center bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-2">
            {/* Hamburger Menu */}
            <button className="md:hidden mr-3" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-blue-900" />
            </button>
            <Home className="w-6 h-6 text-blue-700" />
            <h1 className="text-xl font-bold text-blue-700">HabiTrack</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="w-6 h-6 text-blue-900" />
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full px-1">
                3
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-6 flex-1">{renderContent()}</main>
      </div>
    </div>
  );
}

export default Dashboard;
