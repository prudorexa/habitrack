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

function Dashboard() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          {role === "tenant" ? (
            <>
              <a href="#" className="flex items-center gap-2 hover:text-amber-400">
                <CreditCard className="w-5 h-5" /> My Payments
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-amber-400">
                <FileText className="w-5 h-5" /> Mpesa Statements
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-amber-400">
                <Bell className="w-5 h-5" /> Notifications
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-amber-400">
                <User className="w-5 h-5" /> Profile
              </a>
            </>
          ) : (
            <>
              <a href="#" className="flex items-center gap-2 hover:text-amber-400">
                <Users className="w-5 h-5" /> Manage Tenants
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-amber-400">
                <CreditCard className="w-5 h-5" /> Payments Tracking
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-amber-400">
                <Zap className="w-5 h-5" /> Utilities Control
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-amber-400">
                <BarChart3 className="w-5 h-5" /> Reports
              </a>
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

        {/* Content Area */}
        <main className="p-6 flex-1">
          <h1 className="text-2xl font-bold text-blue-900 mb-6">
            Welcome {role === "tenant" ? "Tenant" : "Landlord"}
          </h1>

          <div className="bg-white p-6 rounded-lg shadow-md">
            {role === "tenant" ? (
              <>
                <h2 className="text-lg font-bold mb-4">Your Payment History</h2>
                <ul className="space-y-2">
                  <li className="p-3 bg-gray-100 rounded">✅ Paid Rent - Sept 2025</li>
                  <li className="p-3 bg-gray-100 rounded">✅ Paid Rent - Aug 2025</li>
                  <li className="p-3 bg-gray-100 rounded">⚠️ Due Payment - Oct 2025</li>
                </ul>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-4">Tenant Overview</h2>
                <ul className="space-y-2">
                  <li className="p-3 bg-gray-100 rounded">John Doe - Unit A3 - Paid</li>
                  <li className="p-3 bg-gray-100 rounded">Jane Smith - Unit B1 - ⚠️ Due</li>
                  <li className="p-3 bg-gray-100 rounded">Mike Lee - Unit C2 - Paid</li>
                </ul>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
