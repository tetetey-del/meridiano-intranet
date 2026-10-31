/**
 * MARCA DEL CLIENTE — todo lo que se reemplaza al recibir los materiales reales.
 * - Logo: reemplazar el archivo public/marca/logo.svg (o cambiar la ruta de `logo`).
 * - Colores: cambiar los valores de `colores` (se aplican a toda la app).
 * - Fotos del directorio: cada persona desde Más › Agregar foto. Sin foto se muestran iniciales.
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
