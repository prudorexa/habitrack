import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";

// Import dummy pages
import PaymentsTracking from "./components/pages/PaymentsTracking";
import Statements from "./components/pages/Statements";
import Notifications from "./components/pages/Notifications";
import Profile from "./components/pages/Profile";
import ManageTenants from "./components/pages/ManageTenants";
import Utilities from "./components/pages/UtilitiesControl";
import Reports from "./components/pages/Reports";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<h1 className="text-2xl font-bold">Welcome to HabiTrack</h1>} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/:role/*" element={<Dashboard />}>
              {/* Tenant routes */}
              <Route path="payments-tracking" element={<PaymentsTracking />} />
              <Route path="statements" element={<Statements />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />

              {/* Landlord routes */}
              <Route path="manage-tenants" element={<ManageTenants />} />
              <Route path="utilities" element={<Utilities />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
