import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  DollarSign,
  Zap,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { name: "Overview", icon: Home, path: "/dashboard/landlord" },
    { name: "Manage Tenants", icon: Users, path: "/landlord/tenants" },
    { name: "Payment Tracking", icon: DollarSign, path: "/landlord/payments" },
    { name: "Utilities Control", icon: Zap, path: "/landlord/utilities" },
    { name: "Reports", icon: BarChart3, path: "/landlord/reports" },
  ];

  return (
    <>
      {/* Toggle for mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-indigo-700 text-white p-2 rounded-lg shadow-md hover:bg-indigo-600 transition-all"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 md:top-0 left-0 h-[calc(100vh-4rem)] md:h-screen bg-gradient-to-b from-indigo-700 to-indigo-900 text-white shadow-2xl flex flex-col justify-between transition-all duration-300 z-40 
        ${isOpen ? "w-64" : "w-0 md:w-20"}
      `}
      >
        {/* Brand Header */}
        <div
          className={`flex items-center justify-center h-16 border-b border-indigo-600 transition-all ${
            isOpen ? "opacity-100" : "opacity-0 md:opacity-100"
          }`}
        >
          <h1 className="text-2xl font-bold tracking-wide">HabiTrack</h1>
        </div>

        {/* Scrollable menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {menuItems.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-500 shadow-md scale-[1.02]"
                    : "hover:bg-indigo-600 hover:scale-[1.01]"
                }`
              }
            >
              <Icon
                size={20}
                className="text-indigo-100 group-hover:text-white transition-colors duration-200"
              />
              <span
                className={`${
                  isOpen ? "opacity-100" : "opacity-0 md:opacity-100"
                } transition-opacity duration-300`}
              >
                {name}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Logout button */}
        <div className="border-t border-indigo-600 p-4">
          <button className="flex items-center justify-center md:justify-start gap-2 w-full text-red-300 hover:text-white transition-all text-sm font-medium">
            <LogOut size={18} />
            <span
              className={`${
                isOpen ? "opacity-100" : "opacity-0 md:opacity-100"
              } transition-opacity duration-300`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
