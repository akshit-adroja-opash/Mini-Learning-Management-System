import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import LearningPage from './pages/LearningPage';
import Dashboard from './pages/Dashboard';
import CertificatePage from './pages/CertificatePage';
import AdminDashboard from './pages/AdminDashboard';
import CourseManagement from './pages/CourseManagement';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a loading spinner

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box sx={{ flex: 1, py: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route 
            path="/learning/:courseId/:lessonId" 
            element={user ? <LearningPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/certificates" 
            element={user ? <CertificatePage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/certificate/:courseId" 
            element={user ? <CertificatePage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
          />
          <Route 
            path="/course-management/:id" 
            element={user?.role === 'instructor' || user?.role === 'admin' ? <CourseManagement /> : <Navigate to="/" />} 
          />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
