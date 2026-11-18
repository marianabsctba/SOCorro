// Controlador do jogo: o SOC em 3D, a equipe, as cenas de diálogo, as interações e o ciclo do dia.
import * as THREE from 'three';
import { DIAS } from './conteudo/index';
import type { Dia, Fala, PersonagemId, Site } from './conteudo/tipos';
import { CONVERSAS } from './conteudo/conversas';
import { M, iniciar3d } from './tres/motor3d';
import { J, iniciarControles, posicionar, soltarMouse } from './tres/jogador';
import { construir, type Sala, type Interativo } from './tres/soc';
import { Equipe } from './tres/equipe';
import { atualizarTelas, estadoTelas } from './tres/telas';
import { preCarregar } from './tres/humanos';
import { abrirConsole, consoleAberto, fecharConsole, novaMissao, turnoCompleto, type Turno } from './ui/console';
import { montarFila } from './motor/fila';
import { fecharDia, honrar, tirarNovas } from './motor/carreira';
import { carregar, estado, limitar, novo, salvar, somar, temPartida, apagar } from './motor/estado';
import { NOMES, PAPEIS, esc, fmt } from './motor/texto';
import * as Som from './motor/som';
import { aviso, avisarNovas } from './ui/avisos';
import { cartaoDia, cracha, fechamento, menuInicial, pausa, telaFinal, comoSeJoga } from './ui/telas';

const app = () => document.getElementById('app')!;
let sala: Sala | null = null;
let equipe: Equipe | null = null;
let turno: Turno | null = null;
let modo: 'menu' | 'livre' | 'cena' | 'console' | 'pausa' | 'tela' = 'menu';
let hud: HTMLElement | null = null;
let alvoAtual: Interativo | { id: 'npc'; quem: PersonagemId; rotulo: string; pos: THREE.Vector3 } | null = null;
let fimDoTurno: (() => void) | null = null;
let olhando: { cabeca: (v: THREE.Vector3) => THREE.Vector3 } | null = null;
const MODELOS_INICIAIS: PersonagemId[] = ['gilmar', 'ro', 'keyla', 'kevin', 'brenda', 'pamela', 'jefferson', 'vandeco', 'neide'];

declare global {
  interface Window {
    __soc?: unknown;
  }
}

export async function iniciar() {
  Som.ligarNoPrimeiroGesto();
  document.querySelector('.carregando')?.remove();
  const mundo = document.getElementById('mundo')!;
  const canvas = iniciar3d(mundo);
  iniciarControles(canvas, app());
  preCarregar(MODELOS_INICIAIS);
  M.atualizar.add(quadro);
  addEventListener('keydown', tecla);
  document.addEventListener('pointerlockchange', () => {
    // Esc no navegador solta o mouse antes de chegar no jogo: soltou no modo livre, pausa
    if (!document.pointerLockElement && modo === 'livre' && !J.toque) void abrirPausa();
  });
  if (matchMedia('(pointer: coarse)').matches) document.body.classList.add('toque');
  window.__soc = { J, M, estado: () => (temPartida() ? estado() : null), get modo() { return modo; }, get sala() { return sala; }, get equipe() { return equipe; }, get turno() { return turno; }, interagir: (id: string) => interagir(id),
    // ajudantes de teste: clica no botão (ou avança o diálogo) cujo texto contém o trecho
    clicar: (trecho = '') => {
      const d = document.querySelector<HTMLElement>('.dialogo');
      if (d && !trecho) {
        d.click();
        return 'dialogo';
      }
      const b = [...document.querySelectorAll<HTMLElement>('#app button')].find((x) => x.offsetParent && !(x as HTMLButtonElement).disabled && x.innerText.includes(trecho));
      b?.click();
      return b ? b.innerText : 'nada';
    },
    // segura a câmera onde o teste colocar (o menu gira a câmera sozinho)
    posar: () => {
      modo = 'tela';
      document.querySelector('.menu')?.remove();
    },
    irParaDia: (n: number) => {
      estado().dia = n;
      salvar();
    },
  };
  await menu();
}

// ---------------------------------------------------------------- sala e vitrine

function trocarSala(site: Site) {
  if (sala && sala.site === site) return;
  if (sala) {
    equipe?.limpar();
    M.cena.remove(sala.grupo);
  }
  sala = construir(site);
  M.cena.add(sala.grupo);
  J.area = sala;
  equipe = new Equipe(sala);
  M.atualizarSombra = true;
  estadoTelas.site = site;
}

function montarEquipe(dia: Dia | null) {
  if (!sala || !equipe) return;
  equipe.limpar();
  const extras = new Set<PersonagemId>();
  if (dia) {
    for (const f of [...dia.chegada, ...(dia.saida ?? [])]) if (f.quem in NOMES && !['voce', 'narrador', 'telefone', 'chat', 'leoncio'].includes(f.quem)) extras.add(f.quem as PersonagemId);
    if (dia.evento === 'visita_ceo' || dia.evento === 'auditoria') extras.add('leoncio');
  }
  equipe.montar(dia?.site ?? 'alfa', dia?.turno ?? 'manhã', [...extras]);
}

let vitrineT = 0;
async function menu() {
  modo = 'menu';
  fecharConsole();
  tirarHud();
  carregar();
  trocarSala('alfa');
  montarEquipe(null);
  J.livre = false;
  Som.ambiente('alfa');
  const s = temPartida() ? estado() : null;
  const r = await menuInicial(!!s && !s.final, s?.dia ?? 1);
  if (r === 'novo') {
    apagar();
    const c = await cracha();
    novo(c.nome, c.genero);
    await comoSeJoga();
  }
  await rodarDia();
}

// ---------------------------------------------------------------- o dia

async function rodarDia() {
  const e = estado();
  const dia = DIAS.find((d) => d.n === e.dia) ?? DIAS[DIAS.length - 1];
  if (!dia) {
    aviso('Conteúdo em construção', 'Este dia ainda não foi escrito.');
    return;
  }
  modo = 'tela';
  trocarSala(dia.site);
  montarEquipe(dia);
  Som.ambiente(dia.site);
  posicionar(sala!.pontos.entrada.x, sala!.pontos.entrada.z, 0);
  J.livre = false;
  // quem abre a cena do dia (e não está sentado) já espera perto da porta
  const primeiro = dia.chegada.map((f) => equipe!.membros.get(f.quem as PersonagemId)).find(Boolean);
  if (primeiro && !primeiro.cadeira) {
    primeiro.h.raiz.position.set(sala!.pontos.entrada.x - 0.3, 0, sala!.pontos.entrada.z - 1.9);
    primeiro.h.olharPara(sala!.pontos.entrada.x, sala!.pontos.entrada.z, true);
  }
  await cartaoDia(dia);
  const sem = [...e.nome].reduce((a, c) => a + c.charCodeAt(0), 0);
  turno = { dia, fila: montarFila(dia, e.nivel, sem), missoes: dia.missoes.map(novaMissao), falas: [] };
  estadoTelas.fila = turno.fila.length * 6 + 7;
  mostrarHud();
  await cena(dia.chegada);
  liberar();
  objetivo();
  await new Promise<void>((r) => (fimDoTurno = r));
  fimDoTurno = null;
  // fim do turno
  if (turno.dia.saida?.length) await cena(turno.dia.saida);
  const t = turno;
  const pontosA = t.fila.reduce((s, a) => s + (a.resposta?.pontos ?? 0), 0);
  const maxA = t.fila.reduce((s, a) => s + (a.modelo.veredito === 'tp' ? 4 : 3), 0);
  const prova = t.missoes.find((m) => m.m.tipo === 'prova');
  const pontosM = t.missoes.filter((m) => m.m.tipo !== 'prova').reduce((s, m) => s + m.pontos, 0);
  const maxM = t.missoes.filter((m) => m.m.tipo !== 'prova').reduce((s, m) => s + m.max, 0);
  let pontos = pontosA + pontosM;
  let max = maxA + maxM;
  if (prova && prova.m.tipo === 'prova') {
    // a prova pesa como metade do dia
    pontos = (max ? (pontos / max) * 50 : 50) + (prova.nota ?? 0) / 2;
    max = 100;
  }
  const f = fecharDia(t.dia, pontos, max, prova && prova.m.tipo === 'prova' ? { nota: prova.nota ?? 0, minima: prova.m.notaMinima, promoveA: prova.m.promoveA } : undefined);
  modo = 'tela';
  J.livre = false;
  soltarMouse();
  tirarHud();
  const ganhas = Object.entries(estado().honrarias)
    .filter(([, d]) => d === t.dia.n)
    .map(([id]) => id);
  tirarNovas();
  await fechamento({ dia: t.dia, nota: f.nota, alertas: t.fila.length, acertos: t.fila.filter((a) => a.resposta?.acertou).length, missoes: t.missoes.length, promovido: f.promovido, reprovou: f.reprovou, honrarias: ganhas });
  if (f.final) {
    await telaFinal(f.final);
    await menu();
    return;
  }
  await rodarDia();
}

function liberar() {
  modo = 'livre';
  J.livre = true;
  J.alvoOlhar = null;
  // a cena deixava a câmera olhando para cima (rosto de quem falava); volta para o horizonte
  J.pitch = Math.max(-0.25, Math.min(0.05, J.pitch));
}

function objetivo() {
  if (!hud || !turno) return;
  const pend = turno.fila.filter((a) => !a.resposta).length;
  const mp = turno.missoes.filter((m) => !m.feita).length;
  const o = hud.querySelector('.objetivo');
  const texto = turnoCompleto(turno) ? 'Turno feito. Bata o ponto no relógio ao lado da porta.' : `Sente na sua estação (post-it amarelo, fileira do fundo) e abra o Vigia. Fila: ${pend} alerta(s), missões: ${mp}.`;
  if (o) o.innerHTML = `<div class="hud-caixa">${texto}</div>`;
  const b = hud.querySelector('.barras');
  if (b) {
    const e = estado();
    b.innerHTML = `<div class="barra"><span>Energia</span><i><s style="width:${e.energia}%;background:var(--ambar)"></s></i></div><div class="barra"><span>Sanidade</span><i><s style="width:${e.sanidade}%;background:var(--verde)"></s></i></div>`;
  }
}

function mostrarHud() {
  tirarHud();
  const e = estado();
  const d = turno!.dia;
  hud = document.createElement('div');
  hud.className = 'passa';
  hud.style.position = 'absolute';
  hud.style.inset = '0';
  hud.innerHTML = `<div class="hud"><div class="hud-caixa"><b>Dia ${d.n}</b> · ${d.turno} · SOC ${d.site === 'alfa' ? 'Alfa' : 'Bravo'}<div class="barras" style="margin-top:6px"></div></div><div style="display:flex;gap:6px"><button class="bt sec peq" data-h="pausa">Pausa</button></div></div>
    <div class="objetivo"></div><div class="mira"></div><div class="dica-e" style="display:none"></div><button class="bt-toque" data-h="e">E</button>`;
  app().append(hud);
  hud.querySelector('[data-h="pausa"]')!.addEventListener('click', () => void abrirPausa());
  hud.querySelector('[data-h="e"]')!.addEventListener('click', () => usar());
  void e;
  objetivo();
}

function tirarHud() {
  hud?.remove();
  hud = null;
}

async function abrirPausa() {
  if (modo !== 'livre') return;
  modo = 'pausa';
  J.livre = false;
  const r = await pausa();
  if (r === 'praia') {
    estado().final = 'praia';
    salvar();
    tirarHud();
    modo = 'tela';
    await telaFinal('praia');
    await menu();
    return;
  }
  if (r === 'menu') {
    salvar();
    fimDoTurno = null;
    await menu();
    return;
  }
  if (r === 'como') await comoSeJoga();
  liberar();
}

// ---------------------------------------------------------------- cenas

function caixaDialogo(f: Fala): Promise<void> {
  return new Promise((res) => {
    const d = document.createElement('div');
    const presente = equipe?.membros.has(f.quem as PersonagemId);
    const tipo = f.quem === 'narrador' ? 'narrador' : f.quem === 'chat' ? 'chat' : f.quem === 'telefone' || (f.quem === 'leoncio' && !presente) ? 'telefone' : '';
    d.className = `dialogo ${tipo}`;
    const nome = f.quem === 'voce' ? estado().nome : NOMES[f.quem];
    const papel = f.quem === 'leoncio' && !presente ? 'ao telefone' : PAPEIS[f.quem] ?? '';
    d.innerHTML = `${nome ? `<div class="quem">${esc(nome)}<span class="papel">${esc(papel)}</span></div>` : ''}<div class="fala">${fmt(f.texto)}</div><div class="seguir">clique, espaço ou E para continuar</div>`;
    app().append(d);
    const fim = () => {
      removeEventListener('keydown', tec);
      d.remove();
      res();
    };
    const tec = (ev: KeyboardEvent) => {
      if (ev.code === 'Space' || ev.code === 'KeyE' || ev.code === 'Enter') {
        ev.preventDefault();
        fim();
      }
    };
    setTimeout(() => {
      addEventListener('keydown', tec);
      d.addEventListener('click', fim);
      app().querySelector('.tela3d')?.addEventListener('click', fim, { once: true });
    }, 250);
  });
}

async function cena(falas: Fala[]) {
  if (!falas.length) return;
  const antes = modo;
  modo = 'cena';
  J.livre = false;
  soltarMouse();
  const envolvidos = new Set<PersonagemId>();
  let tocou = false;
  for (const f of falas) {
    const id = f.quem as PersonagemId;
    const m = equipe?.membros.get(id);
    if ((f.quem === 'telefone' || (f.quem === 'leoncio' && !m)) && !tocou) {
      Som.telefone(2);
      tocou = true;
    }
    if (f.quem === 'chat') Som.alerta();
    if (m) {
      envolvidos.add(id);
      // a fala começa enquanto a pessoa vem andando; a câmera acompanha
      const vindo = equipe!.chamar(id, J.pos);
      await Promise.race([vindo, new Promise((r) => setTimeout(r, 1400))]);
      J.alvoOlhar = m.h.cabeca(new THREE.Vector3());
      olhando = m.h;
      m.h.tocar('falando');
      if (f.gesto) m.h.gesto(f.gesto);
      m.h.expressao(f.expr ?? 'sorriso', f.expr && f.expr !== 'neutro' ? 0.8 : 0.25);
    }
    await caixaDialogo(f);
    if (m) {
      m.h.tocar('parado');
      m.h.expressao('sorriso', 0.15);
    }
  }
  for (const id of envolvidos) equipe?.liberar(id);
  olhando = null;
  J.alvoOlhar = null;
  modo = antes === 'cena' ? 'livre' : antes;
}

// ---------------------------------------------------------------- interação

const FRENTE = new THREE.Vector3();
const DIR = new THREE.Vector3();

function procurarAlvo() {
  if (!sala || modo !== 'livre') {
    alvoAtual = null;
    return;
  }
  M.camera.getWorldDirection(FRENTE);
  const olho = M.camera.position;
  let melhor: typeof alvoAtual = null;
  let nota = Infinity;
  const testar = (pos: THREE.Vector3, raio: number) => {
    DIR.copy(pos).sub(olho);
    const d = DIR.length();
    if (d > raio) return Infinity;
    DIR.normalize();
    const ang = Math.acos(Math.min(1, DIR.dot(FRENTE)));
    if (ang > 0.42) return Infinity;
    return d * 0.4 + ang * 3;
  };
  for (const it of sala.interativos) {
    if (it.id.startsWith('pista_') && estado().pistasBravo.includes(it.id)) continue;
    const n = testar(it.pos, it.raio ?? 2.3);
    if (n < nota) {
      nota = n;
      melhor = it;
    }
  }
  for (const m of equipe?.membros.values() ?? []) {
    if (m.ocupado) continue;
    const p = m.h.cabeca(new THREE.Vector3());
    const n = testar(p, 2.4);
    if (n < nota) {
      nota = n;
      melhor = { id: 'npc', quem: m.id, rotulo: `Falar com ${NOMES[m.id]}`, pos: p };
    }
  }
  alvoAtual = melhor;
}

function mostrarDica() {
  const el = hud?.querySelector<HTMLElement>('.dica-e');
  if (!el) return;
  if (alvoAtual && modo === 'livre') {
    el.style.display = '';
    el.innerHTML = `<kbd>E</kbd>${esc(alvoAtual.rotulo)}`;
  } else el.style.display = 'none';
}

function tecla(ev: KeyboardEvent) {
  if ((ev.target as HTMLElement)?.tagName === 'INPUT' || (ev.target as HTMLElement)?.tagName === 'TEXTAREA') return;
  if (ev.code === 'KeyE' && modo === 'livre') usar();
  if (ev.code === 'Escape' && modo === 'livre') void abrirPausa();
  if (ev.code === 'Escape' && modo === 'console') levantar();
}

function usar() {
  if (modo !== 'livre' || !alvoAtual) return;
  if (alvoAtual.id === 'npc') void conversar((alvoAtual as { quem: PersonagemId }).quem);
  else interagir(alvoAtual.id);
}

async function conversar(quem: PersonagemId) {
  const linhas = CONVERSAS[quem] ?? ['...'];
  const c = estado().cont;
  const k = `conv_${quem}`;
  const i = (c[k] ?? 0) % linhas.length;
  c[k] = (c[k] ?? 0) + 1;
  if (quem === 'neide') somar('neide');
  await cena([{ quem, texto: linhas[i], gesto: Math.random() < 0.4 ? 'ombros' : undefined }]);
  avisarNovas();
  liberar();
}

function pista(id: string, texto: string) {
  const e = estado();
  if (!e.pistasBravo.includes(id)) e.pistasBravo.push(id);
  honrar('conspiracao');
  salvar();
  aviso(`Pista ${e.pistasBravo.length} de 3`, texto, '🕵️', 8000);
  avisarNovas();
}

function interagir(id: string) {
  const e = estado();
  switch (id) {
    case 'estacao':
      sentar();
      break;
    case 'cafe': {
      const hoje = e.cont.cafes_dia ?? 0;
      if (hoje >= 4) {
        aviso('A cafeteira recusou', 'Até ela tem limite. Bebe uma água, pelo amor.', '🚫');
        break;
      }
      Som.caneca();
      e.energia = limitar(e.energia + 22);
      e.sanidade = limitar(e.sanidade + 1);
      somar('cafes');
      somar('cafes_dia');
      if (hoje + 1 >= 4) honrar('taquicardia');
      aviso('Café', ['Coado, forte, levemente queimado. Perfeito.', 'O café da copa tem gosto de SLA estourado. Mas funciona.', 'Você sente os pacotes de rede passando pelas veias.', 'Último gole. A cafeteira piscou para você.'][hoje] ?? 'Café.', '☕');
      salvar();
      break;
    }
    case 'ar':
      honrar('ar');
      aviso('Termostato', 'Você subiu para 23 °C. Em 40 segundos alguém baixou para 16 de novo. Ninguém viu quem.', '🥶');
      break;
    case 'ventilador':
      aviso('Ventilador de teto', 'Por um minuto, Recife ficou fresca. Foi bom enquanto durou.', '🌀');
      break;
    case 'coxinha':
      honrar('coxinha');
      aviso('A coxinha', 'Mordida, fria, com um post-it: "não jogar fora, ainda tô comendo". Data no post-it: 2024.', '🥟');
      break;
    case 'nobreak':
      aviso('Aviso no nobreak', '"NÃO LIGAR CAFETEIRA AQUI". Escrito à mão, sublinhado três vezes. Tem história aí.', '🔌');
      break;
    case 'videowall':
      if (sala?.site === 'bravo') pista('pista_videowall', 'No videowall do Bravo, bem apagadinho, dá para ler: "Captura de tela 2019-03-12 141502.png". Estranho.');
      else aviso('Videowall', 'O mapa de ameaças é um GIF comprado em 2019. Impressiona cliente em visita e ninguém mais.', '🗺️');
      break;
    case 'pista_janela':
      pista('pista_janela', 'O mar da janela tem um vinco no meio. As ondas mexem, mas o vinco nunca sai do lugar. Isso é um pôster?');
      break;
    case 'pista_paint':
      pista('pista_paint', 'No monitor do Nildo tem um Paint aberto: "soc_bravo_FINAL_v3_agoravai.png". É o SOC Bravo. Desenhado.');
      break;
    case 'janela':
      aviso('Janela', sala?.site === 'bravo' ? 'Sol, mar e 31 °C. Lá fora é Recife. Aqui dentro é SLA.' : 'Garoa, 12 °C e um céu da cor do Chamadão. Curitiba sendo Curitiba.', sala?.site === 'bravo' ? '🌊' : '🌧️');
      break;
    case 'ponto':
      if (turno && turnoCompleto(turno)) fimDoTurno?.();
      else if (turno) aviso('O relógio de ponto apitou', `Ainda tem ${turno.fila.filter((a) => !a.resposta).length} alerta(s) e ${turno.missoes.filter((m) => !m.feita).length} missão(ões). O Gilmar está olhando.`, '⏱️');
      break;
  }
  avisarNovas();
  objetivo();
}

function sentar() {
  if (!sala || !turno) return;
  modo = 'console';
  J.livre = false;
  soltarMouse();
  const s = sala.meu;
  J.pos.set(s.x, 0, s.z + 0.05);
  J.olho = 1.22;
  J.alvoOlhar = s.monitor.clone();
  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.inset = '0';
  app().append(el);
  hud && (hud.style.display = 'none');
  setTimeout(() => {
    if (modo !== 'console') return;
    abrirConsole(turno!, el, levantar, () => {
      levantar();
      fimDoTurno?.();
    });
  }, 450);
}

function levantar() {
  if (modo !== 'console') return;
  const el = document.querySelector('.console')?.parentElement;
  fecharConsole();
  el?.remove();
  if (hud) hud.style.display = '';
  const s = sala!.meu;
  J.pos.set(s.x, 0, s.z + 0.75);
  J.olho = 1.62;
  J.yaw = 0;
  J.pitch = -0.05;
  liberar();
  objetivo();
}

// ---------------------------------------------------------------- quadro

let ultimoAlvo = 0;
function quadro(dt: number, t: number) {
  // o CSS esconde o botão E e a mira fora do modo livre (no diálogo o botão ficava por cima do texto)
  if (document.body.dataset.modo !== modo) document.body.dataset.modo = modo;
  sala?.atualizar(dt, t);
  equipe?.atualizar(dt, modo === 'menu' ? undefined : J.pos);
  atualizarTelas(t);
  if (modo === 'menu') {
    vitrineT += dt;
    const a = vitrineT * 0.05;
    J.pos.set(1.5 + Math.sin(a) * 2.5, 0, 6.2 + Math.cos(a * 0.7) * 0.6);
    J.olho = 2.1;
    J.yaw = 0.35 + Math.sin(a * 0.8) * 0.35;
    J.pitch = -0.16;
    return;
  }
  // a câmera acompanha quem fala, mesmo andando
  if (olhando && modo === 'cena' && J.alvoOlhar) olhando.cabeca(J.alvoOlhar);
  if (t - ultimoAlvo > 0.1) {
    ultimoAlvo = t;
    procurarAlvo();
    mostrarDica();
  }
  if (consoleAberto() && J.alvoOlhar) return;
}
