# TriageVoz Rural 3D - CC451 LAB06

Aplicación web interactiva basada en el ejemplo de "Constelaciones Históricas 3D" del LAB06, adaptada al proyecto **TriageVoz Rural: pre-triaje en telemedicina**.

## Funcionalidades implementadas

- Espiral 3D con 14 nodos.
- 5 categorías temáticas.
- Nodos luminosos con shader WebGL y pulso animado.
- Navegación orbital: zoom, rotación y paneo.
- Tooltips con nombre, requerimiento, categoría y resumen.
- 16 conexiones funcionales mediante curvas Bézier.
- Revelado de conexiones según zoom.
- Botón para mostrar todas las conexiones simultáneamente.
- 5 roles/personajes con prompts de sistema optimizados:
  - Paciente rural.
  - Asistente TriageVoz.
  - Enfermero/Técnico de salud.
  - Médico remoto.
  - Administrador del sistema.
- Chat con Gemini y memoria de conversación.
- Selector de temperature: 0.0, 0.5, 1.0 y 1.5.
- Feature adicional: filtro por categoría.
- Manejo de errores de API y aviso cuando falta configurar la API key.

## Requisitos

- Windows 10/11, Linux o macOS.
- Node.js instalado.
- npm.
- Navegador moderno con WebGL (Chrome, Edge o Firefox).
- API key de Google AI Studio para usar el chat.

## 1. Abrir el proyecto en VS Code

Abrir la carpeta raíz `TriageVoz-Rural-3D`.

## 2. Abrir PowerShell en VS Code

Menú:

`Terminal -> New Terminal`

La terminal debe estar ubicada en la carpeta del proyecto.

## 3. Instalar dependencias

Ejecutar:

```powershell
npm install
```

Se instalarán Three.js, D3.js y Vite.

## 4. Configurar Gemini

Abrir:

`js/config.js`

Reemplazar:

```javascript
export const API_KEY = 'PEGA_AQUI_TU_API_KEY';
```

por tu clave real de Google AI Studio:

```javascript
export const API_KEY = 'TU_CLAVE_REAL';
```

No publicar esa clave en GitHub.

El modelo está definido en el mismo archivo:

```javascript
export const GEMINI_MODEL = 'gemini-2.0-flash';
```

Ese nombre sigue el ejemplo del LAB06. Si Google AI Studio informa que el modelo no está disponible para tu cuenta, cambiar solamente ese valor por un modelo Gemini habilitado.

## 5. Ejecutar localmente

Ejecutar:

```powershell
npm run dev
```

Vite mostrará una dirección similar a:

`http://localhost:5173/`

Abrirla en Chrome o Edge.

No abrir `index.html` con doble clic. Debe ejecutarse mediante Vite.

## 6. Pruebas para el LAB06

### Visualización 3D
- Rotar con clic izquierdo + arrastrar.
- Zoom con rueda del mouse.
- Paneo con clic derecho + arrastrar.
- Pasar el cursor sobre nodos para ver tooltips.

### Conexiones
- Acercarse con zoom para revelar las conexiones.
- Presionar `Mostrar todas las conexiones` para mostrar el grafo completo.

### Chat Gemini
- Hacer clic en N01, N08, N11, N13 o N14.
- Escribir un mensaje.
- El sistema utilizará el prompt específico del rol.
- El historial de mensajes se mantiene hasta cambiar de personaje o presionar `Limpiar historial`.

### Experimento de temperature
Usar exactamente la misma pregunta con:
- 0.0
- 0.5
- 1.0
- 1.5

Registrar en el informe las respuestas reales y comparar variabilidad, precisión y estilo.

Pregunta sugerida para N08:

`No entendí la pregunta sobre cuándo comenzó mi molestia. ¿Puedes explicármela de una manera más sencilla?`

### Feature adicional
Usar el selector `Categoría` y elegir, por ejemplo, `Inteligencia Artificial`.

## 7. Capturas

Guardar capturas reales en `screenshots/` siguiendo `screenshots/README.md`.

## Nota de seguridad

El LAB06 usa una integración directa desde JavaScript hacia Gemini. Es válida como demostración local académica, pero una aplicación de producción no debería exponer una API key en el navegador; se debería utilizar un backend/proxy seguro.

## Documentación auxiliar incluida

- `docs/CUMPLIMIENTO_LAB06.md`: mapa entre requisitos y archivos implementados.
- `docs/EXPERIMENTO_TEMPERATURA.md`: procedimiento y tabla para la prueba 0.0 / 0.5 / 1.0 / 1.5.
- `docs/PROMPT_MEJORADO.md`: prompt base, versión mejorada y justificación.
