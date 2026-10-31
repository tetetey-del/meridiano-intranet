import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, Aviso, Profile, nombrePerfil } from "../../lib/supabase";
import { fecha, fechaHora } from "../../lib/formato";
import { Cabecera, Cargando, Vacio } from "../../components/Comunes";
import { Anillo } from "../../components/Anillo";
import { Icono } from "../../components/Icono";

type Lectura = { announcement_id: string; user_id: string; read_at: string };

export default function Lecturas() {
  const [avisos, setAvisos] = useState<Aviso[] | null>(null);
  const [gente, setGente] = useState<Profile[]>([]);
  const [lect, setLect] = useState<Lectura[]>([]);
  const [soloImp, setSoloImp] = useState(true);

  useEffect(() => {
    (async () => {
      const [a, p, l] = await Promise.all([
        supabase.from("announcements").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").eq("active", true).order("full_name"),
        supabase.from("announcement_reads").select("*"),
      ]);
      setAvisos((a.data ?? []) as Aviso[]); setGente((p.data ?? []) as Profile[]); setLect((l.data ?? []) as Lectura[]);
    })();
  }, []);

  if (!avisos) return <Cargando />;
  const lista = avisos.filter((a) => !soloImp || a.is_important);
  const activos = new Set(gente.map((g) => g.id));
  const leidos = (id: string) => lect.filter((l) => l.announcement_id === id && activos.has(l.user_id));

  function exportar(sel: Aviso[]) {
    const c = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const filas = [["Aviso", "Categoría", "Publicado", "Persona", "Correo", "Puesto", "Perfil", "Estado", "Fecha de lectura"].map(c).join(";")];
    for (const a of sel) {
      const mapa = new Map(lect.filter((l) => l.announcement_id === a.id).map((l) => [l.user_id, l.read_at]));
      for (const g of gente) {
        const r = mapa.get(g.id);
        filas.push([a.title, a.category, fecha(a.created_at), g.full_name, g.email, g.puesto, nombrePerfil[g.role],
          r ? "Leído" : "Pendiente", r ? fechaHora(r) : ""].map(c).join(";"));
      }
    }
    // BOM + punto y coma: Excel en español lo abre con acentos y columnas correctas
    const blob = new Blob(["﻿" + filas.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url; el.download = `lecturas-${sel.length === 1 ? sel[0].title.slice(0, 40) : "avisos"}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(el); el.click(); el.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  return (
    <div className="pagina estrecha">
      <Cabecera titulo="Lecturas" volver="/gestion" sub="Quién leyó cada aviso. La exportación se abre en Excel.">
        <button className="btn primario" onClick={() => exportar(lista)} disabled={!lista.length}><Icono n="exportar" size={18} /> Exportar todo</button>
      </Cabecera>
      <label className="check"><input type="checkbox" checked={soloImp} onChange={(e) => setSoloImp(e.target.checked)} /> Solo avisos con confirmación de lectura</label>
      {lista.length === 0 ? <Vacio titulo="No hay avisos para mostrar." /> : (
        <ul className="lista panel">
          {lista.map((a) => {
            const n = leidos(a.id).length;
            return (
              <li key={a.id} className="fila">
                <Anillo valor={n} total={gente.length} size={50} />
                <Link to={`/avisos/${a.id}`} className="fila-txt enlace-fila"><b>{a.title}</b>
                  <small>{a.category} · {fecha(a.created_at)} · {gente.length - n} pendientes</small></Link>
                <button className="icono-btn" onClick={() => exportar([a])} aria-label={`Exportar lecturas de ${a.title}`} title="Exportar"><Icono n="exportar" size={18} /></button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
