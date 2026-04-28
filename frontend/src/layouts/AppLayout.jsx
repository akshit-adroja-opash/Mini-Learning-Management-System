import { Outlet } from "react-router-dom";
import { AppFooter } from "../components/AppFooter.jsx";
import { MainNavigation } from "../components/MainNavigation.jsx";

export function AppLayout() {
  return (
    <div className="app-shell">
      <MainNavigation />
      <main className="page-shell">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
