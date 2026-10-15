import * as d3 from 'd3';
import { ConstellationSpiral } from './constellation.js';
import { LLMClient } from './llm-client.js';
import { triageData, categoryConfig } from './data.js';
import { API_KEY, GEMINI_MODEL } from './config.js';

class TriageVozConstellationApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.constellation = new ConstellationSpiral(
      'canvas-container',
      this.container.clientWidth,
      this.container.clientHeight
    );

    this.llm = new LLMClient(API_KEY, GEMINI_MODEL);
    this.currentCharacter = null;
    this.currentNode = null;

    this.initData();
    this.setupLegend();
    this.setupInteraction();
    this.setupControls();
    this.setupChatUI();
    this.setupResize();
    this.animate();
  }

  initData() {
    triageData.events.forEach(event => {
      this.constellation.addNodeWithShader(event);
    });
    this.constellation.addCausalConnections();

    document.getElementById('node-count').textContent = triageData.events.length;
    document.getElementById('connection-count').textContent = this.constellation.connections.length;
    document.getElementById('character-count').textContent = triageData.events.filter(e => e.prompt_personaje).length;
  }

  setupLegend() {
    const legend = d3.select('#legend-items');
    Object.entries(categoryConfig).forEach(([key, config]) => {
      const item = legend.append('div').attr('class', 'legend-item');
      item.append('span')
        .attr('class', 'legend-dot')
        .style('background', `#${config.color.toString(16).padStart(6, '0')}`);
      item.append('span').text(config.nombre);
    });
  }

  setupInteraction() {
    const canvas = this.constellation.renderer.domElement;
    const tooltip = d3.select('#tooltip');

    canvas.addEventListener('mousemove', event => {
      const node = this.constellation.getIntersectedNode(event.clientX, event.clientY);
      canvas.style.cursor = node ? 'pointer' : 'grab';

      if (!node) {
        tooltip.classed('visible', false);
        return;
      }

      const data = node.userData;
      document.getElementById('tooltip-title').textContent = data.nombre;
      document.getElementById('tooltip-rf').textContent = data.requerimiento;
      document.getElementById('tooltip-summary').textContent = data.resumen;
      document.getElementById('tooltip-category').textContent = categoryConfig[data.categoria]?.nombre || data.categoria;

      tooltip
        .style('left', `${event.clientX + 16}px`)
        .style('top', `${event.clientY + 16}px`)
        .classed('visible', true);
    });

    canvas.addEventListener('mouseleave', () => {
      tooltip.classed('visible', false);
    });

    canvas.addEventListener('click', event => {
      const node = this.constellation.getIntersectedNode(event.clientX, event.clientY);
      if (!node) return;
      this.onNodeClick(node.userData);
    });
  }

  setupControls() {
    const categorySelect = document.getElementById('category-filter');
    Object.entries(categoryConfig).forEach(([key, config]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = config.nombre;
      categorySelect.appendChild(option);
    });

    categorySelect.addEventListener('change', () => {
      this.constellation.setCategoryFilter(categorySelect.value);
    });

    const toggle = document.getElementById('toggle-connections');
    toggle.addEventListener('click', () => {
      this.constellation.setShowAllConnections(!this.constellation.showAllConnections);
      toggle.classList.toggle('active', this.constellation.showAllConnections);
      toggle.textContent = this.constellation.showAllConnections
        ? 'Ocultar conexiones globales'
        : 'Mostrar todas las conexiones';
    });

    document.getElementById('reset-camera').addEventListener('click', () => {
      this.constellation.resetCamera();
    });
  }

  onNodeClick(nodeData) {
    this.currentNode = nodeData;
    if (nodeData.prompt_personaje) {
      this.openCharacterChat(nodeData);
    } else {
      this.openNodeInfo(nodeData);
    }
  }

  setPanelHeader(nodeData) {
    const avatar = document.getElementById('chat-avatar');
    const name = document.getElementById('chat-name');
    const subtitle = document.getElementById('chat-subtitle');

    avatar.src = nodeData.avatar || './assets/info.svg';
    avatar.alt = nodeData.nombre;
    name.textContent = nodeData.nombre;
    subtitle.textContent = `${nodeData.id} · ${nodeData.requerimiento} · ${categoryConfig[nodeData.categoria]?.nombre || nodeData.categoria}`;
  }

  openNodeInfo(nodeData) {
    this.currentCharacter = null;
    this.setPanelHeader(nodeData);

    const messages = document.getElementById('chat-messages');
    messages.innerHTML = '';
    this.addMessageToChat('system', nodeData.resumen);

    if (nodeData.stakeholders?.length) {
      this.addMessageToChat('system', `Stakeholders: ${nodeData.stakeholders.join(', ')}`);
    }

    const metadata = Object.entries(nodeData.metadata || {})
      .map(([key, value]) => `${this.prettyKey(key)}: ${value}`)
      .join('\n');
    if (metadata) this.addMessageToChat('system', metadata);

    document.getElementById('chat-form').classList.add('disabled');
    document.getElementById('chat-input').disabled = true;
    document.getElementById('chat-send').disabled = true;
    document.getElementById('chat-panel').classList.add('active');
  }

  openCharacterChat(characterData) {
    this.currentCharacter = characterData;
    this.llm.clearHistory();
    this.setPanelHeader(characterData);

    const messages = document.getElementById('chat-messages');
    messages.innerHTML = '';

    this.addMessageToChat(
      'system',
      `Estás conversando con ${characterData.nombre}. ${characterData.resumen}`
    );

    document.getElementById('chat-form').classList.remove('disabled');
    document.getElementById('chat-input').disabled = false;
    document.getElementById('chat-send').disabled = false;
    document.getElementById('chat-panel').classList.add('active');

    if (!this.llm.isConfigured()) {
      this.addMessageToChat(
        'warning',
        'Gemini aún no está conectado. Abre js/config.js y reemplaza PEGA_AQUI_TU_API_KEY por tu API key de Google AI Studio.'
      );
    }
  }

  prettyKey(key) {
    return key
      .replaceAll('_', ' ')
      .replace(/^./, first => first.toUpperCase());
  }

  setupChatUI() {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');

    form.addEventListener('submit', event => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text || !this.currentCharacter) return;

      this.addMessageToChat('user', text);
      input.value = '';
      this.sendToLLM(text, this.currentCharacter.prompt_personaje);
    });

    document.getElementById('chat-close').addEventListener('click', () => {
      document.getElementById('chat-panel').classList.remove('active');
      this.currentCharacter = null;
      this.currentNode = null;
    });

    document.getElementById('clear-chat').addEventListener('click', () => {
      if (!this.currentCharacter) return;
      this.llm.clearHistory();
      const messages = document.getElementById('chat-messages');
      messages.innerHTML = '';
      this.addMessageToChat('system', `Historial reiniciado para ${this.currentCharacter.nombre}.`);
    });
  }

  async sendToLLM(message, systemPrompt) {
    const temperature = Number(document.getElementById('temperature').value);
    const loading = this.addMessageToChat('loading', `Gemini está respondiendo con temperature = ${temperature}...`);

    try {
      const response = await this.llm.chat(message, systemPrompt, temperature);
      loading.remove();
      this.addMessageToChat('character', response);
    } catch (error) {
      loading.remove();

      if (error.message === 'API_KEY_NOT_CONFIGURED') {
        this.addMessageToChat(
          'error',
          'Falta configurar Gemini. Edita js/config.js y pega tu API key en API_KEY.'
        );
      } else {
        this.addMessageToChat('error', `No se pudo obtener respuesta de Gemini. ${error.message}`);
      }
      console.error(error);
    }
  }

  addMessageToChat(sender, text) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }

  setupResize() {
    window.addEventListener('resize', () => {
      this.constellation.resize(this.container.clientWidth, this.container.clientHeight);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.constellation.animate();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TriageVozConstellationApp();
});
