import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import EditorPage from "../pages/EditorPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/editor/:roomId" element={<EditorPage />} />
    </Routes>
  );
}
