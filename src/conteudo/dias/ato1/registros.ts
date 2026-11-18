// Conjuntos de registros das missões de SIEM do Ato 1. Sementes fixas: os dados são sempre os mesmos.
import type { Registro } from '../../tipos';
import { rng, ipInterno, ipExterno, hora, porHora, USUARIOS, HOSTS } from '../../util';

const ESTACOES = HOSTS.filter((h) => !h.startsWith('SRV'));

/** dia 4: logons no Windows, com um RDP vindo de fora escondido no meio */
export function logonsDia4(): Registro[] {
  const r = rng(404);
  const base = '2026-03-04T06:00:00';
  const out: Registro[] = [];
  for (let i = 0; i < 70; i++) {
    const usuario = r.um(USUARIOS);
    const t = r.int(0, 11 * 3600);
    const tipo = r.um([2, 2, 3, 3, 3, 3, 7, 7]);
    const host = tipo === 3 ? r.um(['SRV-ARQ-01', 'SRV-SQL-02', 'SRV-DC-01']) : r.um(ESTACOES);
    out.push({ hora: hora(base, t), evento: 4624, usuario, host, ip_origem: tipo === 2 || tipo === 7 ? '127.0.0.1' : ipInterno(r), tipo_logon: tipo });
    if (r.chance(0.4)) out.push({ hora: hora(base, t + r.int(600, 7200)), evento: 4634, usuario, host, ip_origem: '-', tipo_logon: tipo });
  }
  for (let i = 0; i < 8; i++) {
    const usuario = r.um(USUARIOS);
    out.push({ hora: hora(base, r.int(3600, 30000)), evento: 4625, usuario, host: r.um(ESTACOES), ip_origem: '127.0.0.1', tipo_logon: 2 });
  }
  // RDP legítimo do time de TI, de dentro da rede
  for (const [t, host] of [[10800, 'SRV-ARQ-01'], [18000, 'SRV-SQL-02'], [26000, 'SRV-DC-01']] as const) {
    out.push({ hora: hora(base, t), evento: 4624, usuario: 'adm.marcos.gomes', host, ip_origem: '10.20.1.15', tipo_logon: 10 });
    out.push({ hora: hora(base, t + 2), evento: 4672, usuario: 'adm.marcos.gomes', host, ip_origem: '-', tipo_logon: '-' });
  }
  // o achado: RDP de IP público às 3h, com privilégio especial logo depois
  out.push({ hora: '2026-03-04T03:12:41Z', evento: 4625, usuario: 'paulo.rodrigues', host: 'SRV-SQL-02', ip_origem: '185.143.77.20', tipo_logon: 10 });
  out.push({ hora: '2026-03-04T03:13:05Z', evento: 4624, usuario: 'paulo.rodrigues', host: 'SRV-SQL-02', ip_origem: '185.143.77.20', tipo_logon: 10 });
  out.push({ hora: '2026-03-04T03:13:06Z', evento: 4672, usuario: 'paulo.rodrigues', host: 'SRV-SQL-02', ip_origem: '-', tipo_logon: '-' });
  out.push({ hora: '2026-03-04T03:58:30Z', evento: 4634, usuario: 'paulo.rodrigues', host: 'SRV-SQL-02', ip_origem: '-', tipo_logon: 10 });
  return porHora(out);
}

/** dia 5: força bruta num usuário só e password spraying em muitos usuários */
export function falhasDia5(): Registro[] {
  const r = rng(505);
  const base = '2026-03-05T07:00:00';
  const out: Registro[] = [];
  // gente de verdade errando a senha às segundas
  for (let i = 0; i < 25; i++) {
    const usuario = r.um(USUARIOS);
    const ip = ipInterno(r);
    const t = r.int(0, 30000);
    const n = r.int(1, 3);
    for (let k = 0; k < n; k++) {
      const kerb = r.chance(0.5);
      out.push({ hora: hora(base, t + k * 20), evento: kerb ? 4771 : 4625, usuario, host: 'SRV-DC-01', ip_origem: ip, status: kerb ? '0x18' : '0xC000006A', servico: kerb ? 'Kerberos' : 'OWA' });
    }
    out.push({ hora: hora(base, t + n * 20 + 15), evento: 4624, usuario, host: 'SRV-DC-01', ip_origem: ip, status: '0x0', servico: 'OWA' });
  }
  // força bruta barulhenta: um IP, um usuário, muitas tentativas
  for (let k = 0; k < 30; k++) {
    out.push({ hora: hora('2026-03-05T09:40:00', k * 3), evento: 4625, usuario: 'administrador', host: 'SRV-DC-01', ip_origem: '191.36.150.4', status: '0xC000006A', servico: 'OWA' });
  }
  out.push({ hora: '2026-03-05T09:41:35Z', evento: 4740, usuario: 'administrador', host: 'SRV-DC-01', ip_origem: '191.36.150.4', status: 'bloqueada', servico: 'AD' });
  // password spraying: um IP, uma senha, muitos usuários, devagar
  const alvos = [...USUARIOS];
  alvos.forEach((usuario, k) => {
    out.push({ hora: hora('2026-03-05T11:02:00', k * 95 + r.int(0, 30)), evento: 4625, usuario, host: 'SRV-DC-01', ip_origem: '179.124.33.208', status: '0xC000006A', servico: 'OWA' });
  });
  out.push({ hora: '2026-03-05T11:31:10Z', evento: 4625, usuario: 'estagiario.ti', host: 'SRV-DC-01', ip_origem: '179.124.33.208', status: '0xC0000064', servico: 'OWA' });
  out.push({ hora: '2026-03-05T11:33:44Z', evento: 4625, usuario: 'impressora.3andar', host: 'SRV-DC-01', ip_origem: '179.124.33.208', status: '0xC0000064', servico: 'OWA' });
  return porHora(out);
}

/** dia 9: proxy com muita música e um domínio sem categoria engolindo dados */
export function proxyDia9(): Registro[] {
  const r = rng(909);
  const base = '2026-03-11T08:00:00';
  const destinos: [string, string, string][] = [
    ['open.spotify.com', 'Streaming de áudio', '/track'],
    ['audio-ak-spotify-com.akamaized.net', 'Streaming de áudio', '/audio'],
    ['www.youtube.com', 'Streaming de vídeo', '/watch'],
    ['outlook.office365.com', 'Webmail', '/mail'],
    ['teams.microsoft.com', 'Colaboração', '/api/chat'],
    ['www.gov.br', 'Governo', '/receitafederal'],
    ['internetbanking.bancoexemplo.com.br', 'Financeiro', '/login'],
    ['g1.globo.com', 'Notícias', '/pr/parana'],
    ['www.mercadolivre.com.br', 'Compras', '/ofertas'],
    ['portal-corretora-parceira.com.br', 'Desconhecida', '/cotacao'],
  ];
  const out: Registro[] = [];
  for (let i = 0; i < 120; i++) {
    const [dominio, categoria, caminho] = r.um(destinos);
    const streaming = categoria.startsWith('Streaming');
    out.push({
      hora: hora(base, r.int(0, 9 * 3600)),
      usuario: r.um(USUARIOS),
      host: r.um(ESTACOES),
      metodo: dominio.startsWith('portal') && r.chance(0.5) ? 'POST' : 'GET',
      dominio,
      url: `https://${dominio}${caminho}`,
      categoria,
      status: 200,
      bytes_enviados: r.int(300, 2500),
      bytes_recebidos: streaming ? r.int(2_000_000, 9_000_000) : r.int(5_000, 400_000),
    });
  }
  // o achado: POST periódico, a cada 5 minutos, mandando muito mais do que recebe
  for (let k = 0; k < 18; k++) {
    out.push({
      hora: hora('2026-03-11T10:00:00', k * 300 + r.int(0, 8)),
      usuario: 'maria.souza',
      host: 'NB-FIN-014',
      metodo: 'POST',
      dominio: 'atualiza-certificado.top',
      url: 'https://atualiza-certificado.top/api/sync',
      categoria: 'Desconhecida',
      status: 200,
      bytes_enviados: r.int(180_000, 260_000),
      bytes_recebidos: r.int(200, 400),
    });
  }
  return porHora(out);
}

const B32 = 'abcdefghijklmnopqrstuvwxyz234567';
function rotulo(r: ReturnType<typeof rng>, n: number): string {
  let s = '';
  for (let i = 0; i < n; i++) s += B32[r.int(0, B32.length - 1)];
  return s;
}

/** dia 10: DNS com CDN de nome comprido (normal) e túnel por TXT (não normal) */
export function dnsDia10(): Registro[] {
  const r = rng(1010);
  const base = '2026-03-12T13:00:00';
  const comuns = ['www.google.com', 'outlook.office365.com', 'login.microsoftonline.com', 'www.tabajaraseguros.com.br', 'wpad.tabajara.local', 'srv-arq-01.tabajara.local', 'api.whatsapp.net', 'g1.globo.com'];
  const out: Registro[] = [];
  for (let i = 0; i < 110; i++) {
    const consulta = r.um(comuns);
    const partes = consulta.split('.');
    out.push({ hora: hora(base, r.int(0, 4 * 3600)), host: r.um(ESTACOES), consulta, tipo: r.chance(0.8) ? 'A' : 'AAAA', dominio: partes.slice(-2).join('.'), tamanho_sub: partes.slice(0, -2).join('.').length });
  }
  // CDN: nome comprido, mas sempre os mesmos poucos nomes, tipo A
  const cdn = [0, 1, 2].map(() => `${rotulo(r, 34)}.imagens.cdn-exemplo.net`);
  for (let i = 0; i < 30; i++) {
    const consulta = r.um(cdn);
    out.push({ hora: hora(base, r.int(0, 4 * 3600)), host: r.um(ESTACOES), consulta, tipo: 'A', dominio: 'cdn-exemplo.net', tamanho_sub: consulta.length - 'cdn-exemplo.net'.length - 1 });
  }
  // túnel: um host, TXT, cada consulta é um pedaço diferente de dado
  for (let k = 0; k < 40; k++) {
    const sub = `${rotulo(r, 52)}.${k.toString(16)}`;
    out.push({ hora: hora('2026-03-12T14:20:00', k * 7), host: 'DT-ATEND-031', consulta: `${sub}.relatorio-sync.xyz`, tipo: 'TXT', dominio: 'relatorio-sync.xyz', tamanho_sub: sub.length });
  }
  // um TXT legítimo para não ficar fácil demais
  for (let k = 0; k < 4; k++) out.push({ hora: hora(base, r.int(0, 4 * 3600)), host: 'SRV-ARQ-01', consulta: '_dmarc.tabajaraseguros.com.br', tipo: 'TXT', dominio: 'tabajaraseguros.com.br', tamanho_sub: 6 });
  return porHora(out);
}

/** dia 14: firewall de borda com varredura de portas no meio do ruído da internet */
export function firewallDia14(): Registro[] {
  const r = rng(1414);
  const base = '2026-03-18T00:00:00';
  const out: Registro[] = [];
  const publicos = ['200.150.10.5', '200.150.10.6', '200.150.10.20'];
  // tráfego permitido para os serviços publicados
  for (let i = 0; i < 60; i++) {
    out.push({ hora: hora(base, r.int(0, 86000)), acao: 'allow', ip_origem: ipExterno(r), ip_destino: r.um(publicos), porta_destino: r.um([443, 443, 443, 80, 25]), protocolo: 'TCP', regra: 'PUBLICADOS' });
  }
  // ruído de fundo da internet: cada IP tenta uma ou duas portas clássicas
  for (let i = 0; i < 45; i++) {
    const ip = ipExterno(r);
    const n = r.int(1, 2);
    for (let k = 0; k < n; k++) out.push({ hora: hora(base, r.int(0, 86000)), acao: 'deny', ip_origem: ip, ip_destino: r.um(publicos), porta_destino: r.um([22, 23, 3389, 445, 1433, 8080]), protocolo: 'TCP', regra: 'NEGA-TUDO' });
  }
  // armadilha: muito volume, uma porta só (verme antigo batendo no 445)
  for (let k = 0; k < 35; k++) out.push({ hora: hora('2026-03-18T04:00:00', k * 41), acao: 'deny', ip_origem: '186.215.40.99', ip_destino: r.um(publicos), porta_destino: 445, protocolo: 'TCP', regra: 'NEGA-TUDO' });
  // o achado: um IP, um destino, muitas portas diferentes em poucos segundos
  const portas = [21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 161, 389, 443, 445, 465, 587, 631, 993, 995, 1080, 1433, 1521, 1723, 2049, 2082, 3000, 3306, 3389, 5060, 5432, 5900, 5985, 6379, 8000, 8080, 8443, 8888, 9000, 9200, 10000, 27017];
  portas.forEach((p, k) => out.push({ hora: hora('2026-03-18T02:17:00', k), acao: p === 443 || p === 80 ? 'allow' : 'deny', ip_origem: '103.77.21.9', ip_destino: '200.150.10.5', porta_destino: p, protocolo: 'TCP', regra: p === 443 || p === 80 ? 'PUBLICADOS' : 'NEGA-TUDO' }));
  return porHora(out);
}

/** dia 18: WAF da padaria na Black Friday, com credential stuffing de botnet */
export function wafDia18(): Registro[] {
  const r = rng(1818);
  const base = '2026-11-27T00:00:00';
  const uas = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',
  ];
  const nomes = ['ana', 'bia', 'caio', 'davi', 'edu', 'fabi', 'gui', 'helo', 'igor', 'jana', 'leo', 'malu', 'nina', 'otavio', 'rafa', 'sueli', 'tati', 'vini'];
  const out: Registro[] = [];
  for (let i = 0; i < 90; i++) {
    const usuario = `${r.um(nomes)}${r.int(10, 99)}@exemplo.com.br`;
    const ua = r.um(uas);
    const ip = ipExterno(r);
    const t = r.int(0, 3 * 3600);
    const url = r.um(['/produto/sonho-de-creme', '/produto/sonho-de-doce-de-leite', '/carrinho', '/conta/login', '/conta/login', '/checkout']);
    const errou = url === '/conta/login' && r.chance(0.2);
    out.push({ hora: hora(base, t), ip_origem: ip, metodo: url === '/conta/login' || url === '/checkout' ? 'POST' : 'GET', url, status: errou ? 401 : 200, usuario: url === '/conta/login' ? usuario : '-', user_agent: ua, pais: 'BR' });
  }
  // a botnet: muitos IPs, o mesmo navegador velho, uma lista de e-mails vazados
  const botUa = 'Mozilla/5.0 (Windows NT 6.1; rv:45.0) Gecko/20100101 Firefox/45.0';
  const botIps = Array.from({ length: 25 }, () => ipExterno(r));
  for (let k = 0; k < 70; k++) {
    out.push({ hora: hora('2026-11-27T01:10:00', k * 4 + r.int(0, 3)), ip_origem: r.um(botIps), metodo: 'POST', url: '/conta/login', status: 401, usuario: `${r.um(nomes)}${r.int(1950, 2005)}@exemplo.com.br`, user_agent: botUa, pais: r.um(['BR', 'US', 'VN', 'NL', 'ID']) });
  }
  out.push({ hora: '2026-11-27T01:13:31Z', ip_origem: botIps[7], metodo: 'POST', url: '/conta/login', status: 200, usuario: 'regina.prado@exemplo.com.br', user_agent: botUa, pais: 'NL' });
  return porHora(out);
}

/** dia 21: Sysmon de uma estação do RH que recebeu um "currículo" */
export function sysmonDia21(): Registro[] {
  const r = rng(2121);
  const base = '2026-03-25T08:30:00';
  const out: Registro[] = [];
  const procs = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE', 'C:\\Users\\ana.oliveira\\AppData\\Local\\Microsoft\\Teams\\current\\Teams.exe', 'C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe'];
  for (let i = 0; i < 40; i++) {
    const p = r.um(procs);
    out.push({ hora: hora(base, r.int(0, 4 * 3600)), evento: 3, host: r.um(['NB-RH-007', 'DT-ATEND-031', 'NB-COM-022']), processo: p, ip_destino: r.um(['52.96.40.18', '142.250.79.14', '13.107.42.14', '20.190.160.2']), porta_destino: 443 });
  }
  for (let i = 0; i < 25; i++) {
    out.push({ hora: hora(base, r.int(0, 4 * 3600)), evento: 22, host: r.um(['NB-RH-007', 'DT-ATEND-031', 'NB-COM-022']), processo: r.um(procs), consulta: r.um(['outlook.office365.com', 'www.google.com', 'teams.microsoft.com', 'onedrive.live.com']) });
  }
  for (let i = 0; i < 15; i++) {
    out.push({ hora: hora(base, r.int(0, 4 * 3600)), evento: 11, host: r.um(['NB-RH-007', 'NB-COM-022']), processo: procs[0], arquivo_alvo: `C:\\Users\\ana.oliveira\\Downloads\\${r.um(['holerite_marco', 'planilha_ferias', 'manual_integracao', 'apolice_modelo'])}.pdf` });
  }
  for (let i = 0; i < 6; i++) {
    out.push({ hora: hora(base, r.int(0, 4 * 3600)), evento: 1, host: r.um(['NB-RH-007', 'NB-COM-022']), processo: r.um(procs), processo_pai: 'C:\\Windows\\explorer.exe', linha_comando: '"' + r.um(procs) + '"' });
  }
  out.push({ hora: hora(base, 1200), evento: 13, host: 'NB-RH-007', processo: procs[3], objeto_alvo: 'HKU\\S-1-5-21-1004\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\OneDrive' });
  // a cadeia: download, execução, DNS, conexão e persistência
  const exe = 'C:\\Users\\ana.oliveira\\AppData\\Local\\Temp\\curriculo_ana_2026.exe';
  out.push({ hora: '2026-03-25T10:41:02Z', evento: 11, host: 'NB-RH-007', processo: procs[1], arquivo_alvo: exe });
  out.push({ hora: '2026-03-25T10:41:09Z', evento: 1, host: 'NB-RH-007', processo: exe, processo_pai: procs[1], linha_comando: `"${exe}"` });
  out.push({ hora: '2026-03-25T10:41:11Z', evento: 22, host: 'NB-RH-007', processo: exe, consulta: 'rh-vagas-curitiba.top' });
  out.push({ hora: '2026-03-25T10:41:12Z', evento: 3, host: 'NB-RH-007', processo: exe, ip_destino: '194.87.45.12', porta_destino: 443 });
  out.push({ hora: '2026-03-25T10:41:15Z', evento: 13, host: 'NB-RH-007', processo: exe, objeto_alvo: 'HKU\\S-1-5-21-1004\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\AtualizadorCurriculo' });
  return porHora(out);
}

/** dia 26: pushes de MFA, com um bombardeio de madrugada */
export function mfaDia26(): Registro[] {
  const r = rng(2626);
  const base = '2026-04-01T07:00:00';
  const out: Registro[] = [];
  for (let i = 0; i < 70; i++) {
    out.push({ hora: hora(base, r.int(0, 11 * 3600)), usuario: r.um(USUARIOS), app: r.um(['Outlook', 'VPN', 'Portal RH', 'Teams']), resultado: r.chance(0.9) ? 'aprovado' : r.um(['negado', 'sem_resposta']), ip_origem: r.um(['200.150.10.1', ipInterno(r)]), cidade: 'Curitiba' });
  }
  // alguém que esqueceu o celular na mesa e tem três pushes sem resposta: chato, mas normal
  for (let k = 0; k < 3; k++) out.push({ hora: hora('2026-04-01T14:00:00', k * 200), usuario: 'bruno.carvalho', app: 'Outlook', resultado: 'sem_resposta', ip_origem: '200.150.10.1', cidade: 'Curitiba' });
  // o bombardeio: senha certa, push atrás de push, até a pessoa ceder
  for (let k = 0; k < 22; k++) {
    out.push({ hora: hora('2026-04-01T02:10:00', k * 75 + r.int(0, 20)), usuario: 'juliana.santos', app: 'VPN', resultado: r.chance(0.6) ? 'negado' : 'sem_resposta', ip_origem: '77.91.124.56', cidade: 'Amsterdã' });
  }
  out.push({ hora: '2026-04-01T02:39:58Z', usuario: 'juliana.santos', app: 'VPN', resultado: 'aprovado', ip_origem: '77.91.124.56', cidade: 'Amsterdã' });
  return porHora(out);
}
