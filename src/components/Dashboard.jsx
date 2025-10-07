import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
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
import { motion } from "framer-motion";

// Pages
import Overview from "./pages/Overview";
import ManageTenants from "./pages/ManageTenants";
import PaymentsTracking from "./pages/PaymentsTracking";
import UtilitiesControl from "./pages/UtilitiesControl";
import Reports from "./pages/Reports";

export default function Dashboard() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("overview");
  const linkRefs = useRef({});

  // Check login
  useEffect(() => {
    const user =
      JSON.parse(localStorage.getItem("currentUserLoggedIn")) ||
      JSON.parse(sessionStorage.getItem("currentUserLoggedIn"));

    if (!user) navigate("/login");
    else if (user.role !== role) navigate(`/dashboard/${user.role}`);
  }, [role, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUserLoggedIn");
    sessionStorage.removeItem("currentUserLoggedIn");
    navigate("/login");
  };

  const links = [
    { name: "overview", label: "Overview", icon: <Home />, color: "text-blue-400" },
    ...(role === "tenant"
      ? [
          { name: "payments", label: "My Payments", icon: <CreditCard />, color: "text-yellow-400" },
          { name: "statements", label: "Mpesa Statements", icon: <FileText />, color: "text-green-400" },
          { name: "notifications", label: "Notifications", icon: <Bell />, color: "text-red-400" },
          { name: "profile", label: "Profile", icon: <User />, color: "text-purple-400" },
        ]
      : [
          { name: "tenants", label: "Manage Tenants", icon: <Users />, color: "text-pink-400" },
          { name: "payments", label: "Payments Tracking", icon: <CreditCard />, color: "text-yellow-400" },
          { name: "utilities", label: "Utilities Control", icon: <Zap />, color: "text-green-400" },
          { name: "reports", label: "Reports", icon: <BarChart3 />, color: "text-orange-400" },
        ]),
  ];

  const renderContent = () => {
    switch (activePage) {
      case "overview": return <Overview role={role} />;
      case "tenants": return <ManageTenants />;
      case "payments": return <PaymentsTracking />;
      case "utilities": return <UtilitiesControl />;
      case "reports": return <Reports />;
      default: return <div className="text-gray-500 text-center py-10"><p>Page under construction...</p></div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 left-0 h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-lg z-40
          transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"}`}
      >
        <div className="flex justify-between items-center p-4">
          <h2
            className={`text-2xl font-extrabold tracking-tight flex items-center gap-2 transition-all duration-300 ${
              sidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            🏠 HabitTrack
          </h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? (
              <X className="w-6 h-6 hover:text-red-400 transition-colors" />
            ) : (
              <Menu className="w-6 h-6 hover:text-green-400 transition-colors" />
            )}
          </button>
        </div>

        <nav className="flex-1 relative overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-700">
          {links.map((item) => (
            <div key={item.name} className="relative flex items-center">
              {activePage === item.name && linkRefs.current[item.name] && (
                <motion.div
                  layout
                  className="absolute left-0 w-1 rounded-r-full shadow-lg"
                  style={{
                    top: linkRefs.current[item.name].offsetTop,
                    height: linkRefs.current[item.name].offsetHeight,
                    background: "linear-gradient(180deg, #ffffff80, #ffffff40)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  whileHover={{
                    width: 4,
                    boxShadow: "0 0 10px 2px rgba(255,255,255,0.6)",
                  }}
                />
              )}

              <button
                ref={(el) => (linkRefs.current[item.name] = el)}
                onClick={() => setActivePage(item.name)}
                className={`flex items-center gap-3 w-full px-4 py-4 rounded-xl relative transition-all duration-300
                  ${activePage === item.name
                    ? "bg-white bg-opacity-10 scale-105 shadow-inner"
                    : "hover:bg-white hover:bg-opacity-10 hover:scale-105 text-gray-200"
                  }`}
              >
                <motion.span
                  className={`${item.color} transition-transform duration-300`}
                  animate={activePage === item.name ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {item.icon}
                </motion.span>

                <span
                  className={`font-medium transition-all duration-300 ${
                    sidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center bg-white shadow-md px-6 py-4">
          <div className="flex items-center gap-2">
            <button className="md:hidden mr-3" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-blue-900" />
            </button>
            <Home className="w-6 h-6 text-blue-700" />
            <h1 className="text-xl font-bold text-blue-700">HabitTrack</h1>
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

        <main className="p-6 flex-1">
          {renderContent()}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
