# Correspondencia con los requisitos del LAB06

## Tarea 1 - Visualización 3D

- 14 nodos: `js/data.js`.
- Múltiples categorías: paciente, accesibilidad, voz, IA y salud.
- Shader luminoso y pulso: `js/constellation.js`.
- OrbitControls con zoom, rotación y paneo: `js/constellation.js`.
- Tooltips: `js/main.js` + `index.html`.

## Tarea 2 - Conexiones

- 16 conexiones definidas en `js/data.js`.
- Curvas Bézier: `createConnectionCurve()` en `js/constellation.js`.
- Revelado por zoom: `updateConnectionsByZoom()`.
- Animación por pulso de opacidad.
- Botón toggle de todas las conexiones: `index.html` + `js/main.js`.

## Tarea 3 - Gemini

- Cliente: `js/llm-client.js`.
- API key: `js/config.js`.
- 5 roles con prompts optimizados: N01, N08, N11, N13 y N14.
- Memoria: `conversationHistory` en `LLMClient`.
- Manejo de errores y aviso de API key faltante.

## Tarea 4 - Optimización

- Selector de temperature: 0.0, 0.5, 1.0 y 1.5.
- Plantilla de experimento: `docs/EXPERIMENTO_TEMPERATURA.md`.
- Prompt base y prompt mejorado: `docs/PROMPT_MEJORADO.md`.
- Característica adicional: filtro por categoría.
