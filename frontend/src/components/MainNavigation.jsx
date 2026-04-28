import { Link, NavLink, useNavigate } from "react-router-dom";
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
      <Link className="brand" to="/courses">
        Mini LMS
      </Link>
      <nav>
        <NavLink to="/courses">Catalog</NavLink>
        {auth.isAuthenticated ? (
          <>
            <NavLink to="/learner">Learner</NavLink>
            <NavLink to="/instructor">Instructor</NavLink>
            <NavLink to="/admin">Admin</NavLink>
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
