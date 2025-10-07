import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check for logged-in user in localStorage or sessionStorage
    const user =
      JSON.parse(localStorage.getItem("currentUserLoggedIn")) ||
      JSON.parse(sessionStorage.getItem("currentUserLoggedIn"));
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUserLoggedIn");
    sessionStorage.removeItem("currentUserLoggedIn");
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        🏠 HabiTrack
      </h1>

      <div className="flex items-center gap-4">
        {currentUser ? (
          <>
            <span className="font-medium">
              Hello, {currentUser.name.split(" ")[0]} ({currentUser.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="bg-white text-blue-900 px-3 py-1 rounded hover:bg-gray-200 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-blue-900 px-3 py-1 rounded hover:bg-gray-200 transition"
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
