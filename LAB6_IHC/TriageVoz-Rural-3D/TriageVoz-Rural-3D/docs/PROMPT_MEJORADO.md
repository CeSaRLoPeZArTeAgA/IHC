# Tarea 4.2 - Prompt original y versión mejorada

## Prompt base/original de demostración

```text
Eres un asistente virtual para un sistema de pre-triaje rural.
Haz preguntas al paciente sobre sus síntomas y ayúdalo a explicar qué siente.
No reemplaces al médico.
```

## Prompt mejorado

La versión mejorada es el campo `prompt_personaje` del nodo `N08 - Asistente TriageVoz` en `js/data.js`.

## Cambios realizados

1. Se agregó un contexto estricto: el modelo solo puede utilizar la información proporcionada durante la sesión.
2. Se explicitó que TriageVoz Rural es apoyo al pre-triaje y no un sistema de diagnóstico.
3. Se definieron reglas numeradas de interacción: una pregunta a la vez, confirmación y reformulación del lenguaje.
4. Se agregaron límites negativos explícitos: no diagnosticar, no prescribir y no inventar síntomas, antecedentes o exámenes.
5. Se definió el estilo de comunicación: calmado, breve, comprensible y respetuoso.
6. Se añadió comportamiento ante una posible emergencia real: recordar que es un prototipo académico y derivar a atención profesional.

## Justificación

La versión mejorada reduce ambigüedad y alucinaciones, mantiene el alcance del prototipo y hace más consistente la interacción con pacientes rurales, adultos mayores o usuarios con bajo nivel lector.
