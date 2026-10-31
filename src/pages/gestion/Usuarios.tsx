import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabase, Profile, Perfil, nombrePerfil } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { adminUsuarios } from "../../lib/adminApi";
import { normalizarTexto } from "../../lib/texto";
import { Cabecera, Cargando, Mensaje } from "../../components/Comunes";
import { Avatar } from "../../components/Avatar";
import { Icono } from "../../components/Icono";
import { CampoContrasena } from "../../components/CampoContrasena";
import { reducirFoto } from "../../lib/imagen";

const PERFILES: Perfil[] = ["equipo", "responsable", "admin"];
const vacio = { full_name: "", email: "", password: "", role: "equipo" as Perfil, puesto: "", area: "", phone: "" };

export default function Usuarios() {
  const { profile: yo, refresh } = useAuth();
  const [lista, setLista] = useState<Profile[] | null>(null);
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [f, setF] = useState(vacio);
  const [msg, setMsg] = useState<{ t: "ok" | "error"; m: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    const { data } = await supabase.from("profiles").select("*").order("active", { ascending: false }).order("full_name");
    setLista((data ?? []) as Profile[]);
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  async function crear(e: FormEvent) {
    e.preventDefault(); setOcupado(true); setMsg(null);
    try {
      await adminUsuarios({ action: "crear", ...f });
      setMsg({ t: "ok", m: `Cuenta creada para ${f.full_name}. Pasale su correo y contraseña.` });
      setF(vacio); setNuevo(false); cargar();
    } catch (e: any) { setMsg({ t: "error", m: e.message }); }
    setOcupado(false);
  }

  if (!lista) return <Cargando />;
  const n = normalizarTexto(q);
  const vis = lista.filter((p) => !n || normalizarTexto(`${p.full_name} ${p.email} ${p.puesto}`).includes(n));
  const activos = lista.filter((p) => p.active).length;

  return (
    <div className="pagina estrecha">
      <Cabecera titulo="Usuarios" volver="/gestion" sub={`${activos} cuentas activas`}>
        {!nuevo && <button className="btn primario" onClick={() => setNuevo(true)}><Icono n="mas_" size={18} /> Nueva cuenta</button>}
      </Cabecera>
      {msg && <Mensaje tipo={msg.t}>{msg.m}</Mensaje>}

      {nuevo && (
        <form className="panel form" onSubmit={crear}>
          <h2 className="h3">Nueva cuenta</h2>
          <label>Nombre y apellidos<input required value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></label>
          <div className="dos">
            <label>Correo<input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
            <label>Contraseña inicial<CampoContrasena required minLength={8} autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="Mínimo 8 caracteres" /></label>
          </div>
          <div className="dos">
            <label>Puesto<input value={f.puesto} onChange={(e) => setF({ ...f, puesto: e.target.value })} /></label>
            <label>Área<input value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} placeholder="Ej.: Profesorado" /></label>
          </div>
          <div className="dos">
            <label>Teléfono<input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+506 8888-0000" /></label>
            <label>Perfil<select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Perfil })}>{PERFILES.map((r) => <option key={r} value={r}>{nombrePerfil[r]}</option>)}</select></label>
          </div>
          <div className="acciones">
            <button className="btn primario" disabled={ocupado}>{ocupado ? "Creando…" : "Crear cuenta"}</button>
            <button type="button" className="btn secundario" onClick={() => setNuevo(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="buscador-local"><Icono n="buscar" size={18} />
        <input type="search" placeholder="Buscar persona" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar persona" /></div>

      <ul className="lista panel">
        {vis.map((p) => (
          <li key={p.id} className={p.active ? "" : "inactivo"}>
            <button className="fila fila-btn" aria-expanded={abierto === p.id} onClick={() => setAbierto(abierto === p.id ? null : p.id)}>
              <Avatar nombre={p.full_name} url={p.avatar_url} size={38} />
              <span className="fila-txt"><b>{p.full_name}</b><small>{p.email}</small></span>
              <span className="chip">{p.active ? nombrePerfil[p.role] : "Desactivada"}</span>
            </button>
            {abierto === p.id && <Editor p={p} esYo={p.id === yo?.id}
              onListo={(m) => { setMsg(m); cargar(); if (p.id === yo?.id) refresh(); }} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Editor({ p, esYo, onListo }: { p: Profile; esYo: boolean; onListo: (m: { t: "ok" | "error"; m: string }) => void }) {
  const [d, setD] = useState({ full_name: p.full_name, puesto: p.puesto, area: p.area, phone: p.phone, role: p.role });
  const [pass, setPass] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault(); setOcupado(true);
    const { error } = await supabase.from("profiles").update(d).eq("id", p.id);
    setOcupado(false);
    onListo(error ? { t: "error", m: "No se pudieron guardar los cambios." } : { t: "ok", m: `Datos de ${d.full_name} guardados.` });
  }
  async function foto(file?: File) {
    if (!file) return;
    let img: Blob;
    try { img = await reducirFoto(file); } catch { return onListo({ t: "error", m: "No se pudo leer esa imagen. Probá con otra." }); }
    const path = `${p.id}/${Date.now()}.jpg`;
    const up = await supabase.storage.from("avatares").upload(path, img, { upsert: true, contentType: "image/jpeg" });
    if (up.error) return onListo({ t: "error", m: "No se pudo subir la foto." });
    const url = supabase.storage.from("avatares").getPublicUrl(path).data.publicUrl;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", p.id);
    onListo({ t: "ok", m: "Foto actualizada." });
  }
  async function quitarFoto() {
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", p.id);
    onListo({ t: "ok", m: "Foto quitada: se muestran las iniciales." });
  }
  async function activar(active: boolean) {
    if (!active && !confirm(`¿Desactivar la cuenta de ${p.full_name}? No podrá entrar hasta que la reactives.`)) return;
    try { await adminUsuarios({ action: "activar", id: p.id, active }); onListo({ t: "ok", m: active ? "Cuenta reactivada." : "Cuenta desactivada." }); }
    catch (e: any) { onListo({ t: "error", m: e.message }); }
  }
  async function cambiarPass() {
    try { await adminUsuarios({ action: "contrasena", id: p.id, password: pass }); setPass(""); onListo({ t: "ok", m: `Contraseña de ${p.full_name} cambiada.` }); }
    catch (e: any) { onListo({ t: "error", m: e.message }); }
  }

  return (
    <div className="editor">
      <form className="form" onSubmit={guardar}>
        <label>Nombre<input value={d.full_name} onChange={(e) => setD({ ...d, full_name: e.target.value })} /></label>
        <div className="dos">
          <label>Puesto<input value={d.puesto} onChange={(e) => setD({ ...d, puesto: e.target.value })} /></label>
          <label>Área<input value={d.area} onChange={(e) => setD({ ...d, area: e.target.value })} /></label>
        </div>
        <div className="dos">
          <label>Teléfono<input value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value })} /></label>
          <label>Perfil
            <select value={d.role} disabled={esYo} onChange={(e) => setD({ ...d, role: e.target.value as Perfil })}>
              {PERFILES.map((r) => <option key={r} value={r}>{nombrePerfil[r]}</option>)}
            </select>
          </label>
        </div>
        {esYo && <small className="ayuda">No podés cambiar tu propio perfil para no quedarte sin acceso a la gestión.</small>}
        <div className="acciones"><button className="btn primario" disabled={ocupado}>Guardar cambios</button></div>
      </form>
      <div className="editor-extra">
        <label className="btn secundario">Subir foto<input type="file" accept="image/*" hidden onChange={(e) => foto(e.target.files?.[0])} /></label>
        {p.avatar_url && <button className="btn texto" onClick={quitarFoto}>Quitar foto</button>}
      </div>
      <div className="editor-extra">
        <CampoContrasena aria-label="Nueva contraseña" autoComplete="new-password" placeholder="Nueva contraseña (mín. 8)" value={pass} onChange={(e) => setPass(e.target.value)} />
        <button className="btn secundario" disabled={pass.length < 8} onClick={cambiarPass}>Cambiar contraseña</button>
      </div>
      {!esYo && (p.active
        ? <button className="btn peligro" onClick={() => activar(false)}>Desactivar cuenta</button>
        : <button className="btn secundario" onClick={() => activar(true)}>Reactivar cuenta</button>)}
    </div>
  );
}
