import { useState } from "react";
import { Link } from "react-router-dom";
import { resumenSemanal, destinatariosResumen, enviarResumen, enviosResumen, persona, nombrePerfil, Perfil } from "../../lib/datos";
import { useCambios } from "../../lib/auth";
import { marca } from "../../marca";
import { fecha, fechaHora, diaSemana, hora } from "../../lib/formato";
import { Cabecera, Mensaje } from "../../components/Comunes";
import { Icono } from "../../components/Icono";

const PERFILES: Perfil[] = ["equipo", "responsable", "admin"];
const cuenta = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
const corto = (iso: string) => new Date(iso).toLocaleDateString("es-CR", { day: "numeric", month: "short", timeZone: marca.zonaHoraria });

/**
 * Resumen semanal por correo (SIMULADO): no se envía ningún correo.
 * Se muestra la vista previa tal como la recibiría cada perfil y, al "enviar", queda registrado.
 */
export default function Resumen() {
  useCambios();
  const [perfil, setPerfil] = useState<Perfil>("equipo");
  const [msg, setMsg] = useState<string | null>(null);
  const r = resumenSemanal(perfil);
  const dest = destinatariosResumen();
  const total = dest.equipo + dest.responsable + dest.admin;
  const envios = enviosResumen();
  const vacio = !r.avisos.length && !r.documentos.length && !r.eventosNuevos.length && !r.proximos.length;

  function enviar() {
    if (!confirm(`¿Enviar el resumen de la semana a ${total} personas? (Simulado: queda registrado, no sale ningún correo.)`)) return;
    const e = enviarResumen();
    setMsg(`Resumen registrado como enviado a ${total} personas (${fechaHora(e.enviado_at)}). Es una simulación: no se envió ningún correo.`);
  }

  return (
    <div className="pagina estrecha">
      <Cabecera titulo="Resumen semanal" volver="/gestion"
        sub="Novedades de los últimos 7 días para todo el equipo. Cada persona recibe solo lo de las carpetas de su perfil." />

      <p className="aviso-simulado"><Icono n="correo" size={18} /> <span><b>Envío simulado.</b> La demo no manda correos: al tocar <i>Enviar resumen</i> queda registrado como enviado.</span></p>

      <div className="segmentos" role="group" aria-label="Ver la vista previa como">
        {PERFILES.map((p) => (
          <button key={p} className={p === perfil ? "activo" : ""} aria-pressed={p === perfil} onClick={() => setPerfil(p)}>
            {nombrePerfil[p]} ({dest[p]})
          </button>
        ))}
      </div>

      <article className="correo panel" aria-label="Vista previa del correo">
        <header className="correo-cab">
          <p><span>De</span> Intranet {marca.nombre}</p>
          <p><span>Para</span> {dest[perfil]} {dest[perfil] === 1 ? "persona" : "personas"} con perfil {nombrePerfil[perfil]}</p>
          <p><span>Asunto</span> <b>Resumen semanal · {corto(r.desde)} – {corto(r.hasta)}</b></p>
        </header>

        <div className="correo-cuerpo">
          <p>Hola, estas son las novedades de la intranet de la última semana.</p>

          {vacio && <p className="ayuda">No hubo novedades esta semana.</p>}

          {r.avisos.length > 0 && (
            <section>
              <h2 className="h3">Avisos nuevos ({r.avisos.length})</h2>
              <ul>
                {r.avisos.map((a) => (
                  <li key={a.id}>
                    <Link to={`/avisos/${a.id}`}>{a.title}</Link>
                    <small>{a.category} · {fecha(a.created_at)}{a.is_important && " · pide confirmación de lectura"}</small>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {r.documentos.length > 0 && (
            <section>
              <h2 className="h3">Documentos nuevos o actualizados ({r.documentos.length})</h2>
              <ul>
                {r.documentos.map((d) => (
                  <li key={d.id}>
                    <Link to={`/documentos/doc/${d.id}`}>{d.title}</Link>
                    <small>{d.carpeta} · {d.nuevo ? "nuevo" : `nueva versión vigente: v${d.version.version_number}`} · {fecha(d.version.created_at)}</small>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {r.eventosNuevos.length > 0 && (
            <section>
              <h2 className="h3">Eventos nuevos en el calendario ({r.eventosNuevos.length})</h2>
              <ul>
                {r.eventosNuevos.map((e) => (
                  <li key={e.id}><Link to="/calendario">{e.title}</Link><small>{diaSemana(e.starts_at)}, {hora(e.starts_at)}</small></li>
                ))}
              </ul>
            </section>
          )}

          {r.proximos.length > 0 && (
            <section>
              <h2 className="h3">Próximos 7 días ({r.proximos.length})</h2>
              <ul>
                {r.proximos.map((e) => (
                  <li key={e.id}><Link to="/calendario">{e.title}</Link><small>{diaSemana(e.starts_at)}, {hora(e.starts_at)}</small></li>
                ))}
              </ul>
            </section>
          )}

          <p className="ayuda">Para leer los avisos y confirmar los importantes, entrá a la intranet.</p>
        </div>
      </article>

      {msg && <Mensaje>{msg}</Mensaje>}
      <div className="acciones">
        <button className="btn primario grande" onClick={enviar}><Icono n="correo" size={18} /> Enviar resumen</button>
        <small className="ayuda">Se envía a las {total} personas activas, cada una con lo de su perfil.</small>
      </div>

      <section className="bloque" aria-labelledby="t-envios">
        <h2 id="t-envios" className="h2">Envíos anteriores</h2>
        {envios.length === 0 ? <p className="ayuda">Todavía no se envió ningún resumen.</p> : (
          <ul className="lista panel">
            {envios.map((e) => (
              <li key={e.id} className="fila">
                <Icono n="check" className="ico-doc" />
                <span className="fila-txt">
                  <b>{fechaHora(e.enviado_at)} · {cuenta(e.destinatarios.equipo + e.destinatarios.responsable + e.destinatarios.admin, "persona", "personas")}</b>
                  <small>Semana {corto(e.desde)} – {corto(e.hasta)} · {cuenta(e.avisos, "aviso", "avisos")}, {cuenta(e.documentos, "documento", "documentos")}, {cuenta(e.eventos, "evento", "eventos")} · por {persona(e.enviado_por)?.full_name ?? "—"}</small>
                </span>
                <span className="chip">Simulado</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
