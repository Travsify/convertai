import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Dashboard
import DashboardLayout from './pages/DashboardLayout';
import Dashboard from './components/Dashboard';
import AdAnalyzer from './components/AdAnalyzer';
import RewriteSuggestions from './components/RewriteSuggestions';
import ABTestGenerator from './components/ABTestGenerator';
import LandingPageAudit from './components/LandingPageAudit';

// Account
import Account from './pages/Account';

function DashboardIndex() {
  const navigate = useNavigate();
  return <Dashboard onNavigate={(tab) => navigate(`/dashboard/${tab}`)} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Account (protected, uses TopNav) */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          {/* Protected dashboard with nested routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardIndex />} />
            <Route path="analyzer" element={<AdAnalyzer />} />
            <Route path="rewrite" element={<RewriteSuggestions />} />
            <Route path="abtest" element={<ABTestGenerator />} />
            <Route path="audit" element={<LandingPageAudit />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
