import { useMemo, useState } from "react";
import { personas } from "../lib/datos";
import { useCambios } from "../lib/auth";
import { normalizarTexto } from "../lib/texto";
import { Cabecera, Vacio } from "../components/Comunes";
import { Avatar } from "../components/Avatar";
import { Icono } from "../components/Icono";

export default function Directorio() {
  const cambios = useCambios();
  const gente = useMemo(() => personas(), [cambios]);
  const [q, setQ] = useState(""); const [area, setArea] = useState("Todas");
  const areas = useMemo(() => ["Todas", ...[...new Set(gente.map((p) => p.area).filter(Boolean))].sort()], [gente]);
  const n = normalizarTexto(q);
  const lista = gente.filter((p) => (area === "Todas" || p.area === area) &&
    (!n || normalizarTexto(`${p.full_name} ${p.puesto} ${p.area} ${p.email}`).includes(n)));

  return (
    <div className="pagina">
      <Cabecera titulo="Directorio" sub={`${gente.length} personas en el equipo`} />
      <div className="buscador-local">
        <Icono n="buscar" size={18} />
        <input type="search" placeholder="Buscar por nombre, puesto o área" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar en el directorio" />
      </div>
      <div className="filtros" role="group" aria-label="Filtrar por área">
        {areas.map((a) => <button key={a} className={"filtro" + (a === area ? " activo" : "")} aria-pressed={a === area} onClick={() => setArea(a)}>{a}</button>)}
      </div>
      {lista.length === 0 ? <Vacio titulo="Nadie coincide con esa búsqueda." /> : (
        <ul className="directorio">
          {lista.map((p) => (
            <li key={p.id} className="ficha">
              <Avatar nombre={p.full_name} url={p.avatar_url} size={56} />
              <div className="ficha-txt">
                <b>{p.full_name}</b>
                <span>{p.puesto}</span>
                {p.area && <small>{p.area}</small>}
              </div>
              <div className="ficha-contacto">
                <a href={`mailto:${p.email}`} className="contacto"><Icono n="correo" size={17} /><span>{p.email}</span></a>
                {p.phone && <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="contacto"><Icono n="telefono" size={17} /><span>{p.phone}</span></a>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
