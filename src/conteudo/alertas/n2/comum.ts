// Ajudantes e listas compartilhadas pelos alertas de N2 e N3.
import type { Justificativa } from '../../tipos';

/** monta as justificativas: `certa` é o índice (0 em diante) da única certa */
export function js(certa: number, ...textos: string[]): Justificativa[] {
  return textos.map((texto, i) => ({ texto, certa: i === certa }));
}

export const HORA = ['08:21:44', '09:47:03', '10:12:39', '11:58:20', '14:26:51', '15:09:12', '17:33:08'];
export const MADRUGADA = ['00:52:18', '01:39:07', '02:14:46', '02:58:31', '03:27:55', '04:41:02'];
export const DATA = ['2026-06-15', '2026-06-23', '2026-07-02', '2026-07-14', '2026-07-29', '2026-08-05'];
export const DATA3 = ['2026-08-18', '2026-08-26', '2026-09-03', '2026-09-15', '2026-09-24', '2026-10-07'];

/** IPs públicos de documentação (RFC 5737), nunca reais */
export const IP_EXT = ['203.0.113.45', '203.0.113.188', '198.51.100.23', '198.51.100.142', '192.0.2.77', '192.0.2.203'];
/** IPs internos por cliente, nas faixas do CMDB: 10.10 Tabajara, 10.20 Prefeitura, 10.30 Hospital, 10.40 Cooperativa, 10.50 Padaria, 10.60 Insônia */
export const IP_INT = ['10.20.4.31', '10.20.7.112', '10.20.12.58', '10.20.3.204', '10.20.9.17'];
export const IP_TAB = ['10.10.4.31', '10.10.7.112', '10.10.12.58', '10.10.3.204', '10.10.9.17'];
export const IP_HOSP = ['10.30.4.31', '10.30.7.112', '10.30.12.58', '10.30.3.204', '10.30.9.17'];
export const IP_COOP = ['10.40.4.31', '10.40.7.112', '10.40.12.58', '10.40.3.204'];
export const IP_INS = ['10.60.1.21', '10.60.1.22', '10.60.1.35'];

export const U_TAB = ['marcia.kowalski', 'joao.wisniewski', 'fernanda.ribas', 'claudio.portela', 'luana.dalpra'];
export const U_PREF = ['sebastiao.prado', 'gleice.amorim', 'valdir.tesoura', 'rosimeire.lopes', 'adalberto.n'];
export const U_HOSP = ['dra.helena.matos', 'enf.patricia', 'dr.otavio.reis', 'farm.jussara', 'recep.cleide'];
export const U_COOP = ['marlene.financeiro', 'tiago.silo', 'ana.contabil', 'osmar.compras'];
export const U_PAD = ['bruna.ecommerce', 'carlos.loja04', 'debora.marketing', 'edu.ti'];
export const U_INS = ['pamela.n1', 'kevin.n1', 'brenda.n1', 'jefferson.n1'];

export const GMUD = ['4471', '4502', '4519', '4533', '4560'];
