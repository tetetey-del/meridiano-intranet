import { useId } from "react";
import { Icono } from "./Icono";
import { tamano } from "../lib/formato";

/** Selector de archivos propio: botón claro y nombre del archivo visible (reemplaza el control del navegador). */
export function SelectorArchivo({ etiqueta, archivos, onCambio, accept, multiple = false, requerido = false }: {
  etiqueta: string; archivos: File[]; onCambio: (f: File[]) => void;
  accept?: string; multiple?: boolean; requerido?: boolean;
}) {
  const id = useId();
  return (
    <div className="selector">
      <span className="selector-etiqueta">{etiqueta}</span>
      <input id={id} type="file" className="selector-input" accept={accept} multiple={multiple}
        required={requerido && archivos.length === 0}
        onChange={(e) => onCambio([...(e.target.files ?? [])])} />
      <label htmlFor={id} className={"selector-zona" + (archivos.length ? " lleno" : "")}>
        {archivos.length === 0 ? (
          <>
            <span className="selector-ico"><Icono n="subir" size={22} /></span>
            <span className="selector-txt"><b>Elegir {multiple ? "archivos" : "archivo"}</b><small>Del celular o la computadora</small></span>
          </>
        ) : (
          <>
            <span className="selector-ico"><Icono n="archivo" size={22} /></span>
            <span className="selector-txt">
              {archivos.map((f) => <b key={f.name + f.size}>{f.name} <small>· {tamano(f.size)}</small></b>)}
              <small className="selector-cambiar">Tocá para cambiar</small>
            </span>
          </>
        )}
      </label>
    </div>
  );
}
