import { Link } from "react-router-dom";
import { carpetasVisibles, nombrePerfil } from "../lib/datos";
import { useAuth, useCambios } from "../lib/auth";
import { Cabecera, Vacio } from "../components/Comunes";
import { Icono } from "../components/Icono";

export default function Documentos() {
  const { profile, esAdmin } = useAuth();
  useCambios();
  const carpetas = carpetasVisibles();
  return (
    <div className="pagina">
      <Cabecera titulo="Documentos" sub={<span>Ves las carpetas del perfil <b>{profile && nombrePerfil[profile.role]}</b>. Siempre se abre la versión vigente.</span>}>
        {esAdmin && <Link to="/gestion/carpetas" className="btn secundario">Carpetas y permisos</Link>}
      </Cabecera>
      {carpetas.length === 0 ? <Vacio titulo="Todavía no tenés carpetas asignadas." /> : (
        <ul className="carpetas">
          {carpetas.map((c) => (
            <li key={c.id}>
              <Link to={`/documentos/${c.id}`} className="carpeta">
                <Icono n="carpeta" size={26} className="ico-carpeta" />
                <span className="fila-txt"><b>{c.name}</b><small>{c.description}</small></span>
                <span className="carpeta-num">{c.documentos}<small> doc.</small></span>
                {c.allowed_roles.length < 3 && <span className="restringida" title={"Visible para: " + c.allowed_roles.map((r) => nombrePerfil[r]).join(", ")}><Icono n="candado" size={14} /> {c.allowed_roles.map((r) => nombrePerfil[r]).join(" y ")}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
