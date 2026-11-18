// A equipe não atravessa móvel: todo caminho entre duas cadeiras, ou até a copa, contorna as mesas.
import { describe, expect, it } from 'vitest';
import { Navegacao } from '../src/tres/nav';
import type { Caixa, Sala } from '../src/tres/soc';

const FILAS_Z = [-4.4, -1.4, 1.6];
const ESTACOES_X = [-7.2, -4.6, -2.0, 0.6, 3.2];
const obst: Caixa[] = [];
for (const z of FILAS_Z) for (const x of ESTACOES_X) obst.push([x - 0.82, x + 0.82, z - 0.42, z + 0.4]);
obst.push([8.5, 9.5, 4.7, 5.7], [11.2, 12, 3.0, 7.6], [-12, -9.1, -8, -3.1]);
const sala = { limites: [-11.65, 11.65, -7.65, 7.65], obstaculos: obst } as unknown as Sala;

function cruza(a: { x: number; z: number }, b: { x: number; z: number }) {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.05);
  for (let k = 1; k < n; k++) {
    const x = a.x + ((b.x - a.x) * k) / n;
    const z = a.z + ((b.z - a.z) * k) / n;
    if (obst.some((c) => x > c[0] + 0.05 && x < c[1] - 0.05 && z > c[2] + 0.05 && z < c[3] - 0.05)) return true;
  }
  return false;
}

describe('navegação', () => {
  const nav = new Navegacao(sala);
  const cadeiras = FILAS_Z.flatMap((z) => ESTACOES_X.map((x) => ({ x, z: z + 0.62 })));
  it('da cadeira até a cafeteira sem atravessar mesa', () => {
    for (const c of cadeiras) {
      const pts = [c, ...nav.caminho(c, { x: 10.7, z: 4.6 })];
      for (let i = 1; i < pts.length; i++) expect(cruza(pts[i - 1], pts[i]), `de ${c.x},${c.z}`).toBe(false);
    }
  });
  it('de uma fileira para outra contorna as mesas', () => {
    const a = cadeiras[2];
    const b = cadeiras[12];
    const pts = [a, ...nav.caminho(a, b)];
    for (let i = 1; i < pts.length; i++) expect(cruza(pts[i - 1], pts[i])).toBe(false);
    expect(pts.length).toBeGreaterThan(2);
  });
});
