// Navegação da equipe: grade do chão com os móveis marcados e busca A*, para ninguém atravessar mesa.
// O caminho achado é suavizado (corta cantos quando há linha livre) para a pessoa não andar em zigue-zague.
import type { Caixa, Sala } from './soc';

const PASSO = 0.2; // tamanho da célula em metros
const FOLGA = 0.28; // meio corpo: distância mínima entre o centro da pessoa e um móvel

type P = { x: number; z: number };

export class Navegacao {
  private x0: number;
  private z0: number;
  private nx: number;
  private nz: number;
  private livre: Uint8Array;

  constructor(sala: Sala) {
    const [x0, x1, z0, z1] = sala.limites;
    this.x0 = x0;
    this.z0 = z0;
    this.nx = Math.ceil((x1 - x0) / PASSO) + 1;
    this.nz = Math.ceil((z1 - z0) / PASSO) + 1;
    this.livre = new Uint8Array(this.nx * this.nz).fill(1);
    for (let i = 0; i < this.nx; i++)
      for (let j = 0; j < this.nz; j++) {
        const x = x0 + i * PASSO;
        const z = z0 + j * PASSO;
        if (sala.obstaculos.some((c) => dentro(c, x, z, FOLGA))) this.livre[j * this.nx + i] = 0;
      }
  }

  private celula(p: P): [number, number] {
    return [Math.round((p.x - this.x0) / PASSO), Math.round((p.z - this.z0) / PASSO)];
  }

  private ok(i: number, j: number) {
    return i >= 0 && j >= 0 && i < this.nx && j < this.nz && this.livre[j * this.nx + i] === 1;
  }

  private centro(i: number, j: number): P {
    return { x: this.x0 + i * PASSO, z: this.z0 + j * PASSO };
  }

  /** célula livre mais perto (quem está sentado começa dentro da área da mesa) */
  private soltar(p: P): [number, number] {
    const [ci, cj] = this.celula(p);
    if (this.ok(ci, cj)) return [ci, cj];
    for (let r = 1; r < 20; r++) {
      let melhor: [number, number] | null = null;
      let md = Infinity;
      for (let i = ci - r; i <= ci + r; i++)
        for (let j = cj - r; j <= cj + r; j++) {
          if (Math.max(Math.abs(i - ci), Math.abs(j - cj)) !== r || !this.ok(i, j)) continue;
          const c = this.centro(i, j);
          const d = (c.x - p.x) ** 2 + (c.z - p.z) ** 2;
          if (d < md) {
            md = d;
            melhor = [i, j];
          }
        }
      if (melhor) return melhor;
    }
    return [ci, cj];
  }

  /** linha reta entre dois pontos sem bater em nada */
  private visivel(a: P, b: P) {
    const d = Math.hypot(b.x - a.x, b.z - a.z);
    const n = Math.ceil(d / (PASSO * 0.5));
    for (let k = 1; k < n; k++) {
      const t = k / n;
      const [i, j] = this.celula({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
      if (!this.ok(i, j)) return false;
    }
    return true;
  }

  caminho(de: P, para: P): P[] {
    const [si, sj] = this.soltar(de);
    const [gi, gj] = this.soltar(para);
    const N = this.nx * this.nz;
    const g = new Float32Array(N).fill(Infinity);
    const veio = new Int32Array(N).fill(-1);
    const fechado = new Uint8Array(N);
    const aberto: number[] = [];
    const f = new Float32Array(N).fill(Infinity);
    const h = (i: number, j: number) => Math.hypot(i - gi, j - gj);
    const s = sj * this.nx + si;
    const alvo = gj * this.nx + gi;
    g[s] = 0;
    f[s] = h(si, sj);
    aberto.push(s);
    const viz = [
      [1, 0, 1],
      [-1, 0, 1],
      [0, 1, 1],
      [0, -1, 1],
      [1, 1, Math.SQRT2],
      [1, -1, Math.SQRT2],
      [-1, 1, Math.SQRT2],
      [-1, -1, Math.SQRT2],
    ];
    let achou = false;
    while (aberto.length) {
      // a grade é pequena (≈ 120 x 80): uma lista simples basta
      let bi = 0;
      for (let k = 1; k < aberto.length; k++) if (f[aberto[k]] < f[aberto[bi]]) bi = k;
      const c = aberto[bi];
      aberto[bi] = aberto[aberto.length - 1];
      aberto.pop();
      if (c === alvo) {
        achou = true;
        break;
      }
      if (fechado[c]) continue;
      fechado[c] = 1;
      const ci = c % this.nx;
      const cj = (c - ci) / this.nx;
      for (const [di, dj, custo] of viz) {
        const i = ci + di;
        const j = cj + dj;
        if (!this.ok(i, j)) continue;
        // diagonal só se as duas vizinhas retas estiverem livres (não corta quina de mesa)
        if (di && dj && (!this.ok(ci + di, cj) || !this.ok(ci, cj + dj))) continue;
        const n = j * this.nx + i;
        const ng = g[c] + custo;
        if (ng < g[n]) {
          g[n] = ng;
          veio[n] = c;
          f[n] = ng + h(i, j);
          aberto.push(n);
        }
      }
    }
    if (!achou) return [para];
    const pts: P[] = [];
    for (let c = alvo; c !== -1; c = veio[c]) {
      const i = c % this.nx;
      pts.push(this.centro(i, (c - i) / this.nx));
    }
    pts.reverse();
    // suaviza: de cada ponto, pula para o mais distante que dá para ver em linha reta
    const liso: P[] = [pts[0]];
    let k = 0;
    while (k < pts.length - 1) {
      let m = pts.length - 1;
      while (m > k + 1 && !this.visivel(pts[k], pts[m])) m--;
      liso.push(pts[m]);
      k = m;
    }
    // sair de onde está (cadeira) e chegar no ponto exato pedido
    const ini = liso[0];
    const out = Math.hypot(ini.x - de.x, ini.z - de.z) > 0.05 ? [ini, ...liso.slice(1)] : liso.slice(1);
    const fim = out[out.length - 1];
    if (!fim || Math.hypot(fim.x - para.x, fim.z - para.z) > 0.05) out.push(para);
    return out;
  }
}

function dentro(c: Caixa, x: number, z: number, folga: number) {
  return x > c[0] - folga && x < c[1] + folga && z > c[2] - folga && z < c[3] + folga;
}
