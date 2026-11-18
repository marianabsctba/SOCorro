// Canivete: a ferramenta de decodificação do analista (o "CyberChef de pobre" da Insônia).
// Trabalha com bytes de verdade: base64 de PowerShell -EncodedCommand vira UTF-16LE, XOR é byte a byte.
import type { OpCanivete } from '../conteudo/tipos';

function bytesDe(s: string): number[] {
  return Array.from(new TextEncoder().encode(s));
}

function latin(bytes: number[]): string {
  return bytes.map((b) => String.fromCharCode(b)).join('');
}

function deLatin(s: string): number[] {
  return Array.from(s, (c) => c.charCodeAt(0) & 0xff);
}

function textoDe(bytes: number[]): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    return latin(bytes);
  }
}

/** aplica uma operação; a "string" que circula entre operações é binária (um caractere por byte) */
export function aplicar(entrada: string, op: OpCanivete): string {
  switch (op) {
    case 'base64': {
      const limpo = entrada.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
      const pad = limpo + '='.repeat((4 - (limpo.length % 4)) % 4);
      try {
        return atob(pad);
      } catch {
        throw new Error('Isso não é base64 válido.');
      }
    }
    case 'hex': {
      const limpo = entrada.replace(/0x|\\x|[\s:,]/gi, '');
      if (!/^[0-9a-f]*$/i.test(limpo) || limpo.length % 2) throw new Error('Isso não é hexadecimal válido.');
      return latin(limpo.match(/../g)?.map((h) => parseInt(h, 16)) ?? []);
    }
    case 'url':
      try {
        return latin(bytesDe(decodeURIComponent(entrada.replace(/\+/g, ' '))));
      } catch {
        throw new Error('Codificação de URL quebrada.');
      }
    case 'rot13':
      return entrada.replace(/[a-z]/gi, (c) => {
        const b = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - b + 13) % 26) + b);
      });
    case 'inverter':
      return [...entrada].reverse().join('');
    case 'utf16le': {
      const b = deLatin(entrada);
      let s = '';
      for (let i = 0; i + 1 < b.length; i += 2) s += String.fromCharCode(b[i] | (b[i + 1] << 8));
      return latin(bytesDe(s));
    }
    default: {
      const m = /^xor:(\d+)$/.exec(op);
      if (!m) throw new Error('Operação desconhecida.');
      const k = Number(m[1]) & 0xff;
      return latin(deLatin(entrada).map((x) => x ^ k));
    }
  }
}

/** aplica a receita inteira e devolve texto legível */
export function receita(entrada: string, ops: OpCanivete[]): string {
  let s = entrada;
  for (const op of ops) s = aplicar(s, op);
  return textoDe(deLatin(s));
}

/** para exibir o meio do caminho: texto legível de uma string binária */
export function legivel(s: string): string {
  return textoDe(deLatin(s));
}

/** utilitários para quem escreve conteúdo montar entradas */
export function codificarBase64Utf16(s: string): string {
  let bin = '';
  for (const c of s) {
    const u = c.charCodeAt(0);
    bin += String.fromCharCode(u & 0xff, u >> 8);
  }
  return btoa(bin);
}

export function codificarBase64(s: string): string {
  return btoa(latin(bytesDe(s)));
}

export function codificarHex(s: string): string {
  return bytesDe(s)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function xorHex(s: string, k: number): string {
  return bytesDe(s)
    .map((b) => (b ^ k).toString(16).padStart(2, '0'))
    .join('');
}
