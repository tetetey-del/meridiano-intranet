import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, Aviso, Evento, Doc } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { hace, diaSemana, hora, fecha } from "../lib/formato";
import { Cargando, Vacio } from "../components/Comunes";
import { Icono } from "../components/Icono";

export default function Inicio() {
  const { profile } = useAuth();
  const [pend, setPend] = useState<Aviso[] | null>(null);
  const [ultimos, setUltimos] = useState<Aviso[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [docs, setDocs] = useState<(Doc & { folders: { name: string } })[]>([]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [a, r, e, d] = await Promise.all([
        supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("announcement_reads").select("announcement_id").eq("user_id", profile.id),
        supabase.from("events").select("*").gte("starts_at", new Date().toISOString()).order("starts_at").limit(3),
        supabase.from("documents").select("*, folders(name)").order("updated_at", { ascending: false }).limit(4),
      ]);
      const leidos = new Set((r.data ?? []).map((x) => x.announcement_id));
      const todos = (a.data ?? []) as Aviso[];
      setPend(todos.filter((x) => x.is_important && !leidos.has(x.id)));
      setUltimos(todos.filter((x) => !(x.is_important && !leidos.has(x.id))).slice(0, 3));
      setEventos((e.data ?? []) as Evento[]);
      setDocs((d.data ?? []) as any);
    })();
  }, [profile]);

  if (!pend) return <Cargando />;
  const nombre = profile?.full_name.split(" ")[0];

  return (
    <div className="pagina">
      <header className="saludo">
        <h1>Hola, {nombre}</h1>
        <p className="sub">{pend.length
          ? `Tenés ${pend.length} aviso${pend.length > 1 ? "s" : ""} importante${pend.length > 1 ? "s" : ""} por confirmar.`
          : "Estás al día con los avisos importantes."}</p>
      </header>

      {pend.length > 0 && (
        <section aria-labelledby="t-pend" className="bloque">
          <h2 id="t-pend" className="h2">Por confirmar</h2>
          <ul className="pendientes">
            {pend.map((a) => (
              <li key={a.id}>
                <Link to={`/avisos/${a.id}`} className="pendiente">
                  <span className="pendiente-marca" aria-hidden="true" />
                  <span className="pendiente-txt">
                    <b>{a.title}</b>
                    <small>{a.category} · {hace(a.created_at)}</small>
                  </span>
                  <span className="pendiente-cta">Leer y confirmar</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="rejilla-inicio">
        <section className="bloque" aria-labelledby="t-av">
          <div className="bloque-cab"><h2 id="t-av" className="h2">Últimos avisos</h2><Link to="/avisos" className="enlace">Ver todos</Link></div>
          {ultimos.length ? (
            <ul className="lista panel">
              {ultimos.map((a) => (
                <li key={a.id}><Link to={`/avisos/${a.id}`} className="fila">
                  <span className="fila-txt"><b>{a.title}</b><small>{a.category} · {hace(a.created_at)}</small></span>
                  <Icono n="adelante" size={18} />
                </Link></li>
              ))}
            </ul>
          ) : <Vacio titulo="No hay avisos nuevos." />}
        </section>

        <section className="bloque" aria-labelledby="t-ev">
          <div className="bloque-cab"><h2 id="t-ev" className="h2">Próximos eventos</h2><Link to="/calendario" className="enlace">Calendario</Link></div>
          {eventos.length ? (
            <ul className="lista panel">
              {eventos.map((e) => (
                <li key={e.id}><Link to="/calendario" className="fila">
                  <span className="fecha-chip"><b>{new Date(e.starts_at).toLocaleDateString("es-CR", { day: "numeric", timeZone: "America/Costa_Rica" })}</b>
                    <small>{new Date(e.starts_at).toLocaleDateString("es-CR", { month: "short", timeZone: "America/Costa_Rica" })}</small></span>
                  <span className="fila-txt"><b>{e.title}</b><small>{diaSemana(e.starts_at)} · {hora(e.starts_at)}</small></span>
                </Link></li>
              ))}
            </ul>
          ) : <Vacio titulo="No hay eventos próximos." />}
        </section>

        <section className="bloque" aria-labelledby="t-doc">
          <div className="bloque-cab"><h2 id="t-doc" className="h2">Documentos actualizados</h2><Link to="/documentos" className="enlace">Documentos</Link></div>
          <ul className="lista panel">
            {docs.map((d) => (
              <li key={d.id}><Link to={`/documentos/doc/${d.id}`} className="fila">
                <Icono n="archivo" className="ico-doc" />
                <span className="fila-txt"><b>{d.title}</b><small>{d.folders?.name} · actualizado el {fecha(d.updated_at)}</small></span>
              </Link></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
