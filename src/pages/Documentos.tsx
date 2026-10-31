import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, Folder, nombrePerfil } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { Cabecera, Cargando, Vacio } from "../components/Comunes";
import { Icono } from "../components/Icono";

export default function Documentos() {
  const { profile, esAdmin } = useAuth();
  const [carpetas, setCarpetas] = useState<(Folder & { documents: { count: number }[] })[] | null>(null);
  useEffect(() => {
    supabase.from("folders").select("*, documents(count)").order("sort_order").order("name")
      .then(({ data }) => setCarpetas((data ?? []) as any));
  }, []);
  if (!carpetas) return <Cargando />;
  return (
    <div className="pagina">
      <Cabecera titulo="Documentos" sub={<>Ves las carpetas del perfil <b>{profile && nombrePerfil[profile.role]}</b>. Siempre se abre la versión vigente.</>}>
        {esAdmin && <Link to="/gestion/carpetas" className="btn secundario">Carpetas y permisos</Link>}
      </Cabecera>
      {carpetas.length === 0 ? <Vacio titulo="Todavía no tenés carpetas asignadas." /> : (
        <ul className="carpetas">
          {carpetas.map((c) => (
            <li key={c.id}>
              <Link to={`/documentos/${c.id}`} className="carpeta">
                <Icono n="carpeta" size={26} className="ico-carpeta" />
                <span className="fila-txt"><b>{c.name}</b><small>{c.description}</small></span>
                <span className="carpeta-num">{c.documents?.[0]?.count ?? 0}<small> doc.</small></span>
                {c.allowed_roles.length < 3 && <span className="restringida" title={"Visible para: " + c.allowed_roles.map((r) => nombrePerfil[r]).join(", ")}><Icono n="candado" size={14} /> {c.allowed_roles.map((r) => nombrePerfil[r]).join(" y ")}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
