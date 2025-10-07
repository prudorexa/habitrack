import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import homeImg from "../assets/home4.avif"; // high-res image

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
    photo: "", // store profile photo
  });

  useEffect(() => {
    // Redirect to dashboard if already logged in
    const loggedInUser =
      JSON.parse(localStorage.getItem("currentUserLoggedIn")) ||
      JSON.parse(sessionStorage.getItem("currentUserLoggedIn"));
    if (loggedInUser) {
      navigate(`/dashboard/${loggedInUser.role}`);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, photo: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some((u) => u.email === form.email)) {
      alert("Email already registered!");
      return;
    }

    users.push(form);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful! Please log in.");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side Image */}
      <aside
        className="hidden md:flex w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${homeImg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-black/20 flex items-center justify-center">
          <h1 className="text-white text-5xl font-extrabold p-6 text-center leading-snug">
            Join HabiTrack Today
          </h1>
        </div>
      </aside>

      {/* Right Side Form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 p-6">
        <div className="bg-white/80 backdrop-blur-md p-12 rounded-3xl shadow-2xl w-full max-w-md animate-fadeIn">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-blue-900">
            Create an Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-base md:text-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-base md:text-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-base md:text-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-base md:text-lg"
              >
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Profile Photo (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full text-sm text-gray-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 hover:scale-105 transition-transform font-semibold"
            >
              Register
            </button>
          </form>

          <p className="text-center text-gray-600 mt-4">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 font-medium hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
