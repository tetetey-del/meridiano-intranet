import { supabase } from "./supabase";

/** Llama a la función segura del servidor que gestiona cuentas (solo administración). */
export async function adminUsuarios(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("admin-usuarios", { body });
  if (error) {
    let msg = "No se pudo completar la acción.";
    try { const j = await (error as any).context?.json(); if (j?.error) msg = j.error; } catch { /* sin detalle */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
