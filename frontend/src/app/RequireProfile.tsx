import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../lib/SessionContext";
import { AppNav } from "../components/AppNav";

// Route guard: redirect to /login when there is no active profile (BR-4).
// Also renders the app chrome (nav) so it only appears on authenticated pages.
export function RequireProfile({ children }: { children: ReactNode }) {
  const { profileId } = useSession();
  if (!profileId) return <Navigate to="/login" replace />;
  return (
    <>
      <AppNav />
      {children}
    </>
  );
}

// Guard for /login: if already signed in, send the user to the app (BR-4.2 inverse).
export function RedirectIfProfile({ children }: { children: ReactNode }) {
  const { profileId } = useSession();
  if (profileId) return <Navigate to="/" replace />;
  return <>{children}</>;
}
