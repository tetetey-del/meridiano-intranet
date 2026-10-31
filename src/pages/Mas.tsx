import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { nombrePerfil } from "../lib/supabase";
import { Icono } from "../components/Icono";
import { Avatar } from "../components/Avatar";

export default function Mas() {
  const { profile, esGestor, signOut } = useAuth();
  if (!profile) return null;
  return (
    <div className="pagina">
      <div className="perfil-mas panel">
        <Avatar nombre={profile.full_name} url={profile.avatar_url} size={56} />
        <div><b>{profile.full_name}</b><small>{profile.puesto}</small><span className="chip">{nombrePerfil[profile.role]}</span></div>
      </div>
      <ul className="lista panel">
        <li><Link to="/calendario" className="fila"><Icono n="calendario" /><span className="fila-txt"><b>Calendario</b><small>Eventos y confirmación de asistencia</small></span><Icono n="adelante" size={18} /></Link></li>
        <li><Link to="/buscar" className="fila"><Icono n="buscar" /><span className="fila-txt"><b>Buscar</b><small>Avisos y documentos por título y contenido</small></span><Icono n="adelante" size={18} /></Link></li>
        {esGestor && <li><Link to="/gestion" className="fila"><Icono n="gestion" /><span className="fila-txt"><b>Gestión</b><small>Publicar avisos, documentos y eventos{profile.role === "admin" ? ", usuarios y lecturas" : ""}</small></span><Icono n="adelante" size={18} /></Link></li>}
      </ul>
      <button className="btn secundario ancho" onClick={signOut}><Icono n="salir" size={18} /> Cerrar sesión</button>
    </div>
  );
}
