import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import AuthPage from "../pages/AuthPage";
import DashboardPage from "../pages/DashboardPage";
import EditorPage from "../pages/EditorPageNew";
import PlainEditorPage from "../pages/PlainEditorPage";
import AccountPage from "../pages/AccountPage";
import SettingsPage from "../pages/SettingsPage";

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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/editor" element={<EditorRedirect />} />
      <Route path="/editor/:roomId" element={<EditorPage />} />
      <Route path="/editor-plain/:workspaceId" element={<PlainEditorPage />} />
    </Routes>
  );
}
