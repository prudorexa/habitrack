// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const loggedInUser =
    JSON.parse(localStorage.getItem("currentUserLoggedIn")) ||
    JSON.parse(sessionStorage.getItem("currentUserLoggedIn"));

  if (!loggedInUser) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  // User is logged in → render children (Dashboard)
  return children;
}
