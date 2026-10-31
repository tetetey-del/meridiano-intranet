import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { supabase, nombrePerfil } from "../lib/supabase";
import { marca } from "../marca";
import { Icono } from "./Icono";
import { Avatar } from "./Avatar";

export function usePendientes() {
  const { profile } = useAuth();
  const loc = useLocation();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [{ data: imp }, { data: leidos }] = await Promise.all([
        supabase.from("announcements").select("id").eq("is_important", true),
        supabase.from("announcement_reads").select("announcement_id").eq("user_id", profile.id),
      ]);
      const set = new Set((leidos ?? []).map((r) => r.announcement_id));
      setN((imp ?? []).filter((a) => !set.has(a.id)).length);
    })();
  }, [profile, loc.pathname]);
  return n;
}

export function Layout() {
  const { profile, esGestor, signOut } = useAuth();
  const pendientes = usePendientes();
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);

  const items = [
    { to: "/", n: "inicio", t: "Inicio", end: true },
    { to: "/avisos", n: "avisos", t: "Avisos", badge: pendientes },
    { to: "/documentos", n: "carpeta", t: "Documentos" },
    { to: "/directorio", n: "personas", t: "Directorio" },
    { to: "/calendario", n: "calendario", t: "Calendario" },
    { to: "/buscar", n: "buscar", t: "Buscar" },
    ...(esGestor ? [{ to: "/gestion", n: "gestion", t: "Gestión" }] : []),
  ];
  const movil = [items[0], items[1], items[2], items[3]];

  return (
    <div className="app">
      <a href="#contenido" className="saltar">Saltar al contenido</a>
      <aside className="lateral">
        <Link to="/" className="marca">
          <img src={marca.logo} alt="" width={40} height={40} />
          <span><b>{marca.nombreCorto}</b><small>{marca.lema}</small></span>
        </Link>
        <nav aria-label="Principal">
          {items.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.end} className="nav-item">
              <Icono n={i.n} /> <span>{i.t}</span>
              {!!i.badge && <span className="badge-pend" aria-label={`${i.badge} pendientes`}>{i.badge}</span>}
            </NavLink>
          ))}
        </nav>
        {profile && (
          <div className="yo">
            <Avatar nombre={profile.full_name} url={profile.avatar_url} size={36} />
            <span className="yo-txt"><b>{profile.full_name}</b><small>{nombrePerfil[profile.role]}</small></span>
            <button className="icono-btn claro" onClick={signOut} aria-label="Cerrar sesión" title="Cerrar sesión"><Icono n="salir" size={18} /></button>
          </div>
        )}
      </aside>

      <div className="barra-movil">
        <Link to="/" className="marca"><img src={marca.logo} alt="" width={32} height={32} /><b>{marca.nombreCorto}</b></Link>
        <Link to="/buscar" className="icono-btn claro" aria-label="Buscar"><Icono n="buscar" /></Link>
      </div>

      <main id="contenido" className="contenido"><Outlet /></main>

      <nav className="nav-movil" aria-label="Principal móvil">
        {movil.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.end} className="nm-item">
            <span className="nm-ico"><Icono n={i.n} size={22} />{!!i.badge && <span className="badge-pend mini">{i.badge}</span>}</span>
            <span>{i.t}</span>
          </NavLink>
        ))}
        <NavLink to="/mas" className="nm-item">
          <span className="nm-ico"><Icono n="mas" size={22} /></span><span>Más</span>
        </NavLink>
      </nav>
    </div>
  );
}
