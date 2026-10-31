import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fecha } from "../lib/formato";
import { normalizarTexto } from "../lib/texto";
import { Cabecera, Vacio } from "../components/Comunes";
import { Icono } from "../components/Icono";

type R = { tipo: "aviso" | "documento"; id: string; titulo: string; contexto: string; extra: string; fecha: string };

function Resaltar({ texto, q }: { texto: string; q: string }) {
  const n = normalizarTexto(q); const t = normalizarTexto(texto);
  const i = n ? t.indexOf(n) : -1;
  if (i < 0) return <>{texto}</>;
  return <>{texto.slice(0, i)}<mark>{texto.slice(i, i + q.trim().length)}</mark>{texto.slice(i + q.trim().length)}</>;
}

export default function Buscar() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [res, setRes] = useState<R[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);
  useEffect(() => {
    const t = setTimeout(async () => {
      const termino = q.trim();
      setParams(termino ? { q: termino } : {}, { replace: true });
      if (termino.length < 2) { setRes(null); return; }
      setCargando(true);
      const { data } = await supabase.rpc("buscar", { q: termino });
      setRes((data ?? []) as R[]); setCargando(false);
    }, 280);
    return () => clearTimeout(t);
  }, [q, setParams]);

  const docs = (res ?? []).filter((r) => r.tipo === "documento");
  const avisos = (res ?? []).filter((r) => r.tipo === "aviso");

  return (
    <div className="pagina estrecha">
      <Cabecera titulo="Buscar" sub="Busca en títulos y dentro del contenido de avisos y documentos." />
      <div className="buscador-grande">
        <Icono n="buscar" />
        <input ref={ref} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej.: matrícula, simulacro, SINPE" aria-label="Buscar" />
      </div>
      {cargando && <p className="ayuda">Buscando…</p>}
      {res && !cargando && res.length === 0 && <Vacio titulo={`Sin resultados para "${q.trim()}".`}>Probá con otra palabra o revisá la ortografía.</Vacio>}
      {res && res.length > 0 && <p className="ayuda">{res.length} resultado{res.length > 1 ? "s" : ""} en las carpetas de tu perfil.</p>}
      {[["Documentos", docs], ["Avisos", avisos]].map(([t, lista]) => (lista as R[]).length > 0 && (
        <section key={t as string} className="bloque">
          <h2 className="h2">{t as string}</h2>
          <ul className="lista panel">
            {(lista as R[]).map((r) => (
              <li key={r.id}><Link to={r.tipo === "aviso" ? `/avisos/${r.id}` : `/documentos/doc/${r.id}`} className="fila resultado">
                <Icono n={r.tipo === "aviso" ? "avisos" : "archivo"} className="ico-doc" />
                <span className="fila-txt">
                  <b><Resaltar texto={r.titulo} q={q} /></b>
                  {r.contexto && <span className="contexto"><Resaltar texto={r.contexto} q={q} /></span>}
                  <small>{r.extra} · {fecha(r.fecha)}</small>
                </span>
              </Link></li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
