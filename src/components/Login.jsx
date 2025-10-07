import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import houseImg from "../assets/home3.avif"; // import your image

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   // Auto-login if previously logged in
  //   const loggedInUser =
  //     JSON.parse(localStorage.getItem("currentUserLoggedIn")) ||
  //     JSON.parse(sessionStorage.getItem("currentUserLoggedIn"));
  //   if (loggedInUser) {
  //     navigate(`/dashboard/${loggedInUser.role}`);
  //   } else {
  //     // Redirect to register if no users exist
  //     const users = JSON.parse(localStorage.getItem("users")) || [];
  //     if (users.length === 0) navigate("/register");
  //   }
  // }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      if (rememberMe) {
        localStorage.setItem("currentUserLoggedIn", JSON.stringify(foundUser));
      } else {
        sessionStorage.setItem("currentUserLoggedIn", JSON.stringify(foundUser));
      }
      navigate(`/dashboard/${foundUser.role}`);
    } else {
      alert("Invalid email or password!");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Aside with Image */}
      <aside
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${houseImg})` }}
      >
        <div className="bg-black bg-opacity-40 w-full h-full flex items-center justify-center">
          <h1 className="text-white text-4xl font-bold p-6 text-center">
            Welcome to HabiTrack
          </h1>
        </div>
      </aside>

      {/* Right Side Login Form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-gray-700">Remember me</label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition font-semibold"
            >
              Login
            </button>
          </form>

          <p className="text-center text-gray-600 mt-4">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 font-medium hover:underline"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
