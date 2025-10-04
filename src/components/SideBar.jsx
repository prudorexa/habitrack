import { Link, useParams } from "react-router-dom";
import { Home, CreditCard, FileText, Bell, User, Users, BarChart3, Zap, LogOut } from "lucide-react";

const Sidebar = ({ onLogout }) => {
  const { role } = useParams();

  const tenantLinks = [
    { to: "/dashboard/tenant", label: "My Payments", icon: <CreditCard size={20} /> },
    { to: "/dashboard/tenant/statements", label: "Mpesa Statements", icon: <FileText size={20} /> },
    { to: "/dashboard/tenant/notifications", label: "Notifications", icon: <Bell size={20} /> },
    { to: "/dashboard/tenant/profile", label: "Profile", icon: <User size={20} /> },
  ];

  const landlordLinks = [
    { to: "/dashboard/landlord", label: "Manage Tenants", icon: <Users size={20} /> },
    { to: "/dashboard/landlord/payments", label: "Payments Tracking", icon: <CreditCard size={20} /> },
    { to: "/dashboard/landlord/utilities", label: "Utilities Control", icon: <Zap size={20} /> },
    { to: "/dashboard/landlord/reports", label: "Reports", icon: <BarChart3 size={20} /> },
  ];

  const links = role === "tenant" ? tenantLinks : landlordLinks;

  return (
    <div className="bg-blue-900 text-white h-screen w-64 fixed top-0 left-0 flex flex-col shadow-xl">
      <div className="p-6 text-center border-b border-blue-700">
        <h2 className="text-2xl font-bold tracking-wide">HabiTrack</h2>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-4">
          {links.map(({ to, label, icon }) => (
            <li key={label}>
              <Link
                to={to}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-800 transition"
              >
                {icon}
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-blue-700">
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 p-2 w-full rounded-lg hover:bg-blue-800 transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
