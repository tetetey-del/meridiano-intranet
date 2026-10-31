import { FormEvent, useMemo, useState } from "react";
import { personas, crearUsuario, actualizarUsuario, cambiarActivo, cambiarContrasena, nombrePerfil, Profile, Perfil } from "../../lib/datos";
import { useAuth, useCambios } from "../../lib/auth";
import { normalizarTexto } from "../../lib/texto";
import { reducirFoto } from "../../lib/imagen";
import { Cabecera, Mensaje } from "../../components/Comunes";
import { Avatar } from "../../components/Avatar";
import { Icono } from "../../components/Icono";
import { CampoContrasena } from "../../components/CampoContrasena";

const PERFILES: Perfil[] = ["equipo", "responsable", "admin"];
const vacio = { full_name: "", email: "", password: "", role: "equipo" as Perfil, puesto: "", area: "", phone: "" };
type Msg = { t: "ok" | "error"; m: string };

export default function Usuarios() {
  const { profile: yo } = useAuth();
  const cambios = useCambios();
  const lista = useMemo(() => personas({ incluirInactivas: true }), [cambios]);
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [f, setF] = useState(vacio);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function crear(e: FormEvent) {
    e.preventDefault(); setOcupado(true); setMsg(null);
    try {
      await crearUsuario(f);
      setMsg({ t: "ok", m: `Cuenta creada para ${f.full_name}. Pasale su correo y contraseña.` });
      setF(vacio); setNuevo(false);
    } catch (e: any) { setMsg({ t: "error", m: e.message }); }
    setOcupado(false);
  }

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
              <span className="fila-txt">
                <span className="nombre-perfil"><b>{p.full_name}</b><span className="chip">{p.active ? nombrePerfil[p.role] : "Desactivada"}</span></span>
                <small className="un-renglon" title={p.email}>{p.email}</small>
              </span>
            </button>
            {abierto === p.id && <Editor key={p.id} p={p} esYo={p.id === yo?.id} onListo={setMsg} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Editor({ p, esYo, onListo }: { p: Profile; esYo: boolean; onListo: (m: Msg) => void }) {
  const [d, setD] = useState({ full_name: p.full_name, puesto: p.puesto, area: p.area, phone: p.phone, role: p.role });
  const [pass, setPass] = useState("");

  const intentar = async (fn: () => unknown, ok: string) => {
    try { await fn(); onListo({ t: "ok", m: ok }); } catch (e: any) { onListo({ t: "error", m: e.message }); }
  };
  function guardar(e: FormEvent) { e.preventDefault(); intentar(() => actualizarUsuario(p.id, d), `Datos de ${d.full_name} guardados.`); }
  async function foto(file?: File) {
    if (!file) return;
    intentar(async () => actualizarUsuario(p.id, { avatar_url: await reducirFoto(file) }), "Foto actualizada.");
  }
  function activar(active: boolean) {
    if (!active && !confirm(`¿Desactivar la cuenta de ${p.full_name}? No podrá entrar hasta que la reactives.`)) return;
    intentar(() => cambiarActivo(p.id, active), active ? "Cuenta reactivada." : "Cuenta desactivada.");
  }
  function cambiarPass() { intentar(async () => { await cambiarContrasena(p.id, pass); setPass(""); }, `Contraseña de ${p.full_name} cambiada.`); }

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
        <div className="acciones"><button className="btn primario">Guardar cambios</button></div>
      </form>
      <div className="editor-extra">
        <label className="btn secundario">Subir foto<input type="file" accept="image/*" hidden onChange={(e) => foto(e.target.files?.[0])} /></label>
        {p.avatar_url && <button className="btn texto" onClick={() => intentar(() => actualizarUsuario(p.id, { avatar_url: null }), "Foto quitada: se muestran las iniciales.")}>Quitar foto</button>}
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
