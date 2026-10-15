import * as THREE from 'three';
import * as d3 from 'd3';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { categoryConfig } from './data.js';

const vertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform vec3 baseColor;
  uniform float intensity;
  uniform float nodeOpacity;
  varying vec3 vNormal;

  void main() {
    float pulse = sin(time * 2.0) * 0.10 + 0.90;
    float glow = pow(max(0.0, 0.75 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    vec3 color = baseColor * intensity * pulse;
    color += baseColor * glow * 0.55;
    gl_FragColor = vec4(color, nodeOpacity);
  }
`;

export class ConstellationSpiral {
  constructor(containerId, width, height) {
    this.container = document.getElementById(containerId);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07111f);

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 18, 42);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 90;

    this.nodes = [];
    this.connections = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.showAllConnections = false;
    this.currentCategory = 'all';

    // D3 participa en la codificación visual del tamaño de nodo.
    this.radiusScale = d3.scaleLinear().domain([1, 10]).range([0.55, 1.55]);

    this.setupLighting();
    this.addStars();
    this.addSpiralGuide();
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0x7fa6c9, 0.65);
    this.scene.add(ambient);

    const keyLight = new THREE.PointLight(0xffffff, 2.0, 180);
    keyLight.position.set(15, 25, 25);
    this.scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x6aa9ff, 1.2, 140);
    fillLight.position.set(-30, -15, -10);
    this.scene.add(fillLight);
  }

  addStars() {
    const positions = [];
    for (let i = 0; i < 900; i += 1) {
      positions.push(
        (Math.random() - 0.5) * 180,
        (Math.random() - 0.5) * 180,
        (Math.random() - 0.5) * 180
      );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ size: 0.18, color: 0x8ba8c7, transparent: true, opacity: 0.45 });
    this.scene.add(new THREE.Points(geometry, material));
  }

  addSpiralGuide() {
    const points = [];
    for (let stage = 0.5; stage <= 14.6; stage += 0.08) {
      const angle = stage * 0.78;
      const r = 4.2 + stage * 0.72;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, 0));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x244766, transparent: true, opacity: 0.35 });
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
  }

  stageTo3D(stage, category) {
    const angle = stage * 0.78;
    const r = 4.2 + stage * 0.72;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    const z = categoryConfig[category]?.z ?? 0;
    return new THREE.Vector3(x, y, z);
  }

  categoryColor(category) {
    return categoryConfig[category]?.color ?? 0xffffff;
  }

  addNodeWithShader(eventData) {
    const pos = this.stageTo3D(eventData.etapa, eventData.categoria);
    const radius = this.radiusScale(eventData.importancia);
    const geometry = new THREE.SphereGeometry(radius, 32, 32);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(this.categoryColor(eventData.categoria)) },
        intensity: { value: 1.0 + eventData.importancia * 0.08 },
        nodeOpacity: { value: 0.96 }
      },
      transparent: true,
      depthWrite: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(pos);
    mesh.userData = {
      ...eventData,
      shaderUniforms: material.uniforms
    };

    const glowGeometry = new THREE.SphereGeometry(radius * 1.55, 24, 24);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.categoryColor(eventData.categoria),
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
      depthWrite: false
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    mesh.add(glow);

    this.scene.add(mesh);
    this.nodes.push(mesh);
    return mesh;
  }

  addCausalConnections() {
    this.connections.forEach(conn => this.scene.remove(conn.mesh));
    this.connections = [];

    this.nodes.forEach(sourceNode => {
      const sourceData = sourceNode.userData;
      if (!Array.isArray(sourceData.conexiones)) return;

      sourceData.conexiones.forEach(targetId => {
        const targetNode = this.nodes.find(node => node.userData.id === targetId);
        if (!targetNode) return;

        const curve = this.createConnectionCurve(sourceNode, targetNode);
        this.scene.add(curve);
        this.connections.push({
          source: sourceNode,
          target: targetNode,
          mesh: curve,
          phase: Math.random() * Math.PI * 2
        });
      });
    });
  }

  createConnectionCurve(nodeA, nodeB) {
    const start = nodeA.position.clone();
    const end = nodeB.position.clone();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    const direction = end.clone().sub(start);
    const lateral = new THREE.Vector3(-direction.y, direction.x, 0).normalize();
    mid.add(lateral.multiplyScalar(2.5));
    mid.z += 2.8;

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(72);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0xbfd9ff,
      transparent: true,
      opacity: 0.0
    });

    return new THREE.Line(geometry, material);
  }

  setShowAllConnections(value) {
    this.showAllConnections = Boolean(value);
  }

  setCategoryFilter(category) {
    this.currentCategory = category;
    this.nodes.forEach(node => {
      const visible = category === 'all' || node.userData.categoria === category;
      node.visible = visible;
    });
  }

  updateConnectionsByZoom(timeSeconds = 0) {
    this.connections.forEach(conn => {
      const categoryVisible = conn.source.visible && conn.target.visible;
      if (!categoryVisible) {
        conn.mesh.visible = false;
        return;
      }

      conn.mesh.visible = true;
      const pulse = 0.75 + 0.25 * Math.sin(timeSeconds * 3.0 + conn.phase);

      if (this.showAllConnections) {
        conn.mesh.material.opacity = 0.78 * pulse;
        return;
      }

      const sourceDistance = conn.source.position.distanceTo(this.camera.position);
      const targetDistance = conn.target.position.distanceTo(this.camera.position);
      const distance = Math.min(sourceDistance, targetDistance);

      // Más cerca = mayor opacidad. A 36 unidades o más la conexión desaparece.
      const opacity = THREE.MathUtils.clamp((36 - distance) / 18, 0, 1);
      conn.mesh.material.opacity = opacity * 0.9 * pulse;
    });
  }

  getIntersectedNode(clientX, clientY) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const visibleNodes = this.nodes.filter(node => node.visible);
    const intersects = this.raycaster.intersectObjects(visibleNodes, false);
    return intersects.length > 0 ? intersects[0].object : null;
  }

  resetCamera() {
    this.camera.position.set(0, 18, 42);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    const time = performance.now() * 0.001;

    this.nodes.forEach(node => {
      if (node.userData.shaderUniforms) {
        node.userData.shaderUniforms.time.value = time;
      }
    });

    this.updateConnectionsByZoom(time);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
