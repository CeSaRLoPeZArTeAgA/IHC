# TriageVoz Rural — LEC-LAB 11, **Tarea 1**

**Versión:** `LEC11-T1-2026.11.10-R3` .

Proyecto académico de VUI para **registro preliminar de síntomas** de casos ficticios en postas rurales. Incluye tres personalidades, seis rasgos manuales de 0 a 10, prompt dinámico, comparación del mismo diálogo, WebSocket con entrada de voz Whisper y LLM elegible (Groq o Gemini). También dispone de contraste alto, texto grande y botones de zona corporal.

## Instalación en Windows (VSCode o PowerShell)

1. Edita `.env` y configura una o ambas claves:

   ```env
   GROQ_API_KEY=gsk_TU_CLAVE_REAL
   GROQ_CHAT_MODEL=llama-3.3-70b-versatile
   GROQ_STT_MODEL=whisper-large-v3-turbo
   GEMINI_API_KEY=TU_CLAVE_DE_GOOGLE_AI_STUDIO
   GEMINI_MODEL=gemini-3.8-flash
   SAVE_TRANSCRIPTS=0
   ```

   Si tu cuenta Groq no tiene acceso a Llama 3.3 70B, consulta los modelos disponibles en Groq y puedes cambiar `GROQ_CHAT_MODEL` por `openai/gpt-oss-20b` si está habilitado. El acceso a Gemini también depende de tu cuenta. No debes compartir ni publicar `.env`.

2. Ejecuta **`INICIAR_TRIAGEVOZ.bat`** con doble clic (crea `.venv`, instala paquetes e inicia servidor). Alternativa:

   ```powershell
   py -m pip install -r requirements.txt
   py start.py
   ```

3. Abre **la dirección que indique la terminal**, normalmente `http://127.0.0.1:8011`. Comprueba el distintivo `LEC11-T1-2026.11.10-R3` en el encabezado. Si el puerto está ocupado, `start.py` elegirá otro de `8012` a `8019`.
