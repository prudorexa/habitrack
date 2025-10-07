import { useState, useRef, useEffect } from "react";
import { Switch } from "@headlessui/react";

export default function ProfilePage({ currentUser, setCurrentUser, theme }) {
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [role] = useState(currentUser?.role || "");
  const [profilePhoto, setProfilePhoto] = useState(
    currentUser?.profilePhoto || ""
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const fileInputRef = useRef(null);

  // Handle profile photo change
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes
  const handleSave = () => {
    const updatedUser = { ...currentUser, name, email, profilePhoto };
    setCurrentUser(updatedUser);

    // Persist in localStorage/sessionStorage
    if (localStorage.getItem("currentUserLoggedIn")) {
      localStorage.setItem("currentUserLoggedIn", JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem(
        "currentUserLoggedIn",
        JSON.stringify(updatedUser)
      );
    }

    alert("Profile updated successfully!");
  };

  // Optional: Reset password placeholder
  const handleChangePassword = () => {
    alert("Change Password functionality will be implemented here.");
  };

  // Optional: Theme preference handler
  const handleThemePreference = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    window.location.reload(); // Forces re-render with new theme
  };

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col gap-8 text-gray-900">
      <h2 className="text-3xl font-bold text-center text-blue-900">
        My Profile
      </h2>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Photo Card */}
        <div className="flex flex-col items-center bg-white rounded-3xl p-6 shadow-lg w-full md:w-1/3">
          <div
            className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-blue-200 shadow-md cursor-pointer hover:ring-4 hover:ring-blue-300 transition"
            onClick={() => fileInputRef.current.click()}
          >
            <img
              src={profilePhoto || "https://i.pravatar.cc/200"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 w-full bg-black/40 text-white text-center py-1 opacity-0 hover:opacity-100 transition cursor-pointer">
              Change Photo
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handlePhotoChange}
          />
          <p className="mt-4 font-semibold text-lg text-blue-700">{name}</p>
          <p className="text-gray-500">{role}</p>
        </div>

        {/* Info & Settings Card */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Personal Info */}
          <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
            <h3 className="text-xl font-bold text-blue-900">Personal Info</h3>

            <div>
              <label className="block text-gray-700 font-semibold">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold">Role</label>
              <input
                type="text"
                value={role}
                readOnly
                className="w-full mt-1 px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition font-semibold mt-2"
            >
              Save Changes
            </button>
          </div>

          {/* Settings Section */}
          <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
            <h3 className="text-xl font-bold text-blue-900">Settings</h3>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">
                Enable Notifications
              </span>
              <Switch
                checked={notificationsEnabled}
                onChange={setNotificationsEnabled}
                className={`${
                  notificationsEnabled ? "bg-blue-600" : "bg-gray-200"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`${
                    notificationsEnabled ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform bg-white rounded-full transition-transform`}
                />
              </Switch>
            </div>

            <div className="flex flex-col gap-2">
              <button className="w-full text-left px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                Change Password
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                Theme Preferences
              </button>
            </div>
          </div>

          {/* Activity / Stats Section */}
          <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
            <h3 className="text-xl font-bold text-blue-900">Your Activity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-900">12</p>
                <p className="text-gray-600 text-sm">Payments Made</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-700">5</p>
                <p className="text-gray-600 text-sm">Notifications</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-yellow-700">3</p>
                <p className="text-gray-600 text-sm">Documents Uploaded</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple-700">1</p>
                <p className="text-gray-600 text-sm">Pending Tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
