const P: Record<string, string> = {
  inicio: "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  avisos: "M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1Zm12-2a5 5 0 0 1 0 8m2.5-10.5a8.5 8.5 0 0 1 0 13",
  carpeta: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  personas: "M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m13 9v-1a4 4 0 0 0-3-3.9M16 3.1a3.5 3.5 0 0 1 0 6.8",
  calendario: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 2v4m8-4v4",
  buscar: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14m10 3-5-5",
  gestion: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6m7.4-3a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2.2-1.3L14.3 3h-4l-.4 2.4a7 7 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2.2 1.3l.4 2.4h4l.4-2.4a7 7 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3",
  mas: "M5 12h.01M12 12h.01M19 12h.01",
  descargar: "M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M4 19h16",
  abrir: "M14 4h6v6m0-6-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  archivo: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zm0 0v5h5M9 13h6m-6 4h6",
  check: "m5 12.5 4.5 4.5L19 7.5",
  salir: "M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5m5 5H3",
  atras: "M15 5l-7 7 7 7",
  adelante: "m9 5 7 7-7 7",
  clip: "m20 11-8.6 8.6a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4L14.5 7",
  subir: "M12 20V9m0 0-4.5 4.5M12 9l4.5 4.5M4 5h16",
  mas_: "M12 5v14M5 12h14",
  reloj: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18m0-14v5l3 2",
  lugar: "M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21m0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
  correo: "M4 6h16v12H4zm0 0 8 7 8-7",
  telefono: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  exportar: "M12 3v12m0-12L7.5 7.5M12 3l4.5 4.5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6",
  cerrar: "M6 6l12 12M18 6 6 18",
  candado: "M6 11h12v10H6zm2 0V7a4 4 0 0 1 8 0v4",
};
export function Icono({ n, size = 20, className }: { n: keyof typeof P | string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={n === "mas" ? 3.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={P[n] ?? ""} />
    </svg>
  );
}
