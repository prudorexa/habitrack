import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // Check both localStorage (remembered) and sessionStorage (temporary login)
  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) ||
    JSON.parse(sessionStorage.getItem("currentUser"));

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
