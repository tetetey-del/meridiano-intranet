import { FormEvent, useState } from "react";
import { useParams } from "react-router-dom";
import { documento as buscarDocumento, persona, subirVersion, marcarVigente, archivoDeVersion, Version } from "../lib/datos";
import { useAuth, useCambios } from "../lib/auth";
import { fechaHora, tamano } from "../lib/formato";
import { entregarArchivo, extraerTexto, ACEPTA } from "../lib/archivos";
import { Cabecera, Mensaje, Vacio } from "../components/Comunes";
import { Icono } from "../components/Icono";
import { SelectorArchivo } from "../components/SelectorArchivo";

export default function Documento() {
  const { id = "" } = useParams();
  const { esGestor } = useAuth();
  useCambios();
  const [form, setForm] = useState(false);
  const [file, setFile] = useState<File | null>(null); const [notas, setNotas] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [msg, setMsg] = useState<{ t: "ok" | "error"; m: string } | null>(null);

  // Si el perfil no puede ver la carpeta, el documento no se entrega: ni por la lista ni escribiendo la dirección a mano.
  const doc = buscarDocumento(id);
  if (!doc) return (
    <div className="pagina"><Cabecera titulo="Documento no disponible" volver="/documentos" />
      <Vacio titulo="Este documento no existe o tu perfil no tiene acceso a su carpeta." /></div>
  );
  const vigente = doc.versiones.find((v) => v.is_current);
  const anteriores = doc.versiones.filter((v) => !v.is_current);
  const autor = (v: Version) => persona(v.uploaded_by)?.full_name;

  function bajar(v: Version, abrir = false) {
    setMsg(null);
    try { const a = archivoDeVersion(v.id); entregarArchivo(a.blob, a.nombre, abrir); }
    catch (e: any) { setMsg({ t: "error", m: e.message }); }
  }

  async function nuevaVersion(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSubiendo(true); setMsg(null);
    try {
      await subirVersion(id, file, notas, await extraerTexto(file));
      setForm(false); setFile(null); setNotas("");
      setMsg({ t: "ok", m: "Versión nueva subida. La anterior queda guardada en el historial." });
    } catch (e: any) { setMsg({ t: "error", m: e.message }); }
    setSubiendo(false);
  }

  function hacerVigente(v: Version) {
    if (!confirm(`¿Marcar la versión ${v.version_number} como vigente? La versión actual seguirá en el historial.`)) return;
    try { marcarVigente(v.id); setMsg({ t: "ok", m: `La versión ${v.version_number} es ahora la vigente.` }); }
    catch (e: any) { setMsg({ t: "error", m: e.message }); }
  }

  return (
    <div className="pagina estrecha">
      <Cabecera titulo={doc.title} volver={`/documentos/${doc.folder_id}`} sub={<span className="sub-carpeta"><Icono n="carpeta" size={15} /> {doc.carpeta.name}{doc.description && ` · ${doc.description}`}</span>} />

      {msg && <Mensaje tipo={msg.t}>{msg.m}</Mensaje>}

      {vigente && (
        <section className="vigente panel" aria-labelledby="t-vig">
          <div className="vigente-cab">
            <span className="sello-vigente">Vigente</span>
            <h2 id="t-vig" className="h3">Versión {vigente.version_number}</h2>
          </div>
          <p className="vigente-archivo"><Icono n="archivo" /> <span><b>{vigente.file_name}</b><small>{tamano(vigente.size_bytes)} · {fechaHora(vigente.created_at)}{autor(vigente) && ` · ${autor(vigente)}`}</small></span></p>
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
            <p className="ayuda">Pasará a ser la versión {(doc.versiones[0]?.version_number ?? 0) + 1} vigente. La actual se conserva en el historial.</p>
            <SelectorArchivo etiqueta="Archivo de la nueva versión" accept={ACEPTA} requerido archivos={file ? [file] : []} onCambio={(f) => setFile(f[0] ?? null)} />
            <label>Qué cambió (opcional)<input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej.: nuevo plazo de pago" /></label>
            <div className="acciones">
              <button className="btn primario" disabled={subiendo}>{subiendo ? "Subiendo…" : "Subir versión"}</button>
              <button type="button" className="btn secundario" onClick={() => setForm(false)}>Cancelar</button>
            </div>
          </form>
        ) : <button className="btn primario grande" onClick={() => setForm(true)}><Icono n="subir" size={18} /> Subir versión nueva</button>
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
                  <small>{fechaHora(v.created_at)}{autor(v) && ` · ${autor(v)}`}{v.notes && ` · ${v.notes}`}</small>
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
