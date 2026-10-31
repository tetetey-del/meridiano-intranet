import { useState } from "react";
import { useParams } from "react-router-dom";
import { aviso as buscarAviso, adjuntosDe, persona, personas, recuento, miLectura, confirmarLectura, lecturas, archivoDeAdjunto, nombrePerfil } from "../lib/datos";
import { useAuth, useCambios } from "../lib/auth";
import { fechaHora, tamano } from "../lib/formato";
import { entregarArchivo } from "../lib/archivos";
import { Cabecera, Mensaje, Vacio } from "../components/Comunes";
import { Anillo } from "../components/Anillo";
import { Icono } from "../components/Icono";
import { Avatar } from "../components/Avatar";

export default function AvisoDetalle() {
  const { id = "" } = useParams();
  const { esGestor } = useAuth();
  useCambios(); // recuento al momento: se vuelve a calcular cuando alguien confirma, también desde otra pestaña
  const [recien, setRecien] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verPend, setVerPend] = useState(true);

  const aviso = buscarAviso(id);
  if (!aviso) return <div className="pagina"><Cabecera titulo="Aviso no encontrado" volver="/avisos" /><Vacio titulo="Este aviso no existe o fue retirado." /></div>;

  const autor = persona(aviso.author_id);
  const adjs = adjuntosDe(id);
  const mia = miLectura(id);
  const cuenta = recuento(id);

  function confirmar() {
    setError(null);
    try { confirmarLectura(id); setRecien(true); } catch (e: any) { setError(e.message); }
  }
  function bajar(adjId: string) {
    setError(null);
    try { const a = archivoDeAdjunto(adjId); entregarArchivo(a.blob, a.nombre); } catch (e: any) { setError(e.message); }
  }

  let pendientes: ReturnType<typeof personas> = [], hechos: ReturnType<typeof personas> = [];
  let leidoPor = new Map<string, string>();
  if (aviso.is_important && esGestor) {
    leidoPor = new Map(lecturas(id).map((l) => [l.user_id, l.read_at]));
    const gente = personas();
    pendientes = gente.filter((p) => !leidoPor.has(p.id));
    hechos = gente.filter((p) => leidoPor.has(p.id)).sort((a, b) => leidoPor.get(b.id)!.localeCompare(leidoPor.get(a.id)!));
  }
  const listaQuien = verPend ? pendientes : hechos;

  return (
    <div className="pagina estrecha">
      <Cabecera titulo={aviso.title} volver="/avisos"
        sub={<>
          <span className="chip">{aviso.category}</span>
          {aviso.is_important && <span className="chip pend-suave">Importante</span>}
          <span>{fechaHora(aviso.created_at)}{autor && ` · ${autor.full_name}, ${autor.puesto}`}</span>
        </>} />

      <article className="aviso-cuerpo panel">
        {aviso.body.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
        {adjs.length > 0 && (
          <div className="adjuntos">
            <h2 className="h3"><Icono n="clip" size={16} /> Adjuntos</h2>
            {adjs.map((a) => (
              <button key={a.id} className="adjunto" onClick={() => bajar(a.id)}>
                <Icono n="archivo" /><span><b>{a.file_name}</b><small>{tamano(a.size_bytes)}</small></span><Icono n="descargar" />
              </button>
            ))}
          </div>
        )}
      </article>

      {error && <Mensaje tipo="error">{error}</Mensaje>}

      {aviso.is_important && (
        <section className={"confirmacion panel" + (mia ? " hecha" : "")} aria-live="polite">
          <Anillo valor={cuenta.leidos} total={cuenta.total} size={76} />
          <div className="confirmacion-txt">
            {mia ? (
              <>
                <p className={"sello" + (recien ? " animar" : "")}><Icono n="check" size={18} /> Lectura confirmada</p>
                <small>El {fechaHora(mia)} · {cuenta.leidos} de {cuenta.total} personas lo leyeron.</small>
              </>
            ) : (
              <>
                <p><b>Este aviso pide confirmación.</b></p>
                <small>{cuenta.leidos} de {cuenta.total} personas lo leyeron.</small>
                <button className="btn acento grande" onClick={confirmar}>Confirmar lectura</button>
              </>
            )}
          </div>
        </section>
      )}

      {aviso.is_important && esGestor && (
        <section className="bloque" aria-labelledby="t-quien">
          <div className="bloque-cab">
            <h2 id="t-quien" className="h2">Quién lo leyó</h2>
            <div className="segmentos" role="group">
              <button className={verPend ? "activo" : ""} aria-pressed={verPend} onClick={() => setVerPend(true)}>Pendientes ({pendientes.length})</button>
              <button className={!verPend ? "activo" : ""} aria-pressed={!verPend} onClick={() => setVerPend(false)}>Leído ({hechos.length})</button>
            </div>
          </div>
          <ul className="lista panel">
            {listaQuien.map((p) => (
              <li key={p.id} className="fila">
                <Avatar nombre={p.full_name} url={p.avatar_url} size={34} />
                <span className="fila-txt"><b>{p.full_name}</b><small>{p.puesto} · {nombrePerfil[p.role]}</small></span>
                {leidoPor.has(p.id) ? <small className="ok-txt">{fechaHora(leidoPor.get(p.id)!)}</small> : <small className="pend-txt">Sin leer</small>}
              </li>
            ))}
            {listaQuien.length === 0 && <li className="fila"><small>{verPend ? "Todo el equipo lo leyó." : "Nadie lo leyó todavía."}</small></li>}
          </ul>
        </section>
      )}
    </div>
  );
}
