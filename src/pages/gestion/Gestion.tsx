import { Link } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { Cabecera } from "../../components/Comunes";
import { Icono } from "../../components/Icono";

export default function Gestion() {
  const { esAdmin } = useAuth();
  const op = [
    { to: "/gestion/aviso", n: "avisos", t: "Publicar un aviso", d: "Con categoría, adjuntos y confirmación de lectura si es importante." },
    { to: "/documentos", n: "carpeta", t: "Subir un documento o una versión nueva", d: "Entrá a la carpeta o al documento y usá el botón de subir." },
    { to: "/gestion/evento", n: "calendario", t: "Crear un evento", d: "Aparece en el calendario para que el equipo confirme asistencia." },
    ...(esAdmin ? [
      { to: "/gestion/usuarios", n: "personas", t: "Usuarios y perfiles", d: "Dar de alta, cambiar perfil, foto y datos, desactivar o cambiar contraseña." },
      { to: "/gestion/carpetas", n: "candado", t: "Carpetas y permisos", d: "Crear carpetas y elegir qué perfiles ven cada una." },
      { to: "/gestion/lecturas", n: "exportar", t: "Lecturas y exportación", d: "Quién leyó cada aviso importante. Descarga en Excel (CSV)." },
    ] : []),
  ];
  return (
    <div className="pagina estrecha">
      <Cabecera titulo="Gestión" sub="¿Qué querés hacer?" />
      <ul className="lista panel">
        {op.map((o) => (
          <li key={o.to}><Link to={o.to} className="fila gestion-op">
            <span className="gestion-ico"><Icono n={o.n} /></span>
            <span className="fila-txt"><b>{o.t}</b><small>{o.d}</small></span>
            <Icono n="adelante" size={18} />
          </Link></li>
        ))}
      </ul>
    </div>
  );
}
