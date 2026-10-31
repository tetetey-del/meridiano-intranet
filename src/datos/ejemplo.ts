/**
 * DATOS DE EJEMPLO (ficticios, libres de derechos). Se cargan en el localStorage la primera vez y al reiniciar.
 * Los PDF de ejemplo se generan en el navegador a partir de `content_text` (ver lib/pdf.ts).
 * Contraseña de todas las cuentas: Meridiano2026! (aquí solo se guarda su huella SHA-256).
 */
export const EJEMPLO = {
  "hashDemo": "dee1ea6b6fb16424c0d034e766d37fd4d0d54a6d2b6354338186c9d14b45f3b8",
  "usuarios": [
    {
      "id": "u01",
      "email": "laura.mendez@academiameridiano.cr",
      "full_name": "Laura Méndez Solís",
      "role": "admin",
      "puesto": "Directora general",
      "area": "Dirección",
      "phone": "+506 8812-4410"
    },
    {
      "id": "u02",
      "email": "carlos.araya@academiameridiano.cr",
      "full_name": "Carlos Araya Mora",
      "role": "admin",
      "puesto": "Jefe de administración",
      "area": "Administración",
      "phone": "+506 8890-1123"
    },
    {
      "id": "u03",
      "email": "andres.vargas@academiameridiano.cr",
      "full_name": "Andrés Vargas Pérez",
      "role": "responsable",
      "puesto": "Coordinador académico",
      "area": "Coordinación",
      "phone": "+506 8703-5521"
    },
    {
      "id": "u04",
      "email": "mariela.jimenez@academiameridiano.cr",
      "full_name": "Mariela Jiménez Castro",
      "role": "responsable",
      "puesto": "Coordinadora de convocatorias",
      "area": "Coordinación",
      "phone": "+506 8721-6630"
    },
    {
      "id": "u05",
      "email": "paola.herrera@academiameridiano.cr",
      "full_name": "Paola Herrera Rojas",
      "role": "responsable",
      "puesto": "Coordinadora de profesorado",
      "area": "Coordinación",
      "phone": "+506 8834-2297"
    },
    {
      "id": "u06",
      "email": "sofia.rojas@academiameridiano.cr",
      "full_name": "Sofía Rojas Alfaro",
      "role": "equipo",
      "puesto": "Profesora de Derecho Administrativo",
      "area": "Profesorado",
      "phone": "+506 8655-9012"
    },
    {
      "id": "u07",
      "email": "daniela.quesada@academiameridiano.cr",
      "full_name": "Daniela Quesada Mora",
      "role": "equipo",
      "puesto": "Profesora de Matemática y Razonamiento",
      "area": "Profesorado",
      "phone": "+506 8610-3344"
    },
    {
      "id": "u08",
      "email": "josepablo.solano@academiameridiano.cr",
      "full_name": "José Pablo Solano Vega",
      "role": "equipo",
      "puesto": "Profesor de Derecho Constitucional",
      "area": "Profesorado",
      "phone": "+506 8677-4508"
    },
    {
      "id": "u09",
      "email": "valeria.chaves@academiameridiano.cr",
      "full_name": "Valeria Chaves Núñez",
      "role": "equipo",
      "puesto": "Profesora de Redacción y Ortografía",
      "area": "Profesorado",
      "phone": "+506 8699-7781"
    },
    {
      "id": "u10",
      "email": "esteban.monge@academiameridiano.cr",
      "full_name": "Esteban Monge Arias",
      "role": "equipo",
      "puesto": "Profesor de Pruebas Psicométricas",
      "area": "Profesorado",
      "phone": "+506 8643-1209"
    },
    {
      "id": "u11",
      "email": "fabian.calderon@academiameridiano.cr",
      "full_name": "Fabián Calderón Ureña",
      "role": "equipo",
      "puesto": "Profesor de Legislación Laboral",
      "area": "Profesorado",
      "phone": "+506 8620-5576"
    },
    {
      "id": "u12",
      "email": "gabriela.umana@academiameridiano.cr",
      "full_name": "Gabriela Umaña Soto",
      "role": "equipo",
      "puesto": "Orientadora académica",
      "area": "Orientación",
      "phone": "+506 8758-8812"
    },
    {
      "id": "u13",
      "email": "natalia.villalobos@academiameridiano.cr",
      "full_name": "Natalia Villalobos Cruz",
      "role": "equipo",
      "puesto": "Secretaría y atención al alumnado",
      "area": "Secretaría",
      "phone": "+506 8741-0065"
    },
    {
      "id": "u14",
      "email": "ricardo.brenes@academiameridiano.cr",
      "full_name": "Ricardo Brenes Campos",
      "role": "equipo",
      "puesto": "Soporte técnico y aulas",
      "area": "Servicios",
      "phone": "+506 8766-3390"
    }
  ],
  "documentos": [
    {
      "id": "d1",
      "folder_id": "f2",
      "title": "Procedimiento de matrícula de alumnos",
      "description": "Pasos para inscribir a un alumno nuevo y validar su documentación."
    },
    {
      "id": "d2",
      "folder_id": "f2",
      "title": "Protocolo de simulacros de examen",
      "description": "Cómo preparar, aplicar y corregir los simulacros."
    },
    {
      "id": "d3",
      "folder_id": "f1",
      "title": "Guía de bienvenida para nuevo personal",
      "description": "Todo lo necesario para la primera semana."
    },
    {
      "id": "d4",
      "folder_id": "f1",
      "title": "Normas de uso de las aulas",
      "description": "Reserva de aulas, equipos y limpieza."
    },
    {
      "id": "d5",
      "folder_id": "f3",
      "title": "Calendario de convocatorias 2027",
      "description": "Fechas previstas de los concursos para los que preparamos."
    },
    {
      "id": "d6",
      "folder_id": "f3",
      "title": "Temario resumido - Técnico administrativo",
      "description": "Bloques temáticos y bibliografía recomendada."
    },
    {
      "id": "d7",
      "folder_id": "f4",
      "title": "Plan de evaluación del trimestre",
      "description": "Criterios de evaluación y calendario de seguimiento."
    },
    {
      "id": "d8",
      "folder_id": "f5",
      "title": "Presupuesto y tarifas 2027",
      "description": "Tarifas por curso y previsión de gastos (confidencial)."
    }
  ],
  "versiones": [
    {
      "id": "d1-v1",
      "document_id": "d1",
      "version_number": 1,
      "file_name": "procedimiento-matricula-v1.pdf",
      "notes": "Versión inicial",
      "content_text": "Procedimiento de matrícula de alumnos - Versión 1\n1. El alumno completa la ficha de inscripción en papel en secretaría.\n2. Secretaría solicita copia de la cédula de identidad y del título de bachillerato.\n3. El pago de la matrícula se realiza en efectivo o por transferencia en un plazo de 5 días hábiles.\n4. Secretaría envía el horario por correo electrónico."
    },
    {
      "id": "d1-v2",
      "document_id": "d1",
      "version_number": 2,
      "file_name": "procedimiento-matricula-v2.pdf",
      "notes": "Matrícula en línea y pago por SINPE Móvil",
      "content_text": "Procedimiento de matrícula de alumnos - Versión 2 (vigente)\n1. El alumno completa el formulario de inscripción en línea; ya no se acepta la ficha en papel.\n2. Secretaría verifica la cédula de identidad y el título de bachillerato en formato digital.\n3. El pago de la matrícula se realiza por SINPE Móvil o transferencia en un plazo de 3 días hábiles.\n4. La coordinación asigna grupo según la convocatoria elegida y lo comunica en 48 horas.\n5. Secretaría entrega la guía del alumno y el acceso al aula virtual."
    },
    {
      "id": "d2-v1",
      "document_id": "d2",
      "version_number": 1,
      "file_name": "protocolo-simulacros.pdf",
      "notes": "",
      "content_text": "Protocolo de simulacros de examen\nLos simulacros se realizan el último viernes de cada mes en el aula magna.\nEl profesor responsable entrega el examen impreso a coordinación con 72 horas de antelación.\nDuración máxima: 3 horas. No se permite el uso de teléfonos celulares durante la prueba.\nLa corrección se publica en un máximo de 7 días naturales con la plantilla de respuestas."
    },
    {
      "id": "d3-v1",
      "document_id": "d3",
      "version_number": 1,
      "file_name": "guia-bienvenida.pdf",
      "notes": "",
      "content_text": "Guía de bienvenida para nuevo personal\nBienvenido a Academia Meridiano. En esta intranet encontrará los procedimientos vigentes, los avisos y el directorio.\nHorario de la sede: lunes a viernes de 7:00 a 21:00 y sábados de 8:00 a 14:00.\nAnte cualquier duda sobre tu contrato, contacte con Administración.\nLas llaves de las aulas se retiran en recepción firmando el registro de préstamo."
    },
    {
      "id": "d4-v1",
      "document_id": "d4",
      "version_number": 1,
      "file_name": "normas-aulas.pdf",
      "notes": "",
      "content_text": "Normas de uso de las aulas\nLas aulas se reservan con al menos 24 horas de antelación a través de secretaría.\nEl proyector y los equipos audiovisuales deben apagarse al finalizar cada clase.\nCualquier avería se comunica a Soporte técnico el mismo día."
    },
    {
      "id": "d5-v1",
      "document_id": "d5",
      "version_number": 1,
      "file_name": "calendario-convocatorias-2027.pdf",
      "notes": "",
      "content_text": "Calendario de convocatorias 2027\nServicio Civil - Técnico administrativo: publicación prevista en febrero, examen en mayo.\nPoder Judicial - Auxiliar judicial: publicación prevista en marzo, examen en junio.\nCaja Costarricense de Seguro Social - Asistente administrativo: publicación en abril.\nMinisterio de Educación Pública - Oficinista: publicación en julio.\nLas fechas son orientativas y se actualizarán al publicarse cada convocatoria oficial."
    },
    {
      "id": "d6-v1",
      "document_id": "d6",
      "version_number": 1,
      "file_name": "temario-tecnico-administrativo.pdf",
      "notes": "",
      "content_text": "Temario resumido - Técnico administrativo\nBloque 1: Constitución Política y organización del Estado.\nBloque 2: Ley General de la Administración Pública y procedimiento administrativo.\nBloque 3: Redacción de documentos oficiales y ortografía.\nBloque 4: Razonamiento lógico y matemático.\nBloque 5: Ética en la función pública."
    },
    {
      "id": "d7-v1",
      "document_id": "d7",
      "version_number": 1,
      "file_name": "plan-evaluacion-trimestre.pdf",
      "notes": "",
      "content_text": "Plan de evaluación del trimestre (uso interno de coordinación)\nCada profesor entrega el informe de avance de su grupo antes del día 15 de cada mes.\nSe considera alumno en riesgo a quien obtenga menos de 60 puntos en dos simulacros seguidos.\nLa orientadora académica cita a los alumnos en riesgo en un plazo de una semana."
    },
    {
      "id": "d8-v1",
      "document_id": "d8",
      "version_number": 1,
      "file_name": "presupuesto-tarifas-2027.pdf",
      "notes": "",
      "content_text": "Presupuesto y tarifas 2027 (confidencial - solo administración)\nMatrícula: 25 000 colones. Mensualidad curso intensivo: 68 000 colones.\nMensualidad curso regular: 45 000 colones. Descuento por pago trimestral: 10 %.\nPrevisión de gastos de alquiler de sede y mantenimiento incluida en el anexo."
    }
  ],
  "adjuntoSimulacro": [
    "Instrucciones del simulacro general - 27 de noviembre",
    "Lugar: aula magna. Hora de inicio: 8:00. Duración máxima: 3 horas.",
    "Vigilancia por grupo: Grupo A - Sofía Rojas, Grupo B - José Pablo Solano, Grupo C - Daniela Quesada, Grupo D - Esteban Monge.",
    "Los exámenes impresos se retiran en coordinación a las 7:30.",
    "Al terminar, entregar los exámenes y la hoja de asistencia firmada en coordinación."
  ]
} as const;
