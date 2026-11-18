// Primeira pessoa: WASD + mouse no computador, joystick + arrastar no celular.
import * as THREE from 'three';
import * as Som from '../motor/som';
import { M } from './motor3d';
import type { Sala } from './soc';

export const OLHO = 1.62; // adulto em pé
const RAIO = 0.32;

export const J = {
  pos: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  livre: false, // jogador controla o movimento
  olho: OLHO,
  area: null as Sala | null,
  alvoOlhar: null as THREE.Vector3 | null, // câmera em modo cena mira aqui
  teclas: new Set<string>(),
  joy: { x: 0, y: 0 },
  toque: false,
  voo: 1,
};

let canvasRef: HTMLCanvasElement | null = null;

export function posicionar(x: number, z: number, yaw: number, olho = OLHO) {
  J.pos.set(x, 0, z);
  J.yaw = yaw;
  J.pitch = -0.04;
  J.olho = olho;
  J.alvoOlhar = null;
}

export function iniciarControles(canvas: HTMLCanvasElement, camada: HTMLElement) {
  canvasRef = canvas;
  J.toque = matchMedia('(pointer: coarse)').matches;
  addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
    J.teclas.add(e.code);
  });
  addEventListener('keyup', (e) => J.teclas.delete(e.code));
  addEventListener('blur', () => J.teclas.clear());
  canvas.addEventListener('click', () => {
    if (J.livre && !J.toque && document.pointerLockElement !== canvas) canvas.requestPointerLock?.();
  });
  addEventListener('mousemove', (e) => {
    if (!J.livre || document.pointerLockElement !== canvas) return;
    girar(e.movementX * 0.0022, e.movementY * 0.0022);
  });

  // celular: joystick à esquerda, olhar arrastando à direita
  const base = document.createElement('div');
  base.className = 'joy';
  const pino = document.createElement('div');
  pino.className = 'joy-pino';
  base.append(pino);
  camada.append(base);
  let idJoy: number | null = null;
  let idOlhar: number | null = null;
  let ox = 0;
  let oy = 0;
  let lx = 0;
  let ly = 0;
  const raioJoy = 50;
  camada.addEventListener('touchstart', (e) => {
    if (!J.livre) return;
    for (const t of Array.from(e.changedTouches)) {
      if ((t.target as HTMLElement).closest('button, .hud-painel')) continue;
      if (t.clientX < innerWidth * 0.45 && idJoy === null) {
        idJoy = t.identifier;
        ox = t.clientX;
        oy = t.clientY;
        base.style.left = `${ox - 60}px`;
        base.style.top = `${oy - 60}px`;
        base.classList.add('ativo');
      } else if (idOlhar === null) {
        idOlhar = t.identifier;
        lx = t.clientX;
        ly = t.clientY;
      }
    }
  }, { passive: true });
  camada.addEventListener('touchmove', (e) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === idJoy) {
        let dx = t.clientX - ox;
        let dy = t.clientY - oy;
        const d = Math.hypot(dx, dy);
        if (d > raioJoy) {
          dx = (dx / d) * raioJoy;
          dy = (dy / d) * raioJoy;
        }
        pino.style.transform = `translate(${dx}px, ${dy}px)`;
        J.joy.x = dx / raioJoy;
        J.joy.y = dy / raioJoy;
      } else if (t.identifier === idOlhar) {
        girar((t.clientX - lx) * 0.006, (t.clientY - ly) * 0.006);
        lx = t.clientX;
        ly = t.clientY;
      }
    }
  }, { passive: true });
  const fim = (e: TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === idJoy) {
        idJoy = null;
        J.joy.x = J.joy.y = 0;
        pino.style.transform = '';
        base.classList.remove('ativo');
      }
      if (t.identifier === idOlhar) idOlhar = null;
    }
  };
  camada.addEventListener('touchend', fim);
  camada.addEventListener('touchcancel', fim);
  M.atualizar.add(atualizar);
}

function girar(dx: number, dy: number) {
  J.yaw -= dx;
  J.pitch = Math.max(-1.2, Math.min(1.2, J.pitch - dy));
}

export function soltarMouse() {
  if (document.pointerLockElement) document.exitPointerLock();
}

export function travado() {
  return !!canvasRef && document.pointerLockElement === canvasRef;
}

function colide(x: number, z: number): boolean {
  const a = J.area;
  if (!a) return false;
  const [x0, x1, z0, z1] = a.limites;
  if (x < x0 || x > x1 || z < z0 || z > z1) return true;
  return a.obstaculos.some(([ax0, ax1, az0, az1]) => x > ax0 - RAIO && x < ax1 + RAIO && z > az0 - RAIO && z < az1 + RAIO);
}

const v = new THREE.Vector3();
const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const q = new THREE.Quaternion();

function atualizar(dt: number, t: number) {
  if (J.livre) {
    let fx = 0;
    let fz = 0;
    const k = J.teclas;
    if (k.has('KeyW') || k.has('ArrowUp')) fz -= 1;
    if (k.has('KeyS') || k.has('ArrowDown')) fz += 1;
    if (k.has('KeyA') || k.has('ArrowLeft')) fx -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) fx += 1;
    fx += J.joy.x;
    fz += J.joy.y;
    const n = Math.hypot(fx, fz);
    if (n > 0.05) {
      const vel = (k.has('ShiftLeft') || k.has('ShiftRight') || n > 0.95 ? 3.6 : 2.2) * Math.min(1, n) * J.voo;
      fx /= Math.max(1, n);
      fz /= Math.max(1, n);
      const s = Math.sin(J.yaw);
      const c = Math.cos(J.yaw);
      const dx = (fx * c + fz * s) * vel * dt;
      const dz = (-fx * s + fz * c) * vel * dt;
      if (!colide(J.pos.x + dx, J.pos.z)) J.pos.x += dx;
      if (!colide(J.pos.x, J.pos.z + dz)) J.pos.z += dz;
      J.olho = OLHO + Math.sin(t * 9) * 0.018 * Math.min(1, n);
      if (J.voo === 1) Som.passo(vel > 3);
    }
  }
  M.camera.position.set(J.pos.x, J.pos.y + J.olho, J.pos.z);
  if (J.alvoOlhar) {
    // modo cena: vira a cabeça com calma até a pessoa que fala
    v.copy(J.alvoOlhar).sub(M.camera.position);
    const yawAlvo = Math.atan2(-v.x, -v.z);
    const pitchAlvo = Math.atan2(v.y, Math.hypot(v.x, v.z));
    let dy = yawAlvo - J.yaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    const f = Math.min(1, dt * 3.2);
    J.yaw += dy * f;
    J.pitch += (pitchAlvo - J.pitch) * f;
  }
  euler.set(J.pitch, J.yaw, 0);
  q.setFromEuler(euler);
  M.camera.quaternion.copy(q);
}
