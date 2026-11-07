CC451 - INTERACCION HUMANO-COMPUTADORA
LABORATORIO 10 - SMARTPIZZA VUI
Alumno: Cesar Omar Lopez Arteaga

1. OBJETIVO
Aplicacion de pedidos SmartPizza con Streamlit, Groq y SQLite. La VUI ofrece
una conversacion continua por turnos: Pepper presenta el menu hablando y
mostrando el texto; el cliente responde por voz sin botones de grabacion
repetidos; sus palabras aparecen como subtitulos provisionales mientras
habla y como mensajes definitivos al terminar cada turno.
La interfaz incluye un panel de modelos Groq, edicion de personalidad,
memoria visible, tarjetas del menu, carrito y comparacion de modelos.

2. INSTALACION
  - Requiere Python 3.10 o superior.
  - Descomprimir el ZIP y entrar a la carpeta extraida.
  - Ejecutar: pip install -r requirements.txt
  - Configurar .streamlit/secrets.toml con GROQ_API_KEY = "..."
    o establecer la variable de entorno GROQ_API_KEY.
  - Ejecutar: streamlit run smartpizza.py
  - Abrir la URL local mostrada por Streamlit (normalmente localhost:8501).
  - Usar Chrome o Edge actualizados, con microfono, altavoces e internet.
  - En despliegues remotos, acceder por HTTPS para autorizar el microfono.

USO POR VOZ
  a) Pulsar UNA SOLA VEZ "Iniciar conversacion" y autorizar el microfono.
  b) Pepper saludara con voz, ofreciendo las pizzas; el mismo mensaje
     aparecera en "Pepper dice" y en el historial de conversacion.
  c) Cuando Pepper termine, el microfono escuchara automaticamente.
     Decir, por ejemplo: "Quiero una pizza Pepperoni".
  d) Mientras hablas, se mostrara la transcripcion provisional en
     "Tu estas diciendo". Al terminar de hablar, esperar aproximadamente
     un segundo: la frase se enviara automaticamente, sin boton de grabar.
  e) Pepper preguntara el tamano con voz y texto; responder "Mediana".
     Seguir el dialogo hasta confirmar el pedido y dar la direccion.
  f) "Interrumpir a Pepper" corta su lectura y devuelve el turno de voz.
     "Repetir respuesta" vuelve a leer el ultimo mensaje. "Detener"
     finaliza la escucha continua. El chat y los botones siguen disponibles.
  - El navegador reconoce la voz con Web Speech API; algunos navegadores
    envian audio a su propio servicio de reconocimiento. SmartPizza
    transmite al servidor solo el TEXTO final, no graba ni guarda audio.
  - La sintesis de voz usa voces instaladas o accesibles en el navegador.
  - Esta version ofrece manos libres POR TURNOS, no audio full-duplex ni
    interrupcion por voz simultanea como en Gemini Live.
  - Si el reconocimiento no se activa, comprobar permisos del sitio,
    HTTPS/localhost y compatibilidad. Usar Chrome/Edge o el chat escrito.

3. PRINCIPIOS VUI IMPLEMENTADOS
  1) Personalidad: Pepper responde de forma cordial, breve y en espanol
     con un toque peruano, sin ofrecer articulos fuera del menu.
  2) Progressive disclosure: la pantalla inicial muestra solo tres
     acciones; el catalogo se despliega cuando es pertinente.
  3) Confirmaciones inteligentes: agregar es implicito; cancelar o
     modificar requiere confirmacion explicita antes de cambiar el carrito.
  4) Prevencion de errores: no permite sushi ni otros productos ajenos;
     solicita tamano cuando falta y recuerda la direccion conocida.
  5) Memoria: los cinco ultimos intercambios se envian al LLM y se
     guarda el nombre declarado con "me llamo".
  6) Multimodalidad: tarjetas de precios, botones, texto, entrada por
     microfono continua y respuesta de voz subtitulada en pantalla.

3A. INTERFAZ MEJORADA Y MULTIPLES LLM
  - Panel lateral "Modelo de lenguaje": selecciona el LLM de Pepper.
    El programa consulta client.models.list() para mostrar los modelos
    recomendados que siguen activos y accesibles desde la cuenta Groq.
  - Modelos recomendados:
      openai/gpt-oss-20b: rapido, apropiado para respuestas de voz.
      openai/gpt-oss-120b: mayor capacidad de razonamiento.
      llama-3.3-70b-versatile: alternativa conversacional.
      llama-3.1-8b-instant: alternativa ligera para baja latencia.
      qwen/qwen3.8-27b: vista previa si figura en la cuenta Groq.
    La oferta puede cambiar; el catalogo de modelos lo controla Groq.
  - "Ajustar personalidad": modifica el estilo, pero no las reglas del
    carrito, el menu real ni la validacion de precios.
  - "Memoria": muestra nombre, direccion, ultimo pedido y hasta cinco
    turnos recientes usados como contexto del LLM.
  - "Laboratorio: comparar hasta tres modelos": envia una misma pregunta
    a cada modelo elegido. Presenta sus respuestas y tiempo observado.
    ES OPCIONAL Y REALIZA LLAMADAS ADICIONALES A GROQ QUE CONSUMEN CUOTA.
    No agrega productos ni registra pedidos.
  - Durante el pedido se usa UN modelo seleccionado. El motor de reglas
    responde a las operaciones transaccionales; se invoca al LLM para
    preguntas abiertas o dialogos no cubiertos por las reglas.

4. EXTENSIONES OBLIGATORIAS
  - Persistencia SQLite: crea tablas users y orders en smartpizza_vui.db
    y conserva nombre, direccion y ultimos pedidos. Para recuperar la
    informacion en otra sesion, ingresar el mismo nombre en el panel lateral.
    Es una demostracion academica sin autenticacion: no usar datos reales.
  - Recompensa: al completar el SEGUNDO pedido en la misma conversacion,
    se desbloquea un descuento de 20 % en bebidas del siguiente pedido.
    El total mostrado y guardado ya descuenta el importe correspondiente.
  - Estados VUI: reconocimiento del habla, subtitulos provisionales,
    procesamiento de la intencion, lectura de respuesta y reanudacion
    automatica de la escucha tras el turno de Pepper.

5. GUIA DE PRUEBAS
  Prueba A - Flujo por voz:
    Pulsar "Iniciar conversacion" una vez -> escuchar saludo -> decir
    "Quiero una Pepperoni" -> ver subtitulos provisionales -> oir
    pregunta del tamano -> decir "Mediana" -> confirmar y dar direccion.
    No es necesario pulsar grabar ni enviar entre turnos.
  Prueba B - Prevencion de errores:
    "Quiero sushi" -> el sistema lo rechaza y ofrece pizzas del menu.
  Prueba C - Confirmacion de alto riesgo:
    "Quiero una Hawaiana Familiar" -> "Cancelar pedido" ->
    "No" (se conserva) o "Si" (se retira).
  Prueba D - Memoria persistente:
    "Me llamo Cesar" -> registrar pedido -> recargar aplicacion ->
    "Recuperar cliente de otra sesion" = Cesar -> Cargar perfil.
  Prueba E - Recompensa:
    completar dos pedidos consecutivos y anadir una bebida al siguiente.
  Prueba F - Recuperacion ante fallas:
    negar permiso al microfono -> continuar por chat o botones; desconectar
    Groq -> los pasos deterministas siguen activos, mientras que la
    conversacion libre comunica la dificultad de conexion.

6. ENTREGA
La aplicacion se ejecuta con smartpizza.py y carga los componentes visuales
voice_live.html, voice_live.css, voice_live.js y ui_theme.css. Mantener esos
cinco archivos en la misma carpeta. El handout original no ha sido modificado.
En screenshots/ se incluyen instrucciones precisas para tomar las
capturas reales al ejecutar Streamlit; las imagenes PNG aun deben
capturarse en la computadora del alumno. Si se entrega el ZIP al docente,
NO INCLUIR la API key: usar la version para entregar, que contiene una
plantilla de secrets.toml sin credenciales.

7. MODELOS Y VOZ
Predeterminado: openai/gpt-oss-20b. Puede cambiarse desde el panel lateral
o mediante la variable GROQ_MODEL para el valor inicial. Si Groq no esta
disponible, el menu y el carrito siguen funcionando, pero la conversacion
libre devuelve un aviso. Los modelos disponibles dependen de la cuenta.
ASR: Web Speech API SpeechRecognition, es-PE, con resultados intermedios.
TTS: speechSynthesis del navegador, preferentemente es-PE.
Se precisa una interaccion inicial del usuario para activar voz/microfono.
El navegador puede requerir una nueva autorizacion al recargar la pagina.

8. FUENTES TECNICAS
  - Modelos activos de Groq: https://console.groq.com/docs/models
  - API de modelos: https://console.groq.com/docs/api-reference
  - Reconocimiento Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
