import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase, Aviso, Profile, nombrePerfil } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { fechaHora, tamano } from "../lib/formato";
import { descargar } from "../lib/archivos";
import { Cabecera, Cargando, Mensaje, Vacio } from "../components/Comunes";
import { Anillo } from "../components/Anillo";
import { Icono } from "../components/Icono";
import { Avatar } from "../components/Avatar";

type Adj = { id: string; file_path: string; file_name: string; size_bytes: number };
type Lectura = { user_id: string; read_at: string };

export default function AvisoDetalle() {
  const { id } = useParams();
  const { profile, esGestor } = useAuth();
  const [aviso, setAviso] = useState<Aviso | null | undefined>(undefined);
  const [autor, setAutor] = useState<string>("");
  const [adjs, setAdjs] = useState<Adj[]>([]);
  const [miLectura, setMiLectura] = useState<string | null>(null);
  const [cuenta, setCuenta] = useState({ leidos: 0, total: 0 });
  const [lecturas, setLecturas] = useState<Lectura[]>([]);
  const [personas, setPersonas] = useState<Profile[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [recien, setRecien] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verPend, setVerPend] = useState(true);

  const cargarRecuento = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.rpc("recuento_lecturas");
    const r = (data ?? []).find((x: any) => x.announcement_id === id);
    if (r) setCuenta({ leidos: Number(r.leidos), total: Number(r.total) });
    if (esGestor) {
      const { data: l } = await supabase.from("announcement_reads").select("user_id, read_at").eq("announcement_id", id);
      setLecturas((l ?? []) as Lectura[]);
    }
  }, [id, esGestor]);

  useEffect(() => {
    if (!id || !profile) return;
    (async () => {
      const { data: a } = await supabase.from("announcements").select("*").eq("id", id).maybeSingle();
      setAviso(a as Aviso | null);
      if (!a) return;
      const [au, ad, mi] = await Promise.all([
        a.author_id ? supabase.from("profiles").select("full_name, puesto").eq("id", a.author_id).maybeSingle() : Promise.resolve({ data: null }),
        supabase.from("announcement_attachments").select("*").eq("announcement_id", id),
        supabase.from("announcement_reads").select("read_at").eq("announcement_id", id).eq("user_id", profile.id).maybeSingle(),
      ]);
      setAutor(au.data ? `${(au.data as any).full_name}, ${(au.data as any).puesto}` : "");
      setAdjs((ad.data ?? []) as Adj[]);
      setMiLectura(mi.data?.read_at ?? null);
      if (esGestor) {
        const { data: p } = await supabase.from("profiles").select("*").eq("active", true).order("full_name");
        setPersonas((p ?? []) as Profile[]);
      }
      cargarRecuento();
    })();
  }, [id, profile, esGestor, cargarRecuento]);

  // Recuento en tiempo real: cuando alguien confirma, se actualiza sin recargar
  useEffect(() => {
    if (!id) return;
    const canal = supabase.channel("lecturas-" + id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "announcement_reads", filter: `announcement_id=eq.${id}` },
        () => cargarRecuento())
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [id, cargarRecuento]);

  async function confirmar() {
    if (!profile || !id) return;
    setEnviando(true); setError(null);
    const ahora = new Date().toISOString();
    const { error } = await supabase.from("announcement_reads").insert({ announcement_id: id, user_id: profile.id });
    setEnviando(false);
    if (error && !error.message.includes("duplicate")) { setError("No se pudo registrar la lectura. Probá de nuevo."); return; }
    setMiLectura(ahora); setRecien(true);
    setCuenta((c) => ({ ...c, leidos: c.leidos + 1 }));
    if (esGestor) setLecturas((l) => [...l, { user_id: profile.id, read_at: ahora }]);
    cargarRecuento();
  }

  async function bajar(a: Adj) {
    try { await descargar("adjuntos", a.file_path, a.file_name); } catch (e: any) { setError(e.message); }
  }

  if (aviso === undefined) return <Cargando />;
  if (aviso === null) return <div className="pagina"><Cabecera titulo="Aviso no encontrado" volver="/avisos" /><Vacio titulo="Este aviso no existe o fue retirado." /></div>;

  const leidoPor = new Map(lecturas.map((l) => [l.user_id, l.read_at]));
  const pendientes = personas.filter((p) => !leidoPor.has(p.id));
  const hechos = personas.filter((p) => leidoPor.has(p.id))
    .sort((a, b) => leidoPor.get(b.id)!.localeCompare(leidoPor.get(a.id)!));

  return (
    <div className="pagina estrecha">
      <Cabecera titulo={aviso.title} volver="/avisos"
        sub={<>
          <span className="chip">{aviso.category}</span>
          {aviso.is_important && <span className="chip pend-suave">Importante</span>}
          <span>{fechaHora(aviso.created_at)}{autor && ` · ${autor}`}</span>
        </>} />

      <article className="aviso-cuerpo panel">
        {aviso.body.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
        {adjs.length > 0 && (
          <div className="adjuntos">
            <h2 className="h3"><Icono n="clip" size={16} /> Adjuntos</h2>
            {adjs.map((a) => (
              <button key={a.id} className="adjunto" onClick={() => bajar(a)}>
                <Icono n="archivo" /><span><b>{a.file_name}</b><small>{tamano(a.size_bytes)}</small></span><Icono n="descargar" />
              </button>
            ))}
          </div>
        )}
      </article>

      {error && <Mensaje tipo="error">{error}</Mensaje>}

      {aviso.is_important && (
        <section className={"confirmacion panel" + (miLectura ? " hecha" : "")} aria-live="polite">
          <Anillo valor={cuenta.leidos} total={cuenta.total} size={76} />
          <div className="confirmacion-txt">
            {miLectura ? (
              <>
                <p className={"sello" + (recien ? " animar" : "")}><Icono n="check" size={18} /> Lectura confirmada</p>
                <small>El {fechaHora(miLectura)}. {cuenta.leidos} de {cuenta.total} personas lo leyeron.</small>
              </>
            ) : (
              <>
                <p><b>Este aviso pide confirmación.</b></p>
                <small>{cuenta.leidos} de {cuenta.total} personas lo leyeron.</small>
                <button className="btn acento grande" onClick={confirmar} disabled={enviando}>
                  {enviando ? "Registrando…" : "Confirmar lectura"}
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {aviso.is_important && esGestor && (
        <section className="bloque" aria-labelledby="t-quien">
          <div className="bloque-cab">
            <h2 id="t-quien" className="h2">Quién lo leyó</h2>
            <div className="segmentos" role="group">
              <button className={verPend ? "activo" : ""} aria-pressed={verPend} onClick={() => setVerPend(true)}>Pendientes ({pendientes.length})</button>
              <button className={!verPend ? "activo" : ""} aria-pressed={!verPend} onClick={() => setVerPend(false)}>Leído ({hechos.length})</button>
            </div>
          </div>
          <ul className="lista panel">
            {(verPend ? pendientes : hechos).map((p) => (
              <li key={p.id} className="fila">
                <Avatar nombre={p.full_name} url={p.avatar_url} size={34} />
                <span className="fila-txt"><b>{p.full_name}</b><small>{p.puesto} · {nombrePerfil[p.role]}</small></span>
                {leidoPor.has(p.id) ? <small className="ok-txt">{fechaHora(leidoPor.get(p.id)!)}</small> : <small className="pend-txt">Sin leer</small>}
              </li>
            ))}
            {(verPend ? pendientes : hechos).length === 0 && <li className="fila"><small>{verPend ? "Todo el equipo lo leyó." : "Nadie lo leyó todavía."}</small></li>}
          </ul>
        </section>
      )}
    </div>
  );
}
