// Confere se o conteúdo é jogável: toda missão tem solução, todo alerta tem uma justificativa certa,
// nenhum texto tem travessão e os 90 dias existem.
import { describe, expect, it } from 'vitest';
import { ALERTAS, DIAS, ALERTA_POR_ID } from '../src/conteudo/index';
import { consultar, filtro, normalizar } from '../src/motor/siem';
import { receita } from '../src/motor/canivete';
import type { Missao, Dia, ModeloAlerta } from '../src/conteudo/tipos';

const PERSONAGENS = ['gilmar', 'ro', 'vandeco', 'thiaguinho', 'keyla', 'neide', 'leoncio', 'socorro', 'nildo', 'kevin', 'brenda', 'jefferson', 'pamela', 'voce', 'narrador', 'telefone', 'chat'];

function textos(x: unknown, out: string[] = []): string[] {
  if (typeof x === 'string') out.push(x);
  else if (Array.isArray(x)) for (const y of x) textos(y, out);
  else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) if (k !== 'registros') textos(v, out);
  return out;
}

function checarMissao(m: Missao, onde: string) {
  expect(m.titulo, onde).toBeTruthy();
  switch (m.tipo) {
    case 'quiz':
    case 'prova':
      expect(m.perguntas.length, onde).toBeGreaterThan(0);
      for (const p of m.perguntas) {
        expect(p.opcoes.length, `${onde}: ${p.p}`).toBeGreaterThanOrEqual(2);
        expect(p.certa, `${onde}: ${p.p}`).toBeGreaterThanOrEqual(0);
        expect(p.certa, `${onde}: ${p.p}`).toBeLessThan(p.opcoes.length);
        expect(p.explicacao, `${onde}: ${p.p}`).toBeTruthy();
      }
      if (m.tipo === 'prova') expect(m.perguntas.length, onde).toBeGreaterThanOrEqual(8);
      break;
    case 'siem': {
      expect(m.registros.length, onde).toBeGreaterThan(5);
      const r = consultar(m.registros, m.gabarito);
      expect(r.erro, `${onde}: gabarito com erro`).toBeUndefined();
      expect(r.linhas.length, `${onde}: gabarito sem resultado`).toBeGreaterThan(0);
      const valores = Object.values(r.linhas[0]).map((v) => normalizar(String(v)));
      expect(valores, `${onde}: a primeira linha do gabarito não mostra a resposta`).toContain(normalizar(m.resposta));
      break;
    }
    case 'ordenar':
      expect(m.itens.length, onde).toBeGreaterThanOrEqual(3);
      expect(new Set(m.itens).size, `${onde}: itens repetidos`).toBe(m.itens.length);
      break;
    case 'regra': {
      const fps = m.registros.filter((r) => !r.malicioso);
      const tps = m.registros.filter((r) => r.malicioso);
      expect(fps.length, onde).toBeGreaterThan(0);
      expect(tps.length, `${onde}: precisa ter ataque de verdade no meio`).toBeGreaterThan(0);
      // existe um conjunto de exclusões que atinge a meta sem esconder nenhum ataque?
      const seguras = m.exclusoes.filter((e) => !tps.some(filtro(e.filtro)));
      const sobram = fps.filter((r) => !seguras.some((e) => filtro(e.filtro)(r)));
      const reducao = 1 - sobram.length / fps.length;
      expect(reducao, `${onde}: nenhuma combinação segura atinge a meta`).toBeGreaterThanOrEqual(m.minReducao);
      // e existe pelo menos uma armadilha (exclusão que esconde ataque)
      expect(m.exclusoes.length - seguras.length, `${onde}: falta uma exclusão perigosa`).toBeGreaterThan(0);
      break;
    }
    case 'decodificar': {
      const saida = receita(m.entrada, m.receita);
      expect(saida.toLowerCase(), `${onde}: a receita não revela a resposta`).toContain(m.resposta.toLowerCase());
      break;
    }
    case 'escolha':
      expect(m.opcoes.length, onde).toBeGreaterThanOrEqual(2);
      for (const o of m.opcoes) expect(o.reacao.length, onde).toBeGreaterThan(0);
      break;
  }
}

describe('dias', () => {
  it('existem os 90 dias, um de cada', () => {
    expect(DIAS.map((d) => d.n)).toEqual(Array.from({ length: 90 }, (_, i) => i + 1));
  });
  it('provas de promoção nos dias 30 e 60', () => {
    const prova = (d: Dia | undefined, a: string) => d?.missoes.some((m) => m.tipo === 'prova' && m.promoveA === a);
    expect(prova(DIAS.find((d) => d.n === 30), 'N2')).toBe(true);
    expect(prova(DIAS.find((d) => d.n === 60), 'N3')).toBe(true);
  });
  for (const d of DIAS) {
    it(`dia ${d.n}: ${d.titulo}`, () => {
      expect(d.aula.length, 'aula curta demais').toBeGreaterThan(200);
      expect(d.chegada.length).toBeGreaterThan(0);
      expect(d.missoes.length).toBeLessThanOrEqual(3);
      for (const f of [...d.chegada, ...(d.saida ?? [])]) expect(PERSONAGENS, `falante ${f.quem}`).toContain(f.quem);
      for (const id of d.fila.alertas ?? []) expect(ALERTA_POR_ID.has(id), `alerta ${id} não existe`).toBe(true);
      d.missoes.forEach((m, i) => checarMissao(m, `dia ${d.n} missão ${i + 1}`));
      for (const m of d.missoes) if (m.tipo === 'escolha') for (const o of m.opcoes) for (const f of o.reacao) expect(PERSONAGENS).toContain(f.quem);
    });
  }
});

describe('alertas', () => {
  it('ids únicos', () => {
    expect(new Set(ALERTAS.map((a) => a.id)).size).toBe(ALERTAS.length);
  });
  it('fila realista: a maioria é falso positivo ou benigno', () => {
    const n1 = ALERTAS.filter((a) => a.nivel === 'N1');
    const ruido = n1.filter((a) => a.veredito !== 'tp').length;
    expect(ruido / n1.length).toBeGreaterThan(0.55);
  });
  for (const a of ALERTAS as ModeloAlerta[]) {
    it(`alerta ${a.id}`, () => {
      expect(a.logs.length).toBeGreaterThan(0);
      expect(a.justificativas.filter((j) => j.certa).length, 'exatamente uma justificativa certa').toBe(1);
      expect(a.justificativas.length).toBeGreaterThanOrEqual(3);
      if (a.veredito === 'tp') expect(a.acao, 'tp precisa de ação').toBeTruthy();
      // toda {var} usada precisa existir
      for (const t of textos([a.titulo, a.logs, a.contexto, a.explicacao, a.piada, a.justificativas])) {
        for (const m of t.matchAll(/\{(\w+)\}/g)) if (m[1] !== 'nome') expect(a.vars?.[m[1]], `{${m[1]}} sem valores`).toBeTruthy();
      }
    });
  }
});

describe('texto', () => {
  it('nenhum travessão', () => {
    const todos = textos([DIAS, ALERTAS]).join('\n');
    const achados = todos.split('\n').filter((l) => /[—–]/.test(l));
    expect(achados.slice(0, 5)).toEqual([]);
  });
});
