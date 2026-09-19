import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import ProfileRequiredRoute from "./components/ProfileRequiredRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import Premium from "./pages/Premium";
import WhoLikedMe from "./pages/WhoLikedMe";
import Notifications from "./pages/Notifications";
import AppLayout from "./components/AppLayout";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/profile/setup"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfileSetup />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProfileRequiredRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <AppLayout>
                  <Discover />
                </AppLayout>
              </ProfileRequiredRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <AppLayout>
                  <Matches />
                </AppLayout>
              </ProfileRequiredRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:matchId"
          element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <AppLayout>
                  <Chat />
                </AppLayout>
              </ProfileRequiredRoute>
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            PREMIUM

            Login required
            AND
            Profile must be completed
        ===================================================== */}

        <Route
          path="/premium"
          element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <AppLayout>
                  <Premium />
                </AppLayout>
              </ProfileRequiredRoute>
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            WHO LIKED ME

            Login required
            AND
            Profile must be completed
        ===================================================== */}

        <Route
          path="/who-liked-me"
          element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <AppLayout>
                  <WhoLikedMe />
                </AppLayout>
              </ProfileRequiredRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <ProfileRequiredRoute>
                <AppLayout>
                  <Notifications />
                </AppLayout>
              </ProfileRequiredRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
