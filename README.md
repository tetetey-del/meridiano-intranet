# Intranet Academia Meridiano

Intranet ligera para el equipo de una academia de oposiciones (San José, Costa Rica). Reúne en un solo sitio, pensado para el móvil, los **avisos** con confirmación de lectura, los **documentos** con versiones y permisos por perfil, el **directorio**, el **calendario** y una **búsqueda** por título y contenido.

Funciona **solo en el navegador**: no usa servidor, base de datos ni servicios externos. Todo el estado se guarda en el `localStorage` y la sesión en el `sessionStorage`.

> Nombre, logotipo, colores, personas y documentos son **ficticios** y de ejemplo, creados para esta entrega y libres de derechos. Se reemplazan siguiendo la sección *Reemplazar la marca*.

## Acceso de prueba

Contraseña de todas las cuentas: `Meridiano2026!` (en la pantalla de acceso hay un desplegable que completa los datos).

| Perfil | Correo | Qué ve |
|---|---|---|
| Equipo | `sofia.rojas@academiameridiano.cr` | 3 carpetas. Lee, descarga, confirma avisos y asistencia, pone su foto |
| Responsables | `andres.vargas@academiameridiano.cr` | 4 carpetas. Además publica avisos, documentos, versiones y eventos y ve quién leyó |
| Administración | `laura.mendez@academiameridiano.cr` | 5 carpetas. Además gestiona usuarios, carpetas y permisos, exporta lecturas y reinicia la demo |

El resto del equipo de ejemplo (14 personas) usa la misma contraseña.

## Cómo comprobar los criterios de aceptación

1. **Cada perfil ve solo sus carpetas.** Entrá con las tres cuentas y abrí *Documentos*: Equipo ve *General, Procedimientos, Convocatorias y materiales*; Responsables suma *Coordinación académica*; Administración suma *Dirección y administración*.
2. **Confirmación de lectura con recuento al momento.** Abrí el aviso *Nuevo procedimiento de matrícula en línea* con Responsables en una pestaña (9 de 14). En **otra pestaña** del mismo navegador entrá con Equipo y tocá *Confirmar lectura*: pasa a 10 de 14 al instante y la pestaña de Responsables se actualiza sola, sin recargar, incluida la lista "Quién lo leyó". (Cada pestaña tiene su propia sesión porque la sesión vive en `sessionStorage`.)
3. **Versiones.** *Procedimiento de matrícula de alumnos* tiene la v1 guardada y la v2 marcada como *Vigente*. Con Responsables, *Subir versión nueva* crea la v3 vigente y la v2 pasa al historial con la etiqueta "No vigente". *Marcar vigente* permite volver a una versión anterior sin borrar nada.
4. **Sin acceso por URL directa.** Los archivos no tienen ninguna dirección propia: se guardan dentro del `localStorage` y solo se entregan al tocar *Descargar* o *Abrir*, después de comprobar que el perfil puede ver la carpeta (se crea una dirección temporal `blob:` que se descarta). Escribir a mano la dirección de un documento o carpeta de otro perfil (por ejemplo `/documentos/doc/d8` o `/documentos/f5` con la cuenta de Equipo) muestra "no disponible".
5. **Búsqueda por título y contenido.** *Buscar* → `SINPE` encuentra el aviso y el procedimiento de matrícula por una frase que está *dentro* del PDF. Al subir PDF o Word se extrae su texto en el navegador para indexarlo. La búsqueda respeta los permisos: `colones` (dentro del presupuesto confidencial) solo da resultado con Administración.
6. **Móvil.** Diseño pensado primero para el celular: barra de navegación inferior, botones grandes, descarga directa (en iPhone, Safari pide confirmar antes de guardar), correo y teléfono del directorio abren la app del móvil.
7. **Entrega.** Este repositorio + despliegue en Vercel.

## Qué está simulado y cómo se comporta

- **Usuarios y acceso:** las cuentas viven en el `localStorage`; de cada contraseña solo se guarda su huella SHA-256, nunca el texto. La sesión se guarda en `sessionStorage` y caduca sola al cerrar la pestaña.
- **Permisos:** se comprueban en `src/lib/datos.ts` en cada lectura y escritura, no solo ocultando botones: las pantallas solo reciben lo que el perfil puede ver.
- **Archivos:** se guardan en base64 dentro del `localStorage`, con un máximo de **1,5 MB por archivo** (el navegador da unos 5 MB en total). Si no queda espacio, la app lo avisa.
- **Recuento "en tiempo real":** las pestañas del mismo navegador se enteran de los cambios por el evento `storage`; no hay servidor.
- **Correos: no se envían.** No hay correos de bienvenida, de recuperación de contraseña ni de aviso. Administración crea la cuenta con una contraseña inicial en *Gestión → Usuarios* y se la pasa a la persona; si alguien la olvida, Administración le pone una nueva desde la misma pantalla. Los avisos nuevos se ven al entrar (en *Inicio* y con un número en *Avisos*).
- **Pagos y WhatsApp: no hay.** El encargo no los incluye. Los botones de correo y teléfono del *Directorio* abren la app de correo o de llamadas del dispositivo.
- **Datos por navegador:** cada navegador tiene su propia copia de los datos; lo que se cambia en un dispositivo no se ve en otro.
- **Contenido de ejemplo:** las 14 personas, sus correos (dominio ficticio) y teléfonos, los 8 documentos (PDF generados en el navegador a partir de su texto), los 5 avisos con sus lecturas y los 4 eventos están en `src/datos/ejemplo.ts`. Las fotos del directorio son iniciales generadas.

## Datos de ejemplo y cómo reiniciarlos

La primera vez que se abre la intranet, los datos de ejemplo se cargan solos en el `localStorage`. Para volver a ese estado hay dos formas:

- **Borrar el localStorage** del sitio (herramientas del navegador → *Application* → *Local Storage* → borrar). Al recargar se vuelven a cargar los datos de ejemplo.
- Con la cuenta de **Administración**: *Gestión → Reiniciar datos de ejemplo* (hace lo mismo sin abrir las herramientas del navegador).

Todas las claves de la intranet empiezan por `meridiano:`.

## Puesta en marcha

```bash
npm install
npm run dev
```

No hace falta configurar nada: no hay variables de entorno ni claves.

### Desplegar en Vercel

1. *Add New → Project* e importar este repositorio.
2. Framework: **Vite** (se detecta solo). Build: `npm run build`. Output: `dist`.
3. *Deploy*. `vercel.json` incluye la redirección para las rutas de la app.

## Dónde está cada cosa

```
src/
  marca.ts              ← nombre, logo, colores, zona horaria y cuentas de demo (todo lo reemplazable)
  lib/datos.ts          ← almacén local: datos, sesión, permisos, archivos, búsqueda y reinicio
  datos/ejemplo.ts      ← datos de ejemplo (personas, documentos con su texto, avisos…)
  lib/pdf.ts            ← genera los PDF de ejemplo en el navegador a partir de su texto
  lib/auth.tsx          ← sesión actual y actualización automática de pantallas (useCambios)
  lib/archivos.ts       ← descarga segura y extracción de texto de PDF/Word para la búsqueda
  lib/imagen.ts         ← recorte y reducción de fotos de perfil
  components/           ← estructura, íconos, avatar, anillo de lecturas, selector de archivos
  pages/                ← pantallas; pages/gestion/ = panel de gestión
  estilos.css           ← estilos (tokens de color al inicio)
  estilos-extra.css     ← ajustes de componentes añadidos tras las pruebas en móvil
public/marca/logo.svg   ← logotipo
```

Tecnología: React 18 + TypeScript + Vite, CSS propio, tipografías incluidas en el proyecto (Public Sans y Source Serif 4, licencia OFL). Para leer PDF y Word se usan `pdfjs-dist` y `mammoth`, que funcionan dentro del navegador.

## Reemplazar la marca y los datos de ejemplo

- **Logo:** reemplazar `public/marca/logo.svg` (se usa también como favicon).
- **Colores y nombre:** `src/marca.ts`.
- **Fotos del directorio:** cada persona desde *Más → Agregar foto*, o administración desde *Gestión → Usuarios → Subir foto*. Se recortan y reducen solas.
- **Personas, carpetas y documentos reales:** se cargan desde *Gestión*, sin tocar código.
- **Sin cuentas de demo:** poner `mostrarCuentasDemo: false` en `src/marca.ts` (también oculta el botón de reinicio).

## Fuera de alcance

Chat, gestión de tareas, firma de documentos y control horario, según el encargo.
