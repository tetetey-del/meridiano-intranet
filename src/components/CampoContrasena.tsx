import { useState, InputHTMLAttributes } from "react";
import { Icono } from "./Icono";

/** Campo de contraseña oculta con botón para mostrarla u ocultarla. */
export function CampoContrasena(props: InputHTMLAttributes<HTMLInputElement>) {
  const [ver, setVer] = useState(false);
  return (
    <span className="campo-pass">
      <input {...props} type={ver ? "text" : "password"} />
      <button type="button" className="ver-pass" onClick={() => setVer(!ver)}
        aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={ver} title={ver ? "Ocultar" : "Mostrar"}>
        <Icono n={ver ? "ojo-no" : "ojo"} size={20} />
      </button>
    </span>
  );
}
