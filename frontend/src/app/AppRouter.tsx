import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/LoginPage";
import { ProfilePage } from "../features/profile/ProfilePage";
import { LandingPage } from "../features/landing/LandingPage";
import { RequireProfile } from "./RequireProfile";
import { AppNav } from "../components/AppNav";

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppNav />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
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
