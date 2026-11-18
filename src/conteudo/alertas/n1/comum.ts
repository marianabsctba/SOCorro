// Ajudantes e listas compartilhadas pelos alertas de N1.
import type { Justificativa } from '../../tipos';

/** monta as justificativas: `certa` é o índice (0 em diante) da única certa */
export function js(certa: number, ...textos: string[]): Justificativa[] {
  return textos.map((texto, i) => ({ texto, certa: i === certa }));
}

export const HORA_COMERCIAL = ['08:14:37', '09:02:51', '10:27:08', '11:45:19', '14:03:44', '15:38:02', '16:51:26'];
export const HORA_MADRUGADA = ['01:47:12', '02:03:55', '02:31:40', '03:08:17', '03:44:09', '04:12:33'];
export const DATA = ['2026-03-09', '2026-03-17', '2026-04-06', '2026-04-22', '2026-05-11', '2026-06-02'];

/** IPs públicos de documentação (RFC 5737), nunca reais */
export const IP_EXTERNO = ['203.0.113.45', '203.0.113.187', '198.51.100.23', '198.51.100.140', '192.0.2.77', '192.0.2.201'];

export const USU_TABAJARA = ['marcia.kowalski', 'joao.wisniewski', 'fernanda.ribas', 'claudio.portela', 'luana.dalpra'];
export const USU_PREFEITURA = ['sebastiao.prado', 'gleice.amorim', 'valdir.tesoura', 'rosimeire.lopes', 'adalberto.n'];
export const USU_HOSPITAL = ['dra.helena.matos', 'enf.patricia', 'dr.otavio.reis', 'farm.jussara', 'recep.cleide'];
export const USU_COOPERATIVA = ['marlene.financeiro', 'tiago.silo', 'ana.contabil', 'osmar.compras'];
export const USU_PADARIA = ['bruna.ecommerce', 'carlos.loja04', 'debora.marketing', 'edu.ti'];
export const USU_INSONIA = ['pamela.n1', 'kevin.n1', 'brenda.n1', 'jefferson.n1', 'rosangela.n2'];
