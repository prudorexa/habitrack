import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("tenant");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
  e.preventDefault();

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const foundUser = users.find(
    (u) => u.email === email && u.password === password
  );

  if (foundUser) {
    localStorage.setItem("currentUser", JSON.stringify(foundUser));
    navigate(`/dashboard/${foundUser.role}`);  // ✅ route to correct dashboard
  } else {
    alert("Invalid email or password!");
  }
};

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Login</h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Role</label>
          <select
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-400"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
