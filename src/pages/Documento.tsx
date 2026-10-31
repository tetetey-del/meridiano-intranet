import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase, Doc, Version, Folder } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { fechaHora, tamano } from "../lib/formato";
import { descargar } from "../lib/archivos";
import { subirVersion, ACEPTA } from "../lib/subir";
import { Cabecera, Cargando, Mensaje, Vacio } from "../components/Comunes";
import { Icono } from "../components/Icono";

export default function Documento() {
  const { id } = useParams();
  const { profile, esGestor } = useAuth();
  const [doc, setDoc] = useState<(Doc & { folders: Folder }) | null | undefined>(undefined);
  const [versiones, setVersiones] = useState<Version[]>([]);
  const [autores, setAutores] = useState<Record<string, string>>({});
  const [form, setForm] = useState(false);
  const [file, setFile] = useState<File | null>(null); const [notas, setNotas] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [msg, setMsg] = useState<{ t: "ok" | "error"; m: string } | null>(null);

  const cargar = useCallback(async () => {
    const { data: d } = await supabase.from("documents").select("*, folders(*)").eq("id", id!).maybeSingle();
    setDoc(d as any);
    if (!d) return;
    const { data: v } = await supabase.from("document_versions").select("*").eq("document_id", id!).order("version_number", { ascending: false });
    setVersiones((v ?? []) as Version[]);
    const ids = [...new Set((v ?? []).map((x) => x.uploaded_by).filter(Boolean))];
    if (ids.length) {
      const { data: p } = await supabase.from("profiles").select("id, full_name").in("id", ids as string[]);
      setAutores(Object.fromEntries((p ?? []).map((x) => [x.id, x.full_name])));
    }
  }, [id]);
  useEffect(() => { cargar(); }, [cargar]);

  async function bajar(v: Version, abrir = false) {
    setMsg(null);
    try { await descargar("documentos", v.file_path, v.file_name, abrir); } catch (e: any) { setMsg({ t: "error", m: e.message }); }
  }

  async function nuevaVersion(e: FormEvent) {
    e.preventDefault();
    if (!file || !doc || !profile) return;
    setSubiendo(true); setMsg(null);
    try {
      await subirVersion(doc.folder_id, doc.id, file, notas.trim(), profile.id);
      setForm(false); setFile(null); setNotas("");
      await cargar();
      setMsg({ t: "ok", m: "Versión nueva subida. La anterior queda guardada en el historial." });
    } catch (e: any) { setMsg({ t: "error", m: e.message }); }
    setSubiendo(false);
  }

  async function hacerVigente(v: Version) {
    if (!confirm(`¿Marcar la versión ${v.version_number} como vigente? La versión actual seguirá en el historial.`)) return;
    const { error } = await supabase.rpc("marcar_vigente", { version_id: v.id });
    if (error) setMsg({ t: "error", m: "No se pudo cambiar la versión vigente." });
    else { await cargar(); setMsg({ t: "ok", m: `La versión ${v.version_number} es ahora la vigente.` }); }
  }

  if (doc === undefined) return <Cargando />;
  if (doc === null) return (
    <div className="pagina"><Cabecera titulo="Documento no disponible" volver="/documentos" />
      <Vacio titulo="Este documento no existe o tu perfil no tiene acceso a su carpeta." /></div>
  );
  const vigente = versiones.find((v) => v.is_current);
  const anteriores = versiones.filter((v) => !v.is_current);

  return (
    <div className="pagina estrecha">
      <Cabecera titulo={doc.title} volver={`/documentos/${doc.folder_id}`} sub={<span className="sub-carpeta"><Icono n="carpeta" size={15} /> {doc.folders?.name}{doc.description && ` · ${doc.description}`}</span>} />

      {msg && <Mensaje tipo={msg.t}>{msg.m}</Mensaje>}

      {vigente && (
        <section className="vigente panel" aria-labelledby="t-vig">
          <div className="vigente-cab">
            <span className="sello-vigente">Vigente</span>
            <h2 id="t-vig" className="h3">Versión {vigente.version_number}</h2>
          </div>
          <p className="vigente-archivo"><Icono n="archivo" /> <span><b>{vigente.file_name}</b><small>{tamano(vigente.size_bytes)} · {fechaHora(vigente.created_at)}{vigente.uploaded_by && autores[vigente.uploaded_by] && ` · ${autores[vigente.uploaded_by]}`}</small></span></p>
          {vigente.notes && <p className="notas">{vigente.notes}</p>}
          <div className="acciones">
            <button className="btn primario grande" onClick={() => bajar(vigente)}><Icono n="descargar" size={18} /> Descargar</button>
            <button className="btn secundario grande" onClick={() => bajar(vigente, true)}><Icono n="abrir" size={18} /> Abrir</button>
          </div>
        </section>
      )}

      {esGestor && (
        form ? (
          <form className="panel form" onSubmit={nuevaVersion}>
            <h2 className="h3">Subir versión nueva</h2>
            <p className="ayuda">Pasará a ser la versión {(versiones[0]?.version_number ?? 0) + 1} vigente. La actual se conserva en el historial.</p>
            <label>Archivo<input type="file" required accept={ACEPTA} onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
            <label>Qué cambió (opcional)<input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej.: nuevo plazo de pago" /></label>
            <div className="acciones">
              <button className="btn primario" disabled={subiendo}>{subiendo ? "Subiendo…" : "Subir versión"}</button>
              <button type="button" className="btn secundario" onClick={() => setForm(false)}>Cancelar</button>
            </div>
          </form>
        ) : <button className="btn secundario" onClick={() => setForm(true)}><Icono n="subir" size={18} /> Subir versión nueva</button>
      )}

      <section className="bloque" aria-labelledby="t-hist">
        <h2 id="t-hist" className="h2">Versiones anteriores</h2>
        {anteriores.length === 0 ? <p className="ayuda">Este documento tiene una sola versión.</p> : (
          <ol className="historial">
            {anteriores.map((v) => (
              <li key={v.id} className="hist-item">
                <span className="hist-num">v{v.version_number}</span>
                <span className="fila-txt">
                  <b>{v.file_name}</b>
                  <small>{fechaHora(v.created_at)}{v.uploaded_by && autores[v.uploaded_by] && ` · ${autores[v.uploaded_by]}`}{v.notes && ` · ${v.notes}`}</small>
                  <small className="no-vigente">No vigente: no usar para trabajar</small>
                </span>
                <span className="hist-acc">
                  <button className="icono-btn" onClick={() => bajar(v)} aria-label={`Descargar versión ${v.version_number}`} title="Descargar"><Icono n="descargar" size={18} /></button>
                  {esGestor && <button className="btn texto" onClick={() => hacerVigente(v)}>Marcar vigente</button>}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
