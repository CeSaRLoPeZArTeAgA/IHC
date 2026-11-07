"""
CC451 — Laboratorio VUI con Groq + Streamlit
SmartPizza VUI — HANDOUT (Plantilla para completar)
Instrucciones: Resuelva cada bloque # TODO numerado.
"""
import streamlit as st
import os
from groq import Groq

# =============================================================================
# CONFIGURACIÓN DE PÁGINA
# =============================================================================
st.set_page_config(page_title="SmartPizza VUI", page_icon="🍕", layout="centered")

# =============================================================================
# TODO 1: CONFIGURAR CLIENTE GROQ
# =============================================================================
# Complete la inicialización usando st.secrets o variable de entorno.
# Documentación: https://console.groq.com/docs
client = Groq(api_key=st.secrets.get("GROQ_API_KEY", os.getenv("GROQ_API_KEY")))  # FIXME si no tiene secrets.toml

# =============================================================================
# ESTADO DE SESIÓN (Memoria conversacional inmediata)
# =============================================================================
if "messages" not in st.session_state:
    st.session_state.messages = []
if "user_profile" not in st.session_state:
    st.session_state.user_profile = {"nombre": None, "ultimo_pedido": None, "direccion": None}
if "conversation_stage" not in st.session_state:
    st.session_state.conversation_stage = "welcome"
if "current_order" not in st.session_state:
    st.session_state.current_order = []

# =============================================================================
# MENÚ REAL (Para prevenir alucinaciones del LLM)
# =============================================================================
MENU = {
    "pizzas": [
        {"id": "pep", "nombre": "Pepperoni", "precio": 35.0, "emoji": "🍕"},
        {"id": "haw", "nombre": "Hawaiana", "precio": 33.0, "emoji": "🍍🍕"},
        {"id": "veg", "nombre": "Vegetariana", "precio": 30.0, "emoji": "🥬🍕"},
        {"id": "bbq", "nombre": "BBQ Chicken", "precio": 37.0, "emoji": "🍗🍕"},
    ],
    "tamaños": ["Personal", "Mediana", "Familiar"],
    "bebidas": [
        {"id": "inc", "nombre": "Inca Kola", "precio": 8.0, "emoji": "🥤"},
        {"id": "coc", "nombre": "Coca Cola", "precio": 8.0, "emoji": "🥤"},
        {"id": "lim", "nombre": "Limonada", "precio": 10.0, "emoji": "🍋"},
    ],
    "extras": [
        {"id": "alq", "nombre": "Alquiler de película", "precio": 15.0, "emoji": "🎬"},
    ]
}

# =============================================================================
# TODO 2: DISEÑO DE PERSONALIDAD (Principio #1)
# =============================================================================
# Complete el SYSTEM_PROMPT para definir la personalidad de "Pepper":
# - Tono: casual, amigable, entusiasta.
# - Lenguaje: español neutro con toque peruano moderado ("pe", "pues", "bacán").
# - Reglas: NUNCA inventar productos fuera del menú. Siempre confirmar antes de modificar.
SYSTEM_PROMPT = """
Eres Pepper, el asistente de voz de SmartPizza.
# COMPLETE AQUI LA PERSONALIDAD, TONO Y RESTRICCIONES...
"""

# =============================================================================
# TODO 3: FUNCIÓN LLM CON MEMORIA CONVERSACIONAL (Principio #5)
# =============================================================================
def get_llm_response(user_input: str, context_info: str = "") -> str:
    """
    Construye el payload de mensajes y llama a Groq.
    Debe incluir:
    1. SYSTEM_PROMPT
    2. Contexto actual (etapa, perfil, menú)
    3. Los últimos 5 mensajes del historial (st.session_state.messages)
    4. El mensaje del usuario actual
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # TODO 3a: Agregar contexto del sistema (menú, perfil, etapa)
    # context = f"..."
    # messages.append(...)

    # TODO 3b: Agregar los últimos 5 mensajes del historial de session_state
    # for msg in ...:
    #     messages.append(msg)

    # TODO 3c: Agregar mensaje del usuario y llamar a Groq
    # messages.append({"role": "user", "content": user_input})
    # response = client.chat.completions.create(model=..., messages=..., temperature=..., max_tokens=...)
    # assistant_msg = response.choices[0].message.content

    # Guardar en historial (memoria de sesión)
    # st.session_state.messages.append(...)
    # st.session_state.messages.append(...)

    # return assistant_msg
    return "[Respuesta del LLM — completar TODO 3]"

# =============================================================================
# TODO 4: PREVENCIÓN DE ERRORES (Principio #4)
# =============================================================================
def validate_order_input(text: str):
    """
    Valida que el usuario no pida productos fuera del menú.
    Retorna: (is_valid: bool, error_message: str)
    Estrategias sugeridas:
    - Lista negra de productos que NO vendemos (hamburguesa, sushi, etc.)
    - Clarificación proactiva de tamaños si detecta pizza sin tamaño.
    """
    text_lower = text.lower()

    # TODO 4a: Detectar ítems inválidos (fuera de menú)
    # invalid_items = [...]

    # TODO 4b: Detectar si pidió pizza pero olvidó tamaño → pedir clarificación
    # if "pizza" in text_lower and not any(t in text_lower for t in ["personal", "mediana", "familiar"]):
    #     return False, "¿Qué tamaño deseas? Tenemos Personal, Mediana o Familiar."

    return True, ""

# =============================================================================
# TODO 5: CONFIRMACIONES INTELIGENTES (Principio #3)
# =============================================================================
def check_confirmation_needed(text: str):
    """
    Determina el nivel de riesgo de la intención del usuario.
    Retorna: (risk_level: str, warning_message: str | None)
    - "high": cancelar, borrar, modificar → confirmación EXPLÍCITA requerida
    - "low": agregar, quiero, dame → confirmación IMPLÍCITA
    - "medium": neutral
    """
    text_lower = text.lower()

    # TODO 5a: Definir palabras clave de alto y bajo riesgo
    # high_risk = [...]
    # low_risk = [...]

    # TODO 5b: Retornar nivel y mensaje
    # if any(word in text_lower for word in high_risk):
    #     return "high", "⚠️ Esta acción afecta tu pedido actual. ¿Confirmas que deseas continuar?"

    return "medium", None

# =============================================================================
# TODO 6: MULTIMODALIDAD INTELIGENTE (Principio #6)
# =============================================================================
def render_multimodal_menu(category="pizzas"):
    """
    Muestra el menú visualmente usando columnas Streamlit.
    Use st.columns(), st.metric() o st.button() para cada ítem.
    """
    st.subheader("📋 Menú Visual")

    # TODO 6a: Obtener ítems de la categoría
    # items = MENU.get(category, [])

    # TODO 6b: Crear columnas dinámicas y mostrar cada ítem con emoji y precio
    # cols = st.columns(len(items))
    # for i, item in enumerate(items):
    #     with cols[i]:
    #         st.metric(label=item["nombre"], value=f"S/ {item['precio']}")
    #         st.write(item["emoji"] * 3)

    st.info("Complete TODO 6 para mostrar el menú multimodal aquí.")

# =============================================================================
# TODO 7: PROGRESSIVE DISCLOSURE (Principio #2)
# =============================================================================
def render_welcome():
    """
    Muestra SOLO 2-3 opciones iniciales. No abrumar al usuario.
    Revelar sub-opciones solo después de la primera elección.
    """
    st.markdown("""
    ### 👋 ¡Hola! Soy Pepper, tu asistente de SmartPizza 🍕

    **¿Qué te gustaría hacer hoy?**
    """
    )

    # TODO 7: Mostrar máximo 2-3 opciones principales (ej: Pedir, Ver promos, Reordenar)
    # Use st.columns() con st.button() para cada opción.
    # NO muestre todo el menú aquí.

# =============================================================================
# EXTRACCIÓN SIMPLE DE PERFIL (auxiliar para memoria)
# =============================================================================
def extract_profile_info(text: str):
    """Extrae nombre y dirección de forma simple (keyword-based)."""
    text_lower = text.lower()
    if "me llamo" in text_lower:
        try:
            nombre = text_lower.split("me llamo")[-1].strip().split()[0].capitalize()
            st.session_state.user_profile["nombre"] = nombre
        except Exception:
            pass
    if "vivo en" in text_lower or "dirección" in text_lower or "direccion" in text_lower:
        # Extracción muy simple; en producción usar regex o LLM
        pass

# =============================================================================
# MAIN — Estructura base de la interfaz
# =============================================================================
def main():
    st.title("🍕 SmartPizza VUI")
    st.caption("Laboratorio CC451 — VUI Moderna con Groq LLMs")

    # Sidebar: Perfil y configuración
    with st.sidebar:
        st.header("⚙️ Panel VUI")
        st.markdown("**Principios activos:**")
        st.markdown("""
        1. 🎭 Personalidad  
        2. 🪜 Progressive Disclosure  
        3. ✅ Confirmaciones  
        4. 🛡️ Prevención Errores  
        5. 🧠 Memoria  
        6. 🖼️ Multimodalidad
        """)
        st.divider()
        if st.session_state.user_profile["nombre"]:
            st.success(f"👤 Cliente: {st.session_state.user_profile['nombre']}")
        if st.session_state.user_profile["direccion"]:
            st.info(f"📍 Dir: {st.session_state.user_profile['direccion']}")
        if st.session_state.user_profile["ultimo_pedido"]:
            st.write(f"🕐 Último: {st.session_state.user_profile['ultimo_pedido']}")

    # Renderizar bienvenida progresiva si no hay mensajes
    if not st.session_state.messages:
        render_welcome()
        render_multimodal_menu()  # TODO 6: debe mostrar menú reducido o destacado

    # Mostrar historial de chat
    for msg in st.session_state.messages:
        role = msg["role"]
        with st.chat_message("user" if role == "user" else "assistant"):
            st.write(msg["content"])

    # Input de usuario (simula ASR / micrófono)
    user_input = st.chat_input("🎤 Di algo (escribe tu mensaje)...")

    if user_input:
        # Mostrar input
        with st.chat_message("user"):
            st.write(user_input)

        # Extraer info de perfil (memoria)
        extract_profile_info(user_input)

        # TODO 8: INTEGRAR VALIDACIÓN + CONFIRMACIÓN + LLM
        # 1. Llamar validate_order_input()
        # 2. Si inválido → mostrar error y detener
        # 3. Llamar check_confirmation_needed()
        # 4. Llamar get_llm_response() con contexto adecuado
        # 5. Mostrar respuesta del asistente
        # 6. Actualizar conversation_stage según intención

        with st.spinner("🔊 Pepper está procesando..."):
            response = get_llm_response(user_input, context_info=f"Etapa: {st.session_state.conversation_stage}")

        with st.chat_message("assistant"):
            st.write(response)

        # Actualizar etapa de conversación (lógica simple)
        # TODO 9: Mejorar máquina de estados según intención detectada
        if any(x in user_input.lower() for x in ["quiero", "dame", "pedir", "ordenar"]):
            st.session_state.conversation_stage = "ordering"
        elif any(x in user_input.lower() for x in ["confirm", "sí", "si", "ok", "dale"]):
            st.session_state.conversation_stage = "confirming"
        elif any(x in user_input.lower() for x in ["cancela", "no quiero", "olvida"]):
            st.session_state.conversation_stage = "cancelling"

        st.rerun()

    # Botones rápidos multimodales (escape y atajos)
    st.divider()
    c1, c2, c3 = st.columns(3)
    with c1:
        if st.button("📋 Ver Menú Completo"):
            render_multimodal_menu("pizzas")
            render_multimodal_menu("bebidas")
    with c2:
        if st.button("🔄 Reordenar Último"):
            if st.session_state.user_profile["ultimo_pedido"]:
                st.info(f"Reordenando tu último pedido: {st.session_state.user_profile['ultimo_pedido']}")
            else:
                st.warning("Aún no tienes pedidos previos guardados.")
    with c3:
        if st.button("🗑️ Nuevo Pedido / Limpiar"):
            st.session_state.messages = []
            st.session_state.conversation_stage = "welcome"
            st.session_state.current_order = []
            st.rerun()

if __name__ == "__main__":
    main()
