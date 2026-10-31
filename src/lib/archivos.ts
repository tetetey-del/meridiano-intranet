import { supabase } from "./supabase";

/**
 * Descarga segura: se pide un enlace firmado que caduca en 60 s.
 * Supabase solo lo entrega si las reglas de permisos (RLS) permiten ver ese archivo.
 */
export async function descargar(bucket: string, path: string, nombre: string, abrir = false) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60, abrir ? undefined : { download: nombre });
  if (error || !data) throw new Error("No tenés permiso para abrir este archivo o ya no existe.");
  window.location.assign(data.signedUrl);
}

/** Extrae el texto de PDF, Word (.docx) o texto plano para que la búsqueda encuentre por contenido. */
export async function extraerTexto(file: File): Promise<string> {
  const n = file.name.toLowerCase();
  try {
    if (n.endsWith(".pdf")) {
      const pdfjs = await import("pdfjs-dist");
      const worker = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = worker;
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const partes: string[] = [];
      for (let i = 1; i <= Math.min(pdf.numPages, 80); i++) {
        const page = await pdf.getPage(i);
        const c = await page.getTextContent();
        partes.push(c.items.map((it: any) => ("str" in it ? it.str : "")).join(" "));
      }
      return partes.join("\n").slice(0, 200000);
    }
    if (n.endsWith(".docx")) {
      // @ts-ignore — build para navegador sin tipos
      const mammoth = (await import("mammoth/mammoth.browser")).default;
      const r = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return String(r.value).slice(0, 200000);
    }
    if (n.endsWith(".txt") || n.endsWith(".md") || n.endsWith(".csv")) return (await file.text()).slice(0, 200000);
  } catch (e) {
    console.warn("No se pudo extraer texto", e);
  }
  return "";
}
