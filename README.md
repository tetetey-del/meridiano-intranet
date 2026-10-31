# Intranet Academia Meridiano

Intranet ligera para el equipo de una academia de oposiciones (San José, Costa Rica). Reúne en un solo sitio, pensado para el móvil, los **avisos** con confirmación de lectura, los **documentos** con versiones y permisos por perfil, el **directorio**, el **calendario** y una **búsqueda** por título y contenido.

> Nombre, logotipo, colores, personas y documentos son **ficticios** y de ejemplo, creados para esta entrega y libres de derechos. Se reemplazan siguiendo la sección *Reemplazar la marca*.

## Acceso de prueba

Contraseña de todas las cuentas: `Meridiano2026!`

| Perfil | Correo | Qué ve |
|---|---|---|
| Equipo | `sofia.rojas@academiameridiano.cr` | 3 carpetas. Lee, descarga, confirma avisos y asistencia, pone su foto |
| Responsables | `andres.vargas@academiameridiano.cr` | 4 carpetas. Además publica avisos, documentos, versiones y eventos y ve quién leyó |
| Administración | `laura.mendez@academiameridiano.cr` | 5 carpetas. Además gestiona usuarios, carpetas y permisos, y exporta lecturas |

El resto del equipo de ejemplo (14 personas) usa la misma contraseña.

## Cómo comprobar los criterios de aceptación

1. **Cada perfil ve solo sus carpetas.** Entrá con las tres cuentas y abrí *Documentos*: Equipo ve *General, Procedimientos, Convocatorias y materiales*; Responsables suma *Coordinación académica*; Administración suma *Dirección y administración*. Los permisos se aplican en la base de datos (RLS), no solo en pantalla: abrir `/documentos/<id-de-carpeta-ajena>` muestra "Carpeta no disponible".
2. **Confirmación de lectura con recuento al momento.** Con la cuenta de Equipo, abrí el aviso *Nuevo procedimiento de matrícula en línea* (9 de 14) y tocá *Confirmar lectura*: pasa a 10 de 14 al instante. Si a la vez está abierto con Responsables en otra ventana, su recuento y la lista "Quién lo leyó" se actualizan en tiempo real sin recargar.
3. **Versiones.** *Procedimiento de matrícula de alumnos* tiene la v1 guardada y la v2 marcada como *Vigente*. Con Responsables, *Subir versión nueva* crea la v3 vigente y la v2 pasa al historial. *Marcar vigente* permite volver a una versión anterior sin borrar nada.
4. **Sin acceso por URL directa.** Los archivos están en almacenamiento **privado**. Cada descarga pide al servidor un enlace firmado que caduca en 60 segundos y que solo se entrega si el perfil tiene permiso sobre esa carpeta. La ruta pública (`/storage/v1/object/public/documentos/...`) devuelve error, y un enlace firmado copiado deja de funcionar al minuto.
5. **Búsqueda por título y contenido.** *Buscar* → `SINPE` encuentra el procedimiento de matrícula por una frase que está *dentro* del PDF; `simulacro` encuentra avisos y documentos. Al subir PDF o Word se extrae su texto para indexarlo. La búsqueda también respeta los permisos: `colones` solo da resultado con Administración.
6. **Móvil.** Diseño pensado primero para el celular: barra de navegación inferior, botones grandes, descarga directa, correo y teléfono del directorio abren la app del móvil.
7. **Entrega.** Este repositorio + despliegue en Vercel.

## Tecnología

- **Frontend:** React 18 + TypeScript + Vite, CSS propio (sin frameworks de UI).
- **Backend:** Supabase: autenticación, PostgreSQL con Row Level Security, Storage privado, Realtime y una Edge Function (`admin-usuarios`) para alta de cuentas.
- **Despliegue:** Vercel (`vercel.json` incluye la redirección para rutas de la SPA).

### Estructura

```
src/
  marca.ts            ← nombre, logo, colores y cuentas demo (todo lo reemplazable)
  estilos.css         ← estilos (tokens de color al inicio)
  estilos-extra.css   ← ajustes de componentes añadidos tras las pruebas en móvil
  lib/                ← conexión Supabase, sesión, descargas seguras, extracción de texto
  components/         ← estructura, íconos, avatar, anillo de lecturas
  pages/              ← pantallas; pages/gestion/ = panel de gestión
public/marca/logo.svg ← logotipo
supabase/migrations/  ← esquema, permisos y funciones de la base de datos
supabase/functions/   ← función de servidor para gestionar usuarios
```

## Puesta en marcha

```bash
npm install
npm run dev
```

La conexión a Supabase está en `src/marca.ts` (la clave *anon* es pública por diseño; la seguridad está en las reglas RLS). Para usar otro proyecto, definí `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (ver `.env.example`) y aplicá `supabase/migrations/` y `supabase/functions/`.

### Desplegar en Vercel

1. *Add New → Project* e importar este repositorio.
2. Framework: **Vite** (se detecta solo). Build: `npm run build`. Output: `dist`.
3. *Deploy*. No hace falta configurar variables de entorno.

## Reemplazar la marca y los datos de ejemplo

- **Logo:** reemplazar `public/marca/logo.svg` (se usa también como favicon).
- **Colores y nombre:** `src/marca.ts`.
- **Fotos del directorio:** cada persona desde *Más → Agregar foto*, o administración desde *Gestión → Usuarios → Subir foto*. Se recortan y reducen solas antes de subirse. Sin foto se muestran iniciales.
- **Personas, carpetas y documentos reales:** se cargan desde *Gestión*, sin tocar código.
- **Producción:** poner `mostrarCuentasDemo: false` en `src/marca.ts` y desactivar o borrar las cuentas de ejemplo.

## Fuera de alcance

Chat, gestión de tareas, firma de documentos y control horario, según el encargo.
