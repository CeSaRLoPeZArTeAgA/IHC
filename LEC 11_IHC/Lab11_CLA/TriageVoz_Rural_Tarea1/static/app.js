'use strict';
const $ = id => document.getElementById(id);
const TRAITS = [
  ['amabilidad','Amabilidad','0 = directo · 10 = cálido'],
  ['formalidad','Formalidad','0 = cotidiano · 10 = muy formal'],
  ['humor','Humor','Nunca bromear sobre síntomas'],
  ['entusiasmo','Entusiasmo','0 = sobrio · 10 = enérgico'],
  ['empatia','Empatía','0 = neutro · 10 = comprensivo'],
  ['paciencia','Paciencia','0 = conciso · 10 = pausado']
];
let presets = {}, custom = false, basePrompt = '', editedPrompt = false, promptSeq = 0, groqReady = false, providers = {}; 
let ws = null, active = false, withMic = false, stream = null, audioCtx = null,
    analyser = null, recorder = null, segments = [], voiceStarted = 0, quietStarted = 0,
    hasVoice = false, sending = false, speaking = false, loopId = 0,
    holdUntil = 0, mime = '', lastReply = '', started = false;

function status(text){ $('status').textContent=text; }
function addMessage(role,text){
  const empty = document.querySelector('.empty-chat'); if(empty) empty.remove();
  const msg = document.createElement('div');msg.className='msg '+role;
  const avatar=document.createElement('div');avatar.className='avatar';avatar.textContent=role==='user'?'☺':'✚';
  const bubble=document.createElement('div');bubble.className='bubble';
  const name=document.createElement('span');name.className='who';name.textContent=role==='user'?'Paciente':'TriageVoz Rural';
  const body=document.createElement('span');body.textContent=text;
  bubble.append(name,body);msg.append(avatar,bubble);$('messages').append(msg);$('messages').scrollTop=$('messages').scrollHeight;
}
function setTab(id){
  document.querySelectorAll('.tab').forEach(tab=>{
    const on=tab.dataset.tab===id;tab.classList.toggle('active',on);tab.setAttribute('aria-selected',String(on));
  });
  document.querySelectorAll('.page').forEach(page=>{
    const on=page.id==='page-'+id;page.classList.toggle('active',on);page.hidden=!on;
  });
}
function currentPersonality(){const p={};for(const [name] of TRAITS)p[name]=Number($('trait-'+name).value);return p;}
function loadValues(values){
  for(const [name] of TRAITS){$('trait-'+name).value=Number(values[name]??5);$('value-'+name).textContent=$('trait-'+name).value;}
  editedPrompt=false;refreshPrompt();syncSettings();
}
function setupSliders(){
  for(const [name,label,help] of TRAITS){
    const block=document.createElement('div');block.className='slider-block';
    const line=document.createElement('div');line.className='slider-line';
    const l=document.createElement('label');l.htmlFor='trait-'+name;l.textContent=label;
    const value=document.createElement('span');value.className='slider-value';value.id='value-'+name;value.textContent='0';
    line.append(l,value);
    const slider=document.createElement('input');slider.type='range';slider.id='trait-'+name;
    slider.min='0';slider.max='10';slider.step='1';slider.value='5';slider.setAttribute('aria-label',label);
    const hint=document.createElement('div');hint.className='slider-help';hint.textContent=help;
    block.append(line,slider,hint);$('sliderList').appendChild(block);
    slider.addEventListener('input',()=>{
      value.textContent=slider.value;custom=true;$('preset').value='__custom__';
      editedPrompt=false;refreshPrompt();syncSettings();
    });
  }
}
function paramsFromPersonality(){return new URLSearchParams(currentPersonality()).toString();}
async function refreshPrompt(){
  const seq=++promptSeq;
  try{
    const res=await fetch('/api/prompt?'+paramsFromPersonality());if(!res.ok)throw Error('No se pudo cargar el prompt');
    const result=await res.json();if(seq!==promptSeq)return;
    basePrompt=result.prompt;
    if(!editedPrompt)$('promptText').value=basePrompt;
    $('promptState').textContent='Perfil: '+$('preset').selectedOptions[0].textContent;
    syncSettings();
  }catch(error){$('promptSaved').textContent='No se pudo recuperar el prompt del servidor.';}
}
function effectivePrompt(){return $('promptText').value||basePrompt;}
function settingsPacket(action){return {action,personality:currentPersonality(),allow_provider:$('consent').checked,provider:$('provider').value,prompt_edit: editedPrompt ? effectivePrompt() : ''};}
function syncSettings(){
  if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify(settingsPacket('settings')));
}
async function bootstrap(){
  setupSliders();
  for(const tab of document.querySelectorAll('.tab'))tab.addEventListener('click',()=>setTab(tab.dataset.tab));
  const config=await fetch('/api/config').then(r=>r.json());
  if(!config.build || config.build!=='LEC11-T1-2026.11.10-R3')throw Error('VERSIÓN INCOMPATIBLE: ejecuta INICIAR_TRIAGEVOZ.bat desde la carpeta nueva.');
  $('versionTag').textContent=config.build;
  $('buildNotice').textContent=config.build+' · app actualizada';
  presets=config.presets; groqReady=Boolean(config.groq_ready); providers=config.providers||{};
  for(const name of Object.keys(presets)){$('preset').add(new Option(name,name));}
  $('preset').add(new Option('Personalizada','__custom__'));
  const initial='Cercana y comprensiva';$('preset').value=initial;loadValues(presets[initial]);
  refreshProviderInfo();
  $('preset').addEventListener('change',()=>{const name=$('preset').value;if(presets[name]){custom=false;loadValues(presets[name]);}});
  $('resetProfile').onclick=()=>{const name=presets[$('preset').value]?$('preset').value:'Cercana y comprensiva';$('preset').value=name;loadValues(presets[name]);};
  $('promptText').addEventListener('input',()=>{editedPrompt=true;$('promptSaved').textContent='Prompt modificado: se aplicará solo en respuestas del LLM.';syncSettings();});
  $('restorePrompt').onclick=()=>{editedPrompt=false;$('promptText').value=basePrompt;$('promptSaved').textContent='Restaurado.';syncSettings();};
  $('copyPrompt').onclick=async()=>{try{await navigator.clipboard.writeText(effectivePrompt());$('promptSaved').textContent='Prompt copiado al portapapeles.';}catch{ $('promptText').select();$('promptSaved').textContent='Seleccionado. Usa Ctrl+C para copiar.'; }};
  $('consent').addEventListener('change',syncSettings);$('provider').addEventListener('change',()=>{refreshProviderInfo();syncSettings();});
  $('sens').addEventListener('input',()=>{$('sensValue').textContent=$('sens').value;});
  $('startVoice').onclick=()=>startSession(true);$('startText').onclick=()=>startSession(false);
  $('stop').onclick=stopSession;$('repeat').onclick=()=>{if(lastReply)readAloud(lastReply);};
  $('send').onclick=sendTyped;$('textInput').addEventListener('keydown',e=>{if(e.key==='Enter')sendTyped();});
  $('generate').onclick=generateDialogues;$('compareLLM').onclick=compareModels;
  for(const id of ['largeText','highContrast']) {const el=$(id);try{el.checked=localStorage.getItem('triagevoz_ui_'+id)==='true';}catch{}el.addEventListener('change',()=>{try{localStorage.setItem('triagevoz_ui_'+id,String(el.checked));}catch{}applyAccessibility();});}applyAccessibility();
  document.querySelectorAll('.zone-button').forEach(button=>button.addEventListener('click',()=>{if(!active){status('Inicia por texto o voz antes de seleccionar una zona.');return;}$('textInput').value='Siento una molestia en '+button.dataset.zone+'. ';$('textInput').focus();status('Zona agregada como borrador. Completa la molestia y pulsa Enviar.');}));
  await loadExamples();
}
async function loadExamples(){
  try{const d=await fetch('/api/examples').then(r=>r.json());renderExamples(d.examples,'ilustrativo');}
  catch{$('originExamples').textContent='No se pudieron cargar los ejemplos.';}
}
function renderExamples(examples,mode){
  $('examples').replaceChildren();
  for(const ex of examples){
    const card=document.createElement('article');card.className='example';
    const head=document.createElement('div');head.className='example-header';
    const title=document.createElement('h3');title.textContent=ex.name;head.append(title);
    const tags=document.createElement('div');tags.className='trait-tags';
    const abbrev={amabilidad:'Am',formalidad:'Fo',humor:'Hu',entusiasmo:'En',empatia:'Em',paciencia:'Pa'};
    for(const key of Object.keys(abbrev)){const tag=document.createElement('span');tag.className='trait-tag';tag.textContent=abbrev[key]+' '+ex.personality[key];tags.append(tag);}
    const source=document.createElement('div');source.className='source-chip';source.textContent=ex.source?.startsWith('generado_con_')?'Generado con '+ex.source.replace('generado_con_','')+' · '+(ex.model||''):'Ejemplo ilustrativo precargado';
    head.append(tags,source);card.append(head);
    for(const line of ex.dialogue){const sample=document.createElement('div');sample.className='sample';
      for(const [kind,name,text] of [['person','Paciente',line.paciente],['agent','VUI',line.asistente]]){
        const para=document.createElement('p');para.className=kind;
        const nameEl=document.createElement('b');nameEl.textContent=name+': ';
        const content=document.createTextNode(text);para.append(nameEl,content);sample.append(para);
      }card.append(sample);
    }
    const detail=document.createElement('details');const summary=document.createElement('summary');summary.textContent=ex.source?.startsWith('generado_con_')?'Ver prompt utilizado':'Ver prompt para este perfil';
    const pre=document.createElement('pre');pre.textContent=ex.prompt;detail.append(summary,pre);card.append(detail);$('examples').append(card);
  }
  $('originExamples').textContent=mode==='ia'?'Las tres versiones fueron generadas con el LLM usando las mismas cuatro frases del paciente.':'Ejemplos ilustrativos precargados. Usa el botón para generarlos con la IA.';
}
async function generateDialogues(){
  if(!$('consent').checked){$('originExamples').textContent='Activa el consentimiento antes de enviar el ejemplo sintético al proveedor.';return;}
  const button=$('generate');button.disabled=true;button.textContent='Generando tres versiones…';
  try{const response=await fetch('/api/generate-examples',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({allow_provider:true,provider:$('provider').value})});
      const d=await response.json();if(!response.ok)throw Error(d.detail||'No fue posible generar los diálogos');renderExamples(d.examples,'ia');
  }catch(e){$('originExamples').textContent='No se pudo generar con IA: '+e.message+' Los ejemplos precargados siguen disponibles.';}
  finally{button.disabled=false;button.textContent='✦ Generar tres diálogos con IA';}
}
function applyAccessibility(){document.body.classList.toggle('text-large',$('largeText').checked);document.body.classList.toggle('contrast-high',$('highContrast').checked);}
function refreshProviderInfo(){const selected=$('provider').value;const value=providers[selected];const details=value?`${value.model} · ${value.ready?'clave configurada':'sin clave'}`:'Proveedor no configurado';$('modelInfo').textContent=details+' · Whisper (Groq) solo para entrada de audio.';$('apiNote').textContent=groqReady?'Whisper listo si autorizas el audio.':'Para usar micrófono con Whisper debes configurar GROQ_API_KEY. El texto y los intents siguen disponibles.';}
async function compareModels(){
  const el=$('compareResults'),btn=$('compareLLM');if(!$('consent').checked){el.textContent='Activa primero el consentimiento del panel izquierdo.';return;}
  btn.disabled=true;el.textContent='Consultando modelos con un ejemplo ficticio…';
  try{const r=await fetch('/api/compare-models',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({allow_provider:true,personality:currentPersonality()})});const d=await r.json();if(!r.ok)throw Error(d.detail||'Error de comparación');
      el.replaceChildren();for(const v of d.results){const card=document.createElement('article');card.className='compare-result';const title=document.createElement('strong');title.textContent=v.provider.toUpperCase()+' · '+v.model;const meta=document.createElement('small');meta.textContent=v.status==='ok'?'Tiempo observado: '+v.elapsed_ms+' ms':v.status==='no_configurado'?'Clave no configurada':v.detail;const result=document.createElement('p');result.textContent=v.text||'Sin respuesta';card.append(title,meta,result);el.append(card);}const foot=document.createElement('small');foot.textContent=d.notice;el.append(foot);
  }catch(e){el.textContent='Error: '+e.message;}finally{btn.disabled=false;}
}
function setActive(on){
  active=on;$('startVoice').disabled=on;$('startText').disabled=on;$('stop').disabled=!on;
  $('send').disabled=!on;$('textInput').disabled=!on;$('repeat').disabled=!on;
  $('micLamp').textContent=withMic&&on?'● Micrófono activo':'Micrófono inactivo';$('micLamp').classList.toggle('on',withMic&&on);
  $('modeText').textContent=on?(withMic?'Sesión con audio por WebSocket':'Sesión por texto'):'Esperando inicio de sesión';
}
async function setupAudio(){
  if(!window.MediaRecorder)throw Error('MediaRecorder no está disponible en este navegador.');
  stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  audioCtx=new (window.AudioContext||window.webkitAudioContext)();await audioCtx.resume();
  const source=audioCtx.createMediaStreamSource(stream);analyser=audioCtx.createAnalyser();analyser.fftSize=1024;source.connect(analyser);
}
async function startSession(useMicrophone){
  if(active)return;
  if(useMicrophone&&!groqReady){status('Para hablar con Whisper, coloca GROQ_API_KEY en .env y reinicia el servidor. Puedes usar modo texto ahora.');return;}
  if(useMicrophone&&!$('consent').checked){status('Marca el consentimiento del panel izquierdo antes de usar Groq para voz.');return;}
  withMic=useMicrophone;
  $('messages').innerHTML='';lastReply='';$('routeName').textContent='—';$('routePill').textContent='Sin iniciar';
  let fallbackReason='';
  if(useMicrophone){try{await setupAudio();}catch(e){withMic=false;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}fallbackReason='No se pudo iniciar el micrófono: '+e.message+'. Continúa por texto.';}}
  const protocol=location.protocol==='https:'?'wss://':'ws://';
  ws=new WebSocket(protocol+location.host+'/ws');setActive(true);status('Conectando con el servidor…');
  ws.onopen=()=>{ws.send(JSON.stringify(settingsPacket('start')));status(fallbackReason || (withMic?'Micrófono encendido. Habla cuando quieras.':'Conectado. Puedes responder por texto.'));if(withMic)monitorAudio();};
  ws.onmessage=e=>{
    let msg;try{msg=JSON.parse(e.data);}catch{return;}
    if(msg.type==='transcript'){addMessage('user',msg.text);$('liveText').textContent='Paciente: '+msg.text;}
    if(msg.type==='reply'){
      sending=false;hasVoice=false;quietStarted=0;holdUntil=performance.now()+500;
      addMessage('bot',msg.reply);$('routeName').textContent=msg.route;$('routePill').textContent=msg.route;
      lastReply=msg.reply;$('liveText').textContent='Asistente: '+msg.reply;
      status(msg.route==='seguridad'?'Alerta ilustrativa: solicita atención médica urgente.':(withMic?'Escuchando. Puedes interrumpir la voz del asistente.':'Listo para tu siguiente mensaje.'));
      readAloud(msg.reply);
    }
    if(msg.type==='error'){sending=false;status('Atención: '+msg.text);$('liveText').textContent=msg.text;}
  };
  ws.onerror=()=>status('No se pudo establecer la conexión al servidor.');
  ws.onclose=()=>{if(active)stopSession('El WebSocket se cerró. Vuelve a iniciar la sesión.');};
}
function interruptSpeech(){if(speaking){speechSynthesis.cancel();speaking=false;status('Respuesta interrumpida; escuchando al paciente…');}}
function readAloud(text){
  if(!active||!$('tts').checked||!('speechSynthesis' in window))return;
  speechSynthesis.cancel();speaking=false;const u=new SpeechSynthesisUtterance(text);
  u.lang='es-PE';u.rate=1.0;u.pitch=1;u.volume=1;
  speaking=true;u.onend=()=>{speaking=false;holdUntil=performance.now()+250;};u.onerror=()=>{speaking=false;};
  speechSynthesis.speak(u);
}
function chooseMime(){
  if(!window.MediaRecorder)return '';
  for(const m of ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'])if(MediaRecorder.isTypeSupported(m))return m;
  return '';
}
function startRecord(){
  if(!withMic||!stream||recorder||sending||!active)return;
  mime=chooseMime();if(!mime){status('El navegador no admite grabación WebM/OGG. Usa Chrome o Edge.');return;}
  interruptSpeech();segments=[];recorder=new MediaRecorder(stream,{mimeType:mime});
  if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify({action:'format',mime}));
  recorder.ondataavailable=e=>{if(e.data.size>0)segments.push(e.data);};
  recorder.onstop=async()=>{
    const audio=new Blob(segments,{type:mime});recorder=null;segments=[];
    if(!active||!ws||ws.readyState!==WebSocket.OPEN)return;
    if(audio.size<=1500){status('No se detectó suficiente audio. Vuelve a hablar.');return;}
    sending=true;status('Transcribiendo con Whisper…');$('liveText').textContent='Procesando el fragmento de voz…';
    try{ws.send(await audio.arrayBuffer());}catch{sending=false;status('Error al enviar el audio.');}
  };
  recorder.start();status('Escuchando tu intervención…');
}
function stopRecord(){if(recorder&&recorder.state==='recording')recorder.stop();}
function monitorAudio(){
  if(!active||!withMic||!analyser)return;
  const data=new Uint8Array(analyser.fftSize);analyser.getByteTimeDomainData(data);
  let sum=0;for(const x of data){const v=(x-128)/128;sum+=v*v;}const rms=Math.sqrt(sum/data.length);
  const now=performance.now(),voiced=rms>Number($('sens').value);
  if(!sending){
    if(voiced){if(!voiceStarted)voiceStarted=now;quietStarted=0;
      if(now-voiceStarted>200&&!hasVoice&&now>holdUntil){hasVoice=true;startRecord();}}
    else{voiceStarted=0;if(hasVoice){if(!quietStarted)quietStarted=now;
        if(now-quietStarted>850){hasVoice=false;quietStarted=0;stopRecord();}}}
  }
  loopId=requestAnimationFrame(monitorAudio);
}
function sendTyped(){
  const text=$('textInput').value.trim();if(!text)return;
  if(!active||!ws||ws.readyState!==WebSocket.OPEN){status('Inicia primero la sesión.');return;}
  if(sending){status('Todavía se procesa la intervención anterior.');return;}
  interruptSpeech();$('textInput').value='';sending=true;
  ws.send(JSON.stringify({...settingsPacket('message'),text}));status('Procesando respuesta…');
}
function stopSession(message='Sesión detenida. El micrófono está apagado.'){
  active=false;cancelAnimationFrame(loopId);if('speechSynthesis' in window)speechSynthesis.cancel();speaking=false;
  if(recorder&&recorder.state==='recording'){try{recorder.stop();}catch{}}recorder=null;
  if(stream){for(const track of stream.getTracks())track.stop();stream=null;}
  if(audioCtx){audioCtx.close().catch(()=>{});audioCtx=null;}
  analyser=null;hasVoice=false;sending=false;voiceStarted=0;quietStarted=0;
  if(ws){try{ws.close();}catch{}ws=null;}
  withMic=false;setActive(false);status(message);
}
document.addEventListener('DOMContentLoaded',()=>bootstrap().catch(e=>status('Error al preparar la aplicación: '+e.message)));
