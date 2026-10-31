import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabase, Folder, Perfil, nombrePerfil } from "../../lib/supabase";
import { Cabecera, Cargando, Mensaje } from "../../components/Comunes";
import { Icono } from "../../components/Icono";

type F = Folder & { documents: { count: number }[] };

export default function Carpetas() {
  const [lista, setLista] = useState<F[] | null>(null);
  const [msg, setMsg] = useState<{ t: "ok" | "error"; m: string } | null>(null);
  const [nombre, setNombre] = useState("");

  const cargar = useCallback(async () => {
    const { data } = await supabase.from("folders").select("*, documents(count)").order("sort_order").order("name");
    setLista((data ?? []) as F[]);
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  async function crear(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("folders").insert({ name: nombre.trim(), allowed_roles: ["equipo", "responsable", "admin"], sort_order: (lista?.length ?? 0) + 1 });
    if (error) setMsg({ t: "error", m: "No se pudo crear la carpeta." });
    else { setNombre(""); setMsg({ t: "ok", m: "Carpeta creada. Elegí abajo qué perfiles la ven." }); cargar(); }
  }

  if (!lista) return <Cargando />;
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
        {lista.map((c) => <FilaCarpeta key={c.id} c={c} onListo={(m) => { setMsg(m); cargar(); }} />)}
      </ul>
    </div>
  );
}

function FilaCarpeta({ c, onListo }: { c: F; onListo: (m: { t: "ok" | "error"; m: string }) => void }) {
  const [d, setD] = useState({ name: c.name, description: c.description, roles: new Set<Perfil>(c.allowed_roles) });
  const docs = c.documents?.[0]?.count ?? 0;
  const cambiado = d.name !== c.name || d.description !== c.description ||
    ["equipo", "responsable"].some((r) => d.roles.has(r as Perfil) !== c.allowed_roles.includes(r as Perfil));

  function toggle(r: Perfil) { const s = new Set(d.roles); s.has(r) ? s.delete(r) : s.add(r); setD({ ...d, roles: s }); }
  async function guardar() {
    const roles: Perfil[] = [...[...d.roles].filter((r) => r !== "admin"), "admin"];
    const { error } = await supabase.from("folders").update({ name: d.name.trim(), description: d.description.trim(), allowed_roles: roles }).eq("id", c.id);
    onListo(error ? { t: "error", m: "No se pudo guardar." } : { t: "ok", m: `Permisos de "${d.name}" guardados.` });
  }
  async function borrar() {
    if (docs > 0) return onListo({ t: "error", m: "Solo se pueden borrar carpetas vacías. Mové o borrá antes sus documentos." });
    if (!confirm(`¿Borrar la carpeta "${c.name}"?`)) return;
    const { error } = await supabase.from("folders").delete().eq("id", c.id);
    onListo(error ? { t: "error", m: "No se pudo borrar." } : { t: "ok", m: "Carpeta borrada." });
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
        <small className="ayuda">{docs} documento{docs === 1 ? "" : "s"}</small>
        <button className="btn texto" onClick={borrar}>Borrar</button>
        <button className="btn primario" disabled={!cambiado} onClick={guardar}>Guardar</button>
      </div>
    </li>
  );
}
