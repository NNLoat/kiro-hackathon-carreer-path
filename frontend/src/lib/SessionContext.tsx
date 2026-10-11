// Prototype session: holds active profile id/username. NOT a security token (no auth in scope).
// Persists to localStorage so a refresh keeps the user signed in (BR-3).
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Profile, ProfileId } from "./types";
import { apiClient } from "./createApiClient";

const STORAGE_KEY = "cpp.session";

interface PersistedSession {
  profileId: ProfileId;
  username: string;
}

export interface SessionValue {
  profileId: ProfileId | null;
  username: string | null;
  signIn: (profile: Profile) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

function readPersisted(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession;
    if (parsed && typeof parsed.profileId === "string" && typeof parsed.username === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [profileId, setProfileId] = useState<ProfileId | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Restore persisted session on mount (BR-3.2), then revalidate against the backend (BR-3.3):
  // if the stored profile id no longer exists (e.g. DB was reset, or a stale stub id), clear it.
  useEffect(() => {
    const persisted = readPersisted();
    if (!persisted) return;
    setProfileId(persisted.profileId);
    setUsername(persisted.username);

    let cancelled = false;
    apiClient
      .getProfile(persisted.profileId)
      .then((p) => {
        if (cancelled) return;
        // keep in sync with the authoritative record
        setUsername(p.username);
      })
      .catch(() => {
        if (cancelled) return;
        // stale/invalid session — clear it so the user is sent back to login
        setProfileId(null);
        setUsername(null);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = (profile: Profile) => {
    setProfileId(profile.id);
    setUsername(profile.username);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ profileId: profile.id, username: profile.username }),
      );
    } catch {
      /* ignore persistence failures (prototype) */
    }
  };

  const signOut = () => {
    setProfileId(null);
    setUsername(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<SessionValue>(
    () => ({ profileId, username, signIn, signOut }),
    [profileId, username],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
