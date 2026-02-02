import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import EditorPage from "../pages/EditorPage";

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
      <Route path="/editor" element={<EditorRedirect />} />
      <Route path="/editor/:roomId" element={<EditorPage />} />
    </Routes>
  );
}
