import { Link } from "react-router-dom";
import {
  Home,
  User,
  FileText,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  return (
    <div className="bg-blue-900 text-white h-screen w-64 fixed top-0 left-0 flex flex-col shadow-xl">
      {/* Logo / Title */}
      <div className="p-6 text-center border-b border-blue-700">
        <h2 className="text-2xl font-bold tracking-wide">HabiTrack</h2>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-4">
          <li>
            <Link
              to="/dashboard"
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-800 transition"
            >
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/tenants"
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-800 transition"
            >
              <User size={20} />
              <span>Tenants</span>
            </Link>
          </li>
          <li>
            <Link
              to="/landlords"
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-800 transition"
            >
              <FileText size={20} />
              <span>Landlords</span>
            </Link>
          </li>
          <li>
            <Link
              to="/payments"
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-800 transition"
            >
              <CreditCard size={20} />
              <span>Payments</span>
            </Link>
          </li>
          <li>
            <Link
              to="/reports"
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-800 transition"
            >
              <BarChart2 size={20} />
              <span>Reports</span>
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-800 transition"
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-700">
        <Link
          to="/logout"
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-800 transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
