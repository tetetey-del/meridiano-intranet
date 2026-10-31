/**
 * Generador mínimo de PDF (una o más páginas A4 de texto) para los documentos de ejemplo.
 * Evita guardar PDF ya hechos en el repositorio: se arman en el navegador a partir de su texto.
 * Usa la fuente Helvetica estándar con codificación WinAnsi (admite tildes y ñ).
 */
const ANCHO = 595, ALTO = 842, MARGEN = 56;

function partir(texto: string, max: number) {
  const out: string[] = []; let linea = "";
  for (const p of texto.split(" ")) {
    if ((linea + " " + p).trim().length > max) { out.push(linea); linea = p; } else linea = (linea + " " + p).trim();
  }
  if (linea) out.push(linea);
  return out;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

/** Devuelve el PDF en base64. La primera línea es el título. */
export function generarPdf(lineas: string[], encabezado = "ACADEMIA MERIDIANO · Documento de ejemplo"): string {
  type L = { t: string; tam: number; negrita: boolean; espacio: number };
  const todas: L[] = [{ t: encabezado, tam: 9, negrita: true, espacio: 26 }];
  lineas.forEach((l, i) => {
    const tam = i === 0 ? 17 : 11;
    partir(l, i === 0 ? 52 : 92).forEach((t, j, arr) =>
      todas.push({ t, tam, negrita: i === 0, espacio: j === arr.length - 1 ? (i === 0 ? 30 : 20) : tam + 5 }));
  });
  const paginas: L[][] = [[]]; let y = ALTO - MARGEN;
  for (const l of todas) {
    if (y < MARGEN + 20) { paginas.push([]); y = ALTO - MARGEN; }
    paginas[paginas.length - 1].push(l); y -= l.espacio;
  }

  const objs: string[] = [];
  const add = (s: string) => objs.push(s);
  add("<< /Type /Catalog /Pages 2 0 R >>");
  add(""); // páginas, se completa al final
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const kids: number[] = [];
  for (const pag of paginas) {
    let yy = ALTO - MARGEN; let flujo = "";
    for (const l of pag) {
      flujo += `BT /${l.negrita ? "F2" : "F1"} ${l.tam} Tf ${l.negrita && l.tam > 12 ? "0.055 0.29 0.32 rg" : "0.1 0.15 0.16 rg"} ${MARGEN} ${yy} Td (${esc(l.t)}) Tj ET\n`;
      yy -= l.espacio;
    }
    add(`<< /Length ${flujo.length} >>\nstream\n${flujo}endstream`);
    add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ANCHO} ${ALTO}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${objs.length} 0 R >>`);
    kids.push(objs.length);
  }
  objs[1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`;

  let pdf = "%PDF-1.4\n"; const offsets: number[] = [];
  objs.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("");
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  // Todo el texto va en latín-1 (WinAnsi): cada carácter es un byte; lo que no entra se reemplaza
  return btoa(pdf.replace(/[–—]/g, "-").replace(/…/g, "...").replace(/[‹›]/g, ">").replace(/[^\x00-\xff]/g, "?"));
}
