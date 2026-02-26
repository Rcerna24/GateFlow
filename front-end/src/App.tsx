import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from './pages/auth/login/LoginPage';
import SignupPage from './pages/auth/signup/SignupPage';
import VisitorPassPage from './pages/auth/visitor-pass/VisitorPassPage';
import ForgotPasswordPage from './pages/auth/forgot-password/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/reset-password/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import FacultyDashboardPage from './pages/dashboard/FacultyDashboardPage';
import GuardDashboardPage from './pages/dashboard/GuardDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/visitor-pass" element={<VisitorPassPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/faculty-dashboard" element={<FacultyDashboardPage />} />
            <Route path="/guard-dashboard" element={<GuardDashboardPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
