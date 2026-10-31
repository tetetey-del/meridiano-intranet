import { Link } from "react-router-dom";
import { avisos, avisosPendientes, eventos, documentosRecientes } from "../lib/datos";
import { useAuth } from "../lib/auth";
import { hace, diaSemana, hora, fecha } from "../lib/formato";
import { Vacio } from "../components/Comunes";
import { Icono } from "../components/Icono";
import { Avatar } from "../components/Avatar";

export default function Inicio() {
  const { profile } = useAuth();
  if (!profile) return null;
  const pend = avisosPendientes();
  const idsPend = new Set(pend.map((a) => a.id));
  const ultimos = avisos().filter((a) => !idsPend.has(a.id)).slice(0, 3);
  const proximos = eventos().slice(0, 3);
  const docs = documentosRecientes(4);
  const nombre = profile.full_name.split(" ")[0];
  const tz = "America/Costa_Rica";

  return (
    <div className="pagina">
      <header className="saludo">
        <div className="saludo-fila">
          <Avatar nombre={profile.full_name} url={profile.avatar_url} size={56} />
          <h1>Hola, {nombre}</h1>
        </div>
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
          {proximos.length ? (
            <ul className="lista panel">
              {proximos.map((e) => (
                <li key={e.id}><Link to="/calendario" className="fila">
                  <span className="fecha-chip"><b>{new Date(e.starts_at).toLocaleDateString("es-CR", { day: "numeric", timeZone: tz })}</b>
                    <small>{new Date(e.starts_at).toLocaleDateString("es-CR", { month: "short", timeZone: tz })}</small></span>
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
                <span className="fila-txt"><b>{d.title}</b><small>{d.carpeta} · actualizado el {fecha(d.updated_at)}</small></span>
              </Link></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
