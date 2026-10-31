/**
 * ALMACÉN LOCAL DE LA INTRANET
 * Todo vive en el navegador, sin servicios externos:
 *  - localStorage "meridiano:datos"        → personas, carpetas, documentos, versiones, avisos, lecturas, eventos…
 *  - localStorage "meridiano:archivo:<id>" → cada archivo (PDF, Word…) en base64, por separado
 *  - sessionStorage "meridiano:sesion"     → quién entró (caduca al cerrar la pestaña)
 * Los permisos por perfil se comprueban aquí, en cada lectura y escritura: las pantallas solo reciben lo que el perfil puede ver.
 */
import { EJEMPLO } from "../datos/ejemplo";
import { generarPdf } from "./pdf";

export type Perfil = "equipo" | "responsable" | "admin";
export type Profile = {
  id: string; full_name: string; email: string; role: Perfil; puesto: string;
  area: string; phone: string; avatar_url: string | null; active: boolean;
};
type Usuario = Profile & { hash: string };
export type Folder = { id: string; name: string; description: string; allowed_roles: Perfil[]; sort_order: number };
export type Doc = { id: string; folder_id: string; title: string; description: string; created_at: string; updated_at: string };
export type Version = {
  id: string; document_id: string; version_number: number; file_id: string; file_name: string; mime_type: string;
  size_bytes: number; notes: string; content_text: string; is_current: boolean; uploaded_by: string | null; created_at: string;
};
export type Aviso = { id: string; title: string; body: string; category: string; is_important: boolean; author_id: string | null; created_at: string };
export type Adjunto = { id: string; announcement_id: string; file_id: string; file_name: string; size_bytes: number };
export type Lectura = { announcement_id: string; user_id: string; read_at: string };
export type Evento = { id: string; title: string; description: string; location: string; starts_at: string; ends_at: string | null };
export type Asistencia = { event_id: string; user_id: string; status: "si" | "no" };

type Datos = {
  version: 1;
  usuarios: Usuario[]; carpetas: Folder[]; documentos: Doc[]; versiones: Version[];
  avisos: Aviso[]; adjuntos: Adjunto[]; lecturas: Lectura[]; eventos: Evento[]; asistencias: Asistencia[];
};

export const nombrePerfil: Record<Perfil, string> = { equipo: "Equipo", responsable: "Responsables", admin: "Administración" };
export const CATEGORIAS = ["General", "Procedimientos", "Convocatorias", "Simulacros", "Administración"];
export const MAX_ARCHIVO = 1.5 * 1024 * 1024; // el localStorage da ~5 MB en total

const CLAVE = "meridiano:datos";
const PREFIJO_ARCHIVO = "meridiano:archivo:";
const CLAVE_SESION = "meridiano:sesion";
const EVENTO = "meridiano:cambio";

export class ErrorIntranet extends Error {}
const fallo = (m: string): never => { throw new ErrorIntranet(m); };

/* ---------- Lectura y escritura ---------- */

let cache: Datos | null = null;

function leer(): Datos {
  if (cache) return cache;
  const crudo = localStorage.getItem(CLAVE);
  if (crudo) {
    try { cache = JSON.parse(crudo) as Datos; return cache; } catch { /* datos dañados: se recargan los ejemplos */ }
  }
  cache = sembrar();
  return cache;
}

function guardar(d: Datos) {
  try { localStorage.setItem(CLAVE, JSON.stringify(d)); }
  catch { fallo("El navegador no tiene más espacio. Reiniciá los datos de ejemplo o borrá documentos que no uses."); }
  cache = d;
  window.dispatchEvent(new Event(EVENTO));
}

/** Modifica los datos y los guarda; si algo falla, no se guarda nada. */
function cambiar(fn: (d: Datos) => void) {
  const copia = JSON.parse(JSON.stringify(leer())) as Datos;
  fn(copia);
  guardar(copia);
}

/** Avisa a las pantallas cuando cambian los datos (también desde otra pestaña). */
export function suscribir(fn: () => void) {
  const local = () => fn();
  const otraPestana = (e: StorageEvent) => { if (e.key === CLAVE || e.key === null) { cache = null; fn(); } };
  window.addEventListener(EVENTO, local);
  window.addEventListener("storage", otraPestana);
  return () => { window.removeEventListener(EVENTO, local); window.removeEventListener("storage", otraPestana); };
}

const ahora = () => new Date().toISOString();
const hace = (ms: number) => new Date(Date.now() - ms).toISOString();
const DIA = 86400000, HORA = 3600000;
const nuevoId = () => crypto.randomUUID();

/* ---------- Datos de ejemplo ---------- */

function sembrar(): Datos {
  // Los PDF de ejemplo se generan a partir de su texto y se guardan como cualquier archivo subido
  const tamanos: Record<string, number> = {};
  const guardarPdf = (fileId: string, lineas: readonly string[]) => {
    const b64 = generarPdf([...lineas]);
    localStorage.setItem(PREFIJO_ARCHIVO + fileId, b64);
    tamanos[fileId] = Math.floor((b64.length * 3) / 4);
  };
  EJEMPLO.versiones.forEach((v) => guardarPdf("a-" + v.id, v.content_text.split("\n")));
  guardarPdf("a-adjunto-simulacro", EJEMPLO.adjuntoSimulacro);
  const u = EJEMPLO.usuarios.map((x) => ({ ...x, role: x.role as Perfil, avatar_url: null, active: true, hash: EJEMPLO.hashDemo }));
  const id = (usr: string) => u.find((x) => x.email.startsWith(usr + "@"))!.id;
  const matricula = "d1";
  const d: Datos = {
    version: 1,
    usuarios: u,
    carpetas: [
      { id: "f1", name: "General", description: "Normas, horarios y documentación para todo el personal", allowed_roles: ["equipo", "responsable", "admin"], sort_order: 1 },
      { id: "f2", name: "Procedimientos", description: "Procedimientos internos vigentes", allowed_roles: ["equipo", "responsable", "admin"], sort_order: 2 },
      { id: "f3", name: "Convocatorias y materiales", description: "Convocatorias oficiales, temarios y material docente", allowed_roles: ["equipo", "responsable", "admin"], sort_order: 3 },
      { id: "f4", name: "Coordinación académica", description: "Planificación y evaluación (responsables)", allowed_roles: ["responsable", "admin"], sort_order: 4 },
      { id: "f5", name: "Dirección y administración", description: "Presupuestos, tarifas y contratos (solo administración)", allowed_roles: ["admin"], sort_order: 5 },
    ],
    documentos: EJEMPLO.documentos.map((x) => ({ ...x, created_at: hace(40 * DIA), updated_at: hace((x.id === matricula ? 3 : 20) * DIA) })),
    versiones: EJEMPLO.versiones.map((v) => ({
      ...v, file_id: "a-" + v.id, mime_type: "application/pdf",
      size_bytes: tamanos["a-" + v.id],
      is_current: v.document_id === matricula ? v.version_number === 2 : true,
      uploaded_by: id("andres.vargas"),
      created_at: v.document_id === matricula ? hace((v.version_number === 1 ? 40 : 3) * DIA) : hace(20 * DIA),
    })),
    avisos: [
      { id: "av1", title: "Nuevo procedimiento de matrícula en línea", category: "Procedimientos", is_important: true, author_id: id("andres.vargas"), created_at: hace(3 * DIA),
        body: "A partir del lunes 2 de noviembre, todas las matrículas se gestionan con el formulario en línea y el pago por SINPE Móvil. La ficha en papel deja de aceptarse.\n\nLa versión vigente del procedimiento (v2) está en Documentos › Procedimientos. Por favor, léanla antes de atender a cualquier alumno nuevo y confirmen la lectura en este aviso." },
      { id: "av2", title: "Simulacro general del 27 de noviembre", category: "Simulacros", is_important: true, author_id: id("andres.vargas"), created_at: hace(1 * DIA),
        body: "El viernes 27 de noviembre a las 8:00 se realiza el simulacro general en el aula magna. Adjuntamos las instrucciones con la asignación de vigilancia por grupo.\n\nCada profesor debe entregar su examen a coordinación antes del martes 24." },
      { id: "av3", title: "Publicada la convocatoria de Auxiliar Judicial", category: "Convocatorias", is_important: false, author_id: id("mariela.jimenez"), created_at: hace(6 * DIA),
        body: "El Poder Judicial publicó la convocatoria de Auxiliar Judicial. El plazo de inscripción cierra el 15 de diciembre. Ya está disponible el temario en Documentos › Convocatorias y materiales." },
      { id: "av4", title: "Cierre de la sede por feriado", category: "General", is_important: false, author_id: id("laura.mendez"), created_at: hace(9 * DIA),
        body: "Recordamos que la sede permanecerá cerrada el lunes 1 de diciembre. Las clases de ese día se recuperan el sábado 6 en horario de mañana." },
      { id: "av5", title: "Bienvenida a la intranet Meridiano", category: "General", is_important: false, author_id: id("laura.mendez"), created_at: hace(12 * DIA),
        body: "Desde hoy, los documentos, avisos y contactos del equipo están en un solo sitio. Si un aviso está marcado como importante, confirmen la lectura con el botón al final. Cualquier duda, escriban a Administración." },
    ],
    adjuntos: [{ id: "ad1", announcement_id: "av2", file_id: "a-adjunto-simulacro", file_name: "instrucciones-simulacro-noviembre.pdf",
      size_bytes: tamanos["a-adjunto-simulacro"] }],
    lecturas: [
      ...["laura.mendez", "carlos.araya", "andres.vargas", "mariela.jimenez", "paola.herrera", "natalia.villalobos", "gabriela.umana", "daniela.quesada", "valeria.chaves"]
        .map((usr, i) => ({ announcement_id: "av1", user_id: id(usr), read_at: hace(2 * DIA - i * 2 * HORA) })),
      ...["andres.vargas", "paola.herrera", "laura.mendez", "esteban.monge", "josepablo.solano"]
        .map((usr, i) => ({ announcement_id: "av2", user_id: id(usr), read_at: hace(10 * HORA - i * HORA) })),
    ],
    eventos: [
      { id: "ev1", title: "Claustro de profesores", description: "Revisión del trimestre y planificación de diciembre.", location: "Sala de reuniones, 2.º piso", starts_at: "2026-11-05T23:00:00.000Z", ends_at: "2026-11-06T00:30:00.000Z" },
      { id: "ev2", title: "Capacitación: nueva matrícula en línea", description: "Sesión práctica de 1 hora para secretaría y coordinación.", location: "Aula 3", starts_at: "2026-11-10T16:00:00.000Z", ends_at: "2026-11-10T17:00:00.000Z" },
      { id: "ev3", title: "Simulacro general", description: "Simulacro de todas las convocatorias activas.", location: "Aula magna", starts_at: "2026-11-27T14:00:00.000Z", ends_at: "2026-11-27T17:00:00.000Z" },
      { id: "ev4", title: "Cena de fin de año del equipo", description: "Cena informal para todo el personal.", location: "Restaurante en Barrio Escalante", starts_at: "2026-12-12T01:30:00.000Z", ends_at: null },
    ],
    asistencias: [
      ...["laura.mendez", "andres.vargas", "mariela.jimenez", "paola.herrera", "daniela.quesada"].map((usr) => ({ event_id: "ev1", user_id: id(usr), status: "si" as const })),
      ...["carlos.araya", "valeria.chaves"].map((usr) => ({ event_id: "ev1", user_id: id(usr), status: "no" as const })),
      ...["natalia.villalobos", "andres.vargas", "mariela.jimenez"].map((usr) => ({ event_id: "ev2", user_id: id(usr), status: "si" as const })),
    ],
  };
  localStorage.setItem(CLAVE, JSON.stringify(d));
  return d;
}

/** Borra todo lo guardado por la intranet y vuelve a cargar los datos de ejemplo. */
export function reiniciarDatos() {
  for (const k of Object.keys(localStorage)) if (k.startsWith("meridiano:")) localStorage.removeItem(k);
  cache = null;
  leer();
  window.dispatchEvent(new Event(EVENTO));
}

/* ---------- Sesión y permisos ---------- */

const sinHash = ({ hash, ...p }: Usuario): Profile => p;

async function huella(texto: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("meridiano:" + texto));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function usuarioActual(): Profile | null {
  const id = sessionStorage.getItem(CLAVE_SESION);
  const u = id ? leer().usuarios.find((x) => x.id === id) : null;
  return u && u.active ? sinHash(u) : null;
}

export async function iniciarSesion(email: string, contrasena: string): Promise<string | null> {
  const u = leer().usuarios.find((x) => x.email === email.trim().toLowerCase());
  if (!u || u.hash !== (await huella(contrasena))) return "El correo o la contraseña no son correctos.";
  if (!u.active) return "Tu cuenta está desactivada. Contactá con administración.";
  sessionStorage.setItem(CLAVE_SESION, u.id);
  window.dispatchEvent(new Event(EVENTO));
  return null;
}

export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
  window.dispatchEvent(new Event(EVENTO));
}

function yo(): Profile { return usuarioActual() ?? fallo("Tu sesión terminó. Volvé a entrar."); }
const esGestor = (p: Profile) => p.role === "responsable" || p.role === "admin";
function gestor() { const p = yo(); if (!esGestor(p)) fallo("Tu perfil no tiene permiso para esto."); return p; }
function admin() { const p = yo(); if (p.role !== "admin") fallo("Solo administración puede hacer esto."); return p; }
const puedeVer = (p: Profile, c: Folder) => p.role === "admin" || c.allowed_roles.includes(p.role);

/* ---------- Archivos (en localStorage, nunca con una dirección pública) ---------- */

function aBase64(file: Blob): Promise<string> {
  return new Promise((ok, mal) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(",")[1] ?? "");
    r.onerror = () => mal(new ErrorIntranet("No se pudo leer el archivo."));
    r.readAsDataURL(file);
  });
}

async function guardarArchivo(file: File): Promise<string> {
  if (file.size > MAX_ARCHIVO) fallo("El archivo supera 1,5 MB, el máximo que entra en el navegador para esta demo.");
  const id = nuevoId();
  try { localStorage.setItem(PREFIJO_ARCHIVO + id, await aBase64(file)); }
  catch { fallo("El navegador no tiene más espacio para archivos. Reiniciá los datos de ejemplo o borrá documentos que no uses."); }
  return id;
}

function archivoComoBlob(fileId: string, tipo: string): Blob {
  const b64 = localStorage.getItem(PREFIJO_ARCHIVO + fileId) ?? fallo("El archivo ya no está disponible.");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: tipo || "application/octet-stream" });
}

/** Entrega el archivo de una versión solo si el perfil puede ver su carpeta. */
export function archivoDeVersion(versionId: string): { blob: Blob; nombre: string } {
  const p = yo(); const d = leer();
  const v = d.versiones.find((x) => x.id === versionId) ?? fallo("Versión no encontrada.");
  const doc = d.documentos.find((x) => x.id === v.document_id)!;
  const c = d.carpetas.find((x) => x.id === doc.folder_id)!;
  if (!puedeVer(p, c)) fallo("No tenés permiso para abrir este archivo.");
  return { blob: archivoComoBlob(v.file_id, v.mime_type), nombre: v.file_name };
}

export function archivoDeAdjunto(adjuntoId: string): { blob: Blob; nombre: string } {
  yo();
  const a = leer().adjuntos.find((x) => x.id === adjuntoId) ?? fallo("Adjunto no encontrado.");
  const tipo = a.file_name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "";
  return { blob: archivoComoBlob(a.file_id, tipo), nombre: a.file_name };
}

/* ---------- Personas ---------- */

export function personas(opciones?: { incluirInactivas?: boolean }): Profile[] {
  const p = yo();
  const incluir = opciones?.incluirInactivas && p.role === "admin";
  return leer().usuarios.filter((u) => incluir || u.active).map(sinHash)
    .sort((a, b) => Number(b.active) - Number(a.active) || a.full_name.localeCompare(b.full_name));
}
export const persona = (id: string | null) => (id ? personas({ incluirInactivas: true }).find((x) => x.id === id) ?? null : null);

export async function crearUsuario(f: { full_name: string; email: string; password: string; role: Perfil; puesto: string; area: string; phone: string }) {
  admin();
  const email = f.email.trim().toLowerCase();
  if (f.password.length < 8) fallo("La contraseña debe tener al menos 8 caracteres.");
  if (leer().usuarios.some((u) => u.email === email)) fallo("Ya existe un usuario con ese correo.");
  const hash = await huella(f.password);
  cambiar((d) => d.usuarios.push({ id: nuevoId(), email, hash, full_name: f.full_name.trim(), role: f.role,
    puesto: f.puesto.trim(), area: f.area.trim(), phone: f.phone.trim(), avatar_url: null, active: true }));
}

export function actualizarUsuario(id: string, c: Partial<Pick<Profile, "full_name" | "puesto" | "area" | "phone" | "role" | "avatar_url">>) {
  const p = admin();
  if (id === p.id && c.role && c.role !== p.role) fallo("No podés cambiar tu propio perfil.");
  cambiar((d) => Object.assign(d.usuarios.find((u) => u.id === id) ?? fallo("Persona no encontrada."), c));
}

export function cambiarActivo(id: string, active: boolean) {
  const p = admin();
  if (id === p.id && !active) fallo("No podés desactivar tu propia cuenta.");
  cambiar((d) => { (d.usuarios.find((u) => u.id === id) ?? fallo("Persona no encontrada.")).active = active; });
}

export async function cambiarContrasena(id: string, contrasena: string) {
  admin();
  if (contrasena.length < 8) fallo("La contraseña debe tener al menos 8 caracteres.");
  const hash = await huella(contrasena);
  cambiar((d) => { (d.usuarios.find((u) => u.id === id) ?? fallo("Persona no encontrada.")).hash = hash; });
}

/** Cada persona puede cambiar solo su propia foto. */
export function cambiarMiFoto(foto: string | null) {
  const p = yo();
  cambiar((d) => { d.usuarios.find((u) => u.id === p.id)!.avatar_url = foto; });
}

/* ---------- Carpetas ---------- */

export function carpetasVisibles(): (Folder & { documentos: number })[] {
  const p = yo(); const d = leer();
  return d.carpetas.filter((c) => puedeVer(p, c)).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    .map((c) => ({ ...c, documentos: d.documentos.filter((x) => x.folder_id === c.id).length }));
}
export const carpeta = (id: string) => carpetasVisibles().find((c) => c.id === id) ?? null;

export function crearCarpeta(nombre: string) {
  admin();
  cambiar((d) => d.carpetas.push({ id: nuevoId(), name: nombre.trim(), description: "",
    allowed_roles: ["equipo", "responsable", "admin"], sort_order: d.carpetas.length + 1 }));
}

export function actualizarCarpeta(id: string, c: { name: string; description: string; allowed_roles: Perfil[] }) {
  admin();
  const roles = [...new Set<Perfil>([...c.allowed_roles.filter((r) => r !== "admin"), "admin"])];
  cambiar((d) => Object.assign(d.carpetas.find((x) => x.id === id) ?? fallo("Carpeta no encontrada."),
    { name: c.name.trim(), description: c.description.trim(), allowed_roles: roles }));
}

export function borrarCarpeta(id: string) {
  admin();
  if (leer().documentos.some((x) => x.folder_id === id)) fallo("Solo se pueden borrar carpetas vacías. Mové o borrá antes sus documentos.");
  cambiar((d) => { d.carpetas = d.carpetas.filter((x) => x.id !== id); });
}

/* ---------- Documentos y versiones ---------- */

export function documentosDeCarpeta(folderId: string): (Doc & { vigente: Version | null; versiones: number })[] {
  if (!carpeta(folderId)) return [];
  const d = leer();
  return d.documentos.filter((x) => x.folder_id === folderId).sort((a, b) => a.title.localeCompare(b.title)).map((doc) => {
    const vs = d.versiones.filter((v) => v.document_id === doc.id);
    return { ...doc, vigente: vs.find((v) => v.is_current) ?? null, versiones: vs.length };
  });
}

/** Devuelve el documento solo si el perfil puede ver su carpeta (si no, null: "sin permiso"). */
export function documento(id: string): (Doc & { carpeta: Folder; versiones: Version[] }) | null {
  const d = leer();
  const doc = d.documentos.find((x) => x.id === id);
  const c = doc && carpeta(doc.folder_id);
  if (!doc || !c) return null;
  const versiones = d.versiones.filter((v) => v.document_id === id).sort((a, b) => b.version_number - a.version_number);
  return { ...doc, carpeta: c, versiones };
}

export function documentosRecientes(n: number): (Doc & { carpeta: string })[] {
  const visibles = new Map(carpetasVisibles().map((c) => [c.id, c.name]));
  return leer().documentos.filter((x) => visibles.has(x.folder_id))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, n)
    .map((x) => ({ ...x, carpeta: visibles.get(x.folder_id)! }));
}

/** Sube una versión: la anterior se conserva y la nueva queda como vigente. */
export async function subirVersion(docId: string, file: File, notas: string, texto: string) {
  const p = gestor();
  if (!documento(docId)) fallo("No tenés permiso sobre este documento.");
  const fileId = await guardarArchivo(file);
  try {
    cambiar((d) => {
      const vs = d.versiones.filter((v) => v.document_id === docId);
      vs.forEach((v) => { v.is_current = false; });
      d.versiones.push({ id: nuevoId(), document_id: docId, version_number: Math.max(0, ...vs.map((v) => v.version_number)) + 1,
        file_id: fileId, file_name: file.name, mime_type: file.type, size_bytes: file.size, notes: notas.trim(),
        content_text: texto, is_current: true, uploaded_by: p.id, created_at: ahora() });
      d.documentos.find((x) => x.id === docId)!.updated_at = ahora();
    });
  } catch (e) { localStorage.removeItem(PREFIJO_ARCHIVO + fileId); throw e; }
}

export async function crearDocumento(folderId: string, titulo: string, descripcion: string, file: File, texto: string): Promise<string> {
  gestor();
  if (!carpeta(folderId)) fallo("No tenés permiso sobre esta carpeta.");
  const id = nuevoId();
  cambiar((d) => d.documentos.push({ id, folder_id: folderId, title: titulo.trim(), description: descripcion.trim(), created_at: ahora(), updated_at: ahora() }));
  try { await subirVersion(id, file, "Versión inicial", texto); }
  catch (e) { cambiar((d) => { d.documentos = d.documentos.filter((x) => x.id !== id); }); throw e; }
  return id;
}

/** Vuelve a marcar como vigente una versión anterior, sin borrar nada. */
export function marcarVigente(versionId: string) {
  gestor();
  const v = leer().versiones.find((x) => x.id === versionId) ?? fallo("Versión no encontrada.");
  if (!documento(v.document_id)) fallo("No tenés permiso sobre este documento.");
  cambiar((d) => {
    d.versiones.filter((x) => x.document_id === v.document_id).forEach((x) => { x.is_current = x.id === versionId; });
    d.documentos.find((x) => x.id === v.document_id)!.updated_at = ahora();
  });
}

/* ---------- Avisos y lecturas ---------- */

export function avisos(): Aviso[] { yo(); return [...leer().avisos].sort((a, b) => b.created_at.localeCompare(a.created_at)); }
export const aviso = (id: string) => avisos().find((a) => a.id === id) ?? null;
export const adjuntosDe = (avisoId: string) => { yo(); return leer().adjuntos.filter((a) => a.announcement_id === avisoId); };

export async function publicarAviso(a: { title: string; body: string; category: string; is_important: boolean }, archivos: File[]): Promise<string> {
  const p = gestor();
  const ids: { file: File; fileId: string }[] = [];
  try { for (const file of archivos) ids.push({ file, fileId: await guardarArchivo(file) }); }
  catch (e) { ids.forEach((x) => localStorage.removeItem(PREFIJO_ARCHIVO + x.fileId)); throw e; }
  const id = nuevoId();
  cambiar((d) => {
    d.avisos.push({ id, title: a.title.trim(), body: a.body.trim(), category: a.category, is_important: a.is_important, author_id: p.id, created_at: ahora() });
    ids.forEach(({ file, fileId }) => d.adjuntos.push({ id: nuevoId(), announcement_id: id, file_id: fileId, file_name: file.name, size_bytes: file.size }));
  });
  return id;
}

/** Recuento de lecturas: solo cuenta personas activas. Lo ven todos los perfiles (solo números). */
export function recuento(avisoId: string) {
  yo(); const d = leer();
  const activos = new Set(d.usuarios.filter((u) => u.active).map((u) => u.id));
  return { leidos: d.lecturas.filter((l) => l.announcement_id === avisoId && activos.has(l.user_id)).length, total: activos.size };
}

export function miLectura(avisoId: string): string | null {
  const p = yo();
  return leer().lecturas.find((l) => l.announcement_id === avisoId && l.user_id === p.id)?.read_at ?? null;
}

export function confirmarLectura(avisoId: string) {
  const p = yo();
  if (miLectura(avisoId)) return;
  cambiar((d) => d.lecturas.push({ announcement_id: avisoId, user_id: p.id, read_at: ahora() }));
}

/** Quién leyó qué: solo responsables y administración. */
export function lecturas(avisoId?: string): Lectura[] {
  gestor();
  return leer().lecturas.filter((l) => !avisoId || l.announcement_id === avisoId);
}

export function avisosPendientes(): Aviso[] {
  const p = yo(); const d = leer();
  const leidos = new Set(d.lecturas.filter((l) => l.user_id === p.id).map((l) => l.announcement_id));
  return avisos().filter((a) => a.is_important && !leidos.has(a.id));
}

/* ---------- Calendario ---------- */

export function eventos(pasados = false): Evento[] {
  yo(); const t = ahora();
  return leer().eventos.filter((e) => (pasados ? e.starts_at < t : e.starts_at >= t))
    .sort((a, b) => (pasados ? b.starts_at.localeCompare(a.starts_at) : a.starts_at.localeCompare(b.starts_at)));
}

export function crearEvento(e: Omit<Evento, "id">) {
  gestor();
  cambiar((d) => d.eventos.push({ ...e, id: nuevoId(), title: e.title.trim() }));
}

export function miAsistencia(eventoId: string): "si" | "no" | null {
  const p = yo();
  return leer().asistencias.find((a) => a.event_id === eventoId && a.user_id === p.id)?.status ?? null;
}

/** Responder "si" o "no"; null quita la respuesta. */
export function responderAsistencia(eventoId: string, status: "si" | "no" | null) {
  const p = yo();
  cambiar((d) => {
    d.asistencias = d.asistencias.filter((a) => !(a.event_id === eventoId && a.user_id === p.id));
    if (status) d.asistencias.push({ event_id: eventoId, user_id: p.id, status });
  });
}

export function recuentoAsistencia(eventoId: string) {
  yo(); const as = leer().asistencias.filter((a) => a.event_id === eventoId);
  return { si: as.filter((a) => a.status === "si").length, no: as.filter((a) => a.status === "no").length };
}

/** Nombres de quién respondió: solo responsables y administración. */
export function respuestasAsistencia(eventoId: string) {
  gestor(); const d = leer();
  const nombre = (id: string) => d.usuarios.find((u) => u.id === id)?.full_name ?? "";
  const as = d.asistencias.filter((a) => a.event_id === eventoId);
  return { si: as.filter((a) => a.status === "si").map((a) => nombre(a.user_id)), no: as.filter((a) => a.status === "no").map((a) => nombre(a.user_id)) };
}

/* ---------- Búsqueda por título y contenido (respeta permisos) ---------- */

export type Resultado = { tipo: "aviso" | "documento"; id: string; titulo: string; contexto: string; extra: string; fecha: string };
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function fragmento(texto: string, n: string) {
  const i = norm(texto).indexOf(n);
  if (i < 0) return "";
  const desde = Math.max(0, i - 60);
  return (desde > 0 ? "…" : "") + texto.slice(desde, i + 120).replace(/\s+/g, " ").trim() + (i + 120 < texto.length ? "…" : "");
}

export function buscar(q: string): Resultado[] {
  const n = norm(q.trim());
  if (n.length < 2) return [];
  const d = leer();
  const res: Resultado[] = [];
  for (const a of avisos()) {
    const enTitulo = norm(a.title).includes(n);
    if (enTitulo || norm(a.body).includes(n))
      res.push({ tipo: "aviso", id: a.id, titulo: a.title, contexto: enTitulo ? a.body.slice(0, 160) : fragmento(a.body, n), extra: a.category, fecha: a.created_at });
  }
  for (const c of carpetasVisibles()) for (const doc of d.documentos.filter((x) => x.folder_id === c.id)) {
    const v = d.versiones.find((x) => x.document_id === doc.id && x.is_current);
    const enTitulo = norm(doc.title).includes(n) || norm(doc.description).includes(n);
    const enContenido = v ? norm(v.content_text).includes(n) : false;
    if (enTitulo || enContenido)
      res.push({ tipo: "documento", id: doc.id, titulo: doc.title, contexto: enContenido && !norm(doc.title).includes(n) ? fragmento(v!.content_text, n) : doc.description,
        extra: c.name, fecha: doc.updated_at });
  }
  return res.sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 40);
}
