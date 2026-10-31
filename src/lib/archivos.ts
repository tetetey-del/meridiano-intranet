/**
 * Abre o descarga un archivo que la intranet ya entregó tras comprobar permisos (ver datos.ts).
 * Se crea una dirección temporal en memoria (blob:) que se descarta enseguida: no existe ninguna URL fija del archivo.
 */
export function entregarArchivo(blob: Blob, nombre: string, abrir = false) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  if (abrir) a.target = "_blank"; else a.download = nombre;
  a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
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
      return partes.join("\n").slice(0, 100000);
    }
    if (n.endsWith(".docx")) {
      // @ts-ignore — build para navegador sin tipos
      const mammoth = (await import("mammoth/mammoth.browser")).default;
      const r = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return String(r.value).slice(0, 100000);
    }
    if (n.endsWith(".txt") || n.endsWith(".md") || n.endsWith(".csv")) return (await file.text()).slice(0, 100000);
  } catch (e) {
    console.warn("No se pudo extraer texto", e);
  }
  return "";
}

export const ACEPTA = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png";
