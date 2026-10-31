import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { buscar, Resultado } from "../lib/datos";
import { useCambios } from "../lib/auth";
import { fecha } from "../lib/formato";
import { normalizarTexto } from "../lib/texto";
import { Cabecera, Vacio } from "../components/Comunes";
import { Icono } from "../components/Icono";

function Resaltar({ texto, q }: { texto: string; q: string }) {
  const n = normalizarTexto(q); const t = normalizarTexto(texto);
  const i = n ? t.indexOf(n) : -1;
  if (i < 0) return <>{texto}</>;
  return <>{texto.slice(0, i)}<mark>{texto.slice(i, i + q.trim().length)}</mark>{texto.slice(i + q.trim().length)}</>;
}

export default function Buscar() {
  useCambios();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  useEffect(() => {
    const t = setTimeout(() => setParams(q.trim() ? { q: q.trim() } : {}, { replace: true }), 300);
    return () => clearTimeout(t);
  }, [q, setParams]);

  const termino = q.trim();
  const res: Resultado[] | null = termino.length >= 2 ? buscar(termino) : null;
  const docs = (res ?? []).filter((r) => r.tipo === "documento");
  const avisos = (res ?? []).filter((r) => r.tipo === "aviso");

  return (
    <div className="pagina estrecha">
      <Cabecera titulo="Buscar" sub="Busca en títulos y dentro del contenido de avisos y documentos." />
      <div className="buscador-grande">
        <Icono n="buscar" />
        <input ref={ref} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej.: matrícula, simulacro, SINPE" aria-label="Buscar" />
      </div>
      {res && res.length === 0 && <Vacio titulo={`Sin resultados para "${termino}".`}>Probá con otra palabra o revisá la ortografía.</Vacio>}
      {res && res.length > 0 && <p className="ayuda">{res.length} resultado{res.length > 1 ? "s" : ""} en las carpetas de tu perfil.</p>}
      {([["Documentos", docs], ["Avisos", avisos]] as const).map(([t, lista]) => lista.length > 0 && (
        <section key={t} className="bloque">
          <h2 className="h2">{t}</h2>
          <ul className="lista panel">
            {lista.map((r) => (
              <li key={r.id}><Link to={r.tipo === "aviso" ? `/avisos/${r.id}` : `/documentos/doc/${r.id}`} className="fila resultado">
                <Icono n={r.tipo === "aviso" ? "avisos" : "archivo"} className="ico-doc" />
                <span className="fila-txt">
                  <b><Resaltar texto={r.titulo} q={termino} /></b>
                  {r.contexto && <span className="contexto"><Resaltar texto={r.contexto} q={termino} /></span>}
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
