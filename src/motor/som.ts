// Som do SOC: efeitos gravados (CC0) e ambiente sintetizado no navegador
// (zumbido do ar-condicionado e dos servidores, teclado dos colegas, telefone tocando, bipe de alerta).

const BASE = `${import.meta.env.BASE_URL}som/`;
const CHAVE = 'socorro.som';
interface Prefs {
  volume: number;
  mudo: boolean;
}
let prefs: Prefs = { volume: 0.7, mudo: false };
try {
  const p = JSON.parse(localStorage.getItem(CHAVE) ?? 'null');
  if (p) prefs = { ...prefs, ...p };
} catch {
  /* nada */
}

let ctx: AudioContext | null = null;
let mestre: GainNode;
let busAmb: GainNode;
let ruido: AudioBuffer;
const buffers = new Map<string, Promise<AudioBuffer | null>>();
let ambienteAtual: { parar: () => void } | null = null;
let ambientePedido: 'alfa' | 'bravo' | 'nenhum' = 'nenhum';

export function preferencias() {
  return { ...prefs };
}

export function ajustar(p: Partial<Prefs>) {
  prefs = { ...prefs, ...p };
  try {
    localStorage.setItem(CHAVE, JSON.stringify(prefs));
  } catch {
    /* nada */
  }
  if (ctx) mestre.gain.setTargetAtTime(prefs.mudo ? 0 : prefs.volume, ctx.currentTime, 0.05);
}

function iniciar() {
  if (ctx) return;
  try {
    ctx = new AudioContext();
  } catch {
    return;
  }
  mestre = ctx.createGain();
  mestre.gain.value = prefs.mudo ? 0 : prefs.volume;
  mestre.connect(ctx.destination);
  busAmb = ctx.createGain();
  busAmb.gain.value = 0.5;
  busAmb.connect(mestre);
  ruido = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = ruido.getChannelData(0);
  let ult = 0;
  for (let i = 0; i < d.length; i++) {
    // ruído marrom: grave e abafado, como ar-condicionado
    ult = (ult + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = ult * 3.5;
  }
  if (ambientePedido !== 'nenhum') ambiente(ambientePedido);
}

export function ligarNoPrimeiroGesto() {
  const liga = () => {
    iniciar();
    ctx?.resume();
    if (ctx?.state === 'running') ['pointerdown', 'keydown', 'touchstart'].forEach((e) => removeEventListener(e, liga, true));
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((e) => addEventListener(e, liga, true));
}

function carregar(nome: string): Promise<AudioBuffer | null> {
  let p = buffers.get(nome);
  if (!p) {
    p = fetch(BASE + nome + '.mp3')
      .then((r) => r.arrayBuffer())
      .then((b) => ctx!.decodeAudioData(b))
      .catch(() => null);
    buffers.set(nome, p);
  }
  return p;
}

function tocarArquivo(nome: string, vol = 1, taxa = 1) {
  if (!ctx) return;
  carregar(nome).then((b) => {
    if (!b || !ctx) return;
    const s = ctx.createBufferSource();
    s.buffer = b;
    s.playbackRate.value = taxa;
    const g = ctx.createGain();
    g.gain.value = vol;
    s.connect(g).connect(mestre);
    s.start();
  });
}

function bipe(freqs: number[], dur = 0.09, tipo: OscillatorType = 'sine', vol = 0.12) {
  if (!ctx) return;
  let t = ctx.currentTime;
  for (const f of freqs) {
    const o = ctx.createOscillator();
    o.type = tipo;
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(mestre);
    o.start(t);
    o.stop(t + dur + 0.02);
    t += dur * 0.9;
  }
}

export const acerto = () => tocarArquivo('acerto', 0.6);
export const erro = () => tocarArquivo('erro', 0.6);
export const clique = () => tocarArquivo('clique', 0.4);
export const caneca = () => tocarArquivo('caneca', 0.8);
export const porta = (abre = true) => tocarArquivo(abre ? 'porta_abre' : 'porta_fecha', 0.5);
export const alerta = () => bipe([880, 1320], 0.08, 'triangle', 0.08);
export const critico = () => bipe([660, 440, 660, 440], 0.14, 'square', 0.05);
export const promocao = () => bipe([523, 659, 784, 1046], 0.16, 'triangle', 0.12);
export const ponto = () => bipe([1200], 0.12, 'square', 0.05);

let ultimoPasso = 0;
let pe = 0;
export function passo(correndo: boolean) {
  if (!ctx) return;
  const agora = performance.now();
  if (agora - ultimoPasso < (correndo ? 300 : 480)) return;
  ultimoPasso = agora;
  tocarArquivo('passo_' + (pe++ % 4), 0.22, 0.95 + Math.random() * 0.1);
}

/** telefone fixo tocando (o do Dr. Leôncio às 3h) */
export function telefone(vezes = 2) {
  if (!ctx) return;
  for (let k = 0; k < vezes; k++) {
    const t0 = ctx.currentTime + k * 1.6;
    for (let i = 0; i < 2; i++) {
      const o = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      o.frequency.value = 425;
      o2.frequency.value = 480;
      const g = ctx.createGain();
      const t = t0 + i * 0.45;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.02);
      g.gain.setValueAtTime(0.05, t + 0.35);
      g.gain.linearRampToValueAtTime(0, t + 0.4);
      o.connect(g);
      o2.connect(g);
      g.connect(mestre);
      o.start(t);
      o2.start(t);
      o.stop(t + 0.42);
      o2.stop(t + 0.42);
    }
  }
}

/** ambiente da sala: zumbido grave constante e teclado distante dos colegas */
export function ambiente(site: 'alfa' | 'bravo' | 'nenhum') {
  ambientePedido = site;
  if (!ctx) return;
  ambienteAtual?.parar();
  ambienteAtual = null;
  if (site === 'nenhum') return;
  const c = ctx;
  const fonte = c.createBufferSource();
  fonte.buffer = ruido;
  fonte.loop = true;
  const filtro = c.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = site === 'alfa' ? 420 : 300;
  const g = c.createGain();
  g.gain.value = site === 'alfa' ? 0.35 : 0.22;
  fonte.connect(filtro).connect(g).connect(busAmb);
  fonte.start();
  // ventilador de teto do Bravo: leve pulsação
  let lfo: OscillatorNode | null = null;
  if (site === 'bravo') {
    lfo = c.createOscillator();
    lfo.frequency.value = 2.2;
    const lg = c.createGain();
    lg.gain.value = 0.06;
    lfo.connect(lg).connect(g.gain);
    lfo.start();
  }
  // tec-tec dos colegas
  const teclas = window.setInterval(() => {
    if (Math.random() < 0.55) return;
    const n = 2 + Math.floor(Math.random() * 6);
    for (let i = 0; i < n; i++) {
      const t = c.currentTime + i * (0.07 + Math.random() * 0.09);
      const s = c.createBufferSource();
      s.buffer = ruido;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2400 + Math.random() * 1600;
      bp.Q.value = 3;
      const gg = c.createGain();
      gg.gain.setValueAtTime(0.0001, t);
      gg.gain.linearRampToValueAtTime(0.025, t + 0.004);
      gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      s.connect(bp).connect(gg).connect(busAmb);
      s.start(t, Math.random());
      s.stop(t + 0.05);
    }
  }, 700);
  ambienteAtual = {
    parar: () => {
      fonte.stop();
      lfo?.stop();
      clearInterval(teclas);
    },
  };
}
