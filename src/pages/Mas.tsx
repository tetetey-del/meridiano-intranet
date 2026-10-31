import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { nombrePerfil, cambiarMiFoto } from "../lib/datos";
import { reducirFoto } from "../lib/imagen";
import { Icono } from "../components/Icono";
import { Avatar } from "../components/Avatar";
import { Mensaje } from "../components/Comunes";

export default function Mas() {
  const { profile, esGestor, signOut } = useAuth();
  const [msg, setMsg] = useState<{ t: "ok" | "error"; m: string } | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  if (!profile) return null;

  async function subirFoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setMsg({ t: "error", m: "Elegí una imagen (JPG o PNG)." });
    setSubiendo(true); setMsg(null);
    try { cambiarMiFoto(await reducirFoto(file)); setMsg({ t: "ok", m: "Foto actualizada. Ya se ve en el directorio." }); }
    catch (e: any) { setMsg({ t: "error", m: e.message || "No se pudo leer esa imagen. Probá con otra." }); }
    setSubiendo(false);
  }
  function quitarFoto() { cambiarMiFoto(null); setMsg({ t: "ok", m: "Foto quitada: se muestran tus iniciales." }); }

  return (
    <div className="pagina">
      <div className="perfil-mas panel">
        <Avatar nombre={profile.full_name} url={profile.avatar_url} size={64} />
        <div>
          <b>{profile.full_name}</b><small>{profile.puesto}</small><span className="chip">{nombrePerfil[profile.role]}</span>
          <div className="mi-foto">
            <label className="btn secundario">
              {subiendo ? "Subiendo…" : profile.avatar_url ? "Cambiar foto" : "Agregar foto"}
              <input type="file" accept="image/*" hidden disabled={subiendo} onChange={(e) => subirFoto(e.target.files?.[0])} />
            </label>
            {profile.avatar_url && <button className="btn texto" onClick={quitarFoto}>Quitar</button>}
          </div>
        </div>
      </div>
      {msg && <Mensaje tipo={msg.t}>{msg.m}</Mensaje>}
      <ul className="lista panel">
        <li><Link to="/calendario" className="fila"><Icono n="calendario" /><span className="fila-txt"><b>Calendario</b><small>Eventos y confirmación de asistencia</small></span><Icono n="adelante" size={18} /></Link></li>
        <li><Link to="/buscar" className="fila"><Icono n="buscar" /><span className="fila-txt"><b>Buscar</b><small>Avisos y documentos por título y contenido</small></span><Icono n="adelante" size={18} /></Link></li>
        {esGestor && <li><Link to="/gestion" className="fila"><Icono n="gestion" /><span className="fila-txt"><b>Gestión</b><small>Publicar avisos, documentos y eventos{profile.role === "admin" ? ", usuarios y lecturas" : ""}</small></span><Icono n="adelante" size={18} /></Link></li>}
      </ul>
      <button className="btn secundario ancho" onClick={signOut}><Icono n="salir" size={18} /> Cerrar sesión</button>
    </div>
  );
}
