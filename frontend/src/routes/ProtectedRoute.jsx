import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function ProtectedRoute({ allowedRoles }) {
  const auth = useAuth();
  console.log(auth.user);


  if (!auth?.isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/" />;
  }

  if (auth.user?.role && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/courses" replace />;
  }

  return <Outlet />;
}
