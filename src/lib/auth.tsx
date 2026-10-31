import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, Profile } from "./supabase";

type Ctx = {
  session: Session | null; profile: Profile | null; loading: boolean;
  esGestor: boolean; esAdmin: boolean; error: string | null;
  signOut: () => Promise<void>; refresh: () => Promise<void>;
};
const AuthCtx = createContext<Ctx>(null as unknown as Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPerfil = useCallback(async (s: Session | null) => {
    if (!s) { setProfile(null); setLoading(false); return; }
    const { data } = await supabase.from("profiles").select("*").eq("id", s.user.id).maybeSingle();
    if (!data || !data.active) {
      setError("Tu cuenta no está activa. Contactá con administración.");
      await supabase.auth.signOut();
      setProfile(null);
    } else { setProfile(data as Profile); setError(null); }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); cargarPerfil(data.session); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setTimeout(() => cargarPerfil(s), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [cargarPerfil]);

  const value: Ctx = {
    session, profile, loading, error,
    esGestor: profile?.role === "responsable" || profile?.role === "admin",
    esAdmin: profile?.role === "admin",
    signOut: async () => { await supabase.auth.signOut(); },
    refresh: async () => cargarPerfil(session),
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
