import { FormEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { carpeta as buscarCarpeta, documentosDeCarpeta, crearDocumento } from "../lib/datos";
import { useAuth, useCambios } from "../lib/auth";
import { fecha, tamano } from "../lib/formato";
import { extraerTexto, ACEPTA } from "../lib/archivos";
import { Cabecera, Mensaje, Vacio } from "../components/Comunes";
import { Icono } from "../components/Icono";
import { SelectorArchivo } from "../components/SelectorArchivo";

export default function Carpeta() {
  const { id = "" } = useParams();
  const { esGestor } = useAuth();
  useCambios();
  const nav = useNavigate();
  const [nuevo, setNuevo] = useState(false);
  const [titulo, setTitulo] = useState(""); const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null); const [subiendo, setSubiendo] = useState(false);

  const carpeta = buscarCarpeta(id);
  if (!carpeta) return (
    <div className="pagina"><Cabecera titulo="Carpeta no disponible" volver="/documentos" />
      <Vacio titulo="Esta carpeta no existe o tu perfil no tiene acceso." /></div>
  );
  const docs = documentosDeCarpeta(id);

  async function crear(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSubiendo(true); setError(null);
    try { nav(`/documentos/doc/${await crearDocumento(id, titulo, desc, file, await extraerTexto(file))}`); }
    catch (e: any) { setError(e.message); setSubiendo(false); }
  }

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
          <small className="ayuda">PDF, Word, Excel, PowerPoint, texto o imagen, hasta 1,5 MB (se guarda en el navegador). El texto de PDF y Word se incluye en la búsqueda.</small>
          {error && <Mensaje tipo="error">{error}</Mensaje>}
          <div className="acciones">
            <button className="btn primario" disabled={subiendo}>{subiendo ? "Subiendo…" : "Subir documento"}</button>
            <button type="button" className="btn secundario" onClick={() => setNuevo(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {docs.length === 0 ? <Vacio titulo="Esta carpeta está vacía." /> : (
        <ul className="lista panel">
          {docs.map((d) => (
            <li key={d.id}><Link to={`/documentos/doc/${d.id}`} className="fila">
              <Icono n="archivo" className="ico-doc" />
              <span className="fila-txt"><b>{d.title}</b>
                <small>{d.vigente ? `v${d.vigente.version_number} vigente · ${tamano(d.vigente.size_bytes)} · ${fecha(d.vigente.created_at)}` : "Sin archivo"}
                  {d.versiones > 1 && ` · ${d.versiones} versiones`}</small>
              </span>
              <Icono n="adelante" size={18} />
            </Link></li>
          ))}
        </ul>
      )}
    </div>
  );
}
