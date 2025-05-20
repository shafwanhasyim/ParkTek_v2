import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "./Loading";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading when checking authentication status
  if (loading) {
    return <Loading />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render the child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
