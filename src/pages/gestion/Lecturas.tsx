import { useState } from "react";
import { Link } from "react-router-dom";
import { avisos as listarAvisos, personas, lecturas as todasLecturas, nombrePerfil, Aviso } from "../../lib/datos";
import { useCambios } from "../../lib/auth";
import { fecha, fechaHora } from "../../lib/formato";
import { Cabecera, Vacio } from "../../components/Comunes";
import { Anillo } from "../../components/Anillo";
import { Icono } from "../../components/Icono";

export default function Lecturas() {
  useCambios();
  const [soloImp, setSoloImp] = useState(true);
  const gente = personas();
  const lect = todasLecturas();
  const lista = listarAvisos().filter((a) => !soloImp || a.is_important);
  const activos = new Set(gente.map((g) => g.id));
  const leidos = (id: string) => lect.filter((l) => l.announcement_id === id && activos.has(l.user_id)).length;

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
            const n = leidos(a.id);
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
