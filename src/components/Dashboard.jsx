import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bell, LogOut, Home, Menu, X,
  CreditCard, FileText, User, Users,
  BarChart3, Zap, MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Overview from "./pages/Overview";
import ManageTenants from "./pages/ManageTenants";
import PaymentsTracking from "./pages/PaymentsTracking";
import UtilitiesControl from "./pages/UtilitiesControl";
import Reports from "./pages/Reports";
import ProfilePage from "./pages/Profile";
import ChatPage from "./pages/ChatPage";

export default function Dashboard() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar
  const [collapsed, setCollapsed] = useState(false); // desktop sidebar collapse
  const [activePage, setActivePage] = useState("overview");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [chatNotifications, setChatNotifications] = useState({});
  const [theme, setTheme] = useState("light");

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUserLoggedIn")) || JSON.parse(sessionStorage.getItem("currentUserLoggedIn"));
    if (!user) navigate("/login");
    else if (user.role !== role) navigate(`/dashboard/${user.role}`);
    else setCurrentUser(user);

    const storedNotifications = JSON.parse(localStorage.getItem(`${user?.email}_notifications`) || "[]");
    setNotifications(storedNotifications);

    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, [role, navigate]);

  useEffect(() => {
    const storedTenants = JSON.parse(localStorage.getItem("habitrack.tenants") || "[]");
    setTenants(storedTenants);
  }, []);

  useEffect(() => {
    if (activePage === "chat") setChatNotifications({});
  }, [activePage]);

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
        { name: "notificationsPage", label: "Notifications", icon: <Bell />, color: "text-red-400" },
        { name: "profile", label: "Profile", icon: <User />, color: "text-purple-400" },
      ]
      : [
        { name: "tenants", label: "Manage Tenants", icon: <Users />, color: "text-pink-400" },
        { name: "payments", label: "Payments Tracking", icon: <CreditCard />, color: "text-yellow-400" },
        { name: "utilities", label: "Utilities Control", icon: <Zap />, color: "text-green-400" },
        { name: "reports", label: "Reports", icon: <BarChart3 />, color: "text-orange-400" },
        { name: "chat", label: "Chat", icon: <MessageCircle />, color: "text-teal-400" },
        { name: "profile", label: "Profile", icon: <User />, color: "text-purple-400" },
      ]),
  ];

  const renderContent = () => {
    switch (activePage) {
      case "overview": return <Overview role={role} />;
      case "tenants": return <ManageTenants />;
      case "payments": return <PaymentsTracking />;
      case "utilities": return <UtilitiesControl />;
      case "reports": return <Reports />;
      case "profile": return <ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} theme={theme} />;
      case "notificationsPage": return (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          {notifications.length === 0 ? <p>No notifications yet.</p> :
            notifications.map((note, idx) => (
              <div key={idx} className="bg-blue-100 p-3 rounded-xl mb-4 shadow hover:shadow-md transition cursor-pointer"
                onClick={() => {
                  const newNotes = [...notifications]; newNotes.splice(idx, 1); setNotifications(newNotes);
                  localStorage.setItem(`${currentUser.email}_notifications`, JSON.stringify(newNotes));
                }}>{note}</div>
            ))}
        </div>
      );
      case "chat": return <ChatPage currentUser={currentUser} tenants={tenants} onNewMessage={(tenantEmail) => setChatNotifications(prev => ({ ...prev, [tenantEmail]: true }))} />;
      default: return <div className="text-gray-500 text-center py-10"><p>Page under construction...</p></div>;
    }
  };

  return (
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div className="fixed inset-0 z-40 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-4/5 max-w-xs bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-lg flex flex-col rounded-r-2xl"
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}>
              <div className="flex justify-between items-center p-4 border-b border-white/20">
                <h2 className="text-2xl font-semibold tracking-tight truncate">🏠 HabitTrack</h2>
                <button onClick={() => setSidebarOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              <nav className="flex flex-col flex-1 overflow-y-auto px-2 py-4 space-y-2">
                {links.map(item => (
                  <button key={item.name} onClick={() => { setActivePage(item.name); setSidebarOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium tracking-wide transition hover:bg-white hover:bg-opacity-20">
                    <span className={`${item.color} w-5 h-5`}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
            <div className="flex-1" onClick={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex md:flex-col sticky top-0 h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-sm
        transition-all duration-300 ${collapsed ? "w-20" : "w-52"} rounded-r-2xl`}>

        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-white/20">
          <h2 className={`text-xl font-semibold tracking-tight truncate transition-all duration-300 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
            🏠 HabitTrack
          </h2>
          <button className="ml-auto text-white" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-col flex-1 overflow-y-auto px-2 py-6 space-y-2">
          {links.map(item => (
            <button key={item.name} onClick={() => setActivePage(item.name)}
              className={`flex items-center gap-3 w-full px-2 py-3 rounded-lg text-base font-medium tracking-wide transition-colors duration-200
              ${activePage === item.name ? "bg-white bg-opacity-10 shadow-md" : "hover:bg-white hover:bg-opacity-10"}`}
            >
              <span className={`${item.color} w-5 h-5`}>{item.icon}</span>
              <span className={`truncate transition-all duration-300 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center bg-white shadow-md px-4 py-3 md:px-6 md:py-4 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-blue-900" />
            </button>
            <Home className="w-6 h-6 text-blue-700" />
            <h1 className="text-lg font-bold text-blue-700 hidden md:block">HabitTrack</h1>
          </div>

          {/* Notifications & Profile */}
          <div className="flex items-center gap-3 relative">
            <div ref={notifRef} className="relative">
              <button className="relative" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="w-6 h-6 text-blue-900" />
                {Object.keys(chatNotifications).length > 0 &&
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">{Object.keys(chatNotifications).length}</span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-xl z-50 overflow-hidden">
                  {notifications.length === 0 ? <p className="p-3 text-gray-500">No notifications</p> :
                    notifications.map((note, idx) => (
                      <div key={idx} className="p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => {
                          const newNotes = [...notifications]; newNotes.splice(idx, 1); setNotifications(newNotes);
                          localStorage.setItem(`${currentUser.email}_notifications`, JSON.stringify(newNotes));
                        }}>{note}</div>
                    ))}
                </div>
              )}
            </div>

            <div ref={profileRef} className="relative">
              <button className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                <img src={currentUser?.profilePhoto || "https://i.pravatar.cc/200"} alt="Profile"
                  className="w-6 h-6 rounded-full object-cover" />
                <span className="text-blue-900 font-medium hidden md:block truncate max-w-[100px]">{currentUser?.name}</span>
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-xl z-50 overflow-hidden">
                  <div className="p-4 border-b">
                    <p className="font-bold truncate">{currentUser?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{currentUser?.email}</p>
                    <p className="text-sm text-gray-500 capitalize">{currentUser?.role}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50" onClick={() => setActivePage("profile")}>Edit Profile</button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600" onClick={handleLogout}><LogOut className="w-4 h-4" /> Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
