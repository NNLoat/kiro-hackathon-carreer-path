import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/LoginPage";
import { ProfilePage } from "../features/profile/ProfilePage";
import { LandingPage } from "../features/landing/LandingPage";
import { RequireProfile, RedirectIfProfile } from "./RequireProfile";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfProfile>
              <LoginPage />
            </RedirectIfProfile>
          }
        />
        <Route
          path="/"
          element={
            <RequireProfile>
              <LandingPage />
            </RequireProfile>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireProfile>
              <ProfilePage />
            </RequireProfile>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
