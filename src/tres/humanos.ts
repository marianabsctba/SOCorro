// Humanos realistas (MakeHuman/MPFB, assets CC0) animados com a Universal Animation Library
// (Quaternius, CC0) convertida para o esqueleto do MPFB. Gestos de escritório (digitar, café, cochilo) são montados osso a osso.
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const BASE = import.meta.env.BASE_URL;
export const MODELOS = ['gilmar', 'ro', 'vandeco', 'thiaguinho', 'keyla', 'neide', 'leoncio', 'socorro', 'nildo', 'kevin', 'brenda', 'jefferson', 'pamela'];

const DEDO = /^(index|middle|ring|pinky|thumb)_0([1-3])_([lr])\./;
const DEDO_OSSO = /^(index|middle|ring|pinky|thumb)_0([1-3])_([lr])$/;
// sinal da curva dos dedos (ajustado olhando as fotos)
export const CURVA = { sinal: 1, eixo: 'z' as 'x' | 'y' | 'z' };
// dedos juntos (no modelo eles vêm abertos em leque, o que parece garra) e quanto cada um dobra
// pose parada: quanto corrige a animação (1 = braço solto de vez), afastamento do tronco e cotovelo
/** altura do teclado no mundo (mesa a 0,76 m) */
export const DIGITAR = { altura: 0.81 };
export const RELAX = { parado: 1, falando: 0.35, fora: 0.3, cotovelo: 0.1 };
export const JUNTA = { sinal: 1, eixo: 'x' as 'x' | 'y' | 'z', ang: 0, dobra: 0.8, fecha: 0.85 };
// giro extra da palma e polegar encostado na mão (ajustados olhando as fotos)
export const PALMA = { extra: 0, polegarEixo: 'z' as 'x' | 'y' | 'z', polegar: -0.7 };
const V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3(), V4 = new THREE.Vector3();
const V5 = new THREE.Vector3(), V6 = new THREE.Vector3(), V7 = new THREE.Vector3(), V8 = new THREE.Vector3();
const VA = new THREE.Vector3(), VB = new THREE.Vector3(), VC = new THREE.Vector3();
const G1 = new THREE.Vector3(), G2 = new THREE.Vector3(), G3 = new THREE.Vector3(), G4 = new THREE.Vector3();
const G5 = new THREE.Vector3(), G6 = new THREE.Vector3();
export type Gesto = 'acenar' | 'apontar' | 'sim' | 'nao' | 'ombros' | 'pensar' | 'cintura' | 'cruzar' | 'comemorar' | 'digitar' | 'beber' | 'cochilar' | 'telefone';
const DUR_GESTO: Record<Gesto, number> = { acenar: 2.2, apontar: 2.4, sim: 1.4, nao: 1.5, ombros: 1.8, pensar: 4, cintura: 4, cruzar: 5, comemorar: 2.2, digitar: 9999, beber: 3.2, cochilar: 9999, telefone: 9999 };
const QD = new THREE.Quaternion(), QW = new THREE.Quaternion(), QP = new THREE.Quaternion(), QI = new THREE.Quaternion();
const repintadas = new Map<string, THREE.Texture>();
/** troca os pixels laranja (a gravata original) pela cor da casa, mantendo o claro e o escuro do tecido */
function repintarLaranja(mapa: THREE.Texture, tinta: number, tudo = false): THREE.Texture {
  const chave = mapa.uuid + tinta + (tudo ? 't' : '');
  const pronta = repintadas.get(chave);
  if (pronta) return pronta;
  const img = mapa.image as HTMLImageElement | ImageBitmap;
  const cv = document.createElement('canvas');
  cv.width = img.width;
  cv.height = img.height;
  const g = cv.getContext('2d')!;
  g.drawImage(img as CanvasImageSource, 0, 0);
  const d = g.getImageData(0, 0, cv.width, cv.height);
  const alvo = new THREE.Color(tinta);
  const [tr, tg, tb] = [alvo.r * 255, alvo.g * 255, alvo.b * 255];
  for (let i = 0; i < d.data.length; i += 4) {
    const r = d.data[i], gg = d.data[i + 1], b = d.data[i + 2];
    const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
    if (tudo || (r === mx && mx > 35 && (mx - mn) / mx > 0.3)) {
      // pedaço da gravata que ficou no blazer: cor lisa igual à da gravata, senão o escuro vira pinta marrom
      const luz = tudo ? (0.3 * r + 0.59 * gg + 0.11 * b) / 110 : 1;
      d.data[i] = Math.min(255, tr * luz);
      d.data[i + 1] = Math.min(255, tg * luz);
      d.data[i + 2] = Math.min(255, tb * luz);
    }
  }
  g.putImageData(d, 0, 0);
  const nova = new THREE.CanvasTexture(cv);
  nova.colorSpace = mapa.colorSpace;
  nova.flipY = mapa.flipY;
  nova.wrapS = mapa.wrapS;
  nova.wrapT = mapa.wrapT;
  repintadas.set(chave, nova);
  return nova;
}

/** uniforme: a gravata do terno fica num canto da textura; pinta só ali com a cor da casa, mantendo o listrado */
function pintarGravata(mapa: THREE.Texture, tinta: number): THREE.Texture {
  const chave = mapa.uuid + 'g' + tinta;
  const pronta = repintadas.get(chave);
  if (pronta) return pronta;
  const img = mapa.image as HTMLImageElement | ImageBitmap;
  const cv = document.createElement('canvas');
  cv.width = img.width;
  cv.height = img.height;
  const g = cv.getContext('2d')!;
  g.drawImage(img as CanvasImageSource, 0, 0);
  const [x0, x1, y0, y1] = [0.35, 0.425, 0.075, 0.195].map((v, i) => Math.round(v * (i < 2 ? cv.width : cv.height)));
  const d = g.getImageData(x0, y0, x1 - x0, y1 - y0);
  const alvo = new THREE.Color(tinta);
  for (let i = 0; i < d.data.length; i += 4) {
    const r = d.data[i], gg = d.data[i + 1], b = d.data[i + 2];
    const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
    const luz = 0.3 * r + 0.59 * gg + 0.11 * b;
    // a camisa em volta é quase branca e sem cor; a gravata é colorida ou mais escura
    if ((mx - mn) / (mx || 1) > 0.15 || luz < 175) {
      const k = 0.85 + 0.15 * Math.min(1, luz / 160);
      d.data[i] = Math.min(255, alvo.r * 255 * k);
      d.data[i + 1] = Math.min(255, alvo.g * 255 * k);
      d.data[i + 2] = Math.min(255, alvo.b * 255 * k);
    }
  }
  g.putImageData(d, x0, y0);
  const nova = new THREE.CanvasTexture(cv);
  nova.colorSpace = mapa.colorSpace;
  nova.flipY = mapa.flipY;
  nova.wrapS = mapa.wrapS;
  nova.wrapT = mapa.wrapT;
  repintadas.set(chave, nova);
  return nova;
}

const carregados = new Map<string, Promise<THREE.Object3D | null>>();
const clipes: Record<string, THREE.AnimationClip> = {};
let loader: GLTFLoader | null = null;
let animacoes: Promise<void> | null = null;

export function L(): GLTFLoader {
  if (loader) return loader;
  const draco = new DRACOLoader();
  draco.setDecoderPath(`${BASE}draco/`);
  loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  return loader;
}

export function carregarAnimacoes(): Promise<void> {
  animacoes ??= L()
    .loadAsync(`${BASE}modelos/gente/animacoes.glb?v=${__VERSAO__}`)
    .then((g: GLTF) => {
      for (const a of g.animations) {
        // dedos ficam fora das animações: a curva do arquivo dobra os dedos para trás
        a.tracks = a.tracks.filter((t) => !/^Root\.position/.test(t.name) && !DEDO.test(t.name));
        clipes[a.name] = a;
      }
    })
    .catch(() => undefined);
  return animacoes;
}

function carregarModelo(id: string): Promise<THREE.Object3D | null> {
  let p = carregados.get(id);
  if (!p) {
    p = L()
      .loadAsync(`${BASE}modelos/gente/${id}.glb?v=${__VERSAO__}`)
      .then((g) => g.scene)
      .catch(() => null);
    carregados.set(id, p);
  }
  return p;
}

export function preCarregar(ids: string[]) {
  carregarAnimacoes();
  for (const id of ids) carregarModelo(modeloDe(id) ?? id);
}

/** qual modelo representa um personagem */
export function modeloDe(id: string): string {
  return MODELOS.includes(id) ? id : 'kevin';
}

const CLIPE: Record<string, string> = {
  parado: 'Idle_Loop', falando: 'Idle_Talking_Loop', andando: 'Walk_Loop', correndo: 'Jog_Fwd_Loop', feitico: 'Spell_Simple_Idle_Loop',
  apanhando: 'Hit_Head', mexendo: 'Interact', comemorando: 'Dance_Loop', formal: 'Walk_Formal_Loop',
  sentado: 'Sitting_Idle_Loop', sentado_falando: 'Sitting_Talking_Loop',
};

// ---------------------------------------------------------------- humano

export class Humano {
  raiz = new THREE.Group();
  mixer: THREE.AnimationMixer | null = null;
  private acoes: Record<string, THREE.AnimationAction> = {};
  private atual: THREE.AnimationAction | null = null;
  private estado = 'parado';
  private rumo: number | undefined;
  private caminho: THREE.Vector2[] = [];
  private fimCaminho: (() => void) | null = null;
  vel = 1.2;
  altura = 1.6;
  private dedos: { osso: THREE.Object3D; repouso: THREE.Quaternion; ang: number; abre: number; lado: number; ehPolegar: boolean }[] = [];
  private pesoRelax = 1;
  private semente = Math.random() * 10;
  // rosto: formas de expressão gravadas no modelo (piscar, boca, sorriso, surpresa, bravo, triste)
  private rostos: { mesh: THREE.Mesh; dict: Record<string, number> }[] = [];
  private expr: Record<string, number> = {};
  // sem expressão nenhuma o rosto parece de cera: todo mundo começa com um sorriso discreto
  private exprAlvo: Record<string, number> = { sorriso: 0.15 };
  private proximaPiscada = 1 + Math.random() * 3;
  private piscando = 0;
  private bocaFase = Math.random() * 10;
  pronto: Promise<void>;

  constructor(public id: string, tinta?: number) {
    this.raiz.userData.humano = this;
    this.raiz.name = `npc:${id}`;
    const m = modeloDe(id);
    this.pronto = Promise.all([carregarModelo(m), carregarAnimacoes()]).then(([fonte]) => {
      if (!fonte) return;
      const modelo = SkeletonUtils.clone(fonte);
      modelo.traverse((x) => {
        const me = x as THREE.Mesh;
        if (!me.isMesh) return;
        me.castShadow = true;
        me.receiveShadow = true;
        me.frustumCulled = false;
        const mats = Array.isArray(me.material) ? me.material : [me.material];
        const novos = mats.map((mm) => {
          const mt = mm as THREE.MeshStandardMaterial;
          const fio = /eyelash|eyebrow|short|long|bob|braid|afro|ponytail/i.test(mt.name);
          mt.transparent = false;
          mt.depthWrite = true;
          mt.alphaTest = fio ? 0.45 : /low-poly/i.test(mt.name) ? 0.5 : /body/i.test(mt.name) ? 0 : 0.5;
          if (!fio) mt.side = THREE.FrontSide;
          // roupa é tudo que não é corpo, olho, cabelo, sobrancelha ou cílio (o nome da malha varia com o asset)
          const roupa = !fio && !/body|low-poly|eye/i.test(mt.name) && !/^corpo/.test(me.name);
          if (roupa) {
            // a camisa fica por cima da calça na cintura; sem isso as duas brigam pelo mesmo pixel
            // a gravata fica acima da camisa (senão aparecem faixas brancas atravessando o nó)
            const prio = /^gravata/.test(mt.name) ? -16 : /shirt|sweater|top|suit|jacket|blouse/i.test(mt.name + me.name) ? -12 : -2;
            mt.polygonOffset = true;
            mt.polygonOffsetFactor = prio;
            mt.polygonOffsetUnits = prio;
            // tecido é fosco: sem isso blazer e terno brilhavam como plástico
            if (!/^gravata/.test(mt.name)) {
              mt.roughness = Math.max(mt.roughness, 0.85);
              mt.metalness = 0;
              mt.roughnessMap = null;
              mt.metalnessMap = null;
              mt.envMapIntensity = 0.45;
              // relevo do tecido mais suave: forte demais, o blazer parecia papel amassado
              if (mt.normalMap) mt.normalScale.set(0.3, 0.3);
            }
          }
          // peças que vêm do MakeHuman com cor ruim: botinha quase branca, terninho rosa-choque, camiseta cinza metálica
          if (roupa && /ankle_boots/.test(mt.name)) mt.color.setHex(0x5a3e2e);
          if (roupa && /basic_tucked_t-shirt/.test(mt.name)) mt.color.setHex(0xa9bfd8);
          // o mesmo suéter em várias pessoas: cada uma com sua cor (a Rô fica com o vermelho original)
          const corSueter = ({ pamela: 0x3f8f8a, brenda: 0xc9a227, neide: 0x8a6fa8 } as Record<string, number>)[id];
          if (roupa && corSueter && mt.map && /sweater/i.test(mt.name)) {
            const c = mt.clone();
            c.map = repintarLaranja(mt.map, corSueter, true);
            return c;
          }
          // a mesma polo serve para vários: cada um com sua cor
          const corPolo = ({ kevin: 0x6f93c4, nildo: 0x7fa36f, vandeco: 0xcbb68e } as Record<string, number>)[id];
          if (roupa && corPolo && /polo/i.test(mt.name)) {
            const c = mt.clone();
            c.color.setHex(corPolo);
            return c;
          }
          if (roupa && mt.map && /female_suit_2/.test(mt.name) && !mt.userData.recolorido) {
            // terninho com cor própria: ameixa da Dona Socorro, grafite para as outras
            mt.map = repintarLaranja(mt.map, ({ socorro: 0x6e3b52 } as Record<string, number>)[id] ?? 0x4a4a54, true);
            mt.userData.recolorido = true;
          }
          if (tinta !== undefined && roupa && mt.map && /male_elegantsuit01/.test(mt.name)) {
            const c = mt.clone();
            c.map = pintarGravata(mt.map, tinta);
            return c;
          }
          // restos de estampa laranja na textura do blazer do uniforme também ganham a cor da casa
          if (tinta !== undefined && roupa && mt.map && /suit_tie_and_jacket/.test(mt.name)) {
            const c = mt.clone();
            c.map = repintarLaranja(mt.map, tinta);
            return c;
          }
          // gravata do uniforme: tecido liso na cor da casa (ou da escola, para visitantes)
          if (tinta !== undefined && /^gravata/.test(mt.name)) {
            const c = mt.clone();
            c.map = null;
            c.color = new THREE.Color(tinta);
            c.roughness = 0.55;
            c.metalness = 0;
            return c;
          }
          return mt;
        });
        me.material = Array.isArray(me.material) ? novos : novos[0];
      });
      this.raiz.add(modelo);
      const caixa = new THREE.Box3().setFromObject(modelo);
      this.altura = caixa.max.y - caixa.min.y;
      modelo.traverse((o) => {
        const m = DEDO_OSSO.exec(o.name);
        if (!m) return;
        const seg = Number(m[2]);
        // mão relaxada de verdade: dedos dobrados nas três falanges (pouco dobrado parecia mão de manequim)
        const ang = m[1] === 'thumb' ? [0, 0.16, 0.26, 0.16][seg] : [0, 0.32, 0.48, 0.3][seg];
        const abre = seg === 1 ? ({ index: 1, middle: 0, ring: -1, pinky: -2, thumb: 0 } as Record<string, number>)[m[1]] : 0;
        this.dedos.push({ osso: o, repouso: o.quaternion.clone(), ang, abre, lado: m[3] === 'l' ? 1 : -1, ehPolegar: m[1] === 'thumb' && seg === 1 });
      });
      this.curvarDedos();
      modelo.traverse((o) => {
        const me = o as THREE.Mesh;
        if (me.isMesh && me.morphTargetDictionary && me.morphTargetInfluences) this.rostos.push({ mesh: me, dict: me.morphTargetDictionary });
      });
      this.mixer = new THREE.AnimationMixer(modelo);
      this.tocar('parado', 0);
      this.mixer.update(Math.random() * 3);
    });
  }

  /** gira o osso (em espaço de mundo) para o filho apontar na direção pedida */
  private alinhar(osso: THREE.Object3D, filho: THREE.Object3D, alvo: THREE.Vector3, peso: number) {
    const a = osso.getWorldPosition(V1);
    const b = filho.getWorldPosition(V2);
    const atual = b.sub(a).normalize();
    QD.setFromUnitVectors(atual, alvo);
    if (peso < 1) QD.slerp(QI, 1 - peso);
    osso.getWorldQuaternion(QW);
    QW.premultiply(QD);
    osso.parent!.getWorldQuaternion(QP).invert();
    osso.quaternion.copy(QP.multiply(QW));
    osso.updateMatrixWorld(true);
  }

  /** em pé e parado: braços soltos ao lado do corpo, cotovelo pouco dobrado (a animação parada da biblioteca tem postura de luta) */
  private bracosRelaxados(peso: number) {
    const r = this.raiz;
    r.updateMatrixWorld(true);
    const frente = V3.set(Math.sin(r.rotation.y), 0, Math.cos(r.rotation.y));
    for (const lado of ['l', 'r']) {
      const ombro = r.getObjectByName('upperarm_' + lado);
      const cot = r.getObjectByName('lowerarm_' + lado);
      const mao = r.getObjectByName('hand_' + lado);
      const dedo = r.getObjectByName('middle_01_' + lado);
      if (!ombro || !cot || !mao) continue;
      const peito = r.getObjectByName('spine_03');
      const fora = ombro.getWorldPosition(V4).sub(peito ? peito.getWorldPosition(V5) : r.position);
      fora.y = 0;
      fora.normalize();
      // braço um pouco afastado do tronco: colado demais, o paletó repuxa e faz corcova no ombro
      const braco = V6.set(0, -1, 0).multiplyScalar(0.94).addScaledVector(fora, RELAX.fora).addScaledVector(frente, 0.07).normalize();
      this.alinhar(ombro, cot, braco, peso);
      const ante = V7.copy(braco).multiplyScalar(0.96).addScaledVector(frente, RELAX.cotovelo).normalize();
      this.alinhar(cot, mao, ante, peso);
      if (dedo) this.alinhar(mao, dedo, V8.copy(ante).addScaledVector(fora, -0.15).normalize(), peso);
      // palma virada para a coxa e polegar para a frente (sem isso a palma ficava para a frente, feito garra)
      const ind = r.getObjectByName('index_01_' + lado);
      const min = r.getObjectByName('pinky_01_' + lado);
      if (dedo && ind && min) {
        const eixo = dedo.getWorldPosition(VA).sub(mao.getWorldPosition(VB)).normalize();
        const k = ind.getWorldPosition(VB).sub(min.getWorldPosition(VC));
        k.addScaledVector(eixo, -k.dot(eixo)).normalize();
        const t = VC.copy(frente).addScaledVector(eixo, -frente.dot(eixo)).normalize();
        const ang = Math.acos(Math.max(-1, Math.min(1, k.dot(t)))) * (k.cross(t).dot(eixo) < 0 ? -1 : 1);
        QD.setFromAxisAngle(eixo, (ang + PALMA.extra * (lado === 'l' ? 1 : -1)) * peso);
        mao.getWorldQuaternion(QW);
        QW.premultiply(QD);
        mao.parent!.getWorldQuaternion(QP).invert();
        mao.quaternion.copy(QP.multiply(QW));
        mao.updateMatrixWorld(true);
      }
    }
  }

  /** mão relaxada: dedos levemente dobrados para dentro */
  curvarDedos(fator = 1) {
    const eixo = new THREE.Vector3(CURVA.eixo === 'x' ? 1 : 0, CURVA.eixo === 'y' ? 1 : 0, CURVA.eixo === 'z' ? 1 : 0);
    const eixoJ = new THREE.Vector3(JUNTA.eixo === 'x' ? 1 : 0, JUNTA.eixo === 'y' ? 1 : 0, JUNTA.eixo === 'z' ? 1 : 0);
    const q = new THREE.Quaternion();
    const qj = new THREE.Quaternion();
    for (const d of this.dedos) {
      q.setFromAxisAngle(eixo, d.ang * CURVA.sinal * fator * JUNTA.dobra);
      d.osso.quaternion.copy(d.repouso).multiply(q);
      if (PALMA.polegar && d.ehPolegar) {
        const e = new THREE.Vector3(PALMA.polegarEixo === 'x' ? 1 : 0, PALMA.polegarEixo === 'y' ? 1 : 0, PALMA.polegarEixo === 'z' ? 1 : 0);
        qj.setFromAxisAngle(e, PALMA.polegar * d.lado);
        d.osso.quaternion.multiply(qj);
      }
      if (d.abre) {
        qj.setFromAxisAngle(eixoJ, d.abre * JUNTA.ang * JUNTA.sinal);
        d.osso.quaternion.multiply(qj);
      }
    }
  }

  /** dedos juntos: cada dedo gira em direção ao do meio, medido na cena (o modelo vem com a mão aberta em leque) */
  juntarDedos() {
    const r = this.raiz;
    for (const lado of ['l', 'r']) {
      const m1 = r.getObjectByName('middle_01_' + lado);
      const m2 = r.getObjectByName('middle_02_' + lado);
      if (!m1 || !m2) continue;
      for (const nome of ['index', 'ring', 'pinky']) {
        const a = r.getObjectByName(nome + '_01_' + lado);
        const b = r.getObjectByName(nome + '_02_' + lado);
        if (!a || !b) continue;
        const meio = m2.getWorldPosition(VA).sub(m1.getWorldPosition(VB)).normalize();
        const dedo = b.getWorldPosition(VC).sub(a.getWorldPosition(VB)).normalize();
        // só a parte lateral: tira o que é dobra (componente fora do plano dos dois)
        QD.setFromUnitVectors(dedo, meio);
        if (JUNTA.fecha < 1) QD.slerp(QI, 1 - JUNTA.fecha);
        a.getWorldQuaternion(QW);
        QW.premultiply(QD);
        a.parent!.getWorldQuaternion(QP).invert();
        a.quaternion.copy(QP.multiply(QW));
        a.updateMatrixWorld(true);
      }
    }
  }

  // ------------------------------------------------------------ gestos
  // a biblioteca de animação não tem aceno, apontar nem cabeça dizendo sim: os gestos são montados osso a osso por cima dela

  private gestoAtual: { nome: Gesto; t: number; dur: number } | null = null;
  private proximoTique = 8 + Math.random() * 14;
  /** faz um gesto agora (some sozinho no fim); 'cruzar', 'cintura' e 'pensar' ficam alguns segundos */
  gesto(nome: Gesto, dur?: number) {
    if (this.sentado && !['sim', 'nao', 'acenar', 'apontar', 'pensar', 'digitar', 'beber', 'cochilar', 'telefone'].includes(nome)) return;
    this.gestoAtual = { nome, t: 0, dur: dur ?? DUR_GESTO[nome] };
  }
  pararGesto() {
    this.gestoAtual = null;
  }
  get gesticulando() {
    return this.gestoAtual?.nome ?? null;
  }

  /** gira o osso no espaço do mundo em volta de um eixo */
  private girar(osso: THREE.Object3D, eixo: THREE.Vector3, ang: number) {
    QD.setFromAxisAngle(eixo, ang);
    osso.getWorldQuaternion(QW);
    QW.premultiply(QD);
    osso.parent!.getWorldQuaternion(QP).invert();
    osso.quaternion.copy(QP.multiply(QW));
    osso.updateMatrixWorld(true);
  }

  /** põe um braço na pose: direção do braço e, para o antebraço, uma direção ou um ponto do mundo onde a mão deve chegar */
  private poseBraco(lado: string, braco: THREE.Vector3, ante: THREE.Vector3, ehPonto: boolean, peso: number) {
    const r = this.raiz;
    const ombro = r.getObjectByName('upperarm_' + lado);
    const cot = r.getObjectByName('lowerarm_' + lado);
    const mao = r.getObjectByName('hand_' + lado);
    const dedo = r.getObjectByName('middle_01_' + lado);
    if (!ombro || !cot || !mao) return;
    this.alinhar(ombro, cot, braco, peso);
    const dir = ehPonto ? G6.copy(ante).sub(cot.getWorldPosition(G5)).normalize() : G6.copy(ante);
    this.alinhar(cot, mao, dir, peso);
    if (dedo) this.alinhar(mao, dedo, dir, peso * 0.8);
  }

  /**
   * braço por cinemática inversa: o cotovelo fica no plano do polo, a mão chega no alvo,
   * os dedos apontam para "dedos" e o mindinho fica do lado de "fora" (palma para baixo)
   */
  private ikBraco(lado: string, alvo: THREE.Vector3, polo: THREE.Vector3, dedos: THREE.Vector3, fora: THREE.Vector3, peso: number) {
    const r = this.raiz;
    const ombro = r.getObjectByName('upperarm_' + lado);
    const cot = r.getObjectByName('lowerarm_' + lado);
    const mao = r.getObjectByName('hand_' + lado);
    const meio = r.getObjectByName('middle_01_' + lado);
    if (!ombro || !cot || !mao) return;
    const S = ombro.getWorldPosition(new THREE.Vector3());
    const E0 = cot.getWorldPosition(new THREE.Vector3());
    const W0 = mao.getWorldPosition(new THREE.Vector3());
    const a = S.distanceTo(E0);
    const b = E0.distanceTo(W0);
    const para = alvo.clone().sub(S);
    const d = Math.min(para.length(), (a + b) * 0.999);
    para.normalize();
    const cosA = Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d)));
    const sinA = Math.sqrt(1 - cosA * cosA);
    const perp = polo.clone().addScaledVector(para, -polo.dot(para)).normalize();
    const E = S.clone().addScaledVector(para, a * cosA).addScaledVector(perp, a * sinA);
    this.alinhar(ombro, cot, E.clone().sub(S).normalize(), peso);
    const E1 = cot.getWorldPosition(new THREE.Vector3());
    this.alinhar(cot, mao, alvo.clone().sub(E1).normalize(), peso);
    if (meio) this.alinhar(mao, meio, dedos, peso);
    // gira a mão em volta do próprio eixo até o mindinho ficar para fora (palma virada para a mesa)
    const ind = r.getObjectByName('index_01_' + lado);
    const min = r.getObjectByName('pinky_01_' + lado);
    if (meio && ind && min) {
      const eixo = meio.getWorldPosition(new THREE.Vector3()).sub(mao.getWorldPosition(new THREE.Vector3())).normalize();
      const k = min.getWorldPosition(new THREE.Vector3()).sub(ind.getWorldPosition(new THREE.Vector3()));
      k.addScaledVector(eixo, -k.dot(eixo)).normalize();
      const tt = fora.clone().addScaledVector(eixo, -fora.dot(eixo)).normalize();
      const ang = Math.acos(Math.max(-1, Math.min(1, k.dot(tt)))) * (k.clone().cross(tt).dot(eixo) < 0 ? -1 : 1);
      this.girar(mao, eixo, ang * peso);
    }
  }

  private aplicarGesto(dt: number) {
    const g = this.gestoAtual;
    if (!g) return;
    g.t += dt;
    if (g.t >= g.dur) {
      this.gestoAtual = null;
      return;
    }
    // entra e sai suave
    const w = Math.min(1, g.t / 0.35, (g.dur - g.t) / 0.4);
    const p = w * w * (3 - 2 * w);
    const r = this.raiz;
    r.updateMatrixWorld(true);
    const U = G1.set(0, 1, 0);
    const F = G2.set(Math.sin(r.rotation.y), 0, Math.cos(r.rotation.y));
    const peito = r.getObjectByName('spine_03');
    const quadril = r.getObjectByName('pelvis');
    const cabeca = r.getObjectByName('head');
    const pescoco = r.getObjectByName('neck_01');
    const fora = (lado: string) => {
      const o = r.getObjectByName('upperarm_' + lado);
      const v = new THREE.Vector3();
      if (!o) return v;
      o.getWorldPosition(v).sub(peito ? peito.getWorldPosition(G3) : r.position);
      v.y = 0;
      return v.normalize();
    };
    const dir = (u: number, f: number, o: THREE.Vector3, k: number) => new THREE.Vector3().addScaledVector(U, u).addScaledVector(F, f).addScaledVector(o, k).normalize();
    const lateral = G4.crossVectors(U, F).normalize();
    const t = g.t;
    void QD;
    switch (g.nome) {
      case 'acenar': {
        const o = fora('r');
        this.poseBraco('r', dir(0.35, 0.2, o, 0.85), dir(1, 0.25, o, 0.15 + Math.sin(t * 10) * 0.45), false, p);
        if (cabeca) this.girar(cabeca, F, Math.sin(t * 2) * 0.06 * p);
        break;
      }
      case 'apontar': {
        const o = fora('r');
        this.poseBraco('r', dir(0.12, 0.85, o, 0.45), dir(0.15, 0.85, o, 0.5), false, p);
        break;
      }
      case 'sim':
        if (cabeca) this.girar(pescoco ?? cabeca, lateral, (0.1 + Math.sin(t * 9) * 0.14) * p);
        break;
      case 'nao':
        if (cabeca) this.girar(pescoco ?? cabeca, U, Math.sin(t * 8) * 0.3 * p);
        break;
      case 'ombros':
        for (const lado of ['l', 'r']) {
          const o = fora(lado);
          const clav = r.getObjectByName('clavicle_' + lado);
          const ombro = r.getObjectByName('upperarm_' + lado);
          if (clav && ombro) this.alinhar(clav, ombro, ombro.getWorldPosition(G5).sub(clav.getWorldPosition(G3)).normalize().addScaledVector(U, 0.35).normalize(), p);
          this.poseBraco(lado, dir(-0.9, 0.12, o, 0.3), dir(0.15, 0.8, o, 0.5), false, p);
        }
        if (cabeca) this.girar(cabeca, F, 0.14 * p);
        break;
      case 'pensar': {
        const o = fora('r');
        const queixo = cabeca ? cabeca.getWorldPosition(new THREE.Vector3()).addScaledVector(F, 0.1).addScaledVector(U, -0.07) : r.position.clone();
        this.poseBraco('r', dir(-0.85, 0.45, o, 0.12), queixo, true, p);
        const ol = fora('l');
        const cotovelo = r.getObjectByName('lowerarm_r')?.getWorldPosition(new THREE.Vector3()).addScaledVector(F, 0.05);
        if (cotovelo) this.poseBraco('l', dir(-0.9, 0.3, ol, 0.1), cotovelo, true, p);
        if (cabeca) this.girar(pescoco ?? cabeca, lateral, 0.12 * p);
        break;
      }
      case 'cintura':
        for (const lado of ['l', 'r']) {
          const o = fora(lado);
          const quadrilLado = (quadril ?? r).getWorldPosition(new THREE.Vector3()).addScaledVector(o, 0.17).addScaledVector(U, 0.06).addScaledVector(F, 0.02);
          this.poseBraco(lado, dir(-0.7, -0.15, o, 0.7), quadrilLado, true, p);
        }
        break;
      case 'cruzar':
        for (const lado of ['l', 'r']) {
          const o = fora(lado);
          // o braço de baixo e o de cima não se atravessam: um fica um pouco mais alto e mais para fora
          const alt = lado === 'l' ? 0.05 : 0;
          const frente = lado === 'l' ? 0.2 : 0.16;
          const alvo = (peito ?? r).getWorldPosition(new THREE.Vector3()).addScaledVector(F, frente).addScaledVector(o, -0.34).addScaledVector(U, -0.02 + alt);
          this.poseBraco(lado, dir(-0.8, 0.42, o, 0.3), alvo, true, p);
        }
        break;
      case 'digitar': {
        // mãos no teclado: cinemática inversa de dois ossos (ombro e cotovelo) até um ponto em cima da mesa,
        // cotovelo para baixo e para fora, palma para baixo e dedos apontando para a tela
        for (const lado of ['l', 'r']) {
          const o = fora(lado);
          const ombro = r.getObjectByName('upperarm_' + lado);
          if (!ombro) continue;
          const bate = Math.max(0, Math.sin(t * (lado === 'l' ? 13 : 11.5) + this.semente * 3)) * 0.012 * (0.6 + 0.4 * Math.sin(t * 0.7 + this.semente));
          const alvo = ombro.getWorldPosition(new THREE.Vector3()).addScaledVector(F, 0.4).addScaledVector(o, -0.1);
          alvo.y = DIGITAR.altura + bate;
          const polo = new THREE.Vector3().addScaledVector(U, -1).addScaledVector(o, 0.55).addScaledVector(F, -0.2);
          this.ikBraco(lado, alvo, polo, F.clone().addScaledVector(U, -0.12).normalize(), o, p);
        }
        if (cabeca) this.girar(pescoco ?? cabeca, lateral, 0.04 * p);
        break;
      }
      case 'beber': {
        // caneca até a boca: sobe, dá um gole e desce
        const o = fora('r');
        const fase = Math.min(1, Math.sin(Math.min(1, t / g.dur) * Math.PI) * 1.6);
        const boca = cabeca ? cabeca.getWorldPosition(new THREE.Vector3()).addScaledVector(F, 0.12).addScaledVector(U, -0.08) : r.position.clone();
        const mesa = (peito ?? r).getWorldPosition(new THREE.Vector3()).addScaledVector(F, 0.35).addScaledVector(U, -0.25).addScaledVector(o, 0.1);
        this.poseBraco('r', dir(-0.85, 0.35, o, 0.15), mesa.lerp(boca, fase), true, p);
        if (cabeca) this.girar(pescoco ?? cabeca, lateral, -0.18 * fase * p);
        break;
      }
      case 'cochilar': {
        // cabeça caída para a frente, respirando fundo, braços largados
        const resp = Math.sin(t * 1.3) * 0.03;
        if (pescoco || cabeca) this.girar(pescoco ?? cabeca!, lateral, (0.55 + resp) * p);
        if (peito) this.girar(peito, lateral, 0.12 * p);
        break;
      }
      case 'telefone': {
        // fone na orelha, a outra mão gesticulando de vez em quando
        const o = fora('l');
        const orelha = cabeca ? cabeca.getWorldPosition(new THREE.Vector3()).addScaledVector(o, 0.09).addScaledVector(U, -0.02) : r.position.clone();
        this.poseBraco('l', dir(-0.6, 0.25, o, 0.45), orelha, true, p);
        if (cabeca) this.girar(pescoco ?? cabeca, F, -0.1 * p);
        if (Math.sin(t * 0.9) > 0.3) {
          const or = fora('r');
          this.poseBraco('r', dir(-0.7, 0.5, or, 0.3), dir(0.3, 0.9, or, 0.25 + Math.sin(t * 4) * 0.2), false, p * 0.8);
        }
        break;
      }
      case 'comemorar':
        for (const lado of ['l', 'r']) {
          const o = fora(lado);
          const pulo = Math.sin(t * 9 + (lado === 'l' ? 0 : 1)) * 0.15;
          this.poseBraco(lado, dir(0.85 + pulo, 0.1, o, 0.45), dir(1, 0.1, o, 0.05), false, p);
        }
        break;
    }
  }

  /** parada sem fazer nada, a pessoa de vez em quando cruza os braços, põe a mão na cintura ou pensa */
  private tiquesParado(dt: number) {
    if (this.estado !== 'parado' || this.sentado || this.gestoAtual || this.caminho.length) return;
    this.proximoTique -= dt;
    if (this.proximoTique > 0) return;
    this.proximoTique = 10 + Math.random() * 18;
    if (Math.random() < 0.55) this.gesto((['cruzar', 'cintura', 'pensar', 'cruzar'] as const)[Math.floor(Math.random() * 4)], 4 + Math.random() * 5);
  }

  /** sentado: parado vira sentado, falando vira falar sentado */
  sentado = false;

  tocar(estado: string, fade = 0.3) {
    if (this.sentado) estado = estado === 'falando' ? 'sentado_falando' : estado === 'parado' ? 'sentado' : estado;
    this.estado = estado;
    if (!this.mixer) return;
    const clipe = clipes[CLIPE[estado] ?? CLIPE.parado];
    if (!clipe) return;
    let a = this.acoes[clipe.name];
    if (!a) {
      a = this.mixer.clipAction(clipe);
      this.acoes[clipe.name] = a;
    }
    if (this.atual === a) return;
    a.reset().setEffectiveWeight(1).play();
    if (estado === 'apanhando') {
      a.setLoop(THREE.LoopOnce, 1);
      a.clampWhenFinished = false;
    }
    if (this.atual && fade > 0) this.atual.crossFadeTo(a, fade, false);
    else this.atual?.stop();
    this.atual = a;
  }

  olharPara(x: number, z: number, imediato = false) {
    this.rumo = Math.atan2(x - this.raiz.position.x, z - this.raiz.position.z);
    if (imediato) this.raiz.rotation.y = this.rumo;
  }

  irPara(pontos: { x: number; z: number }[], vel = 1.2): Promise<void> {
    this.caminho = pontos.map((p) => new THREE.Vector2(p.x, p.z));
    this.vel = vel;
    return new Promise((r) => (this.fimCaminho = r));
  }

  /** ponto do rosto em coordenadas do mundo, para a câmera mirar (pelo osso da cabeça) */
  cabeca(alvo = new THREE.Vector3()) {
    const osso = this.raiz.getObjectByName('head');
    if (osso) {
      osso.getWorldPosition(alvo);
      alvo.y += 0.06;
      return alvo;
    }
    return this.raiz.getWorldPosition(alvo).setY(this.raiz.position.y + this.altura * 0.92);
  }

  /** cara da pessoa: sorriso, surpresa, bravo ou triste, de 0 a 1 (as outras voltam ao neutro devagar) */
  expressao(nome: 'sorriso' | 'surpresa' | 'bravo' | 'triste' | 'neutro', forca = 1) {
    for (const k of ['sorriso', 'surpresa', 'bravo', 'triste']) this.exprAlvo[k] = 0;
    if (nome !== 'neutro') this.exprAlvo[nome] = forca;
  }

  private animarRosto(dt: number) {
    if (!this.rostos.length) return;
    // piscar sozinho a cada poucos segundos
    this.proximaPiscada -= dt;
    if (this.proximaPiscada <= 0) {
      this.piscando = 0.16;
      this.proximaPiscada = 2 + Math.random() * 4;
    }
    let pisca = 0;
    if (this.piscando > 0) {
      this.piscando -= dt;
      pisca = Math.sin(Math.max(0, this.piscando) / 0.16 * Math.PI);
    }
    // boca mexendo enquanto fala, com ritmo irregular de sílabas
    const falando = this.estado === 'falando' || this.estado === 'sentado_falando';
    this.bocaFase += dt * 11;
    const alvoBoca = falando ? Math.max(0, Math.sin(this.bocaFase) * 0.5 + Math.sin(this.bocaFase * 2.3 + 1) * 0.3 + 0.15) : 0;
    this.expr.boca = (this.expr.boca ?? 0) + (alvoBoca - (this.expr.boca ?? 0)) * Math.min(1, dt * 18);
    for (const k of ['sorriso', 'surpresa', 'bravo', 'triste']) this.expr[k] = (this.expr[k] ?? 0) + ((this.exprAlvo[k] ?? 0) - (this.expr[k] ?? 0)) * Math.min(1, dt * 4);
    for (const { mesh, dict } of this.rostos) {
      const inf = mesh.morphTargetInfluences!;
      if (dict.piscar !== undefined) inf[dict.piscar] = pisca;
      for (const k of ['boca', 'sorriso', 'surpresa', 'bravo', 'triste']) if (dict[k] !== undefined) inf[dict[k]] = this.expr[k] ?? 0;
    }
  }

  update(dt: number) {
    this.animarRosto(dt);
    const r = this.raiz;
    if (this.caminho.length) {
      const a = this.caminho[0];
      const dx = a.x - r.position.x;
      const dz = a.y - r.position.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.08) {
        this.caminho.shift();
        if (!this.caminho.length && this.fimCaminho) {
          const f = this.fimCaminho;
          this.fimCaminho = null;
          f();
        }
      } else {
        const passo = Math.min(d, this.vel * dt);
        r.position.x += (dx / d) * passo;
        r.position.z += (dz / d) * passo;
        this.rumo = Math.atan2(dx, dz);
      }
    }
    if (this.rumo !== undefined) {
      let dif = this.rumo - r.rotation.y;
      dif = Math.atan2(Math.sin(dif), Math.cos(dif));
      r.rotation.y += dif * Math.min(1, dt * 6);
    }
    if (this.mixer) {
      const andando = this.caminho.length > 0;
      const est = andando ? (this.vel > 2 ? 'correndo' : 'andando') : this.estado;
      if (andando || ['parado', 'falando', 'feitico', 'apanhando', 'mexendo', 'comemorando', 'sentado', 'sentado_falando'].includes(est)) this.tocarSemMudarEstado(est);
      this.mixer.update(dt);
      // parado: braços soltos; falando: só suaviza o gesto
      const alvo = this.sentado ? 0 : est === 'parado' ? RELAX.parado : est === 'falando' ? RELAX.falando : 0;
      this.pesoRelax += (alvo - this.pesoRelax) * Math.min(1, dt * 4);
      if (this.pesoRelax > 0.01) this.bracosRelaxados(this.pesoRelax);
      if (!andando) {
        this.tiquesParado(dt);
        this.aplicarGesto(dt);
      } else this.gestoAtual = null;
      // dedos se mexem de leve, como mão relaxada respirando
      // digitando, os dedos curvam sobre as teclas e mexem um pouco mais
      const digita = this.gestoAtual?.nome === 'digitar';
      this.curvarDedos((digita ? 1.3 : 1) * (1 + Math.sin(performance.now() / (digita ? 120 : 900) + this.semente) * (digita ? 0.1 : 0.12)));
      this.juntarDedos();
    }
  }

  private tocarSemMudarEstado(est: string) {
    const guardado = this.estado;
    this.tocar(est);
    this.estado = guardado;
  }
}
