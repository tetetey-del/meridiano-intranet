import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase, Aviso, CATEGORIAS } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { hace } from "../lib/formato";
import { Cabecera, Cargando, Vacio } from "../components/Comunes";
import { Anillo } from "../components/Anillo";

type Recuento = { announcement_id: string; leidos: number; total: number };

export default function Avisos() {
  const { profile, esGestor } = useAuth();
  const [avisos, setAvisos] = useState<Aviso[] | null>(null);
  const [leidos, setLeidos] = useState<Set<string>>(new Set());
  const [rec, setRec] = useState<Record<string, Recuento>>({});
  const [params, setParams] = useSearchParams();
  const cat = params.get("categoria") || "Todas";

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [a, r, c] = await Promise.all([
        supabase.from("announcements").select("*").order("created_at", { ascending: false }),
        supabase.from("announcement_reads").select("announcement_id").eq("user_id", profile.id),
        supabase.rpc("recuento_lecturas"),
      ]);
      setAvisos((a.data ?? []) as Aviso[]);
      setLeidos(new Set((r.data ?? []).map((x) => x.announcement_id)));
      setRec(Object.fromEntries(((c.data ?? []) as Recuento[]).map((x) => [x.announcement_id, x])));
    })();
  }, [profile]);

  const cats = useMemo(() => {
    const usadas = new Set((avisos ?? []).map((a) => a.category));
    return ["Todas", ...CATEGORIAS.filter((c) => usadas.has(c)), ...[...usadas].filter((c) => !CATEGORIAS.includes(c))];
  }, [avisos]);

  if (!avisos) return <Cargando />;
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
            const pendiente = a.is_important && !leidos.has(a.id);
            const r = rec[a.id];
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
                  {a.is_important && r && esGestor && <Anillo valor={Number(r.leidos)} total={Number(r.total)} size={48} />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
