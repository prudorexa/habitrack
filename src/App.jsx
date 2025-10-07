import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useLocation } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";

// Pages inside dashboard
import PaymentsTracking from "./components/pages/PaymentsTracking";
import Statements from "./components/pages/Statements";
import Notifications from "./components/pages/Notifications";
import Profile from "./components/pages/Profile";
import ManageTenants from "./components/pages/ManageTenants";
import Utilities from "./components/pages/UtilitiesControl";
import Reports from "./components/pages/Reports";
import ChatPage  from "./components/pages/ChatPage";
import { ThemeProvider } from "./context/ThemeContext";

// ProtectedRoute wrapper
const ProtectedRoute = ({ children }) => {
  const currentUser =
    JSON.parse(localStorage.getItem("currentUserLoggedIn")) ||
    JSON.parse(sessionStorage.getItem("currentUserLoggedIn"));

  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

function AppWrapper() {
  const location = useLocation();
  const showNavbar = location.pathname === "/"; // only show on homepage

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={
            <h1 className="text-2xl font-bold text-center mt-20">
              Welcome to HabiTrack
            </h1>
          }
        />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard/:role/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Tenant routes */}
          <Route path="payments-tracking" element={<PaymentsTracking />} />
          <Route path="statements" element={<Statements />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />

          {/* Landlord routes */}
          <Route path="manage-tenants" element={<ManageTenants />} />
          <Route path="utilities" element={<Utilities />} />
          <Route path="reports" element={<Reports />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>

        {/* Catch-all: redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppWrapper />
      </Router>
    </ThemeProvider>
  );
}

export default App;
