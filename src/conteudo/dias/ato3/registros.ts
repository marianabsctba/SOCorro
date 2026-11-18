// Conjuntos de registros do Ato 3 para as missões do Vigia SIEM.
// Tudo determinístico: mesma semente, mesmos dados, sempre.
import type { Registro } from '../../tipos';
import { rng, ipInterno, ipExterno, hora, porHora, USUARIOS } from '../../util';

// ---------------------------------------------------------------------------
// Dia 62: ransomware no Hospital São Judas Tadeu, achar o paciente zero
// ---------------------------------------------------------------------------
export function registrosDia62(): Registro[] {
  const r = rng(6201);
  const base = '2026-03-14T00:00:00';
  const estacoes = ['DT-RECEP-04', 'DT-UTI-02', 'NB-ENF-11', 'DT-FARM-03', 'DT-LAB-07', 'DT-FAT-05', 'NB-DIR-HSJT', 'DT-PS-01'];
  const servidores = ['SRV-ARQ-HSJT', 'SRV-PRONT-01', 'SRV-PACS-01'];
  const normais: [string, string, string][] = [
    ['chrome.exe', 'explorer.exe', '"chrome.exe" --type=renderer'],
    ['ProntuarioPlus.exe', 'explorer.exe', 'ProntuarioPlus.exe /unidade=PS'],
    ['ProntuarioPlus.exe', 'explorer.exe', 'ProntuarioPlus.exe /unidade=UTI'],
    ['AcroRd32.exe', 'OUTLOOK.EXE', 'AcroRd32.exe "C:\\Users\\Public\\escala_plantao_marco.pdf"'],
    ['WINWORD.EXE', 'OUTLOOK.EXE', 'WINWORD.EXE /n "C:\\Users\\Public\\ata_comissao_infeccao.docx"'],
    ['EXCEL.EXE', 'OUTLOOK.EXE', 'EXCEL.EXE "C:\\Users\\Public\\estoque_farmacia.xlsx"'],
    ['PacsViewer.exe', 'explorer.exe', 'PacsViewer.exe --estudo=TC-CRANIO'],
    ['svchost.exe', 'services.exe', 'svchost.exe -k netsvcs -p'],
    ['Teams.exe', 'explorer.exe', 'Teams.exe --system-initiated'],
    ['SentinelaAgent.exe', 'services.exe', 'SentinelaAgent.exe --heartbeat'],
  ];
  const destinosOk = ['10.40.1.10:443', '10.40.1.20:1433', '10.40.1.30:104', '13.107.6.152:443', '200.160.2.3:443'];
  const out: Registro[] = [];

  for (let i = 0; i < 150; i++) {
    const [processo, pai, cmd] = r.um(normais);
    const servidor = processo === 'svchost.exe' || processo === 'SentinelaAgent.exe';
    out.push({
      hora: hora(base, r.int(0, 6 * 3600)),
      host: servidor && r.chance(0.5) ? r.um(servidores) : r.um(estacoes),
      usuario: servidor ? 'SYSTEM' : r.um(USUARIOS),
      evento: 1,
      processo,
      processo_pai: pai,
      linha_comando: cmd,
      destino: '-',
    });
  }
  for (let i = 0; i < 60; i++) {
    out.push({
      hora: hora(base, r.int(0, 6 * 3600)),
      host: r.um(estacoes),
      usuario: r.um(USUARIOS),
      evento: 3,
      processo: r.um(['chrome.exe', 'ProntuarioPlus.exe', 'PacsViewer.exe', 'Teams.exe']),
      processo_pai: 'explorer.exe',
      linha_comando: '-',
      destino: r.um(destinosOk),
    });
  }

  // a cadeia que importa
  const mal: Registro[] = [
    { hora: hora(base, 2 * 3600 + 13 * 60 + 7), host: 'DT-RECEP-04', usuario: 'aline.martins', evento: 1, processo: 'laudo_exame_0931.pdf.exe', processo_pai: 'OUTLOOK.EXE', linha_comando: '"C:\\Users\\aline.martins\\AppData\\Local\\Microsoft\\Windows\\INetCache\\Content.Outlook\\X7K2\\laudo_exame_0931.pdf.exe"', destino: '-' },
    { hora: hora(base, 2 * 3600 + 13 * 60 + 41), host: 'DT-RECEP-04', usuario: 'aline.martins', evento: 3, processo: 'laudo_exame_0931.pdf.exe', processo_pai: 'OUTLOOK.EXE', linha_comando: '-', destino: '179.61.204.33:443' },
    { hora: hora(base, 2 * 3600 + 41 * 60 + 2), host: 'DT-RECEP-04', usuario: 'aline.martins', evento: 1, processo: 'rundll32.exe', processo_pai: 'laudo_exame_0931.pdf.exe', linha_comando: 'rundll32.exe C:\\ProgramData\\cachehsjt\\upd.dll,Iniciar', destino: '-' },
    { hora: hora(base, 3 * 3600 + 5 * 60 + 30), host: 'DT-RECEP-04', usuario: 'aline.martins', evento: 1, processo: 'net.exe', processo_pai: 'cmd.exe', linha_comando: 'net group "Domain Admins" /domain', destino: '-' },
    { hora: hora(base, 4 * 3600 + 10 * 60 + 12), host: 'NB-ENF-11', usuario: 'vanessa.rocha', evento: 1, processo: 'laudo_exame_0931.pdf.exe', processo_pai: 'OUTLOOK.EXE', linha_comando: '"C:\\Users\\vanessa.rocha\\AppData\\Local\\Microsoft\\Windows\\INetCache\\Content.Outlook\\Q1M9\\laudo_exame_0931.pdf.exe"', destino: '-' },
    { hora: hora(base, 4 * 3600 + 52 * 60 + 3), host: 'SRV-ARQ-HSJT', usuario: 'adm.ti', evento: 1, processo: 'vssadmin.exe', processo_pai: 'cmd.exe', linha_comando: 'vssadmin delete shadows /all /quiet', destino: '-' },
  ];
  out.push(...mal);

  const alvos = ['SRV-ARQ-HSJT', 'SRV-ARQ-HSJT', 'SRV-ARQ-HSJT', 'DT-FAT-05', 'DT-UTI-02', 'DT-FARM-03', 'DT-LAB-07'];
  const pastas = ['Faturamento', 'Escalas', 'Laudos', 'Compras', 'RH', 'Qualidade'];
  for (let i = 0; i < 22; i++) {
    out.push({
      hora: hora(base, 4 * 3600 + 55 * 60 + i * r.int(20, 50)),
      host: r.um(alvos),
      usuario: 'adm.ti',
      evento: 11,
      processo: 'svhost32.exe',
      processo_pai: 'cmd.exe',
      linha_comando: '-',
      destino: '-',
      arquivo: `\\\\SRV-ARQ-HSJT\\${r.um(pastas)}\\documento_${r.int(100, 999)}.xlsx.sjt`,
    });
  }
  return porHora(out);
}

// ---------------------------------------------------------------------------
// Dia 65: EVTX no hospital, 1102, 4688 e 7045
// ---------------------------------------------------------------------------
export function registrosDia65(): Registro[] {
  const r = rng(6502);
  const base = '2026-03-13T18:00:00';
  const hosts = ['SRV-PRONT-01', 'SRV-PACS-01', 'SRV-ARQ-HSJT', 'SRV-LAB-01', 'SRV-FARM-01', 'SRV-DC-HSJT'];
  const out: Registro[] = [];
  for (let i = 0; i < 110; i++) {
    const h = r.um(hosts);
    const tipo = r.um([3, 3, 3, 5, 10]);
    out.push({
      hora: hora(base, r.int(0, 12 * 3600)),
      host: h,
      canal: 'Security',
      evento: 4624,
      usuario: tipo === 5 ? 'SYSTEM' : r.um(['svc_backup', 'svc_pacs', 'svc_prontuario', ...USUARIOS.slice(0, 5)]),
      tipo_logon: tipo,
      ip_origem: ipInterno(r, '10.40'),
    });
  }
  const procs: [string, string][] = [
    ['C:\\Windows\\System32\\svchost.exe', 'svchost.exe -k netsvcs -p'],
    ['C:\\Program Files\\ProntuarioPlus\\pp_sync.exe', 'pp_sync.exe --fila=laudos'],
    ['C:\\Program Files\\Sentinela\\SentinelaAgent.exe', 'SentinelaAgent.exe --heartbeat'],
    ['C:\\Windows\\System32\\taskhostw.exe', 'taskhostw.exe'],
    ['C:\\Program Files\\Veeam\\Backup\\VeeamAgent.exe', 'VeeamAgent.exe -job diario'],
  ];
  for (let i = 0; i < 90; i++) {
    const [proc, cmd] = r.um(procs);
    out.push({ hora: hora(base, r.int(0, 12 * 3600)), host: r.um(hosts), canal: 'Security', evento: 4688, usuario: 'SYSTEM', processo: proc, linha_comando: cmd });
  }
  // serviços legítimos (atualização do agente do EDR, com GMUD)
  for (const h of ['SRV-PRONT-01', 'SRV-PACS-01', 'SRV-ARQ-HSJT', 'SRV-FARM-01']) {
    out.push({ hora: hora(base, 3600 + r.int(0, 900)), host: h, canal: 'System', evento: 7045, usuario: 'SYSTEM', servico: 'SentinelaUpdater', imagem: 'C:\\Program Files\\Sentinela\\updater.exe', tipo_inicio: 'automático' });
  }
  // o que importa, em SRV-LAB-01
  out.push(
    { hora: hora(base, 9 * 3600 + 31 * 60 + 4), host: 'SRV-LAB-01', canal: 'Security', evento: 4624, usuario: 'adm.ti', tipo_logon: 3, ip_origem: '10.40.12.44' },
    { hora: hora(base, 9 * 3600 + 31 * 60 + 9), host: 'SRV-LAB-01', canal: 'System', evento: 7045, usuario: 'adm.ti', servico: 'SvcAtualizaLab', imagem: 'C:\\Windows\\Temp\\lab_upd.exe', tipo_inicio: 'sob demanda' },
    { hora: hora(base, 9 * 3600 + 31 * 60 + 12), host: 'SRV-LAB-01', canal: 'Security', evento: 4688, usuario: 'SYSTEM', processo: 'C:\\Windows\\Temp\\lab_upd.exe', linha_comando: 'lab_upd.exe -s' },
    { hora: hora(base, 9 * 3600 + 33 * 60 + 40), host: 'SRV-LAB-01', canal: 'Security', evento: 4688, usuario: 'adm.ti', processo: 'C:\\Windows\\System32\\wevtutil.exe', linha_comando: 'wevtutil cl Security' },
    { hora: hora(base, 9 * 3600 + 33 * 60 + 41), host: 'SRV-LAB-01', canal: 'Security', evento: 1102, usuario: 'adm.ti', detalhe: 'O log de auditoria foi apagado' },
  );
  return porHora(out);
}

// ---------------------------------------------------------------------------
// Dia 69: BEC na Cooperativa Agro Boi Gordo
// ---------------------------------------------------------------------------
export function registrosDia69(): Registro[] {
  const r = rng(6903);
  const base = '2026-03-23T07:00:00';
  const internos = ['leoncio', 'financeiro', 'compras', 'contabilidade', 'diretoria', 'silo.norte'];
  const out: Registro[] = [];
  const legit: [string, string, string][] = [
    ['nfe@pevermelho-fert.com.br', 'pevermelho-fert.com.br', 'NF-e 4471 emitida: Fertilizantes Pé Vermelho'],
    ['comercial@pevermelho-fert.com.br', 'pevermelho-fert.com.br', 'Tabela de preços safra 26/27'],
    ['avisos@sicooperativo.com.br', 'sicooperativo.com.br', 'Extrato mensal disponível'],
    ['noreply@agrotempo.com.br', 'agrotempo.com.br', 'Previsão: geada no norte do Paraná'],
    ['contato@revistaboigordo.com.br', 'revistaboigordo.com.br', 'Newsletter: o preço da arroba hoje'],
    ['rh@agroboigordo.coop.br', 'agroboigordo.coop.br', 'Escala de colheita'],
    ['ti@agroboigordo.coop.br', 'agroboigordo.coop.br', 'Lembrete: não clique em link de boleto'],
  ];
  for (let i = 0; i < 110; i++) {
    const [rem, dom, assunto] = r.um(legit);
    out.push({
      hora: hora(base, r.int(0, 3 * 24 * 3600)),
      remetente: rem,
      dominio_remetente: dom,
      destinatario: `${r.um(internos)}@agroboigordo.coop.br`,
      assunto,
      spf: 'pass',
      dkim: 'pass',
      dmarc: 'pass',
      reply_to: '-',
      idade_dominio_dias: dom === 'pevermelho-fert.com.br' ? 4410 : dom === 'agroboigordo.coop.br' ? 3650 : r.int(900, 6000),
      ip_origem: ipExterno(r),
    });
  }
  // spam que falha no DMARC, para ninguém achar que DMARC fail é sempre o golpe
  for (let i = 0; i < 9; i++) {
    out.push({
      hora: hora(base, r.int(0, 3 * 24 * 3600)),
      remetente: `promo${r.int(10, 99)}@ofertas-trator-barato.biz`,
      dominio_remetente: 'ofertas-trator-barato.biz',
      destinatario: `${r.um(internos)}@agroboigordo.coop.br`,
      assunto: 'Trator 0 km por R$ 99 (sério)',
      spf: 'fail',
      dkim: 'none',
      dmarc: 'fail',
      reply_to: '-',
      idade_dominio_dias: r.int(2, 30),
      ip_origem: ipExterno(r),
    });
  }
  // o golpe: domínio parecido, registrado há poucos dias, com SPF/DKIM/DMARC passando
  const golpe = { remetente: 'financeiro@pevermeiho-fert.com.br', dominio_remetente: 'pevermeiho-fert.com.br', spf: 'pass', dkim: 'pass', dmarc: 'pass', reply_to: 'financeiro.pevermelho@caixapostal-segura.net', idade_dominio_dias: 6, ip_origem: '91.214.63.18' };
  out.push(
    { hora: hora(base, 26 * 3600 + 14 * 60), destinatario: 'leoncio@agroboigordo.coop.br', assunto: 'RE: NF-e 4471 emitida: Fertilizantes Pé Vermelho', ...golpe },
    { hora: hora(base, 26 * 3600 + 52 * 60), destinatario: 'leoncio@agroboigordo.coop.br', assunto: 'URGENTE: atualização de dados bancários para pagamento', ...golpe },
    { hora: hora(base, 27 * 3600 + 30 * 60), destinatario: 'financeiro@agroboigordo.coop.br', assunto: 'RE: URGENTE: atualização de dados bancários para pagamento', ...golpe },
  );
  return porHora(out);
}

// ---------------------------------------------------------------------------
// Dia 73: hunting de beacon na Tabajara
// ---------------------------------------------------------------------------
export function registrosDia73(): Registro[] {
  const r = rng(7304);
  const base = '2026-03-27T09:00:00';
  const hosts = ['NB-FIN-014', 'NB-RH-007', 'DT-ATEND-031', 'NB-DIR-001', 'DT-TI-002', 'NB-COM-022', 'DT-CAIXA-05', 'NB-JUR-003'];
  const sites: [string, string][] = [
    ['portal.tabajaraseguros.com.br', 'Negócios'],
    ['sinistros.tabajaraseguros.com.br', 'Negócios'],
    ['www.receita.fazenda.gov.br', 'Governo'],
    ['noticias.exemplo.com.br', 'Notícias'],
    ['cdn.exemplo-imagens.net', 'CDN'],
    ['webmail.tabajaraseguros.com.br', 'Webmail'],
    ['clima.exemplo.com.br', 'Notícias'],
    ['loja-de-capinhas.exemplo.com', 'Compras'],
    ['receitas-da-vovo.exemplo.com', 'Entretenimento'],
    ['susep.gov.br', 'Governo'],
    ['atendimento-corretor.exemplo.com.br', 'Não categorizado'],
    ['blog-do-ze-planilhas.exemplo.net', 'Não categorizado'],
  ];
  const out: Registro[] = [];
  for (let i = 0; i < 150; i++) {
    const [destino, categoria] = r.um(sites);
    out.push({ hora: hora(base, r.int(0, 2 * 3600)), host: r.um(hosts), destino, porta: 443, categoria, bytes_enviados: r.int(400, 9000), bytes_recebidos: r.int(2000, 900000) });
  }
  // telemetria do EDR: periódica, mas em todos os hosts e conhecida
  for (const h of hosts) {
    for (let k = 0; k < 4; k++) {
      out.push({ hora: hora(base, k * 1800 + r.int(0, 20)), host: h, destino: 'telemetria.sentinela-edr.exemplo', porta: 443, categoria: 'Segurança', bytes_enviados: r.int(1500, 2500), bytes_recebidos: r.int(300, 800) });
    }
  }
  // rádio online no atendimento: muita conexão, tamanho variável, categoria conhecida
  for (let k = 0; k < 34; k++) {
    out.push({ hora: hora(base, r.int(0, 2 * 3600)), host: 'DT-ATEND-031', destino: 'stream.radio-sertaneja.exemplo', porta: 443, categoria: 'Streaming', bytes_enviados: r.int(300, 1200), bytes_recebidos: r.int(200000, 1500000) });
  }
  // o beacon: a cada ~300 s com jitter, tamanho quase constante
  let t = 120;
  for (let k = 0; k < 24; k++) {
    out.push({ hora: hora(base, t), host: 'NB-COM-022', destino: 'cdn.planilha-segura.top', porta: 443, categoria: 'Não categorizado', bytes_enviados: r.um([412, 412, 418]), bytes_recebidos: r.um([230, 230, 230, 4812]) });
    t += 300 + r.int(-30, 30);
  }
  return porHora(out);
}

// ---------------------------------------------------------------------------
// Dia 80: token roubado no M365 da Tabajara
// ---------------------------------------------------------------------------
export function registrosDia80(): Registro[] {
  const r = rng(8005);
  const base = '2026-04-03T07:00:00';
  const apps = ['Exchange Online', 'SharePoint Online', 'Microsoft Teams', 'Portal do Corretor'];
  const cidades = ['Curitiba', 'Curitiba', 'Curitiba', 'São José dos Pinhais', 'Londrina'];
  const out: Registro[] = [];
  for (let i = 0; i < 170; i++) {
    const interativo = r.chance(0.3);
    out.push({
      hora: hora(base, r.int(0, 10 * 3600)),
      usuario: r.um(USUARIOS),
      app: r.um(apps),
      tipo: interativo ? 'interativo' : 'não interativo',
      ip: `200.150.${r.int(10, 12)}.${r.int(2, 250)}`,
      pais: 'BR',
      cidade: r.um(cidades),
      resultado: r.chance(0.06) ? 'falha' : 'sucesso',
      mfa: interativo ? 'aprovado no app' : 'token existente',
      dispositivo_conforme: 'sim',
    });
  }
  // viagem legítima: Lisboa, notebook corporativo conforme
  for (let i = 0; i < 8; i++) {
    out.push({ hora: hora(base, r.int(0, 10 * 3600)), usuario: 'paulo.rodrigues', app: r.um(apps), tipo: i === 0 ? 'interativo' : 'não interativo', ip: '194.65.37.20', pais: 'PT', cidade: 'Lisboa', resultado: 'sucesso', mfa: i === 0 ? 'aprovado no app' : 'token existente', dispositivo_conforme: 'sim' });
  }
  // barulho de internet: tentativas que falham
  for (let i = 0; i < 12; i++) {
    out.push({ hora: hora(base, r.int(0, 10 * 3600)), usuario: r.um(USUARIOS), app: 'Exchange Online', tipo: 'interativo', ip: ipExterno(r), pais: r.um(['US', 'RU', 'VN', 'NL']), cidade: '-', resultado: 'falha', mfa: 'não chegou lá', dispositivo_conforme: 'nao' });
  }
  // AiTM: login com MFA pelo proxy de phishing e depois o token reaproveitado de outro lugar
  out.push({ hora: hora(base, 2 * 3600 + 12 * 60), usuario: 'camila.ribeiro', app: 'Exchange Online', tipo: 'interativo', ip: '167.94.12.201', pais: 'US', cidade: 'Ashburn', resultado: 'sucesso', mfa: 'aprovado no app', dispositivo_conforme: 'nao' });
  for (let k = 0; k < 16; k++) {
    out.push({ hora: hora(base, 2 * 3600 + 14 * 60 + k * r.int(90, 240)), usuario: 'camila.ribeiro', app: r.um(['Exchange Online', 'SharePoint Online']), tipo: 'não interativo', ip: '103.75.118.9', pais: 'NL', cidade: 'Amsterdã', resultado: 'sucesso', mfa: 'token existente', dispositivo_conforme: 'nao' });
  }
  return porHora(out);
}

// ---------------------------------------------------------------------------
// Dia 87: a quadrilha volta na VPN da Prefeitura de Pindaíba do Sul
// ---------------------------------------------------------------------------
export function registrosDia87(): Registro[] {
  const r = rng(8706);
  const base = '2026-04-10T19:00:00';
  const servidores = ['protocolo.geral', 'tributos.iptu', 'saude.ubs', 'obras.fiscal', 'gabinete.vereador', 'educacao.merenda', 'rh.folha', 'ti.suporte'];
  const todos = [...USUARIOS, ...servidores];
  const out: Registro[] = [];
  for (let i = 0; i < 120; i++) {
    const falha = r.chance(0.08);
    out.push({
      hora: hora(base, r.int(0, 8 * 3600)),
      usuario: r.um(todos),
      ip_origem: `189.40.${r.int(1, 90)}.${r.int(2, 250)}`,
      pais: 'BR',
      resultado: falha ? 'falha' : 'sucesso',
      motivo: falha ? 'senha incorreta' : 'ok',
      cliente_vpn: 'FortiClient 7.2',
    });
  }
  // spray lento a partir de dois IPs: um usuário por tentativa, todo mundo uma vez
  const spray = (ip: string, inicio: number, alvos: string[]) => {
    alvos.forEach((u, k) => {
      out.push({ hora: hora(base, inicio + k * r.int(40, 70)), usuario: u, ip_origem: ip, pais: 'BR', resultado: 'falha', motivo: 'senha incorreta', cliente_vpn: 'openconnect' });
    });
  };
  spray('186.231.77.140', 2 * 3600, todos.slice(0, 20));
  spray('152.89.47.120', 3 * 3600, todos.filter((u) => u !== 'tributos.iptu'));
  out.push(
    { hora: hora(base, 3 * 3600 + 22 * 60 + 5), usuario: 'tributos.iptu', ip_origem: '152.89.47.120', pais: 'BR', resultado: 'sucesso', motivo: 'ok', cliente_vpn: 'openconnect' },
    { hora: hora(base, 5 * 3600 + 3 * 60), usuario: 'tributos.iptu', ip_origem: '152.89.47.120', pais: 'BR', resultado: 'sucesso', motivo: 'ok', cliente_vpn: 'openconnect' },
  );
  return porHora(out);
}
