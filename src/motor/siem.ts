// Mini-SIEM do SOCorro: uma linguagem de consulta em pipeline, parecida com as de mercado,
// com comandos em português e os apelidos em inglês que todo analista já digitou na vida.
//
//   evento=4625 usuario!=svc_* | contar por ip_origem | onde total>10 | ordenar -total | topo 5
//
// Primeiro trecho: filtros (todos precisam bater). campo=valor, campo!=valor, campo>n, campo<n,
// campo>=n, campo<=n, * como curinga, "aspas" para valores com espaço, e palavra solta procura em qualquer campo.
// OU entre dois filtros: campo=a OU campo=b (ou OR).
// Comandos depois do |:
//   contar [por c1,c2]            (stats count by)      cria a coluna total
//   distintos campo [por c1]      (dc / distinct)       cria a coluna distintos
//   somar campo [por c1]          (sum)                 cria a coluna soma
//   onde <filtros>                (where / search)
//   ordenar [-]campo              (sort)                - = decrescente
//   topo N                        (head)
//   tabela c1,c2                  (table / fields)
//   unicos campo                  (dedup)
import type { Registro } from '../conteudo/tipos';

export interface Resultado {
  colunas: string[];
  linhas: Registro[];
  erro?: string;
}

type Teste = (r: Registro) => boolean;

function tokens(s: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ' || c === '\t' || c === '\n') {
      i++;
      continue;
    }
    let tok = '';
    while (i < s.length && s[i] !== ' ' && s[i] !== '\t' && s[i] !== '\n') {
      if (s[i] === '"') {
        const fim = s.indexOf('"', i + 1);
        const f = fim < 0 ? s.length : fim;
        tok += '\u0001' + s.slice(i + 1, f) + '\u0001';
        i = f + 1;
      } else tok += s[i++];
    }
    out.push(tok);
  }
  return out;
}

const tirarAspas = (v: string) => v.replace(/\u0001/g, '');

function curinga(padrao: string): RegExp {
  const esc = padrao.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp('^' + esc + '$', 'i');
}

function num(v: unknown): number {
  return typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
}

/** acha o campo do registro sem diferenciar maiúsculas */
function campo(r: Registro, nome: string): string | number | undefined {
  if (nome in r) return r[nome];
  const k = Object.keys(r).find((x) => x.toLowerCase() === nome.toLowerCase());
  return k === undefined ? undefined : r[k];
}

function testeDe(tok: string): Teste {
  const m = /^([\w.@-]+)(!=|>=|<=|=|>|<)(.*)$/.exec(tok);
  if (!m) {
    const termo = tirarAspas(tok).toLowerCase();
    if (termo.includes('*')) {
      const re = curinga(termo);
      return (r) => Object.values(r).some((v) => re.test(String(v)));
    }
    return (r) => Object.values(r).some((v) => String(v).toLowerCase().includes(termo));
  }
  const [, nome, op, cru] = m;
  const valor = tirarAspas(cru);
  if (op === '=' || op === '!=') {
    const re = curinga(valor);
    const t: Teste = (r) => {
      const v = campo(r, nome);
      return v !== undefined && re.test(String(v));
    };
    return op === '=' ? t : (r) => !t(r);
  }
  const n = num(valor);
  return (r) => {
    const v = campo(r, nome);
    if (v === undefined) return false;
    const x = num(v);
    if (Number.isNaN(x)) return false;
    return op === '>' ? x > n : op === '<' ? x < n : op === '>=' ? x >= n : x <= n;
  };
}

/** filtros separados por espaço: E implícito, OU/OR explícito (OU tem precedência menor) */
export function filtro(txt: string): Teste {
  const tk = tokens(txt).filter((t) => !/^(e|and)$/i.test(t));
  const grupos: Teste[][] = [[]];
  for (const t of tk) {
    if (/^(ou|or)$/i.test(t)) grupos.push([]);
    else grupos[grupos.length - 1].push(testeDe(t));
  }
  const g = grupos.filter((x) => x.length);
  if (!g.length) return () => true;
  return (r) => g.some((e) => e.every((t) => t(r)));
}

function lista(s: string): string[] {
  return s
    .split(/[,\s]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function colunasDe(linhas: Registro[]): string[] {
  const vistas = new Set<string>();
  for (const l of linhas.slice(0, 200)) for (const k of Object.keys(l)) vistas.add(k);
  return [...vistas];
}

function agrupar(linhas: Registro[], por: string[], calc: (g: Registro[]) => number, nomeCol: string): Registro[] {
  const mapa = new Map<string, Registro[]>();
  for (const l of linhas) {
    const chave = por.map((c) => String(campo(l, c) ?? '')).join('\u0002');
    let g = mapa.get(chave);
    if (!g) mapa.set(chave, (g = []));
    g.push(l);
  }
  const out: Registro[] = [];
  for (const g of mapa.values()) {
    const r: Registro = {};
    for (const c of por) r[c] = campo(g[0], c) ?? '';
    r[nomeCol] = calc(g);
    out.push(r);
  }
  return out;
}

export function consultar(registros: Registro[], consulta: string): Resultado {
  const partes = consulta.split('|').map((p) => p.trim());
  // começou direto com um comando (stats count by ip...): não tem filtro inicial
  if (/^(contar|stats|count|distintos|dc|distinct|somar|sum|onde|where|ordenar|sort|topo|head|tabela|table|fields|unicos|dedup)(\s|$)/i.test(partes[0] ?? '')) partes.unshift('');
  let linhas = registros.filter(filtro(partes[0] ?? ''));
  let colunas: string[] | null = null;
  for (const p of partes.slice(1)) {
    if (!p) continue;
    const m = /^(\S+)\s*(.*)$/.exec(p)!;
    const cmd = m[1].toLowerCase();
    let resto = m[2];
    const porM = /\s*\b(?:por|by)\b\s+(.+)$/i.exec(resto);
    const por = porM ? lista(porM[1]) : [];
    if (porM) resto = resto.slice(0, porM.index);
    try {
      switch (cmd) {
        case 'contar':
        case 'stats':
        case 'count': {
          linhas = agrupar(linhas, por, (g) => g.length, 'total');
          colunas = [...por, 'total'];
          break;
        }
        case 'distintos':
        case 'dc':
        case 'distinct': {
          const c = lista(resto.replace(/[()]/g, ' '))[0];
          if (!c) throw new Error('distintos precisa de um campo: distintos usuario por ip');
          linhas = agrupar(linhas, por, (g) => new Set(g.map((x) => String(campo(x, c) ?? ''))).size, 'distintos');
          colunas = [...por, 'distintos'];
          break;
        }
        case 'somar':
        case 'sum': {
          const c = lista(resto.replace(/[()]/g, ' '))[0];
          if (!c) throw new Error('somar precisa de um campo: somar bytes por ip');
          linhas = agrupar(linhas, por, (g) => g.reduce((s, x) => s + (num(campo(x, c)) || 0), 0), 'soma');
          colunas = [...por, 'soma'];
          break;
        }
        case 'onde':
        case 'where':
        case 'search':
        case 'filtrar':
          linhas = linhas.filter(filtro(resto));
          break;
        case 'ordenar':
        case 'sort': {
          const ch = lista(resto);
          linhas = [...linhas].sort((a, b) => {
            for (const c0 of ch) {
              const desc = c0.startsWith('-');
              const c = c0.replace(/^[-+]/, '');
              const va = campo(a, c);
              const vb = campo(b, c);
              const na = num(va);
              const nb = num(vb);
              const d = !Number.isNaN(na) && !Number.isNaN(nb) ? na - nb : String(va ?? '').localeCompare(String(vb ?? ''));
              if (d) return desc ? -d : d;
            }
            return 0;
          });
          break;
        }
        case 'topo':
        case 'head':
        case 'limite':
        case 'limit': {
          const n = parseInt(resto, 10);
          linhas = linhas.slice(0, Number.isNaN(n) ? 10 : n);
          break;
        }
        case 'tabela':
        case 'table':
        case 'fields':
        case 'campos': {
          const cs = lista(resto);
          linhas = linhas.map((l) => {
            const r: Registro = {};
            for (const c of cs) r[c] = campo(l, c) ?? '';
            return r;
          });
          colunas = cs;
          break;
        }
        case 'unicos':
        case 'dedup': {
          const cs = lista(resto);
          const vistos = new Set<string>();
          linhas = linhas.filter((l) => {
            const k = cs.map((c) => String(campo(l, c) ?? '')).join('\u0002');
            if (vistos.has(k)) return false;
            vistos.add(k);
            return true;
          });
          break;
        }
        default:
          return { colunas: [], linhas: [], erro: `Comando "${m[1]}" não existe. Tente contar, distintos, somar, onde, ordenar, topo, tabela ou unicos.` };
      }
    } catch (e) {
      return { colunas: [], linhas: [], erro: (e as Error).message };
    }
  }
  return { colunas: colunas ?? colunasDe(linhas), linhas };
}

export function normalizar(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}
