// llm-client.js - Cliente Gemini basado en la estructura del LAB06

export class LLMClient {
  constructor(apiKey, modelName = 'gemini-2.0-flash') {
    this.apiKey = apiKey;
    this.modelName = modelName;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.conversationHistory = [];
  }

  isConfigured() {
    return Boolean(
      this.apiKey &&
      this.apiKey.trim() &&
      !this.apiKey.includes('PEGA_AQUI')
    );
  }

  async chat(message, systemPrompt, temperature = 0.5) {
    if (!this.isConfigured()) {
      throw new Error('API_KEY_NOT_CONFIGURED');
    }

    const safeTemperature = Math.max(0, Math.min(2, Number(temperature)));
    const url = `${this.baseUrl}/${this.modelName}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        ...this.conversationHistory,
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ],
      generationConfig: {
        temperature: safeTemperature,
        maxOutputTokens: 512,
        topP: 0.9
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const error = await response.json();
        detail = error?.error?.message || detail;
      } catch (_) {
        // Si la respuesta no es JSON se conserva statusText.
      }
      throw new Error(`Error Gemini (${response.status}): ${detail}`);
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('\n')
      .trim();

    if (!reply) {
      throw new Error('Gemini no devolvió contenido de texto.');
    }

    this.conversationHistory.push(
      { role: 'user', parts: [{ text: message }] },
      { role: 'model', parts: [{ text: reply }] }
    );

    // 20 entradas = 10 intercambios usuario/modelo.
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    return reply;
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}
