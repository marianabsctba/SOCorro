// Ajudantes para montar conjuntos de registros determinísticos (mesma semente, mesmos dados, sempre).
import type { Registro } from './tipos';

export function rng(semente: number) {
  let s = semente >>> 0 || 1;
  const prox = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    prox,
    int: (a: number, b: number) => a + Math.floor(prox() * (b - a + 1)),
    um: <T>(xs: readonly T[]): T => xs[Math.floor(prox() * xs.length)],
    chance: (p: number) => prox() < p,
  };
}

export type Rng = ReturnType<typeof rng>;

/** IP interno 10.x */
export function ipInterno(r: Rng, rede = '10.20'): string {
  return `${rede}.${r.int(1, 30)}.${r.int(2, 250)}`;
}

/** IP público plausível (fora das faixas reservadas) */
export function ipExterno(r: Rng): string {
  const primeiros = [45, 77, 91, 103, 138, 152, 167, 179, 185, 186, 189, 191, 194, 200, 201];
  return `${r.um(primeiros)}.${r.int(1, 254)}.${r.int(1, 254)}.${r.int(1, 254)}`;
}

/** horário ISO a partir de uma data base e de segundos somados */
export function hora(base: string, segundos: number): string {
  const d = new Date(base + 'Z');
  d.setUTCSeconds(d.getUTCSeconds() + segundos);
  return d.toISOString().replace('.000Z', 'Z');
}

/** embaralha de forma determinística */
export function embaralhar<T>(r: Rng, xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r.prox() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** ordena registros pelo campo hora */
export function porHora<T extends Registro>(xs: T[]): T[] {
  return [...xs].sort((a, b) => String(a.hora).localeCompare(String(b.hora)));
}

export const USUARIOS = ['joao.silva', 'maria.souza', 'ana.oliveira', 'carlos.pereira', 'fernanda.lima', 'rafael.costa', 'juliana.santos', 'paulo.rodrigues', 'patricia.alves', 'lucas.ferreira', 'camila.ribeiro', 'marcos.gomes', 'aline.martins', 'bruno.carvalho', 'vanessa.rocha'];
export const HOSTS = ['NB-FIN-014', 'NB-RH-007', 'DT-ATEND-031', 'NB-DIR-001', 'DT-TI-002', 'SRV-ARQ-01', 'SRV-SQL-02', 'SRV-DC-01', 'NB-COM-022', 'DT-CAIXA-05'];
