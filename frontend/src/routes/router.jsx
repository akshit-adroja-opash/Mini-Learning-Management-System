import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { AuthLayout } from "../layouts/AuthLayout.jsx";
import { CourseLearningLayout } from "../layouts/CourseLearningLayout.jsx";
import Login from "../layouts/login.jsx";
import RegisterPage from "../layouts/register.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import InstructorDashboard from "../pages/InstructorDashboard.jsx";
import { CourseBuilderPage } from "../pages/CourseBuilderPage.jsx";
import { CourseCreatePage } from "../pages/CourseCreatePage.jsx";
import { AnalyticsPage } from "../pages/AnalyticsPage.jsx";
import { LearnerDashboard } from "../pages/LearnerDashboard.jsx";
import { CourseCatalogPage } from "../pages/CourseCatalogPage.jsx";
import { CourseDetailPage } from "../pages/CourseDetailPage.jsx";
import { LearningPage } from "../pages/LearningPage.jsx";
import { CertificatePage } from "../pages/CertificatePage.jsx";
import { VerifyCertificatePage } from "../pages/VerifyCertificatePage.jsx";
import { NotFoundPage } from "../pages/NotFoundPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import  AdminUsers from "../pages/AdminUsers.jsx";
import AdminCourses from "../pages/AdminCourses.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/courses" replace /> },
      { path: "courses", element: <CourseCatalogPage /> },
      { path: "courses/:courseId", element: <CourseDetailPage /> },
      { path: "verify/:certId", element: <VerifyCertificatePage /> },
      {
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
          { path: "admin", element: <AdminDashboard /> },
          { path: "admin/users", element: <AdminUsers /> },
          { path: "admin/courses", element: <AdminCourses /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["instructor"]} />,
        children: [
          { path: "instructor", element: <InstructorDashboard /> },
          { path: "instructor/create", element: <CourseCreatePage /> },
          { path: "instructor/courses/:courseId/builder", element: <CourseBuilderPage /> },
          { path: "instructor/analytics", element: <AnalyticsPage /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["learner"]} />,
        children: [
          { path: "learner", element: <LearnerDashboard /> },
          {
            path: "learn/:courseId",
            element: <CourseLearningLayout />,
            children: [{ index: true, element: <LearningPage /> }],
          },
          { path: "certificates/:certId", element: <CertificatePage /> },
        ],
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
