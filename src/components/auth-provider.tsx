"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthContextValue = {
  authenticated: boolean;
  ready: boolean;
  refresh: () => Promise<void>;
  setAuthenticated: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchSession() {
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  const payload = (await response.json()) as { data?: { authenticated?: boolean } };
  return Boolean(payload.data?.authenticated);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const value = await fetchSession();
      setAuthenticated(value);
    } catch {
      setAuthenticated(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchSession()
      .then((value) => {
        if (!cancelled) {
          setAuthenticated(value);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthenticated(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ authenticated, ready, refresh, setAuthenticated }),
    [authenticated, ready, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
