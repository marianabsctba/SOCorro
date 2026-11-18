// Junta todo o conteúdo do jogo.
import type { Dia, ModeloAlerta } from './tipos';
import { ALERTAS_N1 } from './alertas/n1';
import { ALERTAS_N2 } from './alertas/n2';
import { ALERTAS_N3 } from './alertas/n3';
import { ATO1 } from './dias/ato1';
import { ATO2 } from './dias/ato2';
import { ATO3 } from './dias/ato3';

export const ALERTAS: ModeloAlerta[] = [...ALERTAS_N1, ...ALERTAS_N2, ...ALERTAS_N3];
export const DIAS: Dia[] = [...ATO1, ...ATO2, ...ATO3].sort((a, b) => a.n - b.n).map(misturar);

/** embaralha as opções das perguntas com semente fixa, para a certa não ficar sempre no mesmo lugar */
function misturar(d: Dia): Dia {
  let s = d.n * 7919 + 13;
  const r = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (const m of d.missoes) {
    if (m.tipo !== 'quiz' && m.tipo !== 'prova') continue;
    for (const p of m.perguntas) {
      const idx = p.opcoes.map((_, i) => i);
      for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }
      // opções do tipo "todas as anteriores" ficam onde estão
      if (p.opcoes.some((o) => /todas as (anteriores|alternativas)|nenhuma das/i.test(o))) continue;
      const certa = p.opcoes[p.certa];
      p.opcoes = idx.map((i) => p.opcoes[i]);
      p.certa = p.opcoes.indexOf(certa);
    }
  }
  return d;
}
export const ALERTA_POR_ID = new Map(ALERTAS.map((a) => [a.id, a]));
