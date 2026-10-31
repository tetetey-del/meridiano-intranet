import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase, Folder, Doc, Version } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { fecha, tamano } from "../lib/formato";
import { subirVersion, ACEPTA } from "../lib/subir";
import { Cabecera, Cargando, Mensaje, Vacio } from "../components/Comunes";
import { Icono } from "../components/Icono";
import { SelectorArchivo } from "../components/SelectorArchivo";

export default function Carpeta() {
  const { id } = useParams();
  const { profile, esGestor } = useAuth();
  const nav = useNavigate();
  const [carpeta, setCarpeta] = useState<Folder | null | undefined>(undefined);
  const [docs, setDocs] = useState<(Doc & { document_versions: Version[] })[]>([]);
  const [nuevo, setNuevo] = useState(false);
  const [titulo, setTitulo] = useState(""); const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null); const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.from("folders").select("*").eq("id", id!).maybeSingle();
      setCarpeta(c as Folder | null);
      if (!c) return;
      const { data } = await supabase.from("documents").select("*, document_versions(*)").eq("folder_id", id!).order("title");
      setDocs((data ?? []) as any);
    })();
  }, [id]);

  async function crear(e: FormEvent) {
    e.preventDefault();
    if (!file || !profile || !carpeta) return;
    setSubiendo(true); setError(null);
    const { data: d, error } = await supabase.from("documents")
      .insert({ folder_id: carpeta.id, title: titulo.trim(), description: desc.trim(), created_by: profile.id }).select().single();
    if (error || !d) { setError("No se pudo crear el documento."); setSubiendo(false); return; }
    try { await subirVersion(carpeta.id, d.id, file, "Versión inicial", profile.id); nav(`/documentos/doc/${d.id}`); }
    catch (e: any) { await supabase.from("documents").delete().eq("id", d.id); setError(e.message); setSubiendo(false); }
  }

  if (carpeta === undefined) return <Cargando />;
  if (carpeta === null) return (
    <div className="pagina"><Cabecera titulo="Carpeta no disponible" volver="/documentos" />
      <Vacio titulo="Esta carpeta no existe o tu perfil no tiene acceso." /></div>
  );

  return (
    <div className="pagina">
      <Cabecera titulo={carpeta.name} volver="/documentos" sub={carpeta.description}>
        {esGestor && !nuevo && <button className="btn primario" onClick={() => setNuevo(true)}><Icono n="mas_" size={18} /> Nuevo documento</button>}
      </Cabecera>
      {esGestor && <p className="ayuda nota-version">¿Querés actualizar un documento que ya existe? Entrá en él y usá <b>Subir versión nueva</b>: así se conserva el historial.</p>}

      {nuevo && (
        <form className="panel form" onSubmit={crear}>
          <h2 className="h3">Nuevo documento en {carpeta.name}</h2>
          <label>Título<input required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej.: Procedimiento de reserva de aulas" /></label>
          <label>Descripción breve (opcional)<input value={desc} onChange={(e) => setDesc(e.target.value)} /></label>
          <SelectorArchivo etiqueta="Archivo" accept={ACEPTA} requerido archivos={file ? [file] : []} onCambio={(f) => setFile(f[0] ?? null)} />
          <small className="ayuda">PDF, Word, Excel, PowerPoint, texto o imagen, hasta 50 MB. El texto de PDF y Word se incluye en la búsqueda.</small>
          {error && <Mensaje tipo="error">{error}</Mensaje>}
          <div className="acciones">
            <button className="btn primario" disabled={subiendo}>{subiendo ? "Subiendo…" : "Subir documento"}</button>
            <button type="button" className="btn secundario" onClick={() => setNuevo(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {docs.length === 0 ? <Vacio titulo="Esta carpeta está vacía." /> : (
        <ul className="lista panel">
          {docs.map((d) => {
            const v = d.document_versions.find((x) => x.is_current);
            return (
              <li key={d.id}><Link to={`/documentos/doc/${d.id}`} className="fila">
                <Icono n="archivo" className="ico-doc" />
                <span className="fila-txt"><b>{d.title}</b>
                  <small>{v ? `v${v.version_number} vigente · ${tamano(v.size_bytes)} · ${fecha(v.created_at)}` : "Sin archivo"}
                    {d.document_versions.length > 1 && ` · ${d.document_versions.length} versiones`}</small>
                </span>
                <Icono n="adelante" size={18} />
              </Link></li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
