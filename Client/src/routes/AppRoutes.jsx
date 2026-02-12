import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../features/landing/pages/LandingPage";
import AuthPage from "../features/auth/pages/AuthPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import EditorPage from "../features/editor/pages/EditorPageNew";
import PlainEditorPage from "../features/editor/pages/PlainEditorPage";
import AccountPage from "../features/auth/pages/AccountPage";
import SettingsPage from "../features/auth/pages/SettingsPage";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import { useAuth } from "../shared/context/AuthContext";

// Generate a random room ID
const generateRoomId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Redirect component for /editor without roomId
function EditorRedirect() {
  const newRoomId = generateRoomId();
  return <Navigate to={`/editor/${newRoomId}`} replace />;
}

// Auth route wrapper - redirects to dashboard if already logged in
function AuthRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/editor" element={<ProtectedRoute><EditorRedirect /></ProtectedRoute>} />
      <Route path="/editor/:roomId" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
      <Route path="/editor-plain/:workspaceId" element={<ProtectedRoute><PlainEditorPage /></ProtectedRoute>} />
    </Routes>
  );
}
