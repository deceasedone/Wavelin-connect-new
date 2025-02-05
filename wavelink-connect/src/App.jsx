import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/Landing";
import LobbyPage from "./pages/LobbyPage";
import VideoRoom from "./pages/VideoLobby";
import VoiceRoom from "./pages/VoiceLobby";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join/:type" element={<LobbyPage />} />
        <Route path="/video/:lobbyId" element={<VideoRoom />} />
        <Route path="/voice/:lobbyId" element={<VoiceRoom />} />
      </Routes>
    </BrowserRouter>
  );
}