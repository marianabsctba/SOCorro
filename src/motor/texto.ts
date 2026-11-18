// Personalização e formatação dos textos do conteúdo.
import type { Falante, Nivel } from '../conteudo/tipos';
import { estado, temPartida } from './estado';

export const NOMES: Record<Falante, string> = {
  gilmar: 'Gilmar',
  ro: 'Rô',
  vandeco: 'Seu Vandeco',
  thiaguinho: 'Thiaguinho',
  keyla: 'Keyla',
  neide: 'Dona Neide',
  leoncio: 'Dr. Leôncio',
  socorro: 'Dona Socorro',
  nildo: 'Nildo',
  kevin: 'Kevin',
  brenda: 'Brenda',
  jefferson: 'Jefferson',
  pamela: 'Pâmela',
  voce: 'Você',
  narrador: '',
  telefone: 'Telefone',
  chat: 'Bate-Papo Corporativo',
};

export const PAPEIS: Record<string, string> = {
  gilmar: 'Coordenador do SOC Alfa',
  ro: 'Analista N2',
  vandeco: 'CSIRT',
  thiaguinho: 'N1, turno da noite',
  keyla: 'Engenharia de detecção',
  neide: 'Limpeza e sabedoria',
  leoncio: 'Diretor, Cooperativa Agro Boi Gordo',
  socorro: 'Coordenadora do SOC Bravo',
  nildo: 'Analista N2, SOC Bravo',
  kevin: 'Analista N1',
  brenda: 'Analista N1',
  jefferson: 'Analista N1 (e concurseiro)',
  pamela: 'Analista N1',
};

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

const IDX = { f: 0, m: 1, n: 2 } as const;

export function personaliza(s: string): string {
  if (!temPartida()) return s.replace(/\{([^{}|]*)\|([^{}|]*)\|([^{}|]*)\}/g, '$2');
  const e = estado();
  return s.replace(/\{nome\}/g, e.nome).replace(/\{([^{}|]*)\|([^{}|]*)\|([^{}|]*)\}/g, (_m, a: string, b: string, c: string) => [a, b, c][IDX[e.genero]]);
}

/** texto do conteúdo para HTML: personaliza, escapa e aplica `código`, **negrito** e quebras de linha */
export function fmt(s: string): string {
  const codigos: string[] = [];
  const semCodigo = esc(personaliza(s)).replace(/`([^`]*)`/g, (_m, c: string) => {
    codigos.push(c);
    return `\u0000${codigos.length - 1}\u0000`;
  });
  return semCodigo
    .replace(/\*\*([\s\S]+?)\*\*/g, '<b>$1</b>')
    .replace(/\u0000(\d+)\u0000/g, (_m, i: string) => `<code>${codigos[Number(i)]}</code>`)
    .replace(/\n/g, '<br>');
}

/** aula em parágrafos */
export function paragrafos(s: string): string {
  return s
    .split(/\n\s*\n/)
    .map((p) => `<p>${fmt(p.trim())}</p>`)
    .join('');
}

export function cargo(n: Nivel): string {
  if (n === 'N1') return 'Analista N1';
  if (n === 'N2') return 'Analista N2';
  return 'Analista N3 / CSIRT';
}

/** o título do cargo de quem joga, com a forma de gênero */
export function cargoPessoa(n: Nivel): string {
  const base = cargo(n);
  return personaliza(base);
}
