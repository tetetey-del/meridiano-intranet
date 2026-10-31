import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { reiniciarDatos } from "../../lib/datos";
import { marca } from "../../marca";
import { Cabecera, Mensaje } from "../../components/Comunes";
import { Icono } from "../../components/Icono";

export default function Gestion() {
  const { esAdmin } = useAuth();
  const [msg, setMsg] = useState<{ t: "ok" | "error"; m: string } | null>(null);

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

  // Solo en la demo: vuelve a dejar personas, carpetas, documentos, avisos y eventos de ejemplo como al principio
  function reiniciar() {
    if (!confirm("¿Reiniciar los datos de ejemplo? Se borra todo lo creado en las pruebas (avisos, documentos, versiones, eventos, cuentas y fotos) y vuelven los datos originales.")) return;
    reiniciarDatos();
    setMsg({ t: "ok", m: "Datos de ejemplo reiniciados. Todo quedó como al principio." });
  }

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

      {esAdmin && marca.mostrarCuentasDemo && (
        <section className="panel demo-reinicio">
          <h2 className="h3">Datos de ejemplo</h2>
          <p className="ayuda">Esta es una demo. Después de probar, podés dejar todo como al principio: el equipo de 14 personas, las 5 carpetas, los documentos con sus versiones, los avisos con sus lecturas y los eventos. Es lo mismo que borrar el localStorage del navegador.</p>
          {msg && <Mensaje tipo={msg.t}>{msg.m}</Mensaje>}
          <button className="btn secundario" onClick={reiniciar}>Reiniciar datos de ejemplo</button>
        </section>
      )}
    </div>
  );
}
