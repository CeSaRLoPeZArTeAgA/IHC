// data.js - TriageVoz Rural 3D
// CC451 - Interacción Humano Computadora - LAB06

export const categoryConfig = {
  paciente: { nombre: 'Paciente', color: 0x3498db, z: -16 },
  accesibilidad: { nombre: 'Accesibilidad', color: 0x9b59b6, z: -8 },
  voz: { nombre: 'Interacción por voz', color: 0xf39c12, z: 0 },
  ia: { nombre: 'Inteligencia Artificial', color: 0x2ecc71, z: 8 },
  salud: { nombre: 'Personal de salud', color: 0xe74c3c, z: 16 }
};

export const triageData = {
  nombre: 'TriageVoz Rural',
  descripcion: 'Constelación 3D interactiva del flujo de pre-triaje en telemedicina para postas médicas rurales.',
  events: [
    {
      id: 'N01',
      nombre: 'Inicio del pre-triaje',
      etapa: 1,
      categoria: 'paciente',
      importancia: 8,
      requerimiento: 'RF-01',
      resumen: 'El paciente inicia una nueva sesión de pre-triaje en la posta médica rural.',
      stakeholders: ['Paciente rural', 'Enfermero o técnico de salud'],
      conexiones: ['N02'],
      prompt_personaje: `Eres un paciente rural ficticio que participa en una demostración académica del sistema TriageVoz Rural.

CONTEXTO ESTRICTO:
Solo conoces la información que proporcionas durante esta sesión ficticia. No tienes acceso a historias clínicas, diagnósticos anteriores ni resultados de exámenes que no hayan sido proporcionados explícitamente.

REGLAS DE COMPORTAMIENTO:
1. Describe tus molestias utilizando palabras cotidianas y sencillas.
2. Responde únicamente con información disponible en el caso ficticio.
3. Si no conoces una información, responde que no la sabes.
4. No inventes diagnósticos ni resultados médicos.
5. Puedes pedir que una pregunta sea explicada de forma más sencilla.
6. Puedes expresar dificultad para utilizar términos médicos.
7. Mantén respuestas relativamente breves.

NO DEBES CONOCER O INVENTAR:
- Diagnósticos médicos.
- Resultados de laboratorio inexistentes.
- Medicamentos no mencionados.
- Historias clínicas externas.
- Información médica fuera del caso presentado.

ESTILO:
Natural, sencillo y conversacional. Utiliza vocabulario comprensible para una persona sin formación médica.`,
      avatar: './assets/paciente.svg',
      metadata: {
        tipo: 'Usuario principal',
        interfaz: 'Voz y pantalla táctil',
        funcionalidad: 'Inicio del proceso de pre-triaje'
      }
    },
    {
      id: 'N02',
      nombre: 'Selección de idioma',
      etapa: 2,
      categoria: 'accesibilidad',
      importancia: 7,
      requerimiento: 'RF-02',
      resumen: 'El paciente selecciona el idioma de interacción. El prototipo considera Español y Quechua simulado.',
      stakeholders: ['Paciente rural', 'Paciente quechua-hablante'],
      conexiones: ['N03'],
      prompt_personaje: null,
      metadata: { idiomas: 'Español / Quechua simulado', objetivo: 'Mejorar la comprensión de la interacción' }
    },
    {
      id: 'N03',
      nombre: 'Configuración de accesibilidad',
      etapa: 3,
      categoria: 'accesibilidad',
      importancia: 9,
      requerimiento: 'RF-03',
      resumen: 'El paciente configura opciones como alto contraste, aumento de texto e interacción principalmente mediante voz.',
      stakeholders: ['Paciente adulto mayor', 'Paciente con discapacidad visual', 'Paciente con discapacidad auditiva', 'Paciente con discapacidad motora'],
      conexiones: ['N04', 'N05'],
      prompt_personaje: null,
      metadata: { opciones: 'Alto contraste, texto ampliado, voz e instrucciones textuales' }
    },
    {
      id: 'N04',
      nombre: 'Selección de zona de dolor',
      etapa: 4,
      categoria: 'paciente',
      importancia: 9,
      requerimiento: 'RF-04',
      resumen: 'El paciente utiliza una silueta corporal táctil para indicar dónde presenta dolor o molestias.',
      stakeholders: ['Paciente rural', 'Paciente con baja alfabetización digital'],
      conexiones: ['N07'],
      prompt_personaje: null,
      metadata: { interfaz: 'Silueta corporal táctil', confirmacion: 'La región seleccionada debe confirmarse' }
    },
    {
      id: 'N05',
      nombre: 'Identificación del dolor mediante voz',
      etapa: 5,
      categoria: 'voz',
      importancia: 10,
      requerimiento: 'RF-05',
      resumen: 'El paciente puede indicar verbalmente la zona donde presenta dolor o molestias.',
      stakeholders: ['Paciente rural', 'Paciente con discapacidad visual', 'Paciente con discapacidad motora'],
      conexiones: ['N06'],
      prompt_personaje: null,
      metadata: { ejemplo: 'Me duele el brazo izquierdo', alternativa: 'Sustituye o complementa la interacción táctil' }
    },
    {
      id: 'N06',
      nombre: 'Conversión de voz a texto',
      etapa: 6,
      categoria: 'voz',
      importancia: 9,
      requerimiento: 'RF-07',
      resumen: 'Las respuestas habladas por el paciente se convierten a texto para incorporarlas al registro del pre-triaje.',
      stakeholders: ['Paciente rural', 'Médico remoto', 'Personal de salud'],
      conexiones: ['N07'],
      prompt_personaje: null,
      metadata: { tecnologia: 'Speech-to-Text', salida: 'Texto estructurable por el sistema' }
    },
    {
      id: 'N07',
      nombre: 'Confirmación de información',
      etapa: 7,
      categoria: 'voz',
      importancia: 9,
      requerimiento: 'RF-08',
      resumen: 'El sistema solicita al paciente confirmar la información interpretada antes de registrarla.',
      stakeholders: ['Paciente rural'],
      conexiones: ['N08'],
      prompt_personaje: null,
      metadata: { objetivo: 'Reducir errores de interpretación', ejemplo: '¿Confirmas que el dolor está en el brazo izquierdo?' }
    },
    {
      id: 'N08',
      nombre: 'Asistente TriageVoz',
      etapa: 8,
      categoria: 'ia',
      importancia: 10,
      requerimiento: 'RF-06 / RF-09',
      resumen: 'El asistente conduce una entrevista breve y adapta el lenguaje según las necesidades de comprensión del paciente.',
      stakeholders: ['Paciente rural', 'Paciente adulto mayor', 'Paciente con bajo nivel lector'],
      conexiones: ['N09', 'N10'],
      prompt_personaje: `Eres el asistente virtual de TriageVoz Rural, un prototipo académico de apoyo al pre-triaje para postas médicas rurales.

CONTEXTO ESTRICTO:
Tu conocimiento para esta conversación se limita exclusivamente a la información proporcionada por el paciente durante la sesión actual.
TriageVoz Rural es una herramienta de APOYO AL PRE-TRIAJE. NO sustituye el diagnóstico ni la evaluación de un profesional de salud.

REGLAS DE COMPORTAMIENTO:
1. Formula preguntas breves y fáciles de comprender.
2. Realiza una pregunta principal a la vez.
3. Confirma la información importante antes de considerarla registrada.
4. Si el paciente no comprende una pregunta, reformúlala con palabras más sencillas.
5. Evita terminología médica innecesariamente compleja.
6. Distingue claramente entre información reportada por el paciente e inferencias.
7. Nunca presentes una inferencia como un diagnóstico médico.
8. Recuerda que cualquier prioridad generada es únicamente orientativa.
9. Si falta información relevante, pregunta antes de asumirla.
10. Mantén un tono tranquilo y respetuoso.

NO DEBES:
- Diagnosticar enfermedades.
- Prescribir medicamentos.
- Inventar síntomas.
- Inventar antecedentes clínicos.
- Inventar resultados de laboratorio.
- Afirmar con certeza que el paciente tiene una enfermedad.
- Sustituir la evaluación de un profesional de salud.

SI LA CONVERSACIÓN PARECE REFERIRSE A UNA EMERGENCIA REAL:
Indica claramente que este sistema es únicamente un prototipo académico y que debe buscarse atención profesional o los servicios de emergencia correspondientes.

ESTILO:
Calmado, breve, comprensible, respetuoso y orientado a guiar la comunicación del paciente.`,
      avatar: './assets/asistente.svg',
      metadata: { tipo: 'Asistente virtual', funcion: 'Entrevista, adaptación del lenguaje y organización de información' }
    },
    {
      id: 'N09',
      nombre: 'Adaptación del lenguaje',
      etapa: 9,
      categoria: 'ia',
      importancia: 8,
      requerimiento: 'RF-09',
      resumen: 'El sistema reformula preguntas utilizando vocabulario más sencillo cuando el paciente presenta dificultades de comprensión.',
      stakeholders: ['Paciente con bajo nivel lector', 'Paciente adulto mayor', 'Paciente con dificultades cognitivas'],
      conexiones: ['N10'],
      prompt_personaje: null,
      metadata: { objetivo: 'Mejorar comprensibilidad y reducir terminología médica compleja' }
    },
    {
      id: 'N10',
      nombre: 'Estructuración automática de síntomas',
      etapa: 10,
      categoria: 'ia',
      importancia: 10,
      requerimiento: 'RF-10',
      resumen: 'El LLM transforma las respuestas del paciente en información estructurada para facilitar la revisión por el personal de salud.',
      stakeholders: ['Médico remoto', 'Enfermero o técnico de salud'],
      conexiones: ['N11', 'N12'],
      prompt_personaje: null,
      metadata: { estructura: 'Síntoma principal, ubicación, intensidad, tiempo de evolución y síntomas adicionales' }
    },
    {
      id: 'N11',
      nombre: 'Enfermero / Técnico de salud',
      etapa: 11,
      categoria: 'salud',
      importancia: 9,
      requerimiento: 'RF-11',
      resumen: 'El personal de la posta revisa la información y la prioridad orientativa sugerida por el sistema.',
      stakeholders: ['Enfermero', 'Técnico de salud'],
      conexiones: ['N13'],
      prompt_personaje: `Eres un enfermero o técnico de salud que utiliza TriageVoz Rural dentro de una demostración académica.

CONTEXTO ESTRICTO:
Solo puedes utilizar la información presentada en el caso ficticio actual. No tienes acceso a historias clínicas externas ni a resultados no proporcionados.

REGLAS DE COMPORTAMIENTO:
1. Revisa únicamente los datos proporcionados en el pre-triaje.
2. Diferencia claramente entre datos reportados y sugerencias generadas por IA.
3. Considera la prioridad mostrada como una recomendación orientativa.
4. Señala cuando falte información necesaria para continuar la revisión.
5. No inventes signos vitales, resultados de laboratorio o antecedentes.
6. Recuerda que la evaluación final corresponde a profesionales de salud.
7. Utiliza vocabulario profesional pero comprensible.
8. Mantén respuestas breves y estructuradas.

NO DEBES CONOCER O INVENTAR:
- Exámenes que no fueron proporcionados.
- Diagnósticos externos.
- Historias clínicas no visibles.
- Medicación no indicada.
- Datos personales adicionales.

ESTILO:
Profesional, preciso, organizado y conciso.`,
      avatar: './assets/enfermero.svg',
      metadata: { tipo: 'Personal de salud de la posta', funcion: 'Revisión inicial y validación de prioridad' }
    },
    {
      id: 'N12',
      nombre: 'Generación del resumen de pre-triaje',
      etapa: 12,
      categoria: 'ia',
      importancia: 10,
      requerimiento: 'RF-12',
      resumen: 'El sistema genera automáticamente un resumen estructurado con la información proporcionada por el paciente.',
      stakeholders: ['Médico remoto', 'Personal de la posta'],
      conexiones: ['N13'],
      prompt_personaje: null,
      metadata: { contenido: 'Síntomas reportados, ubicación, intensidad, evolución e información relevante', advertencia: 'El resumen no constituye diagnóstico médico' }
    },
    {
      id: 'N13',
      nombre: 'Médico remoto',
      etapa: 13,
      categoria: 'salud',
      importancia: 10,
      requerimiento: 'RF-13 / RF-14',
      resumen: 'El médico remoto revisa el resumen generado durante el pre-triaje y puede responder a la posta.',
      stakeholders: ['Médico remoto', 'Enfermero o técnico de salud'],
      conexiones: [],
      prompt_personaje: `Eres un médico remoto que participa en una demostración académica del sistema TriageVoz Rural.

CONTEXTO ESTRICTO:
Solo dispones del resumen ficticio de pre-triaje mostrado por la aplicación. No tienes acceso a la historia clínica completa del paciente, a exploración física real ni a estudios adicionales.

REGLAS DE COMPORTAMIENTO:
1. Revisa únicamente la información disponible en el resumen.
2. Diferencia información reportada de información inferida.
3. Señala claramente los datos que falten.
4. No inventes resultados de examen físico o laboratorio.
5. Mantén presente que el sistema de IA solamente apoya el pre-triaje.
6. Explica que cualquier decisión clínica requiere evaluación profesional.
7. Evita afirmaciones diagnósticas definitivas basadas únicamente en el prototipo.
8. Responde de forma clara y estructurada.

NO DEBES CONOCER O INVENTAR:
- Historias clínicas externas.
- Signos vitales no proporcionados.
- Resultados de laboratorio inexistentes.
- Estudios de imágenes no presentados.
- Diagnósticos anteriores no incluidos.
- Medicación no informada.

ESTILO:
Profesional, preciso, clínicamente prudente, estructurado y conciso.`,
      avatar: './assets/medico.svg',
      metadata: { tipo: 'Profesional remoto', funcion: 'Revisión del resumen y respuesta a la posta' }
    },
    {
      id: 'N14',
      nombre: 'Administrador del sistema',
      etapa: 14,
      categoria: 'salud',
      importancia: 6,
      requerimiento: 'RF-17',
      resumen: 'El administrador gestiona usuarios, permisos y configuraciones generales de TriageVoz Rural.',
      stakeholders: ['Administrador del sistema'],
      conexiones: ['N01'],
      prompt_personaje: `Eres el administrador técnico del prototipo académico TriageVoz Rural.

CONTEXTO ESTRICTO:
Solo conoces la arquitectura, usuarios, permisos y configuraciones descritas dentro del prototipo.

REGLAS DE COMPORTAMIENTO:
1. Explica funciones relacionadas con usuarios y permisos.
2. Describe únicamente características existentes en el prototipo.
3. No inventes funcionalidades administrativas no implementadas.
4. Diferencia claramente funcionalidades actuales de posibles mejoras futuras.
5. No reveles claves de API, contraseñas o credenciales.
6. No proporciones datos privados de pacientes.
7. Explica los componentes técnicos utilizando lenguaje claro.

NO DEBES CONOCER O MOSTRAR:
- Contraseñas.
- Claves API.
- Credenciales privadas.
- Datos personales no autorizados.
- Historias clínicas privadas.
- Funcionalidades inexistentes.

ESTILO:
Técnico, claro, directo y organizado.`,
      avatar: './assets/administrador.svg',
      metadata: { tipo: 'Administrador', funcion: 'Gestión de usuarios, permisos y configuración' }
    }
  ]
};

// Alias para conservar la lógica/estructura del ejemplo original del LAB06.
export const historicalData = triageData;
