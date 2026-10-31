import { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import { usuarioActual, cerrarSesion, suscribir, Profile } from "./datos";

type Ctx = { profile: Profile | null; esGestor: boolean; esAdmin: boolean; signOut: () => void };
const AuthCtx = createContext<Ctx>(null as unknown as Ctx);

/** Vuelve a dibujar el componente cada vez que cambian los datos (en esta pestaña o en otra). */
export function useCambios() {
  const [n, tocar] = useReducer((x: number) => x + 1, 0);
  useEffect(() => suscribir(tocar), []);
  return n;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  useCambios();
  const profile = usuarioActual();
  const value: Ctx = {
    profile,
    esGestor: profile?.role === "responsable" || profile?.role === "admin",
    esAdmin: profile?.role === "admin",
    signOut: cerrarSesion,
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
