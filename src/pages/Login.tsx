import { FormEvent, useState } from "react";
import { iniciarSesion } from "../lib/datos";
import { marca } from "../marca";
import { Mensaje } from "../components/Comunes";
import { CampoContrasena } from "../components/CampoContrasena";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setError(null); setCargando(true);
    const err = await iniciarSesion(email, pass);
    setCargando(false);
    if (err) setError(err);
  }

  return (
    <div className="login">
      <div className="login-panel">
        <img src={marca.logo} alt="" width={64} height={64} className="login-logo" />
        <h1>{marca.nombre}</h1>
        <p className="sub">{marca.lema}. Entrá con el correo y la contraseña que te dio administración.</p>
        <form onSubmit={entrar} className="form">
          <label>Correo
            <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>Contraseña
            <CampoContrasena autoComplete="current-password" required value={pass} onChange={(e) => setPass(e.target.value)} />
          </label>
          {error && <Mensaje tipo="error">{error}</Mensaje>}
          <button className="btn primario grande" disabled={cargando}>{cargando ? "Entrando…" : "Entrar"}</button>
        </form>
        <p className="nota">¿Olvidaste la contraseña? Pedí una nueva a administración.</p>

        {marca.mostrarCuentasDemo && (
          <details className="demo">
            <summary>Cuentas de prueba (una por perfil)</summary>
            <p>Contraseña de todas: <code>{marca.contrasenaDemo}</code></p>
            <ul>
              {marca.cuentasDemo.map((c) => (
                <li key={c.email}>
                  <button type="button" className="enlace" onClick={() => { setEmail(c.email); setPass(marca.contrasenaDemo); }}>
                    {c.perfil}
                  </button>
                  <span>{c.email}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
