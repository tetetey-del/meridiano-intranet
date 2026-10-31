import { marca } from "../marca";
const tz = marca.zonaHoraria;

export const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric", timeZone: tz });
export const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-CR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: tz });
export const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", timeZone: tz });
export const diaSemana = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "long", timeZone: tz });
export const mesAnio = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CR", { month: "long", year: "numeric", timeZone: tz });

export function hace(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "ahora";
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  if (s < 86400 * 7) { const d = Math.floor(s / 86400); return `hace ${d} día${d > 1 ? "s" : ""}`; }
  return fecha(iso);
}
export const tamano = (b: number) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

export const iniciales = (n: string) =>
  n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export const slug = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "archivo";

/** Convierte una fecha local "YYYY-MM-DDTHH:mm" (hora de Costa Rica, UTC-6 sin horario de verano) a ISO */
export const localCRaISO = (v: string) => new Date(v + ":00-06:00").toISOString();
