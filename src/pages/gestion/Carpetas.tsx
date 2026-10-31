import { FormEvent, useState } from "react";
import { carpetasVisibles, crearCarpeta, actualizarCarpeta, borrarCarpeta, nombrePerfil, Folder, Perfil } from "../../lib/datos";
import { useCambios } from "../../lib/auth";
import { Cabecera, Mensaje } from "../../components/Comunes";
import { Icono } from "../../components/Icono";

type Msg = { t: "ok" | "error"; m: string };

export default function Carpetas() {
  useCambios();
  const lista = carpetasVisibles();
  const [msg, setMsg] = useState<Msg | null>(null);
  const [nombre, setNombre] = useState("");

  function crear(e: FormEvent) {
    e.preventDefault();
    try { crearCarpeta(nombre); setNombre(""); setMsg({ t: "ok", m: "Carpeta creada. Elegí abajo qué perfiles la ven." }); }
    catch (e: any) { setMsg({ t: "error", m: e.message }); }
  }

  return (
    <div className="pagina estrecha">
      <Cabecera titulo="Carpetas y permisos" volver="/gestion"
        sub="Cada persona ve solo las carpetas marcadas para su perfil. Administración ve todas." />
      {msg && <Mensaje tipo={msg.t}>{msg.m}</Mensaje>}
      <form className="panel form en-linea" onSubmit={crear}>
        <label>Nueva carpeta<input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de la carpeta" /></label>
        <button className="btn primario"><Icono n="mas_" size={18} /> Crear</button>
      </form>
      <ul className="carpetas-admin">
        {lista.map((c) => <FilaCarpeta key={c.id + c.allowed_roles.join() + c.name} c={c} onListo={setMsg} />)}
      </ul>
    </div>
  );
}

function FilaCarpeta({ c, onListo }: { c: Folder & { documentos: number }; onListo: (m: Msg) => void }) {
  const [d, setD] = useState({ name: c.name, description: c.description, roles: new Set<Perfil>(c.allowed_roles) });
  const cambiado = d.name !== c.name || d.description !== c.description ||
    (["equipo", "responsable"] as Perfil[]).some((r) => d.roles.has(r) !== c.allowed_roles.includes(r));

  function toggle(r: Perfil) { const s = new Set(d.roles); s.has(r) ? s.delete(r) : s.add(r); setD({ ...d, roles: s }); }
  function guardar() {
    try { actualizarCarpeta(c.id, { name: d.name, description: d.description, allowed_roles: [...d.roles] }); onListo({ t: "ok", m: `Permisos de "${d.name}" guardados.` }); }
    catch (e: any) { onListo({ t: "error", m: e.message }); }
  }
  function borrar() {
    if (c.documentos === 0 && !confirm(`¿Borrar la carpeta "${c.name}"?`)) return;
    try { borrarCarpeta(c.id); onListo({ t: "ok", m: "Carpeta borrada." }); }
    catch (e: any) { onListo({ t: "error", m: e.message }); }
  }

  return (
    <li className="panel carpeta-admin">
      <div className="dos">
        <label>Nombre<input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></label>
        <label>Descripción<input value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} /></label>
      </div>
      <fieldset className="perfiles">
        <legend>La ven</legend>
        {(["equipo", "responsable"] as Perfil[]).map((r) => (
          <label key={r} className="check"><input type="checkbox" checked={d.roles.has(r)} onChange={() => toggle(r)} /> {nombrePerfil[r]}</label>
        ))}
        <label className="check fijo"><input type="checkbox" checked disabled /> Administración</label>
      </fieldset>
      <div className="acciones">
        <small className="ayuda">{c.documentos} documento{c.documentos === 1 ? "" : "s"}</small>
        <button className="btn texto" onClick={borrar}>Borrar</button>
        <button className="btn primario" disabled={!cambiado} onClick={guardar}>Guardar</button>
      </div>
    </li>
  );
}
