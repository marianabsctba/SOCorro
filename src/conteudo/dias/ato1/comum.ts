import type { Dia, Pergunta } from '../../tipos';
import { rng, embaralhar } from '../../util';

/** junta parágrafos da aula com linha em branco entre eles */
export function aula(...paragrafos: string[]): string {
  return paragrafos.join('\n\n');
}

/**
 * As perguntas são escritas com a certa na primeira posição (fica mais fácil revisar).
 * Aqui as opções são embaralhadas de forma determinística, para a certa não morar sempre no mesmo lugar.
 */
function misturarPergunta(p: Pergunta, semente: number): Pergunta {
  const r = rng(semente);
  const ordem = embaralhar(r, p.opcoes.map((_, i) => i));
  return { ...p, opcoes: ordem.map((i) => p.opcoes[i]), certa: ordem.indexOf(p.certa) };
}

export function misturarOpcoes(dias: Dia[]): Dia[] {
  return dias.map((d) => ({
    ...d,
    missoes: d.missoes.map((m, mi) =>
      m.tipo === 'quiz' || m.tipo === 'prova' ? { ...m, perguntas: m.perguntas.map((p, pi) => misturarPergunta(p, d.n * 1000 + mi * 100 + pi + 7)) } : m,
    ),
  }));
}
