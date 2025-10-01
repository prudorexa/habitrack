import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-blue-900 text-white px-6 py-4 shadow-md flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">HabiTrack</Link>
      <div className="space-x-6">
        <Link to="/" className="hover:text-amber-400">Home</Link>
        <Link to="/dashboard/tenant" className="hover:text-amber-400">Tenant</Link>
        <Link to="/dashboard/landlord" className="hover:text-amber-400">Landlord</Link>
        <Link to="/login" className="hover:text-amber-400">Login</Link>
        <Link to="/register" className="hover:text-amber-400">Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;
