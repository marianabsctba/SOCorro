// O SOC em 3D, todo procedural: sala de operação com videowall, três fileiras de estações,
// sala do coordenador de vidro, sala de servidores, copa com a cafeteira (o ativo mais crítico do prédio).
// O SOC Alfa (Curitiba) e o SOC Bravo (Recife) usam a mesma planta com acabamento diferente.
import * as THREE from 'three';
import { pbr } from './pbr';
import { cartaz, telaDiasSemIncidente, telaGrafico, telaJanela, telaKpi, telaMapa, telaPaint, telaPrint, telaSiem } from './telas';
import type { Site } from '../conteudo/tipos';

export type Caixa = [number, number, number, number]; // x0, x1, z0, z1

export interface Assento {
  id: string; // e1..e15
  x: number; // posição da cadeira
  z: number;
  ry: number; // para onde a pessoa sentada olha
  fila: number;
  monitor: THREE.Vector3; // centro do monitor principal
}

export interface Interativo {
  id: string;
  pos: THREE.Vector3;
  rotulo: string;
  raio?: number;
}

export interface Sala {
  site: Site;
  grupo: THREE.Group;
  limites: Caixa;
  obstaculos: Caixa[];
  assentos: Assento[];
  meu: Assento;
  pontos: Record<string, { x: number; z: number }>;
  interativos: Interativo[];
  atualizar: (dt: number, t: number) => void;
}

const L = { x0: -12, x1: 12, z0: -8, z1: 8, alto: 3.4 };
export const FILAS_Z = [-4.4, -1.4, 1.6];
export const ESTACOES_X = [-7.2, -4.6, -2.0, 0.6, 3.2];
export const CORREDOR_X = 5.3;

function caixa(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, g: THREE.Object3D, sombra = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = sombra;
  m.receiveShadow = true;
  g.add(m);
  return m;
}

function cilindro(rt: number, rb: number, h: number, mat: THREE.Material, x: number, y: number, z: number, g: THREE.Object3D, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}

function texCarpete(site: Site): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const g = cv.getContext('2d')!;
  const [a, b] = site === 'alfa' ? ['#3a4150', '#323846'] : ['#5a4a3e', '#514236'];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      g.fillStyle = (i + j) % 2 ? a : b;
      g.fillRect(i * 64, j * 64, 64, 64);
    }
  const img = g.getImageData(0, 0, 256, 256);
  for (let k = 0; k < img.data.length; k += 4) {
    const n = (Math.random() - 0.5) * 22;
    img.data[k] += n;
    img.data[k + 1] += n;
    img.data[k + 2] += n;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(12, 8);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function texForro(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#e9e9e6';
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#b9bab5';
  g.lineWidth = 3;
  g.strokeRect(0, 0, 128, 128);
  for (let i = 0; i < 300; i++) {
    g.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
    g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(20, 13);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ------------------------------------------------------------ móveis

const MAT = {
  tampo: new THREE.MeshStandardMaterial({ color: 0xd8d2c6, roughness: 0.55 }),
  tampoEscuro: new THREE.MeshStandardMaterial({ color: 0x3b3f47, roughness: 0.5 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 0.35, metalness: 0.7 }),
  preto: new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.45 }),
  plasticoPreto: new THREE.MeshStandardMaterial({ color: 0x1f2126, roughness: 0.7 }),
  tecido: new THREE.MeshStandardMaterial({ color: 0x2a2d35, roughness: 0.95 }),
  tecidoRosa: new THREE.MeshStandardMaterial({ color: 0x8a2c5c, roughness: 0.95 }),
  vidro: new THREE.MeshStandardMaterial({ color: 0xbcd6e0, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.18, depthWrite: false }),
  caneca: new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.4 }),
  canecaRosa: new THREE.MeshStandardMaterial({ color: 0xe05fa0, roughness: 0.4 }),
  folha: new THREE.MeshStandardMaterial({ color: 0x2f6b34, roughness: 0.8 }),
  vaso: new THREE.MeshStandardMaterial({ color: 0x8b5a3c, roughness: 0.85 }),
  rack: new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.4, metalness: 0.5 }),
  ledVerde: new THREE.MeshBasicMaterial({ color: 0x46ff7a }),
  ledAzul: new THREE.MeshBasicMaterial({ color: 0x3aa0ff }),
  ledVermelho: new THREE.MeshBasicMaterial({ color: 0xff3344 }),
  luzTeto: new THREE.MeshBasicMaterial({ color: 0xfdfbf2 }),
  branco: new THREE.MeshStandardMaterial({ color: 0xf5f5f2, roughness: 0.5 }),
  inox: new THREE.MeshStandardMaterial({ color: 0xc7ccd1, roughness: 0.25, metalness: 0.85 }),
  vermelho: new THREE.MeshStandardMaterial({ color: 0xb5302c, roughness: 0.45 }),
  madeira: new THREE.MeshStandardMaterial({ color: 0x8a6440, roughness: 0.7 }),
  coxinha: new THREE.MeshStandardMaterial({ color: 0xc98a3a, roughness: 0.85 }),
  papel: new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.9 }),
  amarelo: new THREE.MeshStandardMaterial({ color: 0xf2d24b, roughness: 0.8 }),
};

function telaMat(tex: THREE.Texture) {
  return new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
}

/** cadeira de escritório: base estrela, pistão, assento e encosto */
export function cadeira(g: THREE.Object3D, x: number, z: number, ry: number, rasgada = false) {
  const c = new THREE.Group();
  c.position.set(x, 0, z);
  c.rotation.y = ry;
  for (let i = 0; i < 5; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.32), MAT.plasticoPreto);
    p.position.set(Math.sin((i / 5) * 6.283) * 0.15, 0.07, Math.cos((i / 5) * 6.283) * 0.15);
    p.rotation.y = (i / 5) * 6.283;
    c.add(p);
    const r = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), MAT.preto);
    r.position.set(Math.sin((i / 5) * 6.283) * 0.3, 0.03, Math.cos((i / 5) * 6.283) * 0.3);
    c.add(r);
  }
  cilindro(0.025, 0.025, 0.36, MAT.metal, 0, 0.26, 0, c, 10);
  caixa(0.5, 0.08, 0.48, rasgada ? MAT.tecidoRosa : MAT.tecido, 0, 0.47, 0, c);
  // encosto atrás de quem senta (quem senta olha para +z local)
  caixa(0.46, 0.6, 0.06, rasgada ? MAT.tecidoRosa : MAT.tecido, 0, 0.84, -0.25, c);
  caixa(0.04, 0.3, 0.04, MAT.plasticoPreto, 0, 0.6, -0.25, c);
  if (rasgada) {
    // o rasgo no assento da cadeira gamer
    const r = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.05), new THREE.MeshBasicMaterial({ color: 0xe8e0c8 }));
    r.rotation.x = -Math.PI / 2;
    r.position.set(0.08, 0.512, 0.05);
    c.add(r);
  }
  g.add(c);
  return c;
}

function planta(g: THREE.Object3D, x: number, z: number, alto = 1.1) {
  cilindro(0.2, 0.16, 0.4, MAT.vaso, x, 0.2, z, g);
  for (let i = 0; i < 9; i++) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.1, 7, 5), MAT.folha);
    f.scale.set(1, 1.8, 0.4);
    const a = Math.random() * 6.28;
    const r = 0.05 + Math.random() * 0.16;
    f.position.set(x + Math.cos(a) * r, 0.5 + Math.random() * (alto - 0.4), z + Math.sin(a) * r);
    f.rotation.set(Math.random() * 0.6, a, Math.random() * 0.6 - 0.3);
    f.castShadow = true;
    g.add(f);
  }
}

function caneca(g: THREE.Object3D, x: number, y: number, z: number, rosa = false) {
  const m = cilindro(0.04, 0.036, 0.1, rosa ? MAT.canecaRosa : MAT.caneca, x, y + 0.05, z, g, 12);
  const alca = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 10), rosa ? MAT.canecaRosa : MAT.caneca);
  alca.position.set(x + 0.045, y + 0.05, z);
  alca.rotation.y = Math.PI / 2;
  g.add(alca);
  return m;
}

/** estação de trabalho: mesa, dois monitores, teclado, mouse, caneca e cadeira */
function estacao(g: THREE.Object3D, x: number, z: number, telas: [THREE.Texture, THREE.Texture], extra: { rasgada?: boolean; coxinha?: boolean; postit?: boolean }) {
  const y = 0.74;
  caixa(1.6, 0.04, 0.75, MAT.tampo, x, y, z, g);
  for (const sx of [-0.75, 0.75]) caixa(0.04, y, 0.7, MAT.metal, x + sx, y / 2, z, g);
  caixa(1.5, 0.3, 0.02, MAT.metal, x, 0.45, z - 0.34, g, false);
  // divisória baixa entre fileiras
  caixa(1.6, 0.35, 0.03, MAT.tampoEscuro, x, y + 0.2, z - 0.39, g);
  const mon: THREE.Vector3[] = [];
  [-0.33, 0.33].forEach((dx, i) => {
    const mx = x + dx;
    const mz = z - 0.2;
    const ang = dx < 0 ? 0.18 : -0.18;
    const grp = new THREE.Group();
    grp.position.set(mx, y, mz);
    grp.rotation.y = ang;
    caixa(0.2, 0.015, 0.16, MAT.preto, 0, 0.01, 0, grp, false);
    caixa(0.04, 0.3, 0.03, MAT.preto, 0, 0.16, -0.02, grp, false);
    caixa(0.6, 0.36, 0.03, MAT.preto, 0, 0.42, 0, grp);
    const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.57, 0.33), telaMat(telas[i]));
    tela.position.set(0, 0.42, 0.017);
    grp.add(tela);
    g.add(grp);
    mon.push(new THREE.Vector3(mx, y + 0.42, mz));
  });
  caixa(0.44, 0.02, 0.14, MAT.plasticoPreto, x, y + 0.03, z + 0.12, g, false);
  caixa(0.06, 0.02, 0.1, MAT.plasticoPreto, x + 0.32, y + 0.03, z + 0.12, g, false);
  caneca(g, x - 0.55, y + 0.02, z + 0.1, Math.random() < 0.3);
  if (extra.coxinha) {
    cilindro(0.09, 0.09, 0.01, MAT.branco, x + 0.55, y + 0.025, z + 0.12, g);
    const cx = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 10), MAT.coxinha);
    cx.position.set(x + 0.55, y + 0.07, z + 0.12);
    cx.rotation.z = 0.6;
    g.add(cx);
  }
  if (extra.postit) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.08), new THREE.MeshBasicMaterial({ map: cartaz(['SUA', 'ESTAÇÃO'], '#f2d24b', '#222', 64, 64) }));
    p.position.set(x - 0.33 + 0.18, y + 0.3, z - 0.2 + 0.05);
    p.rotation.y = 0.18;
    g.add(p);
  }
  // quem senta olha para a mesa (-z): o encosto fica do lado do corredor
  cadeira(g, x, z + 0.62, Math.PI, extra.rasgada);
  return mon[0];
}

function rackServidor(g: THREE.Object3D, x: number, z: number, leds: THREE.Mesh[]) {
  caixa(0.6, 2.0, 1.0, MAT.rack, x, 1.0, z, g);
  for (let i = 0; i < 14; i++) {
    const y = 0.25 + i * 0.12;
    caixa(0.54, 0.09, 0.02, MAT.plasticoPreto, x + 0.31, y, z, g, false).rotation.y = Math.PI / 2;
    for (let k = 0; k < 3; k++) {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(0.015, 0.015), [MAT.ledVerde, MAT.ledAzul, MAT.ledVerde][k]);
      l.position.set(x + 0.322, y + 0.02, z - 0.2 + k * 0.04);
      l.rotation.y = Math.PI / 2;
      g.add(l);
      leds.push(l);
    }
  }
}

// ------------------------------------------------------------ a sala

export function construir(site: Site): Sala {
  const g = new THREE.Group();
  g.name = 'soc-' + site;
  const obst: Caixa[] = [];
  const inter: Interativo[] = [];
  const animar: ((dt: number, t: number) => void)[] = [];
  const bravo = site === 'bravo';

  // chão, forro e paredes
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(L.x1 - L.x0, L.z1 - L.z0), new THREE.MeshStandardMaterial({ map: texCarpete(site), roughness: 0.95 }));
  chao.rotation.x = -Math.PI / 2;
  chao.receiveShadow = true;
  g.add(chao);
  const forro = new THREE.Mesh(new THREE.PlaneGeometry(L.x1 - L.x0, L.z1 - L.z0), new THREE.MeshStandardMaterial({ map: texForro(), roughness: 0.9 }));
  forro.rotation.x = Math.PI / 2;
  forro.position.y = L.alto;
  g.add(forro);
  const parede = pbr('reboco', [6, 1.2], { color: bravo ? 0xf3d9a4 : 0xd9dde2 });
  const parede2 = pbr('reboco', [4, 1.2], { color: bravo ? 0xf3d9a4 : 0xd9dde2 });
  const W = L.x1 - L.x0;
  const D = L.z1 - L.z0;
  caixa(W, L.alto, 0.2, parede, 0, L.alto / 2, L.z0 - 0.1, g, false);
  caixa(W, L.alto, 0.2, parede, 0, L.alto / 2, L.z1 + 0.1, g, false);
  caixa(0.2, L.alto, D, parede2, L.x0 - 0.1, L.alto / 2, 0, g, false);
  caixa(0.2, L.alto, D, parede2, L.x1 + 0.1, L.alto / 2, 0, g, false);
  // rodapé
  const rodape = new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.6 });
  caixa(W, 0.1, 0.02, rodape, 0, 0.05, L.z0 + 0.01, g, false);
  caixa(W, 0.1, 0.02, rodape, 0, 0.05, L.z1 - 0.01, g, false);

  // painéis de luz no forro (emissivos; nada de luz pontual, que pesa na web)
  for (let i = -2; i <= 2; i++)
    for (let j = -1; j <= 1; j++) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), MAT.luzTeto);
      p.rotation.x = Math.PI / 2;
      p.position.set(i * 4.4 - 1, L.alto - 0.01, j * 4.6);
      g.add(p);
    }

  // ---------------- videowall (parede norte)
  const vwX = -2;
  const vwTex = [telaMapa(), telaKpi(), bravo ? telaPrint() : telaDiasSemIncidente(), telaSiem(9), telaGrafico(2), telaGrafico(3)];
  const moldura = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.3 });
  caixa(7.6, 2.9, 0.12, moldura, vwX, 1.95, L.z0 + 0.07, g, false);
  vwTex.forEach((t, i) => {
    const col = i % 3;
    const lin = Math.floor(i / 3);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(2.42, 1.36), telaMat(t));
    p.position.set(vwX - 2.45 + col * 2.45, 2.65 - lin * 1.39, L.z0 + 0.135);
    g.add(p);
  });
  const placaSoc = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.32), new THREE.MeshBasicMaterial({ map: cartaz([bravo ? 'SOC BRAVO · RECIFE' : 'SOC ALFA · CURITIBA'], '#0b0b0d', '#e05fa0', 512, 56), toneMapped: false }));
  placaSoc.position.set(vwX, 0.35, L.z0 + 0.14);
  g.add(placaSoc);
  inter.push({ id: 'videowall', pos: new THREE.Vector3(vwX + 2.45, 1.3, L.z0 + 0.2), rotulo: 'Olhar o videowall', raio: 6 });

  // ---------------- estações
  const assentos: Assento[] = [];
  let k = 0;
  const texSiem = [telaSiem(1), telaSiem(2), telaSiem(3), telaSiem(4)];
  const texGraf = [telaGrafico(0), telaGrafico(1), telaGrafico(4), telaGrafico(5)];
  const paint = bravo ? telaPaint() : null;
  FILAS_Z.forEach((zr, fi) => {
    ESTACOES_X.forEach((xr, ei) => {
      k++;
      const id = 'e' + k;
      const minha = fi === 2 && ei === 4;
      const dePaint = bravo && fi === 0 && ei === 1;
      const mon = estacao(g, xr, zr, [dePaint && paint ? paint : texSiem[k % 4], texGraf[(k * 3) % 4]], { rasgada: minha && !bravo, coxinha: fi === 2 && ei === 0 && !bravo, postit: minha });
      assentos.push({ id, x: xr, z: zr + 0.62, ry: Math.PI, fila: fi, monitor: mon });
      obst.push([xr - 0.82, xr + 0.82, zr - 0.42, zr + 0.4]);
      if (dePaint) inter.push({ id: 'pista_paint', pos: mon.clone(), rotulo: 'Olhar o monitor do Nildo' });
    });
  });
  const meu = assentos[14];
  inter.push({ id: 'estacao', pos: new THREE.Vector3(meu.x, 1.0, meu.z - 0.6), rotulo: 'Sentar e abrir o Vigia', raio: 2.4 });
  if (!bravo) inter.push({ id: 'coxinha', pos: new THREE.Vector3(ESTACOES_X[0] + 0.55, 0.8, FILAS_Z[2] + 0.12), rotulo: 'Examinar a coxinha' });

  // ---------------- sala do coordenador (vidro), canto nordeste
  const ox0 = 7.2;
  const oz1 = -2.6;
  caixa(0.06, L.alto, oz1 - L.z0, MAT.vidro, ox0, L.alto / 2, (L.z0 + oz1) / 2, g, false);
  caixa(L.x1 - ox0 - 1.4, L.alto, 0.06, MAT.vidro, ox0 + 1.4 + (L.x1 - ox0 - 1.4) / 2, L.alto / 2, oz1, g, false);
  caixa(0.08, L.alto, 0.08, MAT.metal, ox0, L.alto / 2, oz1, g, false);
  obst.push([ox0 - 0.08, ox0 + 0.08, L.z0, oz1], [ox0 + 1.4, L.x1, oz1 - 0.08, oz1 + 0.08]);
  caixa(1.8, 0.04, 0.8, MAT.madeira, 9.8, 0.74, -6.2, g);
  caixa(1.7, 0.7, 0.04, MAT.madeira, 9.8, 0.37, -6.55, g);
  obst.push([8.8, 10.8, -6.7, -5.7]);
  const monG = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.34), telaMat(telaKpi()));
  monG.position.set(9.8, 1.2, -6.4);
  g.add(monG);
  caixa(0.64, 0.38, 0.03, MAT.preto, 9.8, 1.2, -6.42, g);
  cadeira(g, 9.8, -6.9, 0);
  // o timer de tomate
  const tomate = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), MAT.vermelho);
  tomate.scale.y = 0.8;
  tomate.position.set(10.5, 0.81, -6.1);
  g.add(tomate);
  const placaG = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.5), new THREE.MeshBasicMaterial({ map: cartaz(bravo ? ['COORDENAÇÃO', 'aqui a gente conversa', 'com o incidente'] : ['COORDENAÇÃO', 'Abriu ticket?', 'Então não aconteceu.'], '#ffffff', '#1b1b1b', 256, 96) }));
  placaG.position.set(ox0 + 1.6, 2.2, oz1 + 0.04);
  g.add(placaG);

  // ---------------- sala de servidores (vidro), canto noroeste
  const sx1 = -9.2;
  const sz1 = -3.2;
  caixa(0.06, L.alto, sz1 - L.z0, MAT.vidro, sx1, L.alto / 2, (L.z0 + sz1) / 2, g, false);
  caixa(sx1 - L.x0, L.alto, 0.06, MAT.vidro, (L.x0 + sx1) / 2, L.alto / 2, sz1, g, false);
  obst.push([L.x0, sx1 + 0.1, L.z0, sz1 + 0.1]);
  const leds: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) rackServidor(g, -11.3, -7.2 + i * 1.05, leds);
  // nobreak com aviso (a piada do dia 45)
  caixa(0.5, 0.9, 0.7, MAT.preto, -9.8, 0.45, -3.9, g);
  const aviso = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.3), new THREE.MeshBasicMaterial({ map: cartaz(['NOBREAK', 'NÃO LIGAR', 'CAFETEIRA', 'AQUI'], '#f2d24b', '#111', 128, 96) }));
  aviso.position.set(-9.54, 0.62, -3.9);
  aviso.rotation.y = Math.PI / 2;
  g.add(aviso);
  inter.push({ id: 'nobreak', pos: new THREE.Vector3(-9.3, 0.7, -3.9), rotulo: 'Ler o aviso do nobreak', raio: 2.6 });
  animar.push((_dt, t) => {
    for (let i = 0; i < leds.length; i++) leds[i].visible = Math.sin(t * (3 + (i % 7)) + i * 1.7) > -0.3;
  });

  // ---------------- copa, canto sudeste
  caixa(0.7, 0.9, 4.6, MAT.branco, 11.6, 0.45, 5.3, g);
  caixa(0.72, 0.04, 4.62, MAT.tampoEscuro, 11.6, 0.92, 5.3, g);
  obst.push([11.2, L.x1, 3.0, 7.6]);
  // a cafeteira
  caixa(0.34, 0.42, 0.3, MAT.preto, 11.55, 1.15, 4.6, g);
  caixa(0.3, 0.1, 0.26, MAT.inox, 11.55, 1.4, 4.6, g);
  const luzCafe = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), MAT.ledVermelho);
  luzCafe.position.set(11.37, 1.25, 4.6);
  g.add(luzCafe);
  caneca(g, 11.5, 0.94, 5.0);
  caneca(g, 11.62, 0.94, 5.15, true);
  inter.push({ id: 'cafe', pos: new THREE.Vector3(11.5, 1.1, 4.6), rotulo: 'Tomar um café', raio: 2.2 });
  const placaCafe = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.36), new THREE.MeshBasicMaterial({ map: cartaz(['ATIVO CRÍTICO', 'RTO: 0 minutos', 'RPO: 0 cafés'], '#ffffff', '#b5302c', 192, 112) }));
  placaCafe.position.set(L.x1 - 0.01, 1.75, 4.6);
  placaCafe.rotation.y = -Math.PI / 2;
  g.add(placaCafe);
  // geladeira
  caixa(0.7, 1.8, 0.7, MAT.branco, 11.5, 0.9, 7.4, g);
  obst.push([11.1, L.x1, 7.0, L.z1]);
  const bilhete = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: cartaz(['QUEM', 'COMEU MEU', 'IOGURTE?', '(logs no', 'Vigia)'], '#f2d24b', '#222', 96, 96) }));
  bilhete.position.set(11.14, 1.3, 7.4);
  bilhete.rotation.y = -Math.PI / 2;
  g.add(bilhete);
  // mesa da copa
  cilindro(0.5, 0.5, 0.04, MAT.madeira, 9.0, 0.74, 5.2, g, 24);
  cilindro(0.05, 0.05, 0.72, MAT.metal, 9.0, 0.37, 5.2, g, 10);
  obst.push([8.5, 9.5, 4.7, 5.7]);
  cadeira(g, 9.0, 4.4, 0);
  cadeira(g, 9.0, 6.0, Math.PI);
  if (bravo) {
    // bolo de rolo, patrimônio de Pernambuco
    const bolo = cilindro(0.16, 0.16, 0.09, new THREE.MeshStandardMaterial({ color: 0xd8a35a, roughness: 0.8 }), 9.0, 0.8, 5.2, g, 24);
    bolo.rotation.z = Math.PI / 2;
    const espiral = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 20), new THREE.MeshStandardMaterial({ color: 0x8a3b2c }));
    espiral.position.set(9.05, 0.8, 5.2);
    espiral.rotation.y = Math.PI / 2;
    g.add(espiral);
  }

  // ---------------- janelas (parede oeste) e o que se vê
  const vistaTex = telaJanela(site);
  for (const zc of [1.2, 5.0]) {
    const v = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), telaMat(vistaTex));
    v.position.set(L.x0 + 0.02, 1.75, zc);
    v.rotation.y = Math.PI / 2;
    g.add(v);
    caixa(0.1, 1.72, 3.32, MAT.metal, L.x0 + 0.01, 1.75, zc, g, false);
    const vidro = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), MAT.vidro);
    vidro.position.set(L.x0 + 0.08, 1.75, zc);
    vidro.rotation.y = Math.PI / 2;
    g.add(vidro);
    caixa(0.12, 0.03, 3.32, MAT.metal, L.x0 + 0.06, 1.75, zc, g, false);
  }
  inter.push({ id: 'janela', pos: new THREE.Vector3(L.x0 + 0.3, 1.7, 3.1), rotulo: bravo ? 'Olhar o mar' : 'Olhar a garoa', raio: 3 });

  // ---------------- ar-condicionado ou ventilador de teto
  if (!bravo) {
    for (const [x, z, ry] of [[L.x0 + 0.15, -1.0, Math.PI / 2], [-4, L.z1 - 0.15, Math.PI], [2, L.z1 - 0.15, Math.PI]] as const) {
      const ac = caixa(1.0, 0.3, 0.22, MAT.branco, x, 2.95, z, g, false);
      ac.rotation.y = ry;
    }
    const term = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.1), new THREE.MeshBasicMaterial({ map: cartaz(['16°C'], '#0d1a10', '#46ff7a', 64, 48), toneMapped: false }));
    term.position.set(3.6, 1.4, L.z1 - 0.01);
    term.rotation.y = Math.PI;
    g.add(term);
    caixa(0.18, 0.14, 0.02, MAT.branco, 3.6, 1.4, L.z1 - 0.005, g, false);
    inter.push({ id: 'ar', pos: new THREE.Vector3(3.6, 1.4, L.z1 - 0.1), rotulo: 'Mexer no termostato (16 °C)' });
  } else {
    for (const [x, z] of [[-4.5, -1.5], [1.5, -1.5], [-4.5, 3.5], [1.5, 3.5]]) {
      const v = new THREE.Group();
      v.position.set(x, L.alto - 0.35, z);
      cilindro(0.02, 0.02, 0.3, MAT.metal, 0, 0.15, 0, v, 6);
      cilindro(0.1, 0.1, 0.1, MAT.branco, 0, 0, 0, v, 12);
      const pas = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.01, 0.12), MAT.madeira);
        p.position.x = 0.35;
        const braco = new THREE.Group();
        braco.rotation.y = (i / 3) * Math.PI * 2;
        braco.add(p);
        pas.add(braco);
      }
      v.add(pas);
      g.add(v);
      animar.push((dt) => (pas.rotation.y += dt * 5));
    }
    inter.push({ id: 'ventilador', pos: new THREE.Vector3(1.5, 2.6, 3.5), rotulo: 'Ficar embaixo do ventilador', raio: 2.5 });
  }

  // ---------------- porta, relógio de ponto, quadro branco, cartazes, plantas
  caixa(1.2, 2.2, 0.06, MAT.madeira, CORREDOR_X, 1.1, L.z1 - 0.03, g, false);
  const macaneta = cilindro(0.02, 0.02, 0.12, MAT.inox, CORREDOR_X + 0.45, 1.05, L.z1 - 0.08, g, 8);
  macaneta.rotation.x = Math.PI / 2;
  caixa(0.32, 0.4, 0.12, MAT.plasticoPreto, CORREDOR_X + 1.3, 1.35, L.z1 - 0.06, g, false);
  const visorPonto = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.1), new THREE.MeshBasicMaterial({ map: cartaz(['PONTO'], '#0d1a10', '#46ff7a', 96, 40), toneMapped: false }));
  visorPonto.position.set(CORREDOR_X + 1.3, 1.45, L.z1 - 0.125);
  visorPonto.rotation.y = Math.PI;
  g.add(visorPonto);
  inter.push({ id: 'ponto', pos: new THREE.Vector3(CORREDOR_X + 1.3, 1.35, L.z1 - 0.2), rotulo: 'Bater o ponto' });

  const quadro = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshBasicMaterial({ map: cartaz(bravo ? ['QUADRO DO BRAVO', 'Escala: Nildo, Socorro, você', 'Bolo de rolo: sexta', 'Meta: não ligar pro Alfa'] : ['QUADRO DO TURNO', 'MTTA meta: 5 min', 'MTTR meta: 30 min', 'Fila boa é fila vazia (nunca)'], '#fbfbf8', '#1d3b8a', 384, 192) }));
  quadro.position.set(-4.5, 1.6, L.z1 - 0.02);
  quadro.rotation.y = Math.PI;
  g.add(quadro);
  caixa(2.5, 1.3, 0.03, MAT.metal, -4.5, 1.6, L.z1 - 0.005, g, false);
  const cartazes: [string[], number, number, number][] = bravo
    ? [[['CLICOU?', 'AVISA!', 'ninguém vai brigar', '(muito)'], 9.5, 1.7, -0.5], [['OXE.', 'Isso aí é', 'phishing, visse?'], -0.6, 1.7, 1]]
    : [[['CLICOU?', 'AVISA!', 'ninguém vai brigar', '(muito)'], 9.5, 1.7, -0.5], [['FALSO POSITIVO', 'é igual boleto:', 'sempre tem', 'mais um'], -0.6, 1.7, 1]];
  for (const [txt, x, y, lado] of cartazes) {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.55), new THREE.MeshBasicMaterial({ map: cartaz(txt, '#e05fa0', '#ffffff', 192, 128) }));
    if (lado > 0) {
      c.position.set(x, y, L.z1 - 0.02);
      c.rotation.y = Math.PI;
    } else {
      c.position.set(L.x1 - 0.02, y, x === 9.5 ? 0.8 : x);
      c.rotation.y = -Math.PI / 2;
    }
    g.add(c);
  }
  for (const [x, z] of [[-11.3, 7.3], [-11.3, -2.6], [6.6, -7.3], [6.6, 7.3], [-0.6, 7.3]]) {
    planta(g, x, z, 1.0 + Math.random() * 0.4);
    obst.push([x - 0.3, x + 0.3, z - 0.3, z + 0.3]);
  }

  // luz
  const hemi = new THREE.HemisphereLight(bravo ? 0xfff2d8 : 0xeef3ff, bravo ? 0x6a5040 : 0x3a3f4a, bravo ? 1.25 : 1.05);
  g.add(hemi);
  const sol = new THREE.DirectionalLight(bravo ? 0xffe2b0 : 0xf2f4ff, bravo ? 1.6 : 1.1);
  sol.position.set(-6, 9, 4);
  sol.target.position.set(0, 0, 0);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  const sc = sol.shadow.camera;
  sc.left = -14;
  sc.right = 14;
  sc.top = 10;
  sc.bottom = -10;
  sc.near = 1;
  sc.far = 30;
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.03;
  g.add(sol, sol.target);

  if (bravo) inter.push({ id: 'pista_janela', pos: new THREE.Vector3(L.x0 + 0.3, 1.7, 5.0), rotulo: 'Reparar no vinco da janela', raio: 2.2 });

  return {
    site,
    grupo: g,
    limites: [L.x0 + 0.35, L.x1 - 0.35, L.z0 + 0.35, L.z1 - 0.35],
    obstaculos: obst,
    assentos,
    meu,
    pontos: {
      entrada: { x: CORREDOR_X, z: 7.2 },
      cafe: { x: 10.7, z: 4.6 },
      gilmar: { x: 9.8, z: -6.9 },
      portaGilmar: { x: ox0 + 0.7, z: oz1 + 0.6 },
      ponto: { x: CORREDOR_X + 1.3, z: 7.2 },
      copa: { x: 9.6, z: 6.6 },
      videowall: { x: vwX, z: -6.2 },
    },
    interativos: inter,
    atualizar: (dt, t) => {
      for (const f of animar) f(dt, t);
    },
  };
}
