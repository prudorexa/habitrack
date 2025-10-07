import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

// Pages
import PaymentsTracking from "./components/pages/PaymentsTracking";
import Statements from "./components/pages/Statements";
import Notifications from "./components/pages/Notifications";
import Profile from "./components/pages/Profile";
import ManageTenants from "./components/pages/ManageTenants";
import Utilities from "./components/pages/UtilitiesControl";
import Reports from "./components/pages/Reports";

// ProtectedRoute wrapper
const ProtectedRoute = ({ children }) => {
  const currentUser =
    JSON.parse(localStorage.getItem("currentUserLoggedIn")) ||
    JSON.parse(sessionStorage.getItem("currentUserLoggedIn"));

  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 p-4">
          <Routes>
            <Route
              path="/"
              element={
                <h1 className="text-2xl font-bold text-center mt-20">
                  Welcome to HabiTrack
                </h1>
              }
            />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Dashboard */}
            <Route
              path="/dashboard/:role/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              {/* Tenant */}
              <Route path="payments-tracking" element={<PaymentsTracking />} />
              <Route path="statements" element={<Statements />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />

              {/* Landlord */}
              <Route path="manage-tenants" element={<ManageTenants />} />
              <Route path="utilities" element={<Utilities />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
