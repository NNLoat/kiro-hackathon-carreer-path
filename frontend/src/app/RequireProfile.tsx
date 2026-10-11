import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../lib/SessionContext";

// Route guard: redirect to /login when there is no active profile (BR-4).
export function RequireProfile({ children }: { children: ReactNode }) {
  const { profileId } = useSession();
  if (!profileId) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
