import os
import ollama

# ============================================================
# CONFIGURACIÓN DE OLLAMA EN RED LOCAL
# ============================================================
# Cambia esta IP por la de la máquina donde corre Ollama.
# También puedes definirlo por variable de entorno: export OLLAMA_HOST=...
OLLAMA_HOST  = os.environ.get("OLLAMA_HOST", "http://10.20.4.3:11434")
MODELO       = "gemma4:26b"

# Cliente apuntando al servidor Ollama remoto
client = ollama.Client(host=OLLAMA_HOST)


def analizar_entorno_asistivo(ruta_imagen: str) -> str:
    """
    Envía una imagen a un modelo multimodal servido por Ollama
    y devuelve una indicación de navegación breve para una
    persona con discapacidad visual.
    """

    # Verificar que la imagen exista antes de enviarla
    if not os.path.isfile(ruta_imagen):
        raise FileNotFoundError(f"No se encontró la imagen: {ruta_imagen}")

    system_instruction = (
        "Eres un asistente de navegación por voz para una persona con "
        "discapacidad visual. Reglas estrictas de interacción:\n"
        "1. Menciona primero riesgos inmediatos de seguridad.\n"
        "2. Usa orientación espacial basada en reloj o direcciones "
        "(ej. 'a tus 12').\n"
        "3. Mantén la respuesta por debajo de 25 palabras. Sé directo y claro."
    )

    # Ollama acepta rutas locales en el campo 'images'
    respuesta = client.chat(
        model=MODELO,
        messages=[
            {"role": "system", "content": system_instruction},
            {
                "role": "user",
                "content": (
                    "Analiza este entorno y dame la indicación "
                    "de navegación urgente."
                ),
                "images": [ruta_imagen],
            },
        ],
        options={
            "temperature": 0.2,
        },
    )

    # La respuesta viene en message.content
    return respuesta["message"]["content"]


# ============================================================
# EJECUCIÓN DE PRUEBA
# ============================================================
if __name__ == "__main__":
    try:
        print(analizar_entorno_asistivo("cruce_obstaculo.png"))
    except Exception as e:
        print(f"[ERROR] {e}")