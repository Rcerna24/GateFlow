import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from './pages/auth/login/LoginPage';
import SignupPage from './pages/auth/signup/SignupPage';
import VisitorPassPage from './pages/auth/visitor-pass/VisitorPassPage';
import ForgotPasswordPage from './pages/auth/forgot-password/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/reset-password/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AdminDashboardPage from './pages/dashboard/AdminDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/visitor-pass" element={<VisitorPassPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Student / Faculty / Staff dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'FACULTY', 'STAFF']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Admin dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          </Route>

          {/* Legacy redirect */}
          <Route path="/faculty-dashboard" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
