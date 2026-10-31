import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "../marca";

// La sesión se guarda en sessionStorage: dura mientras la pestaña está abierta y caduca sola al cerrarla.
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, storage: window.sessionStorage },
});

export type Perfil = "equipo" | "responsable" | "admin";
export type Profile = {
  id: string; full_name: string; email: string; role: Perfil; puesto: string;
  area: string; phone: string; avatar_url: string | null; active: boolean;
};
export type Folder = { id: string; name: string; description: string; allowed_roles: Perfil[]; sort_order: number };
export type Doc = { id: string; folder_id: string; title: string; description: string; updated_at: string; created_at: string };
export type Version = {
  id: string; document_id: string; version_number: number; file_path: string; file_name: string;
  mime_type: string; size_bytes: number; notes: string; is_current: boolean; uploaded_by: string | null; created_at: string;
};
export type Aviso = {
  id: string; title: string; body: string; category: string; is_important: boolean; author_id: string | null; created_at: string;
};
export type Evento = {
  id: string; title: string; description: string; location: string; starts_at: string; ends_at: string | null;
};

export const nombrePerfil: Record<Perfil, string> = {
  equipo: "Equipo", responsable: "Responsables", admin: "Administración",
};
export const CATEGORIAS = ["General", "Procedimientos", "Convocatorias", "Simulacros", "Administración"];
