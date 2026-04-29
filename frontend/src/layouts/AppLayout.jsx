import { Outlet, useLocation } from "react-router-dom";
import { AppFooter } from "../components/AppFooter.jsx";
import { MainNavigation } from "../components/MainNavigation.jsx";

export function AppLayout() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/learner") || location.pathname.startsWith("/admin") || location.pathname.startsWith("/instructor");

  return (
    <div className={`app-shell ${isDashboard ? 'dashboard-shell' : ''}`}>
      {!isDashboard && <MainNavigation />}
      <main className="page-shell">
        <Outlet />
      </main>
      {!isDashboard && <AppFooter />}
    </div>
  );
}
