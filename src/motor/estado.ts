// Estado da carreira de quem joga, salvo no navegador.
import type { Nivel } from '../conteudo/tipos';

export type Genero = 'f' | 'm' | 'n';

export interface Estado {
  versao: 1;
  nome: string;
  genero: Genero;
  dia: number; // dia atual (1..90)
  nivel: Nivel;
  sanidade: number; // 0..100
  energia: number; // 0..100 (zera a cada dia)
  reputacao: number; // 0..100
  notas: number[]; // nota de cada dia já fechado (índice = dia - 1)
  flags: Record<string, number>; // flag -> dia em que foi marcada
  honrarias: Record<string, number>; // id -> dia
  cont: Record<string, number>; // contadores para honrarias (alertas, fp certos, cafés...)
  cagadas: number;
  provas: Record<string, number>; // dia -> nota
  pistasBravo: string[]; // pistas do final secreto
  final?: string;
}

const CHAVE = 'socorro.jogo';
let e: Estado | null = null;

export function novo(nome: string, genero: Genero): Estado {
  e = {
    versao: 1,
    nome: nome.trim().slice(0, 24) || 'Analista',
    genero,
    dia: 1,
    nivel: 'N1',
    sanidade: 80,
    energia: 100,
    reputacao: 50,
    notas: [],
    flags: {},
    honrarias: {},
    cont: {},
    cagadas: 0,
    provas: {},
    pistasBravo: [],
  };
  salvar();
  return e;
}

export function carregar(): Estado | null {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE) ?? 'null');
    if (s && s.versao === 1) e = s;
  } catch {
    /* nada */
  }
  return e;
}

export function salvar() {
  if (!e) return;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(e));
  } catch {
    /* sem armazenamento: o jogo segue, só não lembra depois */
  }
}

export function apagar() {
  e = null;
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* nada */
  }
}

export function estado(): Estado {
  if (!e) throw new Error('sem partida');
  return e;
}

export function temPartida() {
  return !!e;
}

export function somar(chave: string, n = 1) {
  const s = estado();
  s.cont[chave] = (s.cont[chave] ?? 0) + n;
}

export function limitar(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function media(): number {
  const n = estado().notas;
  return n.length ? Math.round(n.reduce((a, b) => a + b, 0) / n.length) : 0;
}
