// Robô que joga os 90 dias pelo motor: monta a fila de cada dia, responde e confere promoções e finais.
import { describe, expect, it } from 'vitest';
import { DIAS } from '../src/conteudo/index';
import { corrigir, montarFila } from '../src/motor/fila';
import { fecharDia, aplicarEfeitos } from '../src/motor/carreira';
import { estado, novo } from '../src/motor/estado';
import { consultar } from '../src/motor/siem';
import { receita } from '../src/motor/canivete';

function jogar(acerta: (dia: number) => boolean, decisoes: Record<number, number> = {}) {
  novo('Robô', 'n');
  let final: string | undefined;
  for (const dia of DIAS) {
    const e = estado();
    if (e.dia !== dia.n) break;
    const fila = montarFila(dia, e.nivel, 42);
    expect(fila.length, `dia ${dia.n}`).toBeGreaterThan(0);
    let pontos = 0;
    let max = 0;
    const bom = acerta(dia.n);
    for (const a of fila) {
      const m = a.modelo;
      const ver = bom ? m.veredito : m.veredito === 'tp' ? 'bp' : 'tp';
      const j = a.justificativas.findIndex((x) => x.certa === bom);
      const r = corrigir(a, ver, j, m.acao, e.nivel);
      pontos += r.pontos;
      max += r.max;
    }
    let prova: { nota: number; minima: number; promoveA: 'N1' | 'N2' | 'N3' } | undefined;
    for (const mi of dia.missoes) {
      if (mi.tipo === 'prova') prova = { nota: bom ? 100 : 40, minima: mi.notaMinima, promoveA: mi.promoveA };
      if (mi.tipo === 'escolha') aplicarEfeitos(mi.opcoes[decisoes[dia.n] ?? 0].efeitos);
    }
    const f = fecharDia(dia, pontos, max, prova);
    if (f.final) {
      final = f.final;
      break;
    }
  }
  return final;
}

describe('carreira', () => {
  it('quem acerta tudo e recusa as propostas vira líder do CSIRT', () => {
    // nas escolhas de final, a opção que liga a flag nunca é a única; procura uma que não ligue
    const recusas: Record<number, number> = {};
    for (const d of DIAS)
      for (const m of d.missoes)
        if (m.tipo === 'escolha') {
          const i = m.opcoes.findIndex((o) => !o.efeitos?.flag && (o.efeitos?.sanidade ?? 0) >= 0);
          recusas[d.n] = i >= 0 ? i : m.opcoes.findIndex((o) => !o.efeitos?.flag);
        }
    const f = jogar(() => true, recusas);
    expect(estado().nivel).toBe('N3');
    expect(f).toBe('lider');
  });

  it('quem erra as provas fica N1 para sempre (ou sai antes)', () => {
    const recusas: Record<number, number> = {};
    for (const d of DIAS) for (const m of d.missoes) if (m.tipo === 'escolha') recusas[d.n] = Math.max(0, m.opcoes.findIndex((o) => !o.efeitos?.flag && (o.efeitos?.sanidade ?? 0) >= 0));
    const f = jogar((n) => n % 3 !== 0, recusas);
    expect(['n1', 'burnout', 'demitido']).toContain(f);
  });

  it('decisão de final mais recente vence', () => {
    const escolhas: Record<number, number> = {};
    for (const d of DIAS)
      for (const m of d.missoes)
        if (m.tipo === 'escolha') {
          const i = m.opcoes.findIndex((o) => o.efeitos?.flag === 'coach');
          const recusa = m.opcoes.findIndex((o) => !o.efeitos?.flag && (o.efeitos?.sanidade ?? 0) >= 0);
          escolhas[d.n] = i >= 0 ? i : Math.max(0, recusa);
        }
    expect(jogar(() => true, escolhas)).toBe('coach');
  });

  it('as quatro decisões de final existem no conteúdo', () => {
    const flags = new Set(DIAS.flatMap((d) => d.missoes.flatMap((m) => (m.tipo === 'escolha' ? m.opcoes.map((o) => o.efeitos?.flag) : []))));
    for (const f of ['concorrente', 'coach', 'concurso', 'gerente']) expect(flags).toContain(f);
  });
});

describe('motor', () => {
  it('mini-SIEM conta, filtra e ordena', () => {
    const regs = [
      { ip: 'a', evento: 4625 },
      { ip: 'a', evento: 4625 },
      { ip: 'b', evento: 4625 },
      { ip: 'b', evento: 4624 },
    ];
    const r = consultar(regs, 'evento=4625 | contar por ip | ordenar -total | topo 1');
    expect(r.linhas).toEqual([{ ip: 'a', total: 2 }]);
    expect(consultar(regs, 'evento=4624 OU ip=a | contar').linhas[0].total).toBe(3);
    expect(consultar(regs, 'stats count by ip | where total>1').linhas.length).toBe(2);
  });
  it('Canivete lê PowerShell codificado (base64 de UTF-16LE)', () => {
    expect(receita('dwBoAG8AYQBtAGkA', ['base64', 'utf16le'])).toBe('whoami');
  });
});
