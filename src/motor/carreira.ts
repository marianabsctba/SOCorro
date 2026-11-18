// Regras da carreira: nota do dia, recursos, promoções, honrarias e qual final acontece.
import type { Dia, Efeitos, Nivel } from '../conteudo/tipos';
import { HONRARIA_POR_ID } from '../conteudo/honrarias';
import { estado, limitar, media, salvar, somar } from './estado';

const PROXIMO: Record<Nivel, Nivel> = { N1: 'N2', N2: 'N3', N3: 'N3' };

/** concede uma honraria (uma vez só); devolve true se é nova */
export function honrar(id: string): boolean {
  const e = estado();
  if (e.honrarias[id] || !HONRARIA_POR_ID.has(id)) return false;
  e.honrarias[id] = e.dia;
  novas.push(id);
  salvar();
  return true;
}

/** honrarias ganhas desde a última vez que alguém perguntou (para mostrar o aviso) */
const novas: string[] = [];
export function tirarNovas(): string[] {
  return novas.splice(0);
}

export function aplicarEfeitos(ef: Efeitos | undefined) {
  if (!ef) return;
  const e = estado();
  if (ef.sanidade) e.sanidade = limitar(e.sanidade + ef.sanidade);
  if (ef.energia) e.energia = limitar(e.energia + ef.energia);
  if (ef.reputacao) e.reputacao = limitar(e.reputacao + ef.reputacao);
  if (ef.flag) e.flags[ef.flag] = e.dia;
  if (ef.honraria) honrar(ef.honraria);
  if (ef.flag === 'ransomware_fechado' || ef.flag === 'cagada') e.cagadas++;
  salvar();
}

export function verificarContadores() {
  const e = estado();
  const c = (k: string) => e.cont[k] ?? 0;
  if (c('fp_certos') >= 10) honrar('fp10');
  if (c('fp_certos') >= 100) honrar('fp100');
  if (c('escalou_fp') >= 5) honrar('escala_tudo');
  if (c('rapidos') >= 20) honrar('relampago');
  if (c('cafes') >= 50) honrar('caneca_ouro');
  if (c('noites') >= 5) honrar('vampiro');
  if (c('madrugadas') >= 3) honrar('plantao');
  if (c('quiz_perfeito') >= 5) honrar('decorou_wiki');
  if (c('consultas') >= 50) honrar('fluente');
  if (c('canivete') >= 10) honrar('canivete');
  if (c('neide') >= 5) honrar('neide');
}

export interface Fechamento {
  nota: number;
  promovido?: Nivel;
  reprovou?: boolean;
  final?: string; // final antecipado (burnout, demissão)
}

/**
 * Fecha o dia.
 * pontos/maximo: soma de alertas e missões; prova: nota da prova do dia, se houve.
 */
export function fecharDia(dia: Dia, pontos: number, maximo: number, prova?: { nota: number; minima: number; promoveA: Nivel }): Fechamento {
  const e = estado();
  const nota = maximo > 0 ? Math.round((pontos / maximo) * 100) : 100;
  e.notas[dia.n - 1] = nota;
  const f: Fechamento = { nota };

  // sanidade: dia bom alivia, dia ruim pesa, madrugada cobra seu preço
  let ds = nota >= 85 ? 4 : nota >= 60 ? 1 : nota >= 40 ? -4 : -9;
  if (dia.turno === 'madrugada') ds -= 3;
  if (dia.turno === 'noite') ds -= 1;
  if (e.energia < 15) ds -= 3;
  e.sanidade = limitar(e.sanidade + ds);
  e.reputacao = limitar(e.reputacao + (nota - 60) / 10);

  if (dia.turno === 'noite') somar('noites');
  if (dia.turno === 'madrugada') {
    somar('noites');
    somar('madrugadas');
  }
  if (dia.site === 'bravo') honrar('passaporte');
  if (dia.n === 1) honrar('cracha');
  if (dia.n === 18) honrar('black_friday');
  if (dia.n === 19) honrar('leoncio');
  if (dia.n === 45) honrar('failover');
  if (dia.n === 30) honrar('mes1');
  if (dia.n === 60) honrar('mes2');
  if (dia.n === 90) honrar('dias_zero');
  if (nota >= 100) honrar('turno_perfeito');
  if (nota < 30) honrar('segunda');
  if (e.sanidade < 15 && e.sanidade > 0) honrar('por_um_fio');
  if (dia.n > 30 && e.nivel === 'N1') honrar('acumulo');
  if (dia.n % 30 === 0 && media() >= 80) honrar('funcionario_mes');

  if (prova) {
    e.provas[dia.n] = prova.nota;
    if (prova.nota >= prova.minima && e.nivel !== 'N3') {
      e.nivel = PROXIMO[e.nivel];
      f.promovido = e.nivel;
      honrar(e.nivel === 'N2' ? 'n2' : 'n3');
    } else if (prova.nota < prova.minima) f.reprovou = true;
  }
  verificarContadores();

  if (e.sanidade <= 0) f.final = 'burnout';
  else if (e.cagadas >= 3 || e.flags.ransomware_fechado) f.final = 'demitido';
  else if (dia.n >= 90) f.final = escolherFinal();
  if (f.final) e.final = f.final;
  else {
    e.dia = dia.n + 1;
    e.energia = 100;
    e.cont.cafes_dia = 0;
  }
  salvar();
  return f;
}

/** final do dia 90: a decisão mais recente vale; sem decisão, a carreira decide */
export function escolherFinal(): string {
  const e = estado();
  if (e.pistasBravo.length >= 3) return 'secreto';
  const decisoes = ['concorrente', 'coach', 'concurso', 'gerente'].filter((k) => e.flags[k]).sort((a, b) => e.flags[b] - e.flags[a]);
  if (decisoes.length) return decisoes[0];
  if (e.nivel === 'N1') return 'n1';
  if (e.nivel === 'N3' && media() >= 70 && e.cagadas === 0) return 'lider';
  return 'pleno';
}
