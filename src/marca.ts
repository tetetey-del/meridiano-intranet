/**
 * MARCA DEL CLIENTE — todo lo que se reemplaza al recibir los materiales reales.
 * - Logo: reemplazar el archivo public/marca/logo.svg (o cambiar la ruta de `logo`).
 * - Colores: cambiar los valores de `colores` (se aplican a toda la app).
 * - Fotos del directorio: se suben desde Gestión › Usuarios. Sin foto se muestran iniciales.
 */
export const marca = {
  nombre: "Academia Meridiano",
  nombreCorto: "Meridiano",
  lema: "Intranet del equipo",
  logo: "/marca/logo.svg",
  zonaHoraria: "America/Costa_Rica",
  colores: {
    principal: "#0E4A52",      // verde petróleo
    profundo: "#08343A",       // barra de navegación
    principalSuave: "#E1ECEB",
    acento: "#B07D2B",         // latón: solo para "pendiente de confirmar"
    acentoSuave: "#F6EEDD",
  },
  // Cuentas de demostración visibles en el login (poner en false para producción)
  mostrarCuentasDemo: true,
  cuentasDemo: [
    { perfil: "Equipo", email: "sofia.rojas@academiameridiano.cr" },
    { perfil: "Responsables", email: "andres.vargas@academiameridiano.cr" },
    { perfil: "Administración", email: "laura.mendez@academiameridiano.cr" },
  ],
  contrasenaDemo: "Meridiano2026!",
};

// Conexión pública con Supabase (la clave "anon" es pública por diseño; la seguridad está en las reglas RLS).
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || "https://rfctcoprhkdndcymueat.supabase.co",
  anonKey:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY3Rjb3ByaGtkbmRjeW11ZWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MzI4OTgsImV4cCI6MjEwOTAwODg5OH0.NCQgvgfuWTkmCdIvKTRNHPasoeBbUix6z9WAAGT7mT0",
};
