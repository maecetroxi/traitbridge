import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [, setExpiryTick] = useState(0);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, current) => {
      setSession(current);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.expires_at) return;
    const delay = Math.min(
      Math.max(0, session.expires_at * 1000 - Date.now()),
      2_147_483_647,
    );
    const recheck = () => setExpiryTick((n) => n + 1);
    const timer = window.setTimeout(recheck, delay);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, [session]);

  const signOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } finally {
      setSigningOut(false);
    }
  };

  const active =
    !signingOut && session && (session.expires_at ?? 0) * 1000 > Date.now()
      ? session
      : null;
  return (
    <AuthContext.Provider
      value={{ user: active?.user ?? null, session: active, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
