import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicarAviso, CATEGORIAS } from "../../lib/datos";
import { Cabecera, Mensaje } from "../../components/Comunes";
import { SelectorArchivo } from "../../components/SelectorArchivo";

export default function NuevoAviso() {
  const nav = useNavigate();
  const [titulo, setTitulo] = useState(""); const [cuerpo, setCuerpo] = useState("");
  const [cat, setCat] = useState("General"); const [imp, setImp] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null); const [enviando, setEnviando] = useState(false);

  async function publicar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true); setError(null);
    try { nav(`/avisos/${await publicarAviso({ title: titulo, body: cuerpo, category: cat, is_important: imp }, files)}`); }
    catch (e: any) { setError(e.message); setEnviando(false); }
  }

  return (
    <div className="pagina estrecha">
      <Cabecera titulo="Publicar aviso" volver="/gestion" />
      <form className="panel form" onSubmit={publicar}>
        <label>Título<input required maxLength={140} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej.: Cambio de horario del simulacro" /></label>
        <label>Categoría
          <select value={cat} onChange={(e) => setCat(e.target.value)}>{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label>Texto del aviso<textarea required rows={8} value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} placeholder="Dejá una línea en blanco para separar párrafos." /></label>
        <SelectorArchivo etiqueta="Adjuntos (opcional, hasta 1,5 MB cada uno)" multiple archivos={files} onCambio={setFiles} />
        <label className="check-grande">
          <input type="checkbox" checked={imp} onChange={(e) => setImp(e.target.checked)} />
          <span><b>Importante: pedir confirmación de lectura</b><small>Cada persona verá un botón para confirmar y podrás ver el recuento de quién lo leyó.</small></span>
        </label>
        {error && <Mensaje tipo="error">{error}</Mensaje>}
        <div className="acciones"><button className="btn primario grande" disabled={enviando}>{enviando ? "Publicando…" : "Publicar aviso"}</button></div>
      </form>
    </div>
  );
}
