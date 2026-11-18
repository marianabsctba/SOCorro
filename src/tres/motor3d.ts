// Renderizador, cena, câmera e laço principal.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type Qualidade = 'alta' | 'baixa';

export const M = {
  renderer: null as unknown as THREE.WebGLRenderer,
  cena: new THREE.Scene(),
  camera: new THREE.PerspectiveCamera(70, 1, 0.05, 400),
  relogio: new THREE.Clock(),
  atualizar: new Set<(dt: number, t: number) => void>(),
  qualidade: 'alta' as Qualidade,
  ativo: false,
  atualizarSombra: true,
};

export function lerQualidade(): Qualidade {
  try {
    const q = localStorage.getItem('socorro.qualidade');
    if (q === 'alta' || q === 'baixa') return q;
  } catch {
    /* nada */
  }
  // celular fraco começa no modo leve
  const fraco = (navigator.hardwareConcurrency ?? 8) <= 4 || /Android [4-8]\b/.test(navigator.userAgent);
  return fraco ? 'baixa' : 'alta';
}

export function definirQualidade(q: Qualidade) {
  M.qualidade = q;
  try {
    localStorage.setItem('socorro.qualidade', q);
  } catch {
    /* nada */
  }
  if (!M.renderer) return;
  M.renderer.setPixelRatio(Math.min(devicePixelRatio, q === 'alta' ? (matchMedia('(pointer: coarse)').matches ? 1.25 : 1.5) : 0.85));
  M.renderer.shadowMap.enabled = q === 'alta';
  M.cena.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | undefined;
    if (m) m.needsUpdate = true;
  });
  redimensionar();
}

export function iniciar3d(alvo: HTMLElement): HTMLCanvasElement {
  if (M.renderer) {
    alvo.prepend(M.renderer.domElement);
    return M.renderer.domElement;
  }
  M.qualidade = lerQualidade();
  const r = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.3;
  r.shadowMap.enabled = M.qualidade === 'alta';
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  // sombra recalculada algumas vezes por segundo, não a cada quadro
  r.shadowMap.autoUpdate = false;
  r.setPixelRatio(Math.min(devicePixelRatio, M.qualidade === 'alta' ? (matchMedia('(pointer: coarse)').matches ? 1.25 : 1.5) : 0.85));
  r.domElement.className = 'tela3d';
  M.renderer = r;
  alvo.prepend(r.domElement);
  const pm = new THREE.PMREMGenerator(r);
  M.cena.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  M.cena.environmentIntensity = 0.35;
  M.cena.add(M.camera);
  // luz suave de frente, presa na câmera: tira as órbitas escuras dos rostos (luz só de cima deixava todo mundo com cara de assombração)
  const frente = new THREE.DirectionalLight(0xfff1e4, 0.55);
  frente.position.set(0, 0.3, 0);
  frente.target.position.set(0, -0.2, -1);
  M.camera.add(frente, frente.target);
  window.addEventListener('resize', redimensionar);
  redimensionar();
  M.ativo = true;
  let quadro = 0;
  r.setAnimationLoop(() => {
    const dt = Math.min(M.relogio.getDelta(), 0.05);
    const t = M.relogio.elapsedTime;
    if (!M.ativo) return;
    for (const f of M.atualizar) f(dt, t);
    if (++quadro % 6 === 0 || M.atualizarSombra) {
      r.shadowMap.needsUpdate = true;
      M.atualizarSombra = false;
    }
    r.render(M.cena, M.camera);
  });
  return r.domElement;
}

export function redimensionar() {
  if (!M.renderer) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  M.renderer.setSize(w, h);
  M.camera.aspect = w / h;
  M.camera.fov = w < h ? 78 : 68;
  M.camera.updateProjectionMatrix();
}
