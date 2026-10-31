import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase, Evento } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { diaSemana, hora, mesAnio } from "../lib/formato";
import { Cabecera, Cargando, Vacio } from "../components/Comunes";
import { Icono } from "../components/Icono";

type Rec = { event_id: string; si: number; no: number };

export default function Calendario() {
  const { profile, esGestor } = useAuth();
  const [eventos, setEventos] = useState<Evento[] | null>(null);
  const [mio, setMio] = useState<Record<string, string>>({});
  const [rec, setRec] = useState<Record<string, Rec>>({});
  const [nombres, setNombres] = useState<Record<string, { si: string[]; no: string[] }>>({});
  const [pasados, setPasados] = useState(false);

  const cargar = useCallback(async () => {
    if (!profile) return;
    const ahora = new Date().toISOString();
    const q = supabase.from("events").select("*");
    const [e, m, r] = await Promise.all([
      (pasados ? q.lt("starts_at", ahora).order("starts_at", { ascending: false }) : q.gte("starts_at", ahora).order("starts_at")),
      supabase.from("event_rsvps").select("event_id, status").eq("user_id", profile.id),
      supabase.rpc("recuento_asistencia"),
    ]);
    setEventos((e.data ?? []) as Evento[]);
    setMio(Object.fromEntries((m.data ?? []).map((x) => [x.event_id, x.status])));
    setRec(Object.fromEntries(((r.data ?? []) as Rec[]).map((x) => [x.event_id, x])));
    if (esGestor) {
      const { data } = await supabase.from("event_rsvps").select("event_id, status, profiles(full_name)");
      const agr: Record<string, { si: string[]; no: string[] }> = {};
      (data ?? []).forEach((x: any) => {
        agr[x.event_id] ??= { si: [], no: [] };
        agr[x.event_id][x.status as "si" | "no"].push(x.profiles?.full_name);
      });
      setNombres(agr);
    }
  }, [profile, esGestor, pasados]);
  useEffect(() => { cargar(); }, [cargar]);

  async function responder(ev: string, status: "si" | "no") {
    if (!profile) return;
    setMio((m) => ({ ...m, [ev]: status }));
    await supabase.from("event_rsvps").upsert({ event_id: ev, user_id: profile.id, status, updated_at: new Date().toISOString() });
    cargar();
  }

  if (!eventos) return <Cargando />;
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
              const r = rec[e.id]; const yo = mio[e.id];
              return (
                <li key={e.id} className="evento panel">
                  <div className="evento-fecha" aria-hidden="true">
                    <b>{new Date(e.starts_at).toLocaleDateString("es-CR", { day: "numeric", timeZone: "America/Costa_Rica" })}</b>
                    <small>{new Date(e.starts_at).toLocaleDateString("es-CR", { weekday: "short", timeZone: "America/Costa_Rica" })}</small>
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
                        <button className={"rsvp-btn" + (yo === "no" ? " no" : "")} aria-pressed={yo === "no"} onClick={() => responder(e.id, "no")}>No asistiré</button>
                      </div>
                    )}
                    <p className="rsvp-cuenta">{r ? `${r.si} asistirán · ${r.no} no asistirán` : ""}</p>
                    {esGestor && nombres[e.id] && (
                      <details className="quien">
                        <summary>Ver respuestas</summary>
                        {nombres[e.id].si.length > 0 && <p><b>Asistirán:</b> {nombres[e.id].si.join(", ")}</p>}
                        {nombres[e.id].no.length > 0 && <p><b>No asistirán:</b> {nombres[e.id].no.join(", ")}</p>}
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
