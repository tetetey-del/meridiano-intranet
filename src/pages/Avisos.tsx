import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { avisos as listarAvisos, avisosPendientes, recuento, CATEGORIAS } from "../lib/datos";
import { useAuth, useCambios } from "../lib/auth";
import { hace } from "../lib/formato";
import { Cabecera, Vacio } from "../components/Comunes";
import { Anillo } from "../components/Anillo";

export default function Avisos() {
  const { esGestor } = useAuth();
  const cambios = useCambios();
  const [params, setParams] = useSearchParams();
  const cat = params.get("categoria") || "Todas";
  const avisos = useMemo(() => listarAvisos(), [cambios]);
  const pendientes = new Set(avisosPendientes().map((a) => a.id));

  const cats = useMemo(() => {
    const usadas = new Set(avisos.map((a) => a.category));
    return ["Todas", ...CATEGORIAS.filter((c) => usadas.has(c)), ...[...usadas].filter((c) => !CATEGORIAS.includes(c))];
  }, [avisos]);
  const lista = avisos.filter((a) => cat === "Todas" || a.category === cat);

  return (
    <div className="pagina">
      <Cabecera titulo="Avisos" sub="Los avisos importantes piden confirmación de lectura.">
        {esGestor && <Link to="/gestion/aviso" className="btn primario">Publicar aviso</Link>}
      </Cabecera>
      <div className="filtros" role="group" aria-label="Filtrar por categoría">
        {cats.map((c) => (
          <button key={c} className={"filtro" + (c === cat ? " activo" : "")} aria-pressed={c === cat}
            onClick={() => setParams(c === "Todas" ? {} : { categoria: c })}>{c}</button>
        ))}
      </div>
      {lista.length === 0 ? <Vacio titulo="No hay avisos en esta categoría." /> : (
        <ul className="lista panel">
          {lista.map((a) => {
            const pendiente = pendientes.has(a.id);
            const r = a.is_important && esGestor ? recuento(a.id) : null;
            return (
              <li key={a.id}>
                <Link to={`/avisos/${a.id}`} className={"fila aviso-fila" + (pendiente ? " es-pendiente" : "")}>
                  <span className="fila-txt">
                    <span className="aviso-meta">
                      <span className="chip">{a.category}</span>
                      {a.is_important && (pendiente
                        ? <span className="chip pend">Por confirmar</span>
                        : <span className="chip ok">Confirmado</span>)}
                    </span>
                    <b>{a.title}</b>
                    <small>{hace(a.created_at)}</small>
                  </span>
                  {r && <Anillo valor={r.leidos} total={r.total} size={48} />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
