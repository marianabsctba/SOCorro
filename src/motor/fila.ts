// Monta a fila do turno: sorteia modelos de alerta do nível certo e preenche as variáveis.
import type { Acao, ClienteId, Dia, ModeloAlerta, Nivel } from '../conteudo/tipos';
import { ALERTAS, ALERTA_POR_ID } from '../conteudo/index';
import { rng, type Rng } from '../conteudo/util';

export interface AlertaFila {
  uid: string;
  modelo: ModeloAlerta;
  cliente: ClienteId;
  titulo: string;
  logs: string[];
  contexto: string[];
  justificativas: { texto: string; certa: boolean }[];
  explicacao: string;
  piada?: string;
  hora: string;
  resposta?: { veredito: string; justificativa: number; acao?: Acao; acertou: boolean; pontos: number; segundos: number };
}

const CLIENTES: ClienteId[] = ['tabajara', 'prefeitura', 'hospital', 'cooperativa', 'padaria', 'olhovivo'];
export const NOME_CLIENTE: Record<ClienteId, string> = {
  tabajara: 'Tabajara Seguros',
  prefeitura: 'Prefeitura de Itaquaquecetuba do Norte',
  hospital: 'Hospital São Judas Tadeu',
  cooperativa: 'Cooperativa Agro Boi Gordo',
  padaria: 'Padaria Pão de Ló Digital',
  olhovivo: 'Olho Vivo (interno)',
};

const ORDEM: Record<Nivel, number> = { N1: 1, N2: 2, N3: 3 };

function preencher(s: string, valores: Record<string, string>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => valores[k] ?? m);
}

function instanciar(m: ModeloAlerta, r: Rng, uid: string, hora: string): AlertaFila {
  const valores: Record<string, string> = {};
  for (const [k, vs] of Object.entries(m.vars ?? {})) valores[k] = r.um(vs);
  const p = (s: string) => preencher(s, valores);
  // a justificativa certa não fica sempre no mesmo lugar
  const js = m.justificativas.map((j) => ({ texto: p(j.texto), certa: j.certa }));
  for (let i = js.length - 1; i > 0; i--) {
    const k = Math.floor(r.prox() * (i + 1));
    [js[i], js[k]] = [js[k], js[i]];
  }
  return {
    uid,
    modelo: m,
    cliente: m.cliente === 'qualquer' ? r.um(CLIENTES.filter((c) => c !== 'olhovivo')) : m.cliente,
    titulo: p(m.titulo),
    logs: m.logs.map(p),
    contexto: m.contexto.map(p),
    justificativas: js,
    explicacao: p(m.explicacao),
    piada: m.piada ? p(m.piada) : undefined,
    hora,
  };
}

/** pesos: alertas do nível atual saem mais, os de baixo continuam aparecendo (a vida é assim) */
export function montarFila(dia: Dia, nivelPessoa: Nivel, semente: number): AlertaFila[] {
  const r = rng(semente * 7919 + dia.n * 104729);
  // a partir do dia 31 a fila tem trabalho de N2 mesmo para quem ficou N1 (acúmulo de função)
  const nivelDia: Nivel = dia.n > 60 ? 'N3' : dia.n > 30 ? 'N2' : 'N1';
  const teto = Math.max(ORDEM[nivelDia], ORDEM[nivelPessoa]);
  const pool = ALERTAS.filter((a) => ORDEM[a.nivel] <= teto);
  const pesos = pool.map((a) => (a.peso ?? 1) * (ORDEM[a.nivel] === teto ? 1.6 : 1));
  const total = pesos.reduce((s, x) => s + x, 0);
  const escolhidos: ModeloAlerta[] = [];
  for (const id of dia.fila.alertas ?? []) {
    const m = ALERTA_POR_ID.get(id);
    if (m) escolhidos.push(m);
  }
  let guarda = 0;
  while (escolhidos.length < dia.fila.quantidade + (dia.fila.alertas?.length ?? 0) && pool.length && guarda++ < 500) {
    let x = r.prox() * total;
    let i = 0;
    while (x > pesos[i] && i < pool.length - 1) x -= pesos[i++];
    const m = pool[i];
    // não repete o mesmo modelo no mesmo turno, a não ser que o banco seja pequeno
    if (escolhidos.includes(m) && pool.length > escolhidos.length * 2) continue;
    escolhidos.push(m);
  }
  const inicio = { manhã: 7, tarde: 13, noite: 19, madrugada: 1 }[dia.turno];
  return escolhidos.map((m, k) => {
    const min = k * (11 + r.int(0, 25));
    const h = (inicio + Math.floor(min / 60)) % 24;
    const hora = `${String(h).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
    return instanciar(m, r, `${dia.n}-${k}`, hora);
  });
}

/** corrige a triagem: veredito vale 2, justificativa 1, ação certa em verdadeiro positivo 1 */
export function corrigir(a: AlertaFila, veredito: string, justificativa: number, acao: Acao | undefined, nivel: Nivel) {
  const m = a.modelo;
  const vOk = veredito === m.veredito;
  const jOk = !!a.justificativas[justificativa]?.certa;
  let aOk = true;
  if (m.veredito === 'tp' && vOk) aOk = acao === m.acao || (nivel === 'N1' && acao === 'escalar');
  const max = m.veredito === 'tp' ? 4 : 3;
  const pontos = (vOk ? 2 : 0) + (jOk ? 1 : 0) + (m.veredito === 'tp' && vOk && aOk ? 1 : 0);
  return { vOk, jOk, aOk, pontos, max, acertou: vOk && jOk && aOk };
}

export const NOME_VEREDITO: Record<string, string> = { fp: 'Falso positivo', bp: 'Benigno (esperado)', tp: 'Verdadeiro positivo' };
export const NOME_ACAO: Record<Acao, string> = {
  escalar: 'Escalar para o nível acima',
  isolar: 'Isolar o host no EDR',
  bloquear: 'Bloquear o indicador',
  resetar: 'Resetar senha e revogar sessões',
  incidente: 'Abrir incidente (acionar CSIRT)',
};
