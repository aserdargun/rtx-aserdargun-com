import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { Category } from '../data/content';

export type CameraView = 'assembled' | 'exploded' | 'top';
export interface Part { id: string; label: string; category: Category; anchor: [number, number, number]; layer: number }
export interface ModelManifest { parts: Part[]; cpuCores: number; cudaCores: number; representation: string }
export interface SceneState { selected: string; category: Category; separation: number; playing: boolean; flowVisible: boolean; speed: number; rotate: boolean; isolate: boolean; labels: boolean; path: string[]; step: number }
const defaults: SceneState = { selected: 'overview', category: 'overview', separation: 0, playing: false, flowVisible: false, speed: 1, rotate: false, isolate: false, labels: true, path: [], step: 0 };

export class AtlasScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly camera = new THREE.OrthographicCamera(-7, 7, 5, -5, .1, 100);
  readonly scene = new THREE.Scene();
  readonly controls: OrbitControls;
  state = { ...defaults };
  manifest: ModelManifest | null = null;
  private frame = 0;
  private disposed = false;
  private lastTime = 0;
  private phase = 0;
  private groups: THREE.Object3D[] = [];
  private model: THREE.Object3D | null = null;
  private materials: { material: THREE.MeshStandardMaterial; color: THREE.Color; emissive: THREE.Color; intensity: number; part: string; category: Category }[] = [];
  private resize: ResizeObserver;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private down = [0, 0];
  private pmrem: THREE.PMREMGenerator;
  private environment: THREE.WebGLRenderTarget;
  private flow = new THREE.Group();
  private flowLine: THREE.Line;
  private particles: THREE.Mesh[] = [];
  private cameraGoal: { position: THREE.Vector3; target: THREE.Vector3; zoom: number } | null = null;
  private lastFlow = '';
  private resizeHandler: () => void;
  private onPointerDown: (event: PointerEvent) => void;
  private onPointerUp: (event: PointerEvent) => void;
  private onContextLost: (event: Event) => void;
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private host: HTMLElement, private onSelect: (id: string) => void, private onError: () => void) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = .92;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.domElement.setAttribute('aria-label', 'Interactive representative RTX Spark N1X model');
    this.renderer.domElement.setAttribute('role', 'img');
    this.host.appendChild(this.renderer.domElement);
    this.camera.position.set(1.8, 11, 7.2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, .3, .4);
    this.controls.enableDamping = !this.reduced;
    this.controls.dampingFactor = .075;
    this.controls.minZoom = .65;
    this.controls.maxZoom = 8;
    this.controls.maxPolarAngle = Math.PI * .49;
    this.controls.minPolarAngle = .025;
    this.controls.autoRotateSpeed = .6;
    this.controls.addEventListener('start', () => { this.cameraGoal = null; });
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.environment = this.pmrem.fromScene(room, .04);
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = .32;
    room.dispose();
    this.scene.add(new THREE.HemisphereLight(0xdffaff, 0x253829, .9));
    const key = new THREE.DirectionalLight(0xfff1dc, 1.8);
    key.position.set(-3, 9, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -8; key.shadow.camera.right = 8;
    key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
    key.shadow.normalBias = .025;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x8be5f3, .8); fill.position.set(5, 4, -6); this.scene.add(fill);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: .3 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -.29; floor.receiveShadow = true; this.scene.add(floor);
    this.flowLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x8af2ea, transparent: true, opacity: .7, depthTest: false }));
    this.flow.add(this.flowLine);
    const particleGeometry = new THREE.SphereGeometry(.038, 8, 6);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xbcfff7, depthTest: false });
    for (let i = 0; i < 22; i++) { const mesh = new THREE.Mesh(particleGeometry, particleMaterial); mesh.renderOrder = 5; this.flow.add(mesh); this.particles.push(mesh); }
    this.scene.add(this.flow);
    this.resizeHandler = () => {
      const { width, height } = this.host.getBoundingClientRect();
      const ratio = width / Math.max(height, 1);
      const h = ratio < 1 ? 11.6 / ratio : 7.65;
      this.camera.left = -h * ratio / 2; this.camera.right = h * ratio / 2;
      this.camera.top = h / 2; this.camera.bottom = -h / 2; this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
    };
    this.resize = new ResizeObserver(this.resizeHandler); this.resize.observe(this.host); this.resizeHandler();
    this.onPointerDown = e => { this.down = [e.clientX, e.clientY]; };
    this.onPointerUp = e => {
      if (Math.hypot(e.clientX - this.down[0], e.clientY - this.down[1]) > 5 || !this.model) return;
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
      this.raycaster.setFromCamera(this.pointer, this.camera);
      for (const hit of this.raycaster.intersectObject(this.model, true)) {
        let node: THREE.Object3D | null = hit.object;
        let visible = true; for (let n: THREE.Object3D | null = node; n; n = n.parent) if (!n.visible) visible = false;
        if (!visible) continue;
        while (node && !node.userData.partId) node = node.parent;
        if (node?.userData.partId && node.userData.partId !== 'overview') { this.onSelect(node.userData.partId); break; }
      }
    };
    this.onContextLost = e => { e.preventDefault(); this.onError(); };
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointerup', this.onPointerUp);
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
    this.frame = requestAnimationFrame(this.tick);
  }

  async load() {
    const [gltf, response] = await Promise.all([new GLTFLoader().loadAsync('/models/rtx-spark-n1x-128gb.glb'), fetch('/models/architecture.json')]);
    if (!response.ok) throw new Error('Model manifest unavailable');
    const manifest = await response.json() as ModelManifest;
    if (this.disposed) { this.disposeObject(gltf.scene); return; }
    this.manifest = manifest; this.model = gltf.scene;
    gltf.scene.traverse(node => {
      if (node.userData.partId) { node.userData.basePosition = node.position.clone(); this.groups.push(node); }
      if (node instanceof THREE.Mesh) {
        node.castShadow = true; node.receiveShadow = true;
        let parent: THREE.Object3D | null = node; while (parent && !parent.userData.partId) parent = parent.parent;
        const materials = (Array.isArray(node.material) ? node.material : [node.material]).map(material => {
          const mat = (material as THREE.MeshStandardMaterial).clone();
          this.materials.push({ material: mat, color: mat.color.clone(), emissive: mat.emissive.clone(), intensity: mat.emissiveIntensity, part: parent?.userData.partId || 'overview', category: parent?.userData.category || 'overview' });
          return mat;
        });
        node.material = materials.length === 1 ? materials[0] : materials;
      }
    });
    this.scene.add(gltf.scene); this.update(this.state); this.controls.update(); this.renderer.render(this.scene, this.camera);
  }

  update(next: SceneState) {
    this.state = next; this.controls.autoRotate = next.rotate;
    this.model?.traverse(node => { if (node.userData.isLegend) node.visible = next.labels; });
    for (const group of this.groups) {
      group.visible = !next.isolate || next.category === 'overview' || group.userData.category === next.category;
    }
    for (const m of this.materials) {
      const selected = next.selected !== 'overview' && (m.part === next.selected || (next.selected === next.category && m.category === next.category));
      const inCategory = next.category === 'overview' || m.category === next.category;
      m.material.color.copy(m.color).multiplyScalar(inCategory ? 1 : .58);
      m.material.emissive.copy(selected ? new THREE.Color(0x84b868) : m.emissive);
      m.material.emissiveIntensity = selected ? .19 : m.intensity;
    }
  }

  view(view: CameraView) {
    this.cameraGoal = { position: view === 'top' ? new THREE.Vector3(0, 14, .76) : new THREE.Vector3(1.8, view === 'exploded' ? 12 : 11, 7.2), target: new THREE.Vector3(0, view === 'exploded' ? .9 : .3, .4), zoom: view === 'exploded' ? .88 : 1 };
  }
  focus(id: string) {
    const part = this.manifest?.parts.find(p => p.id === id);
    if (!part) return;
    const target = this.anchor(part);
    this.cameraGoal = { position: target.clone().add(new THREE.Vector3(.6, 9, 5)), target, zoom: id.startsWith('cpu') && id.includes('_') ? 6 : ['cpu0','cpu1','tensor','rt'].includes(id) ? 3.2 : 2 };
  }
  snapshot(): Promise<Blob> {
    this.renderer.render(this.scene, this.camera);
    return new Promise((resolve, reject) => this.renderer.domElement.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG export unavailable')), 'image/png'));
  }
  zoom(delta: number) { this.camera.zoom = THREE.MathUtils.clamp(this.camera.zoom * delta, .65, 8); this.camera.updateProjectionMatrix(); this.cameraGoal = null; }
  private anchor(part: Part) { return new THREE.Vector3(...part.anchor).add(new THREE.Vector3(0, part.layer * this.state.separation * 1.25 + .08, 0)); }
  private tick = (time: number) => {
    if (this.disposed) return;
    const dt = Math.min((time - this.lastTime) / 1000 || .016, .05); this.lastTime = time;
    const smooth = this.reduced ? 1 : 1 - Math.exp(-dt * 8);
    for (const group of this.groups) {
      const base = group.userData.basePosition as THREE.Vector3;
      const targetY = base.y + (group.userData.layer || 0) * this.state.separation * 1.25;
      group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, smooth);
    }
    if (this.cameraGoal) {
      this.camera.position.lerp(this.cameraGoal.position, smooth);
      this.controls.target.lerp(this.cameraGoal.target, smooth);
      this.camera.zoom = THREE.MathUtils.lerp(this.camera.zoom, this.cameraGoal.zoom, smooth); this.camera.updateProjectionMatrix();
      if (this.camera.position.distanceTo(this.cameraGoal.position) < .005) this.cameraGoal = null;
    }
    this.controls.update(dt);
    this.flow.visible = this.state.flowVisible && !this.state.isolate;
    if (this.flow.visible && this.manifest) {
      if (this.state.playing) this.phase += dt * this.state.speed * .18;
      const parts = this.state.path.map(id => this.manifest!.parts.find(p => p.id === id)).filter((p): p is Part => !!p);
      if (parts.length >= 2) {
        const idx = this.state.step % parts.length;
        const a = this.anchor(parts[idx]); const b = this.anchor(parts[(idx + 1) % parts.length]);
        const curve = new THREE.QuadraticBezierCurve3(a, a.clone().lerp(b, .5).add(new THREE.Vector3(0, .65, 0)), b);
        const key = `${idx}:${this.state.path}:${this.state.separation}`;
        if (key !== this.lastFlow) { this.flowLine.geometry.dispose(); this.flowLine.geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50)); this.lastFlow = key; }
        for (let i = 0; i < this.particles.length; i++) this.particles[i].position.copy(curve.getPoint((this.phase + i / this.particles.length) % 1));
      }
    }
    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame(this.tick);
  };
  private disposeObject(object: THREE.Object3D) {
    const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>();
    object.traverse(node => { if (node instanceof THREE.Mesh || node instanceof THREE.Line) { geometries.add(node.geometry); (Array.isArray(node.material) ? node.material : [node.material]).forEach(m => materials.add(m)); } });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
  }
  dispose() {
    this.disposed = true; cancelAnimationFrame(this.frame); this.resize.disconnect(); this.controls.dispose();
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown); this.renderer.domElement.removeEventListener('pointerup', this.onPointerUp); this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
    this.disposeObject(this.scene); this.environment.dispose(); this.pmrem.dispose(); this.renderer.dispose(); this.renderer.domElement.remove();
  }
}
