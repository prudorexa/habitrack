import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<h1 className="text-2xl font-bold">Welcome to HabiTrack</h1>} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard/:role" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
