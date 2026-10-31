import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearEvento } from "../../lib/datos";
import { localCRaISO } from "../../lib/formato";
import { Cabecera, Mensaje } from "../../components/Comunes";

export default function NuevoEvento() {
  const nav = useNavigate();
  const [f, setF] = useState({ title: "", description: "", location: "", inicio: "", fin: "" });
  const [error, setError] = useState<string | null>(null); const [enviando, setEnviando] = useState(false);
  const set = (k: keyof typeof f) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function crear(e: FormEvent) {
    e.preventDefault();
    if (f.fin && f.fin <= f.inicio) { setError("La hora de fin tiene que ser posterior al inicio."); return; }
    setEnviando(true);
    try {
      crearEvento({ title: f.title, description: f.description.trim(), location: f.location.trim(),
        starts_at: localCRaISO(f.inicio), ends_at: f.fin ? localCRaISO(f.fin) : null });
      nav("/calendario");
    } catch (e: any) { setError(e.message); setEnviando(false); }
  }

  return (
    <div className="pagina estrecha">
      <Cabecera titulo="Nuevo evento" volver="/gestion" sub="Horario de Costa Rica." />
      <form className="panel form" onSubmit={crear}>
        <label>Título<input required value={f.title} onChange={set("title")} placeholder="Ej.: Claustro de profesores" /></label>
        <div className="dos">
          <label>Empieza<input type="datetime-local" required value={f.inicio} onChange={set("inicio")} /></label>
          <label>Termina (opcional)<input type="datetime-local" value={f.fin} onChange={set("fin")} /></label>
        </div>
        <label>Lugar<input value={f.location} onChange={set("location")} placeholder="Ej.: Aula magna" /></label>
        <label>Descripción<textarea rows={4} value={f.description} onChange={set("description")} /></label>
        {error && <Mensaje tipo="error">{error}</Mensaje>}
        <div className="acciones"><button className="btn primario grande" disabled={enviando}>{enviando ? "Creando…" : "Crear evento"}</button></div>
      </form>
    </div>
  );
}
