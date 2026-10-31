import { useState } from "react";
import { Link } from "react-router-dom";
import { eventos as listarEventos, miAsistencia, responderAsistencia, recuentoAsistencia, respuestasAsistencia, Evento } from "../lib/datos";
import { useAuth, useCambios } from "../lib/auth";
import { diaSemana, hora, mesAnio } from "../lib/formato";
import { Cabecera, Vacio } from "../components/Comunes";
import { Icono } from "../components/Icono";

const tz = "America/Costa_Rica";

export default function Calendario() {
  const { esGestor } = useAuth();
  useCambios();
  const [pasados, setPasados] = useState(false);
  const eventos = listarEventos(pasados);

  // Tocar de nuevo la opción elegida quita la respuesta
  function responder(ev: string, status: "si" | "no") {
    responderAsistencia(ev, miAsistencia(ev) === status ? null : status);
  }

  const porMes: Record<string, Evento[]> = {};
  eventos.forEach((e) => { (porMes[mesAnio(e.starts_at)] ??= []).push(e); });

  return (
    <div className="pagina estrecha">
      <Cabecera titulo="Calendario" sub="Confirmá si vas a asistir a cada evento.">
        {esGestor && <Link to="/gestion/evento" className="btn primario">Nuevo evento</Link>}
      </Cabecera>
      <div className="segmentos" role="group">
        <button className={!pasados ? "activo" : ""} aria-pressed={!pasados} onClick={() => setPasados(false)}>Próximos</button>
        <button className={pasados ? "activo" : ""} aria-pressed={pasados} onClick={() => setPasados(true)}>Pasados</button>
      </div>
      {eventos.length === 0 && <Vacio titulo={pasados ? "No hay eventos pasados." : "No hay eventos próximos."} />}
      {Object.entries(porMes).map(([mes, evs]) => (
        <section key={mes} className="bloque">
          <h2 className="h2 mes">{mes}</h2>
          <ul className="eventos">
            {evs.map((e) => {
              const r = recuentoAsistencia(e.id); const yo = miAsistencia(e.id);
              const quien = esGestor ? respuestasAsistencia(e.id) : null;
              return (
                <li key={e.id} className="evento panel">
                  <div className="evento-fecha" aria-hidden="true">
                    <b>{new Date(e.starts_at).toLocaleDateString("es-CR", { day: "numeric", timeZone: tz })}</b>
                    <small>{new Date(e.starts_at).toLocaleDateString("es-CR", { weekday: "short", timeZone: tz })}</small>
                  </div>
                  <div className="evento-txt">
                    <h3 className="h3">{e.title}</h3>
                    <p className="meta"><Icono n="reloj" size={15} /> {diaSemana(e.starts_at)}, {hora(e.starts_at)}{e.ends_at && `–${hora(e.ends_at)}`}</p>
                    {e.location && <p className="meta"><Icono n="lugar" size={15} /> {e.location}</p>}
                    {e.description && <p className="desc">{e.description}</p>}
                    {!pasados && (
                      <div className="rsvp" role="group" aria-label="¿Vas a asistir?">
                        <button className={"rsvp-btn" + (yo === "si" ? " si" : "")} aria-pressed={yo === "si"} onClick={() => responder(e.id, "si")}>
                          {yo === "si" && <Icono n="check" size={16} />} Asistiré</button>
                        <button className={"rsvp-btn" + (yo === "no" ? " no" : "")} aria-pressed={yo === "no"} onClick={() => responder(e.id, "no")}>
                          {yo === "no" && <Icono n="check" size={16} />} No asistiré</button>
                      </div>
                    )}
                    {!pasados && yo && <p className="rsvp-ayuda">Tocá de nuevo tu respuesta para quitarla.</p>}
                    <p className="rsvp-cuenta">{r.si} asistirán · {r.no} no asistirán</p>
                    {quien && (quien.si.length > 0 || quien.no.length > 0) && (
                      <details className="quien">
                        <summary>Ver respuestas</summary>
                        {quien.si.length > 0 && <p><b>Asistirán:</b> {quien.si.join(", ")}</p>}
                        {quien.no.length > 0 && <p><b>No asistirán:</b> {quien.no.join(", ")}</p>}
                      </details>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
