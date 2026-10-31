/** Recuento de lecturas como un meridiano que se completa. */
export function Anillo({ valor, total, size = 72, etiqueta = true }: { valor: number; total: number; size?: number; etiqueta?: boolean }) {
  const r = 15.5, c = 2 * Math.PI * r;
  const p = total ? Math.min(valor / total, 1) : 0;
  const completo = total > 0 && valor >= total;
  return (
    <div className={"anillo" + (completo ? " completo" : "")} style={{ width: size, height: size }}
      role="img" aria-label={`${valor} de ${total} lo leyeron`}>
      <svg viewBox="0 0 36 36" width={size} height={size}>
        <circle cx="18" cy="18" r={r} className="anillo-fondo" />
        <ellipse cx="18" cy="18" rx="6" ry={r} className="anillo-meridiano" />
        <circle cx="18" cy="18" r={r} className="anillo-valor"
          strokeDasharray={`${c * p} ${c}`} transform="rotate(-90 18 18)" />
      </svg>
      {etiqueta && <span className="anillo-num"><b>{valor}</b><small>/{total}</small></span>}
    </div>
  );
}
