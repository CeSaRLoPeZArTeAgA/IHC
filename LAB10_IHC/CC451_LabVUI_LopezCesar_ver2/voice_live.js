// SmartPizza Live VUI. Web Speech reconoce frases automáticamente y
// Streamlit recibe solo turnos terminados (triggers), nunca audio crudo.
// Un controlador por pestaña conserva la sesión durante los reruns de Python.

function cleanForSpeech(value) {
  return String(value || '')
    .replace(/\*\*|[`#_]/g, '')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createController() {
  const s = {
    enabled: false, speaking: false, recognizing: false, starting: false,
    waiting: false, recognition: null, speechToken: 0, pending: '',
    preview: '', status: '● En espera', note: '',
    speakSeq: 0, assistantSeq: 0, assistantText: '',
    trigger: null, root: null, finalTimer: null, restartTimer: null,
    disposeTimer: null, mounted: false, mountVersion: 0, turnCounter: 0,
    lastSent: '', lastSentAt: 0, wantGreeting: false,
  };

  s.element = (id) => s.root?.querySelector('#' + id);
  s.draw = () => {
    const status = s.element('voice-status');
    const preview = s.element('voice-preview');
    const pepper = s.element('voice-pepper');
    const help = s.element('voice-help');
    const start = s.element('voice-start');
    const stop = s.element('voice-stop');
    const interrupt = s.element('voice-interrupt');
    if (status) status.textContent = s.status;
    if (preview) preview.textContent = s.preview || 'Habla cuando Pepper termine su respuesta.';
    if (pepper) pepper.textContent = cleanForSpeech(s.assistantText) || 'Pepper te dará la bienvenida al iniciar.';
    if (help) help.textContent = s.note || 'Habla normalmente; la frase se enviará al terminar. No necesitas pulsar grabar en cada turno.';
    if (start) start.disabled = s.enabled;
    if (stop) stop.disabled = !s.enabled;
    if (interrupt) interrupt.disabled = !s.speaking;
  };

  s.setStatus = (label, note = '') => { s.status = label; s.note = note; s.draw(); };
  s.cancelTimer = () => {
    if (s.finalTimer) clearTimeout(s.finalTimer);
    s.finalTimer = null;
  };
  s.stopRecognition = () => {
    clearTimeout(s.restartTimer);
    s.restartTimer = null;
    s.cancelTimer();
    if (s.recognition && (s.recognizing || s.starting)) {
      try { s.recognition.abort(); } catch (_) { /* ya terminó */ }
    }
    s.recognizing = false;
    s.starting = false;
  };

  s.submitTurn = () => {
    s.cancelTimer();
    const text = s.pending.trim().slice(0, 800);
    s.pending = '';
    if (!text || !s.enabled || s.waiting) return;
    const now = Date.now();
    if (text === s.lastSent && now - s.lastSentAt < 2800) return;
    s.lastSent = text;
    s.lastSentAt = now;
    s.preview = text;
    s.waiting = true;
    s.setStatus('⚙️ Pepper está pensando...', 'Tu frase se envió; espera la respuesta hablada.');
    s.stopRecognition();
    if (s.trigger) {
      s.trigger('utterance', { id: `${now}-${++s.turnCounter}`, text });
    }
  };

  s.scheduleSubmit = () => {
    s.cancelTimer();
    if (s.pending.trim()) s.finalTimer = setTimeout(s.submitTurn, 1050);
  };

  s.ensureRecognizer = () => {
    if (s.recognition) return true;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      s.setStatus('⚠️ Voz no disponible',
        'Este navegador no admite reconocimiento continuo. Usa Edge o Chrome actualizado; el chat de texto sigue funcionando.');
      return false;
    }
    const rec = new SR();
    rec.lang = 'es-PE';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onstart = () => {
      s.starting = false;
      s.recognizing = true;
      if (s.wantGreeting) {
        s.wantGreeting = false;
        s.stopRecognition();
        s.speak(s.assistantText, s.assistantSeq);
        return;
      }
      if (s.enabled && !s.waiting && !s.speaking) {
        s.setStatus('🎙️ Te escucho...', 'Habla con naturalidad. Verás las palabras aquí mientras las reconocemos.');
      }
    };
    rec.onspeechstart = () => s.cancelTimer();
    rec.onresult = (event) => {
      if (!s.enabled || s.waiting || s.speaking) return;
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const part = (result[0]?.transcript || '').trim();
        if (!part) continue;
        if (result.isFinal) s.pending += (s.pending ? ' ' : '') + part;
        else interim += (interim ? ' ' : '') + part;
      }
      s.preview = [s.pending, interim].filter(Boolean).join(' ');
      s.setStatus('🎙️ Te escucho...', 'Transcripción provisional: el turno se enviará al detectar una pausa.');
      s.scheduleSubmit();
    };
    rec.onspeechend = () => { if (s.pending.trim()) s.scheduleSubmit(); };
    rec.onend = () => {
      s.recognizing = false;
      s.starting = false;
      if (s.pending.trim() && s.enabled && !s.waiting && !s.speaking) {
        s.scheduleSubmit();
      } else if (s.enabled && !s.waiting && !s.speaking) {
        s.restartTimer = setTimeout(s.startRecognition, 500);
      }
    };
    rec.onerror = (event) => {
      s.recognizing = false;
      s.starting = false;
      const code = event.error || '';
      if (code === 'aborted' || code === 'no-speech') return;
      if (code === 'not-allowed' || code === 'service-not-allowed' || code === 'audio-capture') {
        s.enabled = false;
        s.setStatus('⚠️ Micrófono desactivado', 'Permite el micrófono en la barra del navegador y pulsa Iniciar conversación.');
        return;
      }
      if (code === 'network' || code === 'language-not-supported') {
        s.enabled = false;
        s.setStatus('⚠️ Reconocimiento no disponible',
          'Tu navegador no puede usar su servicio de reconocimiento. Comprueba la conexión o continúa mediante el chat de texto.');
        return;
      }
      s.setStatus('⚠️ Problema de reconocimiento',
        'No se pudo reconocer la voz. Comprueba la red o usa el chat; puedes detener y reiniciar la conversación.');
    };
    s.recognition = rec;
    return true;
  };

  s.startRecognition = () => {
    if (!s.enabled || s.waiting || s.speaking || s.recognizing || s.starting) return;
    if (!s.ensureRecognizer()) return;
    s.starting = true;
    try { s.recognition.start(); }
    catch (_) {
      s.starting = false;
      s.restartTimer = setTimeout(s.startRecognition, 750);
    }
  };

  s.speak = (text, seq = null) => {
    if (!s.enabled) return;
    const content = cleanForSpeech(text);
    if (!content) { s.waiting = false; s.startRecognition(); return; }
    if (!('speechSynthesis' in window)) {
      s.setStatus('⚠️ Sin salida de voz', 'Este navegador no admite síntesis de voz; la respuesta está en pantalla.');
      s.waiting = false;
      s.startRecognition();
      return;
    }
    s.stopRecognition();
    const token = ++s.speechToken;
    window.speechSynthesis.cancel();
    s.speaking = true;
    s.waiting = false;
    if (seq !== null) s.speakSeq = seq;
    const u = new SpeechSynthesisUtterance(content);
    u.lang = 'es-PE';
    u.rate = 0.94;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.toLowerCase() === 'es-pe') ||
      voices.find(v => v.lang.toLowerCase().startsWith('es-'));
    if (voice) u.voice = voice;
    const finish = () => {
      if (token !== s.speechToken) return;
      s.speaking = false;
      s.preview = '';
      if (s.enabled) {
        s.setStatus('🎙️ Tu turno', 'Pepper terminó de hablar. Puedes responder ahora.');
        s.restartTimer = setTimeout(s.startRecognition, 350);
      } else s.draw();
    };
    u.onstart = () => s.setStatus('🔊 Pepper está hablando...', 'Escucha la respuesta. Cuando termine, el micrófono volverá a escuchar.');
    u.onend = finish;
    u.onerror = finish;
    window.speechSynthesis.speak(u);
    s.draw();
  };

  s.interrupt = () => {
    ++s.speechToken;
    window.speechSynthesis?.cancel();
    s.speaking = false;
    s.waiting = false;
    s.setStatus('🎙️ Tu turno', 'La respuesta se detuvo. Puedes hablar.');
    s.startRecognition();
  };

  s.stop = () => {
    s.enabled = false;
    s.waiting = false;
    s.wantGreeting = false;
    s.pending = '';
    ++s.speechToken;
    s.stopRecognition();
    window.speechSynthesis?.cancel();
    s.speaking = false;
    s.setStatus('● En pausa', 'Pulsa Iniciar conversación para continuar cuando quieras.');
  };

  s.start = () => {
    if (s.enabled) return;
    if (!s.ensureRecognizer()) return;
    s.enabled = true;
    s.waiting = false;
    s.wantGreeting = s.assistantSeq > s.speakSeq;
    s.setStatus('🎙️ Activando micrófono...', 'El navegador podría solicitar permiso de micrófono por única vez.');
    s.startRecognition();
  };

  return s;
}

export default function (component) {
  const { parentElement, data, setTriggerValue } = component;
  const name = '__smartpizzaLiveVoiceController';
  const s = window[name] || (window[name] = createController());
  s.root = parentElement;
  s.trigger = setTriggerValue;
  s.mounted = true;
  const myMount = ++s.mountVersion;
  if (s.disposeTimer) clearTimeout(s.disposeTimer);

  const currentSeq = Number(data?.assistant_seq || 0);
  const text = String(data?.assistant_text || '');
  if (currentSeq > s.assistantSeq) {
    s.assistantSeq = currentSeq;
    s.assistantText = text;
    // La respuesta nueva viene del servidor después de transcribir una frase.
    if (s.enabled && s.assistantSeq > s.speakSeq) {
      s.speak(text, currentSeq);
    }
  } else {
    s.assistantText = text;
  }

  s.element('voice-start').onclick = s.start;
  s.element('voice-stop').onclick = s.stop;
  s.element('voice-interrupt').onclick = s.interrupt;
  s.element('voice-repeat').onclick = () => {
    if (!s.enabled) { s.start(); return; }
    s.speak(s.assistantText, s.assistantSeq);
  };
  s.draw();

  return () => {
    if (myMount !== s.mountVersion) return;
    // Un rerun de Streamlit puede remontar el mismo componente. Sólo liberar
    // el micrófono si no se produjo un nuevo montaje en 1,5 segundos.
    s.mounted = false;
    s.disposeTimer = setTimeout(() => { if (!s.mounted) s.stop(); }, 1500);
  };
}
