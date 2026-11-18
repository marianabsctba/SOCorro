// O console do analista: Vigia SIEM com a fila do turno, as missões do dia, a consulta livre,
// o Canivete de decodificação, a aula do dia (Wiki do SOC) e a carreira.
import type { Acao, Dia, Missao, Pergunta, Registro } from '../conteudo/tipos';
import { corrigir, NOME_ACAO, NOME_CLIENTE, NOME_VEREDITO, type AlertaFila } from '../motor/fila';
import { consultar, filtro, normalizar } from '../motor/siem';
import { aplicar, legivel } from '../motor/canivete';
import { esc, fmt, paragrafos, cargo } from '../motor/texto';
import { estado, limitar, salvar, somar } from '../motor/estado';
import { aplicarEfeitos, honrar, verificarContadores } from '../motor/carreira';
import { HONRARIAS } from '../conteudo/honrarias';
import * as Som from '../motor/som';
import { avisarNovas } from './avisos';
import type { OpCanivete } from '../conteudo/tipos';

export interface EstadoMissao {
  m: Missao;
  feita: boolean;
  pontos: number;
  max: number;
  tentativas: number;
  nota?: number; // prova
  respostas: Record<string, unknown>;
}

export interface Turno {
  dia: Dia;
  fila: AlertaFila[];
  missoes: EstadoMissao[];
  falas: { quem: string; texto: string }[]; // reações das escolhas, tocadas ao levantar
}

type Aba = 'fila' | 'missoes' | 'vigia' | 'canivete' | 'aula' | 'carreira';

export function maxMissao(m: Missao): number {
  switch (m.tipo) {
    case 'quiz':
      return m.perguntas.length * 2;
    case 'prova':
      return m.perguntas.length * 2;
    case 'escolha':
      return 0;
    default:
      return 6;
  }
}

export function novaMissao(m: Missao): EstadoMissao {
  return { m, feita: false, pontos: 0, max: maxMissao(m), tentativas: 0, respostas: {} };
}

export function turnoCompleto(t: Turno) {
  return t.fila.every((a) => a.resposta) && t.missoes.every((m) => m.feita);
}

let raiz: HTMLElement | null = null;
let turno: Turno;
let aba: Aba = 'fila';
let selAlerta = 0;
let selMissao = 0;
// no celular, lista e detalhe são telas separadas: true = mostrando o alerta ou a missão aberta
let detalheMob = false;
let fechar: () => void = () => {};
let encerrar: () => void = () => {};
const abertoEm = new Map<string, number>();
const escolha: { veredito?: string; just?: number; acao?: Acao } = {};
let vigia = { fonte: 0, consulta: '', resultado: null as ReturnType<typeof consultar> | null };
let canivete = { entrada: '', receita: [] as OpCanivete[] };

export function abrirConsole(t: Turno, el: HTMLElement, aoFechar: () => void, aoEncerrar: () => void) {
  turno = t;
  fechar = aoFechar;
  encerrar = aoEncerrar;
  raiz = el;
  detalheMob = false;
  if (!t.fila.some((a) => !a.resposta) && t.missoes.some((m) => !m.feita)) aba = 'missoes';
  desenhar();
}

export function consoleAberto() {
  return !!raiz;
}

export function fecharConsole() {
  if (!raiz) return;
  raiz.innerHTML = '';
  raiz = null;
}

function fontes(): { nome: string; registros: Registro[] }[] {
  const fs: { nome: string; registros: Registro[] }[] = [];
  turno.missoes.forEach((em, i) => {
    if (em.m.tipo === 'siem' || em.m.tipo === 'regra') fs.push({ nome: `Missão ${i + 1}: ${em.m.titulo}`, registros: em.m.registros });
  });
  // os alertas do turno também viram registros consultáveis
  fs.push({
    nome: 'Alertas do turno',
    registros: turno.fila.map((a) => ({ hora: a.hora, cliente: NOME_CLIENTE[a.cliente], regra: a.modelo.regra, fonte: a.modelo.fonte, severidade: a.modelo.severidade, mitre: a.modelo.mitre ?? '', titulo: a.titulo })),
  });
  return fs;
}

function barra(rot: string, v: number, cor: string) {
  return `<div class="barra"><span>${rot}</span><i><s style="width:${v}%;background:${cor}"></s></i></div>`;
}

function desenhar() {
  if (!raiz) return;
  const e = estado();
  const d = turno.dia;
  const pend = turno.fila.filter((a) => !a.resposta).length;
  const mPend = turno.missoes.filter((m) => !m.feita).length;
  const completo = turnoCompleto(turno);
  const abas: [Aba, string, string][] = [
    ['fila', 'Fila', pend ? `<span class="n">${pend}</span>` : '<span class="ok">✓</span>'],
    ['missoes', 'Missões', turno.missoes.length ? (mPend ? `<span class="n">${mPend}</span>` : '<span class="ok">✓</span>') : ''],
    ['vigia', 'Vigia<span class="pc"> (consulta)</span>', ''],
    ['canivete', 'Canivete', ''],
    ['aula', '<span class="pc">Wiki do SOC: a</span><span class="mob">A</span>ula<span class="pc"> do dia</span>', ''],
    ['carreira', 'Carreira', ''],
  ];
  raiz.innerHTML = `
  <div class="console ${e.energia < 25 ? 'cansado' : ''} ${detalheMob ? 'ver-detalhe' : ''}">
    <div class="c-topo">
      <div class="marca">Vigia <i class="pc">SIEM</i> <span class="fraco pc" style="font:12px var(--mono)">Insônia · SOC ${d.site === 'alfa' ? 'Alfa' : 'Bravo'}</span></div>
      <span class="etiqueta rosa pc">Dia ${d.n} · ${d.turno}</span>
      <span class="etiqueta pc">${esc(e.nome)} · ${cargo(e.nivel)}</span>
      <span class="mob mini-rec" title="dia, energia e sanidade">D${d.n} ⚡${e.energia} 🧠${e.sanidade}</span>
      <div class="barras pc">${barra('Energia', e.energia, e.energia < 25 ? 'var(--vermelho)' : 'var(--ambar)')}${barra('Sanidade', e.sanidade, e.sanidade < 25 ? 'var(--vermelho)' : 'var(--verde)')}</div>
      <div class="esp"></div>
      <button class="bt sec peq" data-a="levantar">Levantar<span class="pc"> da cadeira</span></button>
      <button class="bt peq" data-a="encerrar" ${completo ? '' : 'disabled title="Termine a fila e as missões"'}>Encerrar<span class="pc"> o turno</span></button>
    </div>
    <div class="c-abas">${abas
      .filter(([id]) => id !== 'missoes' || turno.missoes.length)
      .map(([id, nome, extra]) => `<button class="c-aba ${aba === id ? 'ativa' : ''}" data-aba="${id}">${nome}${extra}</button>`)
      .join('')}</div>
    <div class="c-corpo">${corpo()}</div>
  </div>`;
  ligar();
}

function corpo(): string {
  switch (aba) {
    case 'fila':
      return corpoFila();
    case 'missoes':
      return corpoMissoes();
    case 'vigia':
      return `<div class="c-detalhe">${corpoVigia()}</div>`;
    case 'canivete':
      return `<div class="c-detalhe">${corpoCanivete()}</div>`;
    case 'aula':
      return `<div class="c-detalhe aula"><span class="etiqueta rosa">Aula do dia ${turno.dia.n}</span><h2>${esc(turno.dia.titulo)}</h2>${paragrafos(turno.dia.aula)}<p class="fraco"><i>Wiki do SOC, última edição em 2019 por "admin". Esta página foi revisada, milagrosamente.</i></p></div>`;
    case 'carreira':
      return `<div class="c-detalhe">${corpoCarreira()}</div>`;
  }
}

// ---------------------------------------------------------------- fila

function corpoFila(): string {
  if (!turno.fila.length) return '<div class="c-detalhe"><h2>Fila vazia.</h2><p class="fraco">Aproveite. Isso nunca acontece.</p></div>';
  const lista = turno.fila
    .map((a, i) => `<div class="c-item ${i === selAlerta ? 'sel' : ''} ${a.resposta ? 'feito' : ''}" data-al="${i}"><div class="sev sev-${a.modelo.severidade}"></div><div><div class="t">${a.resposta ? (a.resposta.acertou ? '✅ ' : '❌ ') : ''}${esc(a.titulo)}</div><div class="s">${a.hora} · ${esc(NOME_CLIENTE[a.cliente])} · ${a.modelo.fonte}</div></div></div>`)
    .join('');
  const faltam = turno.fila.filter((a) => !a.resposta).length;
  return `<div class="c-lista">${lista}</div><div class="c-detalhe"><button class="bt sec peq voltar-lista" data-voltar>← Fila${faltam ? ` (${faltam} pendente${faltam > 1 ? 's' : ''})` : ''}</button>${detalheAlerta(turno.fila[selAlerta])}</div>`;
}

function detalheAlerta(a: AlertaFila): string {
  if (!abertoEm.has(a.uid)) abertoEm.set(a.uid, performance.now());
  const m = a.modelo;
  const e = estado();
  let html = `
    <div class="meta"><span class="etiqueta">${a.hora}</span><span class="etiqueta">${esc(NOME_CLIENTE[a.cliente])}</span><span class="etiqueta">${m.fonte}</span><span class="etiqueta" style="color:var(--${{ baixa: 'verde', média: 'ambar', alta: 'laranja', crítica: 'vermelho' }[m.severidade]})">severidade ${m.severidade}</span>${m.mitre ? `<span class="etiqueta">ATT&amp;CK ${esc(m.mitre)}</span>` : ''}</div>
    <h2>${esc(a.titulo)}</h2>
    <div class="fraco" style="font:12px var(--mono)">regra: ${esc(m.regra)}</div>
    <div class="secao">Evidência (logs crus)</div>
    <div class="log">${a.logs.map(esc).join('\n')}</div>
    <div class="secao">Enriquecimento</div>
    <div class="ctx"><ul>${a.contexto.map((c) => `<li>${fmt(c)}</li>`).join('')}</ul></div>`;
  if (a.resposta) {
    const r = a.resposta;
    const ok = r.acertou;
    const certa = a.justificativas.find((j) => j.certa)!;
    html += `<div class="retorno ${ok ? 'bom' : r.pontos >= 2 ? 'meio' : 'ruim'}">
      <b>${ok ? 'Certo.' : r.pontos >= 2 ? 'Veredito certo, mas faltou acertar o resto.' : 'Errado.'}</b> ${r.pontos} ponto(s).
      <p>Era <b>${NOME_VEREDITO[m.veredito]}</b>${m.veredito === 'tp' && m.acao ? `, com a ação <b>${NOME_ACAO[m.acao]}</b>${e.nivel === 'N1' ? ' (em N1, escalar também vale)' : ''}` : ''}. Justificativa certa: ${fmt(certa.texto)}</p>
      <p>${fmt(a.explicacao)}</p>${a.piada ? `<div class="piada">${fmt(a.piada)}</div>` : ''}</div>`;
    const prox = turno.fila.findIndex((x) => !x.resposta);
    if (prox >= 0) html += `<div class="linha-bt" style="margin-top:12px"><button class="bt" data-al="${prox}">Próximo alerta</button></div>`;
    else if (turno.missoes.some((x) => !x.feita)) html += `<div class="linha-bt" style="margin-top:12px"><button class="bt" data-aba="missoes">Fila zerada. Ir para as missões</button></div>`;
    return html;
  }
  html += `<div class="secao">Classificação</div>
    <div class="vered">${(['fp', 'bp', 'tp'] as const).map((v) => `<button class="opcao ${escolha.veredito === v ? 'sel' : ''}" data-ver="${v}">${NOME_VEREDITO[v]}</button>`).join('')}</div>
    <div class="secao">Por quê?</div>
    <div class="opcoes">${a.justificativas.map((j, i) => `<button class="opcao ${escolha.just === i ? 'sel' : ''}" data-just="${i}">${fmt(j.texto)}</button>`).join('')}</div>`;
  if (escolha.veredito === 'tp') {
    html += `<div class="secao">Ação</div><div class="opcoes">${(Object.keys(NOME_ACAO) as Acao[]).map((k) => `<button class="opcao ${escolha.acao === k ? 'sel' : ''}" data-acao="${k}">${NOME_ACAO[k]}</button>`).join('')}</div>`;
  }
  const pode = escolha.veredito && escolha.just !== undefined && (escolha.veredito !== 'tp' || escolha.acao);
  html += `<div class="linha-bt" style="margin-top:16px"><button class="bt" data-a="fechar-alerta" ${pode ? '' : 'disabled'}>Fechar o alerta</button></div>`;
  return html;
}

function responderAlerta() {
  const a = turno.fila[selAlerta];
  if (!a || a.resposta || !escolha.veredito || escolha.just === undefined) return;
  const e = estado();
  const r = corrigir(a, escolha.veredito, escolha.just, escolha.acao, e.nivel);
  const seg = (performance.now() - (abertoEm.get(a.uid) ?? performance.now())) / 1000;
  a.resposta = { veredito: escolha.veredito, justificativa: escolha.just, acao: escolha.acao, acertou: r.acertou, pontos: r.pontos, segundos: seg };
  somar('alertas');
  if (r.acertou) somar('acertos');
  if (r.vOk && a.modelo.veredito !== 'tp') somar('fp_certos');
  if (escolha.veredito === 'tp' && a.modelo.veredito !== 'tp') somar('escalou_fp');
  if (seg < 4) honrar('sem_ler');
  if (seg < 20 && r.acertou) somar('rapidos');
  e.energia = limitar(e.energia - 4);
  e.sanidade = limitar(e.sanidade + (r.acertou ? 0.5 : -2));
  // fechar como ruído um verdadeiro positivo crítico é cagada grave
  if (a.modelo.veredito === 'tp' && escolha.veredito !== 'tp' && a.modelo.severidade === 'crítica') {
    honrar('cagada');
    const ehRansom = /ransom/i.test(a.modelo.id + a.modelo.titulo) && a.modelo.nivel === 'N3';
    aplicarEfeitos({ flag: ehRansom ? 'ransomware_fechado' : 'cagada', reputacao: -10, sanidade: -8 });
  }
  if (r.acertou) Som.acerto();
  else Som.erro();
  verificarContadores();
  salvar();
  escolha.veredito = undefined;
  escolha.just = undefined;
  escolha.acao = undefined;
  avisarNovas();
  desenhar();
}

// ---------------------------------------------------------------- missões

function corpoMissoes(): string {
  const lista = turno.missoes
    .map((em, i) => `<div class="c-item ${i === selMissao ? 'sel' : ''} ${em.feita ? 'feito' : ''}" data-mi="${i}"><div class="sev" style="background:var(--rosa)"></div><div><div class="t">${em.feita ? '✅ ' : ''}${esc(em.m.titulo)}</div><div class="s">${rotuloTipo(em.m.tipo)}</div></div></div>`)
    .join('');
  return `<div class="c-lista">${lista}</div><div class="c-detalhe"><button class="bt sec peq voltar-lista" data-voltar>← Missões</button>${detalheMissao(turno.missoes[selMissao])}</div>`;
}

function rotuloTipo(t: Missao['tipo']) {
  return { quiz: 'Perguntas', siem: 'Investigação no Vigia', ordenar: 'Pôr em ordem', regra: 'Ajuste de regra (tuning)', decodificar: 'Decodificar no Canivete', escolha: 'Decisão', prova: 'PROVA DE PROMOÇÃO' }[t];
}

function rodapeMissao(em: EstadoMissao) {
  if (!em.feita) return '';
  const prox = turno.missoes.findIndex((x) => !x.feita);
  const botao = prox >= 0 ? `<button class="bt" data-mi="${prox}">Próxima missão</button>` : turnoCompleto(turno) ? `<button class="bt" data-a="encerrar">Encerrar o turno</button>` : `<button class="bt" data-aba="fila">Voltar para a fila</button>`;
  return `<div class="linha-bt">${botao}</div>`;
}

function perguntasHtml(em: EstadoMissao, ps: Pergunta[], revelarJa: boolean) {
  const resp = em.respostas as Record<number, number>;
  return ps
    .map((p, i) => {
      const r = resp[i];
      const mostrar = r !== undefined && (revelarJa || em.feita);
      return `<div style="margin:18px 0"><b>${i + 1}. ${fmt(p.p)}</b><div class="opcoes" style="margin-top:8px">${p.opcoes
        .map((o, k) => {
          let cls = '';
          if (mostrar) cls = k === p.certa ? 'certa' : k === r ? 'errada' : '';
          else if (r === k) cls = 'sel';
          return `<button class="opcao ${cls}" data-perg="${i}" data-op="${k}" ${mostrar || em.feita ? 'disabled' : ''}>${fmt(o)}</button>`;
        })
        .join('')}</div>${mostrar ? `<div class="retorno ${r === p.certa ? 'bom' : 'ruim'}" style="margin-top:8px">${fmt(p.explicacao)}</div>` : ''}</div>`;
    })
    .join('');
}

function detalheMissao(em: EstadoMissao | undefined): string {
  if (!em) return '<h2>Sem missões hoje.</h2><p class="fraco">O Gilmar esqueceu de planejar. Curta a fila.</p>';
  const m = em.m;
  let h = `<span class="etiqueta rosa">${rotuloTipo(m.tipo)}</span><h2>${esc(m.titulo)}</h2><p>${fmt(m.enunciado)}</p>`;
  switch (m.tipo) {
    case 'quiz':
      if (m.anexo) h += `<div class="log">${esc(m.anexo)}</div>`;
      h += perguntasHtml(em, m.perguntas, true);
      if (em.feita) h += `<div class="retorno bom">Missão concluída: ${em.pontos} de ${em.max} pontos.</div>`;
      break;
    case 'prova': {
      h += `<p class="fraco">Nota mínima para promoção: <b>${m.notaMinima}</b>. As respostas só aparecem no fim. Respira.</p>`;
      h += perguntasHtml(em, m.perguntas, false);
      const respondidas = Object.keys(em.respostas).length;
      if (!em.feita) h += `<div class="linha-bt"><button class="bt" data-a="entregar-prova" ${respondidas < m.perguntas.length ? 'disabled' : ''}>Entregar a prova (${respondidas}/${m.perguntas.length})</button></div>`;
      else h += `<div class="retorno ${em.nota! >= m.notaMinima ? 'bom' : 'ruim'}"><b>Nota ${em.nota}.</b> ${em.nota! >= m.notaMinima ? 'Aprovação! O RH vai processar a promoção ao fim do turno (em 3 a 5 dias úteis, brincadeira, é hoje mesmo).' : 'Não foi dessa vez. O trabalho de cima continua vindo, o salário de cima não.'}</div>`;
      break;
    }
    case 'siem':
      h += `<div class="ctx"><b>Pergunta:</b> ${fmt(m.pergunta)}</div>
        <div class="linha-bt"><button class="bt sec" data-a="abrir-vigia" data-fonte="${fontes().findIndex((f) => f.registros === m.registros)}">Abrir os registros no Vigia (${m.registros.length})</button><button class="bt sec" data-a="dica">Dica</button></div>
        ${em.respostas.dica ? `<div class="retorno meio">${fmt(m.dica)}</div>` : ''}`;
      if (!em.feita)
        h += `<div class="secao">Resposta</div><div style="display:flex;gap:8px"><input class="campo" id="resp" placeholder="digite aqui" value="${esc(String(em.respostas.ultima ?? ''))}"><button class="bt" data-a="responder-siem">Responder</button></div>${em.tentativas ? `<p class="fraco">Tentativas erradas: ${em.tentativas}. Cada uma custa ponto (e dignidade).</p>` : ''}`;
      else h += `<div class="retorno bom"><b>Isso: ${esc(m.resposta)}.</b> ${em.pontos} de ${em.max} pontos.<p>${fmt(m.explicacao)}</p><p class="fraco">Consulta de referência: <code>${esc(m.gabarito)}</code></p></div>`;
      break;
    case 'decodificar':
      h += `<div class="log">${esc(m.entrada)}</div><div class="ctx"><b>Pergunta:</b> ${fmt(m.pergunta)}</div>
        <div class="linha-bt"><button class="bt sec" data-a="abrir-canivete">Abrir no Canivete</button></div>`;
      if (!em.feita)
        h += `<div class="secao">Resposta</div><div style="display:flex;gap:8px"><input class="campo" id="resp" placeholder="digite aqui"><button class="bt" data-a="responder-dec">Responder</button></div>${em.tentativas ? `<p class="fraco">Tentativas erradas: ${em.tentativas}.</p>` : ''}`;
      else h += `<div class="retorno bom"><b>Isso: ${esc(m.resposta)}.</b> ${em.pontos} de ${em.max} pontos. Receita: <code>${m.receita.join(' → ')}</code><p>${fmt(m.explicacao)}</p></div>`;
      break;
    case 'ordenar': {
      const ordem = (em.respostas.ordem as number[]) ?? embaralharIdx(m.itens.length, turno.dia.n);
      em.respostas.ordem = ordem;
      h += `<div class="ordenar"><ol>${ordem
        .map((idx, pos) => {
          const certo = em.feita ? (idx === pos ? ' ✅' : ' ❌') : '';
          return `<li><b>${pos + 1}.</b><span>${fmt(m.itens[idx])}${certo}</span>${em.feita ? '' : `<button class="bt sec" data-sobe="${pos}" ${pos === 0 ? 'disabled' : ''}>↑</button><button class="bt sec" data-desce="${pos}" ${pos === ordem.length - 1 ? 'disabled' : ''}>↓</button>`}</li>`;
        })
        .join('')}</ol></div>`;
      if (!em.feita) h += `<div class="linha-bt"><button class="bt" data-a="conferir-ordem">Conferir a ordem</button></div>`;
      else h += `<div class="retorno ${em.pontos >= 5 ? 'bom' : 'meio'}">${em.pontos} de ${em.max} pontos. Ordem certa:<ol>${m.itens.map((x) => `<li>${fmt(x)}</li>`).join('')}</ol><p>${fmt(m.explicacao)}</p></div>`;
      break;
    }
    case 'regra': {
      const sel = (em.respostas.sel as number[]) ?? [];
      const fps = m.registros.filter((r) => !r.malicioso).length;
      h += `<div class="secao">Regra atual</div><div class="log">${esc(m.regra)}</div>
        <p class="fraco">${m.registros.length} disparos na última semana. Meta: eliminar pelo menos ${Math.round(m.minReducao * 100)}% dos falsos positivos <b>sem esconder nenhum ataque</b>. Use o Vigia para olhar os disparos antes de decidir.</p>
        <div class="linha-bt"><button class="bt sec" data-a="abrir-vigia" data-fonte="${fontes().findIndex((f) => f.registros === m.registros)}">Ver disparos no Vigia</button></div>
        <div class="secao">Exclusões propostas</div>
        ${m.exclusoes.map((x, i) => `<label class="exclusao"><input type="checkbox" data-excl="${i}" ${sel.includes(i) ? 'checked' : ''} ${em.feita ? 'disabled' : ''}><div>${fmt(x.texto)}<div class="fraco" style="font:12px var(--mono)">${esc(x.filtro)}</div></div></label>`).join('')}`;
      if (!em.feita) h += `<div class="linha-bt"><button class="bt" data-a="aplicar-regra">Aplicar o ajuste</button></div>`;
      else {
        const r = em.respostas.resultado as { reducao: number; escondidos: number };
        h += `<div class="retorno ${em.pontos === 6 ? 'bom' : em.pontos ? 'meio' : 'ruim'}"><b>${r.escondidos ? `Você escondeu ${r.escondidos} ataque(s) de verdade.` : `Falsos positivos eliminados: ${Math.round(r.reducao * 100)}% de ${fps}.`}</b> ${em.pontos} de ${em.max} pontos.<p>${fmt(m.explicacao)}</p></div>`;
      }
      break;
    }
    case 'escolha':
      if (!em.feita) h += `<div class="opcoes">${m.opcoes.map((o, i) => `<button class="opcao" data-esc="${i}">${fmt(o.texto)}</button>`).join('')}</div>`;
      else {
        const o = m.opcoes[em.respostas.escolhida as number];
        h += `<div class="retorno bom"><b>Você escolheu:</b> ${fmt(o.texto)}${o.reacao.map((f) => `<p><b>${esc(nomeFalante(f.quem))}:</b> ${fmt(f.texto)}</p>`).join('')}</div>`;
      }
      break;
  }
  return h + rodapeMissao(em);
}

function nomeFalante(q: string) {
  return ({ voce: 'Você', narrador: '', telefone: 'Telefone', chat: 'Chat' } as Record<string, string>)[q] ?? q.charAt(0).toUpperCase() + q.slice(1);
}

function embaralharIdx(n: number, sem: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  let s = sem * 9301 + 49297;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.every((x, i) => x === i) && n > 1) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

function concluir(em: EstadoMissao, pontos: number) {
  em.feita = true;
  em.pontos = Math.max(0, Math.min(em.max, pontos));
  if (em.max && em.pontos >= em.max * 0.99) Som.acerto();
  verificarContadores();
  salvar();
  avisarNovas();
}

function responderPergunta(i: number, k: number) {
  const em = turno.missoes[selMissao];
  if (!em || em.feita) return;
  const resp = em.respostas as Record<number, number>;
  const m = em.m;
  if (m.tipo === 'quiz') {
    if (resp[i] !== undefined) return;
    resp[i] = k;
    if (k === m.perguntas[i].certa) Som.acerto();
    else Som.erro();
    if (Object.keys(resp).length === m.perguntas.length) {
      const certas = m.perguntas.filter((p, j) => resp[j] === p.certa).length;
      if (certas === m.perguntas.length) somar('quiz_perfeito');
      concluir(em, certas * 2);
    }
  } else if (m.tipo === 'prova') {
    resp[i] = k;
    Som.clique();
  }
  desenhar();
}

// ---------------------------------------------------------------- vigia

const EXEMPLOS = [
  'evento=4625 | contar por ip_origem | ordenar -total',
  'evento=4625 | distintos usuario por ip_origem | onde distintos>5',
  'processo_pai=winword.exe | tabela hora,host,processo,linha_comando',
  'categoria!=streaming | somar bytes por destino | ordenar -soma | topo 5',
];

function corpoVigia(): string {
  const fs = fontes();
  if (vigia.fonte >= fs.length) vigia.fonte = 0;
  const f = fs[vigia.fonte];
  const campos = new Set<string>();
  for (const r of f.registros.slice(0, 50)) for (const k of Object.keys(r)) if (k !== 'malicioso') campos.add(k);
  let tabela = '';
  const r = vigia.resultado;
  if (r?.erro) tabela = `<div class="retorno ruim">${esc(r.erro)}</div>`;
  else if (r) {
    const cols = r.colunas.filter((c) => c !== 'malicioso');
    tabela = `<p class="fraco">${r.linhas.length} resultado(s)${r.linhas.length > 300 ? ', mostrando 300' : ''}.</p><div class="tabela-cx"><table class="tabela"><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>${r.linhas
      .slice(0, 300)
      .map((l) => `<tr>${cols.map((c) => `<td>${esc(String(l[c] ?? ''))}</td>`).join('')}</tr>`)
      .join('')}</table></div>`;
  }
  return `<h2>Vigia: consulta</h2>
    <p class="fraco">Filtros no começo (<code>campo=valor</code>, <code>campo!=valor</code>, <code>campo>10</code>, <code>*</code> curinga, <code>OU</code>), depois comandos com <code>|</code>: <code>contar por</code>, <code>distintos campo por</code>, <code>somar campo por</code>, <code>onde</code>, <code>ordenar -campo</code>, <code>topo N</code>, <code>tabela a,b</code>, <code>unicos campo</code>. Os nomes em inglês (stats count by, sort, head, table, dedup) também funcionam, porque ninguém é de ferro.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><select class="campo" style="width:auto" id="fonte">${fs.map((x, i) => `<option value="${i}" ${i === vigia.fonte ? 'selected' : ''}>${esc(x.nome)} (${x.registros.length})</option>`).join('')}</select><span class="fraco" style="font:12px var(--mono)">campos: ${[...campos].map(esc).join(', ')}</span></div>
    <textarea class="consulta" id="consulta" spellcheck="false" placeholder="${esc(EXEMPLOS[0])}">${esc(vigia.consulta)}</textarea>
    <div class="linha-bt" style="margin-top:8px"><button class="bt" data-a="rodar">Rodar consulta<span class="pc"> (Ctrl+Enter)</span></button>${EXEMPLOS.map((x) => `<button class="bt sec peq" data-ex="${esc(x)}">${esc(x.split('|')[1]?.trim().split(' ')[0] ?? 'exemplo')}</button>`).join('')}</div>
    ${tabela}`;
}

function rodarConsulta() {
  const ta = raiz?.querySelector<HTMLTextAreaElement>('#consulta');
  if (ta) vigia.consulta = ta.value;
  vigia.resultado = consultar(fontes()[vigia.fonte].registros, vigia.consulta);
  somar('consultas');
  verificarContadores();
  avisarNovas();
  desenhar();
}

// ---------------------------------------------------------------- canivete

const OPS: [OpCanivete | 'xor', string][] = [
  ['base64', 'De Base64'],
  ['hex', 'De Hex'],
  ['url', 'Decodificar URL'],
  ['utf16le', 'Ler como UTF-16LE'],
  ['rot13', 'ROT13'],
  ['inverter', 'Inverter texto'],
  ['xor', 'XOR com chave...'],
];

function corpoCanivete(): string {
  let saida = '';
  let erro = '';
  try {
    let s = canivete.entrada;
    for (const op of canivete.receita) s = aplicar(s, op);
    saida = legivel(s);
  } catch (e) {
    erro = (e as Error).message;
  }
  return `<h2>Canivete</h2>
    <p class="fraco">Cole o texto, monte a receita na ordem e veja a saída. Dica de ouro: PowerShell com <code>-EncodedCommand</code> é Base64 de texto UTF-16LE (por isso aparece um monte de ponto entre as letras se você esquecer o segundo passo).</p>
    <textarea class="consulta" id="entrada" spellcheck="false" placeholder="cole aqui">${esc(canivete.entrada)}</textarea>
    <div class="linha-bt" style="margin-top:8px">${OPS.map(([op, nome]) => `<button class="bt sec peq" data-op-can="${op}">${nome}</button>`).join('')}<button class="bt perigo peq" data-a="limpar-receita">Limpar receita</button></div>
    <div class="receita">${canivete.receita.map((op, i) => `<span class="passo-receita">${i + 1}. ${op} <a href="#" data-tira="${i}" style="color:#fff">×</a></span>`).join('') || '<span class="fraco">receita vazia</span>'}</div>
    <div class="secao">Saída</div>
    ${erro ? `<div class="retorno ruim">${esc(erro)}</div>` : `<div class="log">${esc(saida.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '·'))}</div>`}`;
}

// ---------------------------------------------------------------- carreira

function corpoCarreira(): string {
  const e = estado();
  const notas = e.notas.filter((x) => x !== undefined && x !== null);
  const media = notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : 0;
  const c = (k: string) => e.cont[k] ?? 0;
  return `<h2>Carreira de ${esc(e.nome)}</h2>
    <div class="placar"><div><b>${cargo(e.nivel)}</b><span>cargo</span></div><div><b>${media}</b><span>média dos dias</span></div><div><b>${e.reputacao}</b><span>reputação</span></div><div><b>${c('alertas')}</b><span>alertas triados</span></div><div><b>${c('alertas') ? Math.round((c('acertos') / c('alertas')) * 100) : 0}%</b><span>acerto na fila</span></div><div><b>${c('cafes')}</b><span>cafés</span></div></div>
    <div class="secao">Honrarias (${Object.keys(e.honrarias).length} de ${HONRARIAS.length})</div>
    <div class="honras">${HONRARIAS.map((h) => `<div class="honra ${e.honrarias[h.id] ? '' : 'nao'}"><span class="ic">${h.icone}</span><div><b>${esc(h.nome)}</b><div class="fraco">${e.honrarias[h.id] ? esc(h.descricao) : '???'}</div></div></div>`).join('')}</div>`;
}

// ---------------------------------------------------------------- eventos

function ligar() {
  if (!raiz) return;
  const r = raiz;
  r.querySelectorAll<HTMLElement>('[data-aba]').forEach((b) =>
    b.addEventListener('click', () => {
      aba = b.dataset.aba as Aba;
      detalheMob = false;
      Som.clique();
      desenhar();
    }),
  );
  r.querySelectorAll<HTMLElement>('[data-al]').forEach((b) =>
    b.addEventListener('click', () => {
      selAlerta = Number(b.dataset.al);
      aba = 'fila';
      detalheMob = true;
      escolha.veredito = escolha.just = escolha.acao = undefined;
      desenhar();
    }),
  );
  r.querySelectorAll<HTMLElement>('[data-mi]').forEach((b) =>
    b.addEventListener('click', () => {
      selMissao = Number(b.dataset.mi);
      aba = 'missoes';
      detalheMob = true;
      desenhar();
      r.querySelector('.c-detalhe')?.scrollTo(0, 0);
    }),
  );
  r.querySelector<HTMLElement>('[data-voltar]')?.addEventListener('click', () => {
    detalheMob = false;
    Som.clique();
    desenhar();
  });
  r.querySelectorAll<HTMLElement>('[data-ver]').forEach((b) =>
    b.addEventListener('click', () => {
      escolha.veredito = b.dataset.ver;
      if (escolha.veredito !== 'tp') escolha.acao = undefined;
      Som.clique();
      desenhar();
    }),
  );
  r.querySelectorAll<HTMLElement>('[data-just]').forEach((b) =>
    b.addEventListener('click', () => {
      escolha.just = Number(b.dataset.just);
      Som.clique();
      desenhar();
    }),
  );
  r.querySelectorAll<HTMLElement>('[data-acao]').forEach((b) =>
    b.addEventListener('click', () => {
      escolha.acao = b.dataset.acao as Acao;
      Som.clique();
      desenhar();
    }),
  );
  r.querySelectorAll<HTMLElement>('[data-perg]').forEach((b) => b.addEventListener('click', () => responderPergunta(Number(b.dataset.perg), Number(b.dataset.op))));
  r.querySelectorAll<HTMLElement>('[data-sobe],[data-desce]').forEach((b) =>
    b.addEventListener('click', () => {
      const em = turno.missoes[selMissao];
      const o = em.respostas.ordem as number[];
      const p = Number(b.dataset.sobe ?? b.dataset.desce);
      const q = b.dataset.sobe !== undefined ? p - 1 : p + 1;
      [o[p], o[q]] = [o[q], o[p]];
      Som.clique();
      desenhar();
    }),
  );
  r.querySelectorAll<HTMLInputElement>('[data-excl]').forEach((b) =>
    b.addEventListener('change', () => {
      const em = turno.missoes[selMissao];
      const sel = new Set((em.respostas.sel as number[]) ?? []);
      const i = Number(b.dataset.excl);
      if (b.checked) sel.add(i);
      else sel.delete(i);
      em.respostas.sel = [...sel];
    }),
  );
  r.querySelectorAll<HTMLElement>('[data-esc]').forEach((b) =>
    b.addEventListener('click', () => {
      const em = turno.missoes[selMissao];
      if (em.m.tipo !== 'escolha' || em.feita) return;
      const i = Number(b.dataset.esc);
      em.respostas.escolhida = i;
      const o = em.m.opcoes[i];
      aplicarEfeitos(o.efeitos);
      turno.falas.push(...o.reacao);
      concluir(em, 0);
      desenhar();
    }),
  );
  r.querySelectorAll<HTMLElement>('[data-ex]').forEach((b) =>
    b.addEventListener('click', () => {
      vigia.consulta = b.dataset.ex!;
      rodarConsulta();
    }),
  );
  r.querySelectorAll<HTMLElement>('[data-op-can]').forEach((b) =>
    b.addEventListener('click', () => {
      const ta = r.querySelector<HTMLTextAreaElement>('#entrada');
      if (ta) canivete.entrada = ta.value;
      let op = b.dataset.opCan as string;
      if (op === 'xor') {
        const k = prompt('Chave do XOR (número de 0 a 255, ou hex como 0x2a):', '0x2a');
        if (!k) return;
        const n = /^0x/i.test(k) ? parseInt(k, 16) : parseInt(k, 10);
        if (Number.isNaN(n)) return;
        op = `xor:${n & 0xff}`;
      }
      canivete.receita.push(op as OpCanivete);
      somar('canivete');
      verificarContadores();
      avisarNovas();
      desenhar();
    }),
  );
  r.querySelectorAll<HTMLElement>('[data-tira]').forEach((b) =>
    b.addEventListener('click', (ev) => {
      ev.preventDefault();
      canivete.receita.splice(Number(b.dataset.tira), 1);
      desenhar();
    }),
  );
  const ta = r.querySelector<HTMLTextAreaElement>('#entrada');
  ta?.addEventListener('input', () => {
    canivete.entrada = ta.value;
  });
  ta?.addEventListener('change', () => desenhar());
  const cs = r.querySelector<HTMLTextAreaElement>('#consulta');
  cs?.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
      ev.preventDefault();
      rodarConsulta();
    }
  });
  cs?.addEventListener('input', () => (vigia.consulta = cs.value));
  r.querySelector<HTMLSelectElement>('#fonte')?.addEventListener('change', (ev) => {
    vigia.fonte = Number((ev.target as HTMLSelectElement).value);
    vigia.resultado = null;
    desenhar();
  });
  const resp = r.querySelector<HTMLInputElement>('#resp');
  resp?.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') r.querySelector<HTMLElement>('[data-a="responder-siem"],[data-a="responder-dec"]')?.click();
  });
  r.querySelectorAll<HTMLElement>('[data-a]').forEach((b) => b.addEventListener('click', () => acao(b.dataset.a!, b)));
}

function acao(a: string, b: HTMLElement) {
  const em = turno.missoes[selMissao];
  switch (a) {
    case 'levantar':
      fechar();
      break;
    case 'encerrar':
      if (turnoCompleto(turno)) encerrar();
      break;
    case 'fechar-alerta':
      responderAlerta();
      break;
    case 'rodar':
      rodarConsulta();
      break;
    case 'abrir-vigia':
      vigia.fonte = Math.max(0, Number(b.dataset.fonte));
      vigia.resultado = null;
      vigia.consulta = '';
      aba = 'vigia';
      desenhar();
      break;
    case 'abrir-canivete':
      if (em.m.tipo === 'decodificar') canivete = { entrada: em.m.entrada, receita: [] };
      aba = 'canivete';
      desenhar();
      break;
    case 'limpar-receita':
      canivete.receita = [];
      desenhar();
      break;
    case 'dica':
      em.respostas.dica = true;
      desenhar();
      break;
    case 'responder-siem':
    case 'responder-dec': {
      const v = raiz?.querySelector<HTMLInputElement>('#resp')?.value ?? '';
      if (!v.trim()) return;
      const m = em.m;
      const certa = m.tipo === 'siem' || m.tipo === 'decodificar' ? m.resposta : '';
      em.respostas.ultima = v;
      if (normalizar(v) === normalizar(certa) || (m.tipo === 'decodificar' && normalizar(v).includes(normalizar(certa)) && normalizar(v).length <= normalizar(certa).length + 4)) {
        concluir(em, 6 - em.tentativas * 2 - (em.respostas.dica ? 1 : 0));
        if (em.pontos < 2) em.pontos = 2;
      } else {
        em.tentativas++;
        Som.erro();
        estado().sanidade = limitar(estado().sanidade - 1);
      }
      desenhar();
      break;
    }
    case 'conferir-ordem': {
      if (em.m.tipo !== 'ordenar') return;
      const o = em.respostas.ordem as number[];
      const certos = o.filter((x, i) => x === i).length;
      concluir(em, Math.round((certos / o.length) * 6));
      desenhar();
      break;
    }
    case 'aplicar-regra': {
      const m = em.m;
      if (m.tipo !== 'regra') return;
      const sel = ((em.respostas.sel as number[]) ?? []).map((i) => m.exclusoes[i]);
      const passa = (r: Registro) => !sel.some((x) => filtro(x.filtro)(r));
      const fps = m.registros.filter((r) => !r.malicioso);
      const tps = m.registros.filter((r) => r.malicioso);
      const escondidos = tps.filter((r) => !passa(r)).length;
      const reducao = 1 - fps.filter(passa).length / fps.length;
      em.respostas.resultado = { reducao, escondidos };
      if (escondidos) {
        Som.erro();
        concluir(em, 0);
      } else concluir(em, reducao >= m.minReducao ? 6 : reducao >= m.minReducao / 2 ? 3 : 1);
      desenhar();
      break;
    }
    case 'entregar-prova': {
      const m = em.m;
      if (m.tipo !== 'prova') return;
      const resp = em.respostas as Record<number, number>;
      const certas = m.perguntas.filter((p, j) => resp[j] === p.certa).length;
      em.nota = Math.round((certas / m.perguntas.length) * 100);
      concluir(em, certas * 2);
      if (em.nota >= m.notaMinima) Som.promocao();
      else Som.erro();
      desenhar();
      break;
    }
  }
}
