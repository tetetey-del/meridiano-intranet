import { iniciales } from "../lib/formato";

// Avatar con iniciales generado (sin fotos de terceros). Si administración sube una foto, se muestra la foto.
const tonos = ["#0E4A52", "#2F6B5E", "#3D5A73", "#6B5B3E", "#4F4A6B", "#5E6B2F"];
export function Avatar({ nombre, url, size = 44 }: { nombre: string; url?: string | null; size?: number }) {
  const tono = tonos[[...nombre].reduce((a, c) => a + c.charCodeAt(0), 0) % tonos.length];
  if (url) return <img className="avatar" src={url} alt="" width={size} height={size} style={{ width: size, height: size }} />;
  return (
    <span className="avatar" aria-hidden="true"
      style={{ width: size, height: size, background: tono, fontSize: size * 0.36 }}>
      {iniciales(nombre)}
    </span>
  );
}
