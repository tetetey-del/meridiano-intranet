import { supabase } from "./supabase";
import { extraerTexto } from "./archivos";
import { slug } from "./formato";

export const ACEPTA = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png";

/** Sube un archivo como nueva versión. La base de datos conserva la anterior y marca esta como vigente. */
export async function subirVersion(folderId: string, docId: string, file: File, notas: string, userId: string) {
  if (file.size > 50 * 1024 * 1024) throw new Error("El archivo supera los 50 MB.");
  const texto = await extraerTexto(file);
  const path = `${folderId}/${docId}/${Date.now()}-${slug(file.name)}`;
  const up = await supabase.storage.from("documentos").upload(path, file, { contentType: file.type || "application/octet-stream" });
  if (up.error) throw new Error("No se pudo subir el archivo: " + up.error.message);
  const { error } = await supabase.from("document_versions").insert({
    document_id: docId, file_path: path, file_name: file.name, mime_type: file.type,
    size_bytes: file.size, notes: notas, content_text: texto, uploaded_by: userId,
  });
  if (error) { await supabase.storage.from("documentos").remove([path]); throw new Error("No se pudo registrar la versión: " + error.message); }
}
