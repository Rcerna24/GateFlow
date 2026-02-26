import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/login/LoginPage';
import SignupPage from './pages/auth/signup/SignupPage';
import VisitorPassPage from './pages/auth/visitor-pass/VisitorPassPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/visitor-pass" element={<VisitorPassPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Dashboard routes will go here */}
        <Route path="/dashboard" element={<div className="p-8">Dashboard - Coming Soon</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
