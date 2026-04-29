import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function MainNavigation() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <header className="main-navigation">
      <NavLink className="brand" to="/">
        Mini LMS
      </NavLink>
      <nav>
        {auth.isAuthenticated && <NavLink to="/courses">Courses</NavLink>}
        {auth.isAuthenticated ? (
          <>
            {auth.user.role === "admin" && (
              <>
                <NavLink to="/admin">Admin Dashboard</NavLink>
                <NavLink to="/admin/users">Users</NavLink>
                <NavLink to="/admin/courses">Courses</NavLink>
              </>
            )}
            {auth.user.role === "instructor" && (
              <>
                <NavLink to="/instructor">Dashboard</NavLink>
                <NavLink to="/instructor/create">Create Course</NavLink>
                <NavLink to="/instructor/analytics">Analytics</NavLink>
              </>
            )}
            {auth.user.role === "learner" && <NavLink to="/learner">Dashboard</NavLink>}
          </>
        ) : (
          <>
            <NavLink to="/auth/login">Login</NavLink>
            <NavLink to="/auth/register">Register</NavLink>
          </>
        )}
      </nav>
      {auth.isAuthenticated ? (
        <div className="nav-account">
          <span>{auth.user?.name || "User"}</span>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : null}
    </header>
  );
}


