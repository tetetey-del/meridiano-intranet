import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icono } from "./Icono";

export const Cargando = () => <div className="cargando" role="status"><span className="spinner" /> Cargando…</div>;

export function Vacio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return <div className="vacio"><p className="vacio-t">{titulo}</p>{children && <div>{children}</div>}</div>;
}

export function Cabecera({ titulo, volver, children, sub }: { titulo: string; volver?: string; children?: ReactNode; sub?: ReactNode }) {
  return (
    <header className="cabecera">
      {volver && <Link to={volver} className="volver"><Icono n="atras" size={18} /> Volver</Link>}
      <div className="cabecera-fila">
        <div><h1>{titulo}</h1>{sub && <p className="sub">{sub}</p>}</div>
        {children && <div className="cabecera-acciones">{children}</div>}
      </div>
    </header>
  );
}

export function Mensaje({ tipo = "ok", children }: { tipo?: "ok" | "error"; children: ReactNode }) {
  return <p className={"mensaje " + tipo} role={tipo === "error" ? "alert" : "status"}>{children}</p>;
}
