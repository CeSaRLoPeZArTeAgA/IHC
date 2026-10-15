import os
from google import genai
from google.genai import types

# Inicializar cliente de Gemini API
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def analizar_entorno_asistivo(ruta_imagen):
    # Cargar archivo de imagen
    image_file = client.files.upload(file=ruta_imagen)
    
    system_instruction = """
    Eres un asistente de navegación por voz para una persona con discapacidad visual.
    Reglas estrictas de interacción:
    1. Menciona primero riesgos inmediatos de seguridad.
    2. Usa orientación espacial basada en reloj o direcciones (ej. 'a tus 12').
    3. Mantiene la respuesta por debajo de 25 palabras. Sé directo y claro.
    """
    
    response = client.models.generate_content(
        #model="gemma-4-26b-a4b-it",
        model="gemini-3.8-flash",
        contents=[image_file, "Analiza este entorno y dame la indicación de navegación urgente."],
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.2
        )
    )
    return response.text

# Ejecución de prueba
print(analizar_entorno_asistivo("cruce_obstaculo.png"))