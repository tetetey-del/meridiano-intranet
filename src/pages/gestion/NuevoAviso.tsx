import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, CATEGORIAS } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { slug, tamano } from "../../lib/formato";
import { Cabecera, Mensaje } from "../../components/Comunes";

export default function NuevoAviso() {
  const { profile } = useAuth();
  const nav = useNavigate();
  const [titulo, setTitulo] = useState(""); const [cuerpo, setCuerpo] = useState("");
  const [cat, setCat] = useState("General"); const [imp, setImp] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null); const [enviando, setEnviando] = useState(false);

  async function publicar(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setEnviando(true); setError(null);
    const { data: a, error } = await supabase.from("announcements")
      .insert({ title: titulo.trim(), body: cuerpo.trim(), category: cat, is_important: imp, author_id: profile.id }).select().single();
    if (error || !a) { setError("No se pudo publicar el aviso."); setEnviando(false); return; }
    for (const f of files) {
      const path = `${a.id}/${Date.now()}-${slug(f.name)}`;
      const up = await supabase.storage.from("adjuntos").upload(path, f, { contentType: f.type || "application/octet-stream" });
      if (!up.error) await supabase.from("announcement_attachments").insert({ announcement_id: a.id, file_path: path, file_name: f.name, size_bytes: f.size });
    }
    nav(`/avisos/${a.id}`);
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
        <label>Adjuntos (opcional)<input type="file" multiple onChange={(e) => setFiles([...(e.target.files ?? [])])} /></label>
        {files.length > 0 && <ul className="ayuda">{files.map((f) => <li key={f.name}>{f.name} · {tamano(f.size)}</li>)}</ul>}
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
