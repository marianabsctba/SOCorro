// Ato 2, dias 39 a 45: EDR, tuning do falso Mimikatz, enriquecimento, exfiltração, persistência, webshell e a queda do Alfa.
import type { Dia, Registro } from '../../tipos';
import { rng, hora, porHora, HOSTS } from '../../util';

// ---------- dia 40: o "Mimikatz" que é o antivírus ----------
function registrosLsass(): (Registro & { malicioso: 0 | 1 })[] {
  const r = rng(4001);
  const base = '2026-03-10T07:00:00';
  const lsass = 'C:\\Windows\\System32\\lsass.exe';
  const out: (Registro & { malicioso: 0 | 1 })[] = [];
  for (let i = 0; i < 30; i++) {
    out.push({ hora: hora(base, r.int(0, 40000)), evento: 10, host: r.um(HOSTS), origem_imagem: 'C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\4.18.24090.11-0\\MsMpEng.exe', alvo_imagem: lsass, acesso: r.um(['0x1010', '0x1410']), assinatura: 'Microsoft Corporation', usuario: 'NT AUTHORITY\\SYSTEM', malicioso: 0 });
  }
  for (let i = 0; i < 20; i++) {
    out.push({ hora: hora(base, r.int(0, 40000)), evento: 10, host: r.um(HOSTS), origem_imagem: 'C:\\Program Files\\Guarita\\guarita-agent.exe', alvo_imagem: lsass, acesso: '0x1410', assinatura: 'Guarita Segurança Ltda.', usuario: 'NT AUTHORITY\\SYSTEM', malicioso: 0 });
  }
  for (let i = 0; i < 6; i++) {
    out.push({ hora: hora(base, r.int(0, 40000)), evento: 10, host: r.um(['SRV-ARQ-01', 'SRV-SQL-02', 'SRV-DC-01']), origem_imagem: 'C:\\Windows\\System32\\wbem\\WmiPrvSE.exe', alvo_imagem: lsass, acesso: '0x1400', assinatura: 'Microsoft Corporation', usuario: 'NT AUTHORITY\\NETWORK SERVICE', malicioso: 0 });
  }
  out.push({ hora: hora(base, 23000), evento: 10, host: 'SRV-ARQ-01', origem_imagem: 'C:\\Windows\\System32\\rundll32.exe', alvo_imagem: lsass, acesso: '0x1FFFFF', assinatura: 'Microsoft Corporation', usuario: 'TABAJARA\\suporte.ti', malicioso: 1 });
  out.push({ hora: hora(base, 23400), evento: 10, host: 'NB-FIN-014', origem_imagem: 'C:\\Users\\Public\\MsMpEng.exe', alvo_imagem: lsass, acesso: '0x1010', assinatura: 'não assinado', usuario: 'TABAJARA\\ana.oliveira', malicioso: 1 });
  return porHora(out);
}

// ---------- dia 42: exfiltração ----------
function registrosExfil(): Registro[] {
  const r = rng(4201);
  const out: Registro[] = [];
  const destinos = ['portal.tabajara.exemplo', 'outlook.office365.com', 'teams.microsoft.com', 'www.gov.br', 'cdn.jsdelivr.net', 'www.youtube.com', 'api.bcb.gov.br', 'sinistros.tabajara.exemplo'];
  const estacoes = HOSTS.filter((h) => !h.startsWith('SRV'));
  for (let i = 0; i < 150; i++) {
    const hl = r.int(8, 18);
    out.push({ hora: `2026-03-12T${String(hl + 3).padStart(2, '0')}:${String(r.int(0, 59)).padStart(2, '0')}:${String(r.int(0, 59)).padStart(2, '0')}Z`, hora_local: hl, host: r.um(estacoes), destino: r.um(destinos), porta: 443, protocolo: 'HTTPS', bytes_enviados: r.int(500, 90000), bytes_recebidos: r.int(10000, 5000000) });
  }
  for (let i = 0; i < 15; i++) {
    const hl = r.int(0, 5);
    out.push({ hora: `2026-03-12T${String(hl + 3).padStart(2, '0')}:${String(r.int(0, 59)).padStart(2, '0')}:00Z`, hora_local: hl, host: r.um(HOSTS), destino: r.um(['download.windowsupdate.com', 'update.guarita-edr.exemplo']), porta: 443, protocolo: 'HTTPS', bytes_enviados: r.int(1500, 6000), bytes_recebidos: r.int(5000000, 90000000) });
  }
  for (let i = 0; i < 8; i++) {
    out.push({ hora: `2026-03-12T04:${String(i * 7).padStart(2, '0')}:00Z`, hora_local: 1, host: 'SRV-ARQ-01', destino: 'backup.insonia-nuvem.exemplo', porta: 443, protocolo: 'HTTPS', bytes_enviados: r.int(2000000000, 4000000000), bytes_recebidos: r.int(20000, 90000) });
  }
  for (let i = 0; i < 20; i++) {
    const min = 10 + i * 6;
    const hl = 2 + Math.floor(min / 60);
    out.push({ hora: `2026-03-12T${String(hl + 3).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}:${String(r.int(0, 59)).padStart(2, '0')}Z`, hora_local: hl, host: 'NB-FIN-014', destino: 'nuvem-arquivo-gratis.top', porta: 443, protocolo: 'HTTPS', bytes_enviados: r.int(150000000, 250000000), bytes_recebidos: r.int(3000, 9000) });
  }
  return porHora(out);
}

// ---------- dia 44: webshell ----------
function registrosW3C(): Registro[] {
  const r = rng(4401);
  const out: Registro[] = [];
  const clientes = Array.from({ length: 30 }, () => `${r.um([177, 179, 186, 187, 189, 191, 200, 201])}.${r.int(1, 254)}.${r.int(1, 254)}.${r.int(1, 254)}`);
  const navegadores = ['Mozilla/5.0+(Windows+NT+10.0;+Win64;+x64)+AppleWebKit/537.36+Chrome/124.0', 'Mozilla/5.0+(iPhone;+CPU+iPhone+OS+17_4)+AppleWebKit/605.1.15+Safari/604.1', 'Mozilla/5.0+(Linux;+Android+14)+AppleWebKit/537.36+Chrome/124.0+Mobile'];
  const base = '2026-03-14T10:00:00';
  const reg = (t: number, metodo: string, stem: string, query: string, ip: string, ua: string, status: number, tempo: number) =>
    out.push({ hora: hora(base, t), s_ip: '10.30.1.20', cs_method: metodo, cs_uri_stem: stem, cs_uri_query: query, s_port: 443, c_ip: ip, cs_user_agent: ua, sc_status: status, time_taken: tempo });
  const gets = ['/', '/default.aspx', '/css/site.css', '/js/app.js', '/img/logo.png', '/cotacao.aspx', '/boleto.aspx'];
  for (let i = 0; i < 100; i++) reg(r.int(0, 30000), 'GET', r.um(gets), '-', r.um(clientes), r.um(navegadores), r.chance(0.8) ? 200 : 304, r.int(5, 300));
  for (let i = 0; i < 30; i++) reg(r.int(0, 30000), 'POST', '/login.aspx', '-', r.um(clientes), r.um(navegadores), r.chance(0.85) ? 302 : 200, r.int(80, 600));
  for (let i = 0; i < 20; i++) reg(r.int(0, 30000), 'POST', '/cotacao.aspx', '-', r.um(clientes), r.um(navegadores), 200, r.int(100, 900));
  for (let i = 0; i < 8; i++) reg(r.int(0, 30000), 'POST', '/upload.aspx', '-', clientes[i * 3], r.um(navegadores), 200, r.int(400, 3000));
  const atacante = '203.0.113.17';
  const ua = 'Mozilla/5.0+(compatible;+MSIE+9.0;+Windows+NT+6.1)';
  ['/admin', '/.env', '/wp-login.php', '/backup.zip', '/web.config', '/phpmyadmin/'].forEach((p, i) => reg(18000 + i * 2, 'GET', p, '-', atacante, ua, 404, 3));
  reg(18100, 'POST', '/upload.aspx', '-', atacante, ua, 200, 812);
  reg(18130, 'GET', '/uploads/ajuda.aspx', '-', atacante, ua, 200, 41);
  for (let i = 0; i < 14; i++) reg(18200 + i * 37, 'POST', '/uploads/ajuda.aspx', '-', atacante, ua, 200, r.int(200, 4000));
  return porHora(out);
}

export const DIAS_39_45: Dia[] = [
  {
    n: 39,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'Isolar ou não isolar',
    resumo: 'Lendo a árvore de processos do EDR e decidindo a contenção.',
    aula:
      'O EDR mostra a **árvore de processos**: quem criou quem, com que linha de comando, como qual usuário, e que conexões e arquivos cada processo fez. É ali que o alerta deixa de ser "tem um PowerShell" e vira história: `OUTLOOK.EXE` abriu `WINWORD.EXE`, que abriu `cmd.exe`, que abriu `powershell.exe`, que carregou uma DLL de `C:\\Users\\Public` e conectou num domínio de dois dias de idade.\n\n' +
      'Relações pai e filho que quase nunca são boas: Office criando shell (`T1204.002` execução pelo usuário, seguida de `T1059`), `rundll32.exe` carregando DLL de pasta de usuário (`T1218.011`), `w3wp.exe` criando `cmd.exe` (webshell), `services.exe` criando binário de pasta temporária. O processo pai explica mais que o nome do filho.\n\n' +
      '**Isolar** no EDR corta a rede da máquina, menos a comunicação com o console, e mantém o host ligado: a memória fica preservada para forense e o atacante perde o canal. Isolar estação de recepção com macro ativa é decisão fácil. Isolar o servidor do prontuário do hospital, o PDV da padaria em Black Friday ou o controlador de domínio **não se decide no turno sem aprovação**: siga o playbook, que define quem aprova e o que fazer enquanto a aprovação não vem (bloquear o IOC, matar o processo, desabilitar a conta).\n\n' +
      'Antes ou logo depois de isolar, registre os IOCs (hash, domínio, IP, caminho), procure os mesmos IOCs em outras máquinas e anote no ticket o horário da contenção. Desligar da tomada não é contenção, é apagar a memória com pressa.',
    chegada: [
      { quem: 'brenda', texto: 'O EDR tem um botão vermelho escrito "Isolar". Eu posso apertar? Eu quero muito apertar.', gesto: 'apontar', expr: 'surpresa' },
      { quem: 'ro', texto: 'Brenda, o botão vermelho é igual cartão de crédito: funciona sempre, mas a conta chega depois.', gesto: 'cruzar' },
      { quem: 'gilmar', texto: 'Semana passada alguém isolou o servidor de folha de pagamento no dia do pagamento. Eu ainda acordo suando.', expr: 'triste' },
      { quem: 'vandeco', texto: 'Árvore de processos é igual árvore genealógica: quando o filho do Word é o PowerShell, alguém precisa conversar com a família.', expr: 'neutro' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'A recepção da Tabajara',
        enunciado: 'O Guarita EDR alertou no DT-ATEND-031, estação da recepção. Leia a árvore e decida.',
        anexo:
          'Guarita EDR | Host: DT-ATEND-031 | Usuário: TABAJARA\\joao.silva | Função (CMDB): recepção\n' +
          '[09:14:02] explorer.exe (PID 3312)\n' +
          '  |-- OUTLOOK.EXE (PID 5120)\n' +
          '       |-- WINWORD.EXE (PID 7788) "...\\INetCache\\Content.Outlook\\8KQ2\\Proposta_Sinistro.docm"\n' +
          '            |-- cmd.exe (PID 7912) /c powershell -nop -w hidden -enc SQBFAFgAIAAo...\n' +
          '                 |-- powershell.exe (PID 8020)\n' +
          '                      |-- rundll32.exe (PID 8144) C:\\Users\\Public\\cache.dll,Iniciar\n' +
          '[09:14:40] rundll32.exe (PID 8144) conecta em 198.51.100.204:443\n' +
          '           SNI: atualiza-cdn-office.top (domínio registrado há 2 dias)\n' +
          '[09:15:10] rundll32.exe cria chave HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\CacheSvc',
        perguntas: [
          {
            p: 'Qual relação pai e filho é o primeiro sinal forte de problema?',
            opcoes: ['explorer.exe criando OUTLOOK.EXE', 'WINWORD.EXE criando cmd.exe', 'OUTLOOK.EXE criando WINWORD.EXE', 'Nenhuma, todas são comuns'],
            certa: 1,
            explicacao: 'Abrir anexo pelo Outlook é normal. Word criando shell quase sempre é macro executando comando. Daí para baixo a cadeia só piora.',
          },
          {
            p: 'Qual é a melhor decisão de contenção agora?',
            opcoes: ['Isolar o DT-ATEND-031 no EDR, mantendo a máquina ligada', 'Desligar a máquina da tomada', 'Esperar o usuário terminar o expediente', 'Só bloquear o domínio no proxy e fechar'],
            certa: 0,
            explicacao: 'Estação de recepção com execução ativa e C2 estabelecido: isolar é proporcional e preserva a memória. Bloquear o domínio ajuda, mas a persistência na chave Run e a DLL continuam lá.',
          },
          {
            p: 'Se essa mesma árvore aparecesse no servidor do prontuário do hospital, o que mudaria?',
            opcoes: ['Nada, isola igual e avisa depois', 'A decisão de isolar passa pelo responsável definido no playbook; enquanto isso, ações menores como matar o processo e bloquear o IOC', 'Não faz nada, servidor crítico não pode ser mexido', 'Formata o servidor à noite'],
            certa: 1,
            explicacao: 'Contenção é proporcional ao impacto no negócio. Em ativo crítico, o playbook define quem aprova e quais ações intermediárias reduzem o risco sem parar o atendimento.',
          },
          {
            p: 'Depois de isolar, qual destes passos amplia o escopo do jeito certo?',
            opcoes: ['Procurar o hash da `cache.dll`, o domínio e o IP em todas as máquinas do cliente', 'Reiniciar o DT-ATEND-031 para limpar', 'Apagar o e-mail da caixa do joao.silva e encerrar', 'Trocar o teclado da recepção'],
            certa: 0,
            explicacao: 'O mesmo e-mail pode ter chegado para outras pessoas. Caçar os IOCs no parque inteiro mostra se é uma máquina ou um surto.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'brenda', texto: 'Apertei o botão vermelho com justificativa no ticket. Foi o momento mais feliz da minha semana.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'gilmar', texto: 'Isolamento com horário anotado. Isso vira gráfico na reunião de segunda.', gesto: 'sim' },
    ],
  },
  {
    n: 40,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'O Mimikatz que é o antivírus',
    resumo: 'Tuning 2: acesso ao LSASS, exclusão por caminho e assinatura, nunca por nome.',
    aula:
      'Roubo de credencial da memória do LSASS é `T1003.001`. O Sysmon registra acesso a processo no **evento 10** (`ProcessAccess`), com `SourceImage`, `TargetImage` e `GrantedAccess`. Uma regra que alerta todo acesso a `lsass.exe` vai disparar com o antivírus, com o EDR e com o WMI, porque eles também olham o LSASS o dia inteiro.\n\n' +
      'Valores de `GrantedAccess` dão pista: `0x1010` e `0x1410` incluem leitura de memória (`PROCESS_VM_READ`, 0x0010) com consulta de informação; `0x1FFFFF` é acesso total, e aparece muito quando alguém faz dump da memória. Ferramenta legítima também pede esses acessos, então o valor sozinho não decide nada.\n\n' +
      'Exclusão boa usa **caminho completo** e, se a fonte tiver, **assinatura** ou hash. Exclusão ruim usa o nome do arquivo: qualquer atacante pode chamar o binário de `MsMpEng.exe` e jogar em `C:\\Users\\Public`. Também fique de olho em binário legítimo do sistema usado para o mal: `rundll32.exe` é assinado pela Microsoft e aparece em dump de LSASS via `comsvcs.dll`. Assinatura válida diz quem fez o arquivo, não quem está usando.\n\n' +
      'Proteções que reduzem o problema: **LSA Protection** (RunAsPPL), Credential Guard e a regra de ASR do Defender que bloqueia roubo de credencial do LSASS. Proteger o LSASS é como esconder o pote de biscoito: não acaba com a fome, mas atrasa bastante.',
    chegada: [
      { quem: 'keyla', texto: 'Minha regra de LSASS pegou 58 tentativas de Mimikatz ontem! O antivírus é o maior hacker da Tabajara!', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'ro', texto: 'O antivírus olhando a memória do LSASS é o porteiro olhando a portaria. Ele é pago pra isso.', gesto: 'cintura' },
      { quem: 'kevin', texto: 'Então exclui tudo que chama MsMpEng.exe e pronto.', gesto: 'ombros' },
      { quem: 'vandeco', texto: 'Em 2008 vi um malware chamado `svchost.exe` morando na pasta do Messenger. Nome de arquivo não é RG, Kevin.', expr: 'neutro' },
      { quem: 'gilmar', texto: 'Quero a regra viva e silenciosa. Igual eu em reunião de diretoria.', gesto: 'apontar' },
    ],
    fila: { quantidade: 7 },
    missoes: [
      {
        tipo: 'regra',
        titulo: 'Tuning da regra de acesso ao LSASS',
        enunciado: 'A regra alerta todo Sysmon 10 com destino `lsass.exe`. Quase tudo é Defender, EDR e WMI. Escolha exclusões que reduzam o ruído sem esconder os dois acessos maliciosos que estão no meio.',
        regra: 'Sysmon evento=10 TargetImage=C:\\Windows\\System32\\lsass.exe: severidade crítica, "Possível Mimikatz"',
        registros: registrosLsass(),
        exclusoes: [
          { texto: 'Excluir o MsMpEng.exe do caminho oficial do Defender, assinado pela Microsoft', filtro: 'origem_imagem="C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\*\\MsMpEng.exe" assinatura="Microsoft Corporation"' },
          { texto: 'Excluir o agente do Guarita EDR no caminho de instalação, assinado pelo fabricante', filtro: 'origem_imagem="C:\\Program Files\\Guarita\\guarita-agent.exe" assinatura="Guarita Segurança Ltda."' },
          { texto: 'Excluir qualquer processo chamado MsMpEng.exe', filtro: 'origem_imagem=*MsMpEng.exe' },
          { texto: 'Excluir tudo que é assinado pela Microsoft', filtro: 'assinatura="Microsoft Corporation"' },
          { texto: 'Excluir servidores (SRV-*), porque lá só tem gente de TI', filtro: 'host=SRV-*' },
        ],
        minReducao: 0.8,
        explicacao: 'As duas exclusões seguras amarram caminho completo e assinatura, então só calam o Defender e o Guarita de verdade. Excluir por nome deixaria passar o `MsMpEng.exe` falso em `C:\\Users\\Public` (não assinado). Excluir tudo assinado pela Microsoft esconderia o `rundll32.exe` com `0x1FFFFF` no SRV-ARQ-01, que é o clássico dump via binário do próprio sistema. Excluir servidores é excluir justamente onde moram as credenciais mais valiosas.',
      },
    ],
    saida: [
      { quem: 'keyla', texto: 'De 58 para 8, e dois deles são ataque de verdade. Minha regra virou adulta.', expr: 'sorriso' },
      { quem: 'ro', texto: 'E as outras seis são WMI. Semana que vem a gente conversa com ele também.', gesto: 'sim' },
    ],
  },
  {
    n: 41,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'Reputação não é veredito',
    resumo: 'Enriquecimento: idade de domínio, WHOIS, DNS passivo e o perigo do "0 detecções".',
    aula:
      '**Enriquecimento** é juntar contexto ao IOC: reputação em serviços de inteligência, **idade do domínio** (WHOIS ou RDAP), registrador, **DNS passivo** (que IPs esse domínio já teve e que domínios já apontaram para esse IP), certificados emitidos (Certificate Transparency), ASN e país do IP, e o histórico interno (o SOC já viu isso antes?).\n\n' +
      '**Reputação não é veredito.** Domínio novo, criado ontem para uma campanha, tem zero detecções porque ninguém viu ainda. IP de CDN ou de nuvem pública aparece "malicioso" porque milhares de clientes dividem a mesma faixa. Zero detecções é ausência de informação, não atestado de bons antecedentes.\n\n' +
      'Sinais que pesam: domínio com poucos dias de vida, registrado com privacidade, hospedado em ASN de VPS barato, com certificado gratuito emitido na mesma hora e nome imitando marca (`atualiza-cdn-office.top`). DNS passivo mostrando o mesmo IP com dezenas de domínios de "boleto" e "rastreio" é praticamente uma confissão.\n\n' +
      '**Nunca suba arquivo do cliente** em serviço público de análise: o documento pode ter dado pessoal ou segredo comercial, e o que sobe vira público. Consulte pelo **hash**. Se precisar detonar, use sandbox interna ou contratada com acordo de confidencialidade. A LGPD não aceita "foi só pra ver se era vírus" como base legal.',
    chegada: [
      { quem: 'kevin', texto: 'O domínio do alerta tem zero detecções. Fechei como limpo.', gesto: 'ombros' },
      { quem: 'ro', texto: 'Kevin, o domínio nasceu anteontem. Ele tem zero detecções igual recém-nascido tem zero multas.', gesto: 'cruzar', expr: 'bravo' },
      { quem: 'jefferson', texto: 'Posso subir o PDF da proposta do cliente no site de análise pra ver?', gesto: 'pensar' },
      { quem: 'vandeco', texto: 'Sobe o hash, Jefferson. O PDF tem CPF de segurado. Você quer passar no concurso ou aparecer no jornal?', expr: 'neutro' },
      { quem: 'pamela', texto: 'O DNS passivo mostra o mesmo IP com quarenta domínios de "segunda via". Acho que dá pra ter uma opinião.', gesto: 'apontar' },
    ],
    fila: { quantidade: 9 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Enriquecendo sem se enganar',
        enunciado: 'Um alerta de proxy mostra acesso a `rastreio-correio-entrega.top`. Use o enriquecimento com juízo.',
        anexo:
          'Domínio: rastreio-correio-entrega.top\n' +
          'Criação (RDAP): 2026-03-15 | Hoje: 2026-03-17\n' +
          'Registrador: privacidade ativada\n' +
          'Resolve para: 203.0.113.9 (ASN de VPS, outro país)\n' +
          'Certificado TLS: emitido em 2026-03-15 22:41 UTC\n' +
          'Reputação: 0 de 70 serviços marcam como malicioso\n' +
          'DNS passivo do IP: 38 domínios nos últimos 10 dias, ex.: segunda-via-boleto-agora.top, entrega-pendente-taxa.top',
        perguntas: [
          {
            p: 'Como interpretar o "0 de 70"?',
            opcoes: ['Domínio limpo, pode fechar', 'Ausência de informação: domínio de 2 dias ainda não foi avaliado pela maioria dos serviços', 'Prova de que é falso positivo', 'Prova de que é malicioso'],
            certa: 1,
            explicacao: 'Reputação depende de alguém ter visto e reportado. Para domínio recém-criado, o silêncio dos serviços não diz nada.',
          },
          {
            p: 'Qual evidência do anexo é a mais forte de infraestrutura maliciosa?',
            opcoes: ['O TLD `.top`', 'O DNS passivo: o mesmo IP hospedando dezenas de domínios recém-criados de boleto e entrega', 'A privacidade no WHOIS', 'O certificado TLS existir'],
            certa: 1,
            explicacao: 'TLD, privacidade e certificado gratuito são comuns em site legítimo também. Um IP servindo 38 domínios de golpe em 10 dias é padrão de campanha.',
          },
          {
            p: 'Um anexo `.docx` do cliente precisa ser analisado. O que fazer?',
            opcoes: ['Subir o arquivo num serviço público de análise', 'Consultar pelo hash e, se precisar detonar, usar sandbox interna ou contratada com confidencialidade', 'Abrir no notebook do SOC para ver', 'Mandar por e-mail para o Vandeco'],
            certa: 1,
            explicacao: 'Arquivo enviado a serviço público pode ficar disponível para terceiros. Hash não expõe conteúdo. Dado do cliente fica sob controle, como manda a LGPD e o contrato.',
          },
          {
            p: 'Um IP de nuvem pública aparece com reputação ruim e é o mesmo que serve o Office 365 do cliente. O que isso ensina?',
            opcoes: ['Bloquear o IP imediatamente', 'IP compartilhado tem reputação misturada; decidir com contexto (domínio, SNI, histórico) e não só pela nota', 'Desligar o Office 365', 'Reputação de IP é sempre exata'],
            certa: 1,
            explicacao: 'Em nuvem e CDN, milhares de clientes dividem IPs. Bloquear pela reputação do IP pode derrubar serviço legítimo.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'kevin', texto: 'Reabri o ticket. Mudei de "limpo" para "recém-nascido suspeito".', gesto: 'sim' },
      { quem: 'ro', texto: 'Já é uma evolução. Pequena, mas registrada.', expr: 'sorriso' },
    ],
  },
  {
    n: 42,
    site: 'alfa',
    turno: 'madrugada',
    titulo: 'Bytes que saem de madrugada',
    resumo: 'Exfiltração: somar bytes por destino, olhar horário e separar do backup.',
    aula:
      'Exfiltração aparece nos logs como **volume de saída**: `bytes_enviados` muito maior que `bytes_recebidos`, para um destino incomum, em horário estranho. Navegação normal baixa muito e envia pouco. Upload grande de estação de trabalho às 3h da manhã não é ninguém mandando currículo.\n\n' +
      'Técnicas que você vai mapear: `T1041` (exfiltração pelo próprio canal de C2), `T1567.002` (para serviço de armazenamento em nuvem), `T1048` (por protocolo alternativo, como DNS ou FTP) e `T1030` (limite de tamanho de transferência, quando o atacante manda em pedaços para não chamar atenção). Pedaços regulares de 150 a 250 MB, um a cada poucos minutos, são assinatura de ferramenta, não de pessoa.\n\n' +
      'Para investigar: some os bytes por destino e por host, filtre a janela de horário e **tire o que é esperado**, como o backup homologado que roda toda madrugada. Depois confirme o destino (idade do domínio, categoria no proxy) e o que estava naquela máquina (o EDR mostra quais arquivos foram lidos e compactados antes).\n\n' +
      'Atenção ao fuso de novo: o log do proxy está em UTC, a regra de "fora do horário" precisa estar no horário local do cliente. Senão o SOC acha que o financeiro trabalha às 5h, e o financeiro acha que o SOC não trabalha nunca.',
    chegada: [
      { quem: 'thiaguinho', texto: 'Madrugada é tranquila. Só o backup roda e o Dr. Leôncio liga.', gesto: 'acenar' },
      { quem: 'narrador', texto: 'O relógio marca 3h12. O ar-condicionado está em 16 °C e o café está em estado de sítio.' },
      { quem: 'vandeco', texto: 'O proxy da Tabajara mostra gigas saindo do NB-FIN-014. Notebook de financeiro não faz backup sozinho de madrugada.', gesto: 'pensar' },
      { quem: 'thiaguinho', texto: 'Vai ver ele é dedicado.', gesto: 'ombros' },
      { quem: 'vandeco', texto: 'Dedicado é o atacante, Thiaguinho. O notebook só está sendo esvaziado.', expr: 'neutro' },
    ],
    fila: { quantidade: 6 },
    missoes: [
      {
        tipo: 'siem',
        titulo: 'Para onde foram os gigas',
        enunciado: 'Logs de proxy da Tabajara (hora em UTC, `hora_local` em Brasília). O backup homologado vai para `backup.insonia-nuvem.exemplo` toda madrugada. Ache o destino da exfiltração.',
        registros: registrosExfil(),
        pergunta: 'Qual destino recebeu mais bytes enviados antes das 6h (horário local), fora o backup homologado?',
        resposta: 'nuvem-arquivo-gratis.top',
        gabarito: 'hora_local<6 destino!=backup.* | somar bytes_enviados por destino | ordenar -soma',
        dica: 'Filtre a madrugada com `hora_local<6` e tire o backup com `destino!=backup.*`. Depois `| somar bytes_enviados por destino | ordenar -soma`.',
        explicacao: 'O NB-FIN-014 mandou cerca de 4 GB para `nuvem-arquivo-gratis.top` entre 2h e 4h, em vinte pedaços regulares, recebendo quase nada de volta: padrão de `T1567.002` com `T1030`. O backup manda ainda mais, mas é do servidor certo, para o destino homologado, no horário da janela. Próximos passos: isolar o notebook, bloquear o domínio, ver no EDR quais arquivos foram compactados antes e avaliar se há dado pessoal envolvido (isso aciona o jurídico e a avaliação de comunicação à ANPD).',
      },
    ],
    saida: [
      { quem: 'thiaguinho', texto: 'Vou deixar anotado na passagem de turno. Com fuso e tudo. Tô aprendendo.', gesto: 'sim', expr: 'sorriso' },
      { quem: 'telefone', texto: 'Meu jovem, é o Leôncio. Não é nada, só queria saber se vocês estão acordados.' },
    ],
  },
  {
    n: 43,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'O inquilino que não sai',
    resumo: 'Persistência: chave Run, tarefa agendada 4698, serviço e assinatura WMI.',
    aula:
      'Persistência é o atacante garantindo que volta depois do reinício. Os lugares mais comuns no Windows: **chave Run** (`HKCU` ou `HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run`, `T1547.001`), que o Sysmon registra no **evento 13** (valor de registro alterado); **tarefa agendada** (`T1053.005`), que gera o **4698** no log Security quando a auditoria está ligada, com o XML da tarefa inteiro; e **serviço novo** (`T1543.003`), com **7045** no System e **4697** no Security.\n\n' +
      'O mais escondido é a **assinatura de eventos WMI** (`T1546.003`): um filtro, um consumidor e a ligação entre os dois, executando comando quando algo acontece (por exemplo, alguns minutos depois do boot). O Sysmon registra nos eventos **19, 20 e 21**. Quase ninguém usa isso de forma legítima numa estação comum, então qualquer evento desses merece olhar.\n\n' +
      'O que denuncia persistência maliciosa: binário em pasta de usuário ou temporária (`AppData`, `Public`, `Temp`), nome imitando o sistema (`svch0st.exe`, `WindowsUpdater`), comando com PowerShell codificado, tarefa criada por usuário comum fora de janela de mudança e autor estranho no XML.\n\n' +
      'Na resposta, remover a persistência é parte do trabalho, mas só depois de **documentar** (chave, valor, caminho, hash, horário). Apagar antes de registrar é limpar a cena do crime para a perícia chegar e achar o chão brilhando.',
    chegada: [
      { quem: 'ro', texto: 'Limparam a máquina da recepção na semana passada. Hoje o malware voltou. Deve ter gostado do café.', gesto: 'cintura' },
      { quem: 'keyla', texto: 'Será que tem uma tarefa agendada? Eu tenho uma regra pra 4698! Ela dispara toda vez que o Windows Update cria tarefa.', expr: 'sorriso' },
      { quem: 'vandeco', texto: 'Malware que volta tem chave. Procura no registro, nas tarefas, nos serviços e no WMI. Nessa ordem, que é a ordem da preguiça do atacante.', expr: 'neutro' },
      { quem: 'neide', texto: 'Inquilino que não sai a gente resolve trocando a fechadura, {nome}.', gesto: 'apontar' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Onde o malware fez ninho',
        enunciado: 'O Vigia trouxe estes eventos do DT-ATEND-031 depois da "limpeza".',
        anexo:
          'Sysmon 13 | 09:15:10 | Image: C:\\Windows\\System32\\rundll32.exe\n' +
          '  TargetObject: HKU\\S-1-5-21-...-1107\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\CacheSvc\n' +
          '  Details: rundll32.exe C:\\Users\\Public\\cache.dll,Iniciar\n' +
          'Security 4698 | 09:16:02 | SubjectUserName: joao.silva\n' +
          '  TaskName: \\Microsoft\\Windows\\UpdateOrchestrator\\AtualizaCache\n' +
          '  Command: powershell.exe  Arguments: -nop -w hidden -enc JABjAD0A...\n' +
          '  Trigger: LogonTrigger\n' +
          'Sysmon 20 | 09:17:30 | Name: AtualizaConsumidor\n' +
          '  Destination: powershell.exe -nop -enc JABzAD0A...\n' +
          'Sysmon 21 | 09:17:30 | Consumer: AtualizaConsumidor  Filter: AposBoot',
        perguntas: [
          {
            p: 'O Sysmon 13 mostra qual técnica de persistência?',
            opcoes: ['T1547.001, Registry Run Keys', 'T1053.005, Scheduled Task', 'T1543.003, Windows Service', 'T1003.001, LSASS Memory'],
            certa: 0,
            explicacao: 'Valor gravado em `...\\CurrentVersion\\Run` executa a cada logon do usuário: `T1547.001`.',
          },
          {
            p: 'O que torna o 4698 suspeito, mesmo com nome de tarefa que parece da Microsoft?',
            opcoes: ['O nome tem a palavra "Update"', 'Criada por usuário comum, com PowerShell oculto e codificado, disparando no logon', 'Tarefas agendadas são sempre maliciosas', 'O horário é de manhã'],
            certa: 1,
            explicacao: 'Atacante adora pasta com nome de sistema. O que denuncia é quem criou e o que executa: `-w hidden -enc` não é coisa do Windows Update.',
          },
          {
            p: 'Os eventos Sysmon 20 e 21 indicam o quê?',
            opcoes: ['Conexão de rede', 'Assinatura de eventos WMI (consumidor e ligação com filtro), `T1546.003`', 'Criação de arquivo', 'Consulta DNS'],
            certa: 1,
            explicacao: 'Sysmon 19 é o filtro, 20 é o consumidor e 21 é a ligação. Juntos, executam comando quando a condição do filtro acontece.',
          },
          {
            p: 'A limpeza falhou. Qual é a lição para a próxima resposta?',
            opcoes: ['Rodar o antivírus duas vezes', 'Procurar todos os mecanismos de persistência (registro, tarefas, serviços, WMI) e documentar cada um antes de remover; na dúvida, reinstalar a máquina', 'Trocar só a senha do usuário', 'Desligar o Sysmon para não gerar mais alerta'],
            certa: 1,
            explicacao: 'Atacante raramente deixa uma porta só. Remover um mecanismo e esquecer os outros é o motivo mais comum de "o malware voltou".',
          },
        ],
      },
    ],
    saida: [
      { quem: 'keyla', texto: 'Vou criar uma regra para Sysmon 19, 20 e 21. Prometo que ela não vai disparar com o Windows Update. Acho.', gesto: 'pensar' },
      { quem: 'neide', texto: 'Trocaram a fechadura? Então pode ir em paz.', gesto: 'acenar', expr: 'sorriso' },
    ],
  },
  {
    n: 44,
    site: 'alfa',
    turno: 'noite',
    titulo: 'A página de ajuda que ajuda demais',
    resumo: 'Webshell: logs W3C do IIS, POST em .aspx estranho e o w3wp.exe criando cmd.exe.',
    aula:
      '**Webshell** (`T1505.003`) é um arquivo de script colocado no servidor web que recebe comandos por HTTP. Em IIS costuma ser `.aspx`; em Apache e Nginx, `.php` ou `.jsp`. Entra por upload sem validação, vulnerabilidade da aplicação ou credencial de FTP vazada.\n\n' +
      'O log **W3C** do IIS tem os campos que você precisa: `date`, `time`, `s-ip`, `cs-method`, `cs-uri-stem` (o caminho), `cs-uri-query`, `s-port`, `c-ip` (o cliente), `cs(User-Agent)`, `sc-status` e `time-taken`. O IIS grava `date` e `time` em UTC por padrão. O **corpo do POST não aparece**, então o comando não está no log: o que aparece é o padrão.\n\n' +
      'Sinais: arquivo `.aspx` que não faz parte do sistema, numa pasta de upload ou de imagens; recebendo **POST de um único IP**, que antes fez varredura (vários 404 para `/.env`, `/wp-login.php`, `/backup.zip`); `User-Agent` antigo ou estranho; `time-taken` variável (cada comando demora o seu tempo). No EDR, o processo `w3wp.exe` criando `cmd.exe`, `powershell.exe` ou `whoami.exe` fecha o caso.\n\n' +
      'Uma pergunta que resolve muita coisa: **quantos clientes diferentes acessam esse arquivo?** Página legítima é usada por muita gente. Webshell é usada por uma pessoa só, que não quer companhia.',
    chegada: [
      { quem: 'gilmar', texto: 'O Guarita do servidor web da Tabajara viu o `w3wp.exe` rodando `whoami`. Servidor web com crise de identidade não é bom sinal.', gesto: 'apontar' },
      { quem: 'thiaguinho', texto: 'Talvez ele só queira saber quem ele é. Todo mundo passa por isso aos 24.', gesto: 'ombros' },
      { quem: 'ro', texto: 'O IIS não faz terapia, Thiaguinho. Ele faz o que mandam por POST.', gesto: 'cruzar' },
      { quem: 'vandeco', texto: 'Webshell é o bilhete escondido embaixo do capacho. Abre o log W3C e vê quem anda pisando nesse capacho.', expr: 'neutro' },
    ],
    fila: { quantidade: 7 },
    missoes: [
      {
        tipo: 'siem',
        titulo: 'O .aspx que ninguém conhece',
        enunciado: 'Logs W3C do portal de corretores da Tabajara. As páginas oficiais com POST são `/login.aspx`, `/cotacao.aspx` e `/upload.aspx`. Ache a webshell.',
        registros: registrosW3C(),
        pergunta: 'Qual é o caminho (cs_uri_stem) da webshell?',
        resposta: '/uploads/ajuda.aspx',
        gabarito: 'cs_method=POST cs_uri_stem=*.aspx | distintos c_ip por cs_uri_stem | ordenar distintos',
        dica: 'Conte quantos clientes diferentes fazem POST em cada página: `cs_method=POST cs_uri_stem=*.aspx | distintos c_ip por cs_uri_stem | ordenar distintos`. Sem o `-`, ordena do menor para o maior.',
        explicacao: 'A `/uploads/ajuda.aspx` recebe POST de um único IP (203.0.113.17), que antes varreu o servidor com vários 404 e fez um POST em `/upload.aspx` (a provável porta de entrada). Página de ajuda em pasta de uploads, com um cliente só e `User-Agent` de navegador de 2011, é webshell. Próximos passos: preservar o arquivo e os logs, tirar o servidor de exposição conforme o playbook, revisar o que o `w3wp.exe` executou no EDR e corrigir a validação do upload.',
      },
    ],
    saida: [
      { quem: 'thiaguinho', texto: 'Então "ajuda.aspx" não ajudava ninguém. Que decepção.', expr: 'triste' },
      { quem: 'gilmar', texto: 'Amanhã tem reunião de continuidade de negócio. Tragam caneta e paciência.', gesto: 'acenar' },
    ],
  },
  {
    n: 45,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'A cafeteira derrubou o SOC',
    resumo: 'Queda do SOC Alfa: BCP, DRP, RTO, RPO e failover para Recife.',
    aula:
      '**BCP** (Plano de Continuidade de Negócios, referência na ISO 22301) diz como o negócio continua funcionando quando algo para. **DRP** (Plano de Recuperação de Desastres) é a parte técnica: como restaurar sistemas, dados e infraestrutura. Os dois nascem da **BIA** (Análise de Impacto no Negócio), que diz o que é crítico e quanto tempo cada coisa aguenta parada.\n\n' +
      '**RTO** (Recovery Time Objective) é o tempo máximo para voltar a funcionar. **RPO** (Recovery Point Objective) é quanto dado dá para perder, medido em tempo: RPO de 15 minutos quer dizer que a última cópia não pode ser mais velha que isso. Para um SOC, RTO é o tempo até alguém estar olhando a fila de novo; RPO é quantos alertas e anotações de investigação se perdem no caminho.\n\n' +
      'No modelo **ativo-ativo**, os dois sites trabalham ao mesmo tempo e um absorve o outro. No **ativo-passivo**, o segundo fica esperando. **Failover** é passar a operação para o site de contingência; **failback** é voltar, com calma e testado. Plano que nunca foi testado é só um PDF otimista.\n\n' +
      'Detalhe que todo plano esquece: o **canal de comunicação alternativo**. Se o chat da empresa estava no mesmo prédio que caiu, a mensagem "caímos" não sai. E toda tomada de nobreak precisa de etiqueta. Grande. Em letra de forma. Com desenho de cafeteira riscada.',
    chegada: [
      { quem: 'gilmar', texto: 'Bom dia, equipe! Trouxe a cafeteira nova pro SOC. Italiana, quinze bar de pressão, a gente merece.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'narrador', texto: 'Um clique seco. O videowall apaga, os monitores apagam, o ar-condicionado suspira pela primeira vez em anos. Só a cafeteira continua acesa, feliz.' },
      { quem: 'ro', texto: 'Alguém ligou a cafeteira na tomada do nobreak. O nobreak, com a bateria vencida desde 2021, não aguentou e desistiu de viver. Eu não vou dizer quem foi. Mas ele tem um timer de tomate.', gesto: 'cruzar', expr: 'bravo' },
      { quem: 'neide', texto: 'Dessa vez não fui eu. Eu juro pelo meu aspirador.', gesto: 'nao', expr: 'surpresa' },
      { quem: 'vandeco', texto: 'O Vigia caiu junto, o chat caiu junto. Alguém tem o telefone da Dona Socorro anotado em papel?', gesto: 'pensar' },
      { quem: 'pamela', texto: 'Eu tenho. Está no plano de continuidade impresso, na gaveta que ninguém abre desde 2022.', gesto: 'apontar' },
      { quem: 'gilmar', texto: 'Ninguém mexe na cafeteira. Ela é evidência. E está quase pronta.', expr: 'triste' },
    ],
    fila: { quantidade: 6 },
    evento: 'queda_alfa',
    missoes: [
      {
        tipo: 'ordenar',
        titulo: 'Failover para o SOC Bravo',
        enunciado: 'O SOC Alfa está sem energia e sem SIEM. Coloque os passos do failover na ordem certa.',
        itens: [
          'Confirmar a indisponibilidade (energia, rede, Vigia) e anotar o horário de início da parada',
          'Quem tem autoridade no plano declara o acionamento da continuidade',
          'Avisar o SOC Bravo pelo canal alternativo combinado (telefone), já que o chat caiu junto',
          'O Bravo assume a fila e recebe a lista do que estava em investigação e dos SLAs em risco',
          'Comunicar os clientes conforme o contrato, informando o contato temporário',
          'Restaurar o Alfa e testar energia, rede, Vigia e acessos antes de qualquer retorno',
          'Fazer o failback planejado e marcar a reunião de lições aprendidas',
        ],
        explicacao: 'Primeiro se confirma o problema e se registra o horário (é dali que o RTO é medido). O acionamento é decisão de quem o plano define, não de quem estiver mais perto. A comunicação usa o canal alternativo, porque o principal caiu. O Bravo assume com contexto, não às cegas. Cliente é avisado conforme contrato. O retorno só acontece depois de testar, e a lição aprendida fecha o ciclo para a próxima cafeteira.',
      },
    ],
    saida: [
      { quem: 'socorro', texto: 'Curitiba? Aqui é Socorro, de Recife. Recebemos a fila de vocês. Ninguém precisa gritar, a gente conversa com o incidente.', gesto: 'acenar' },
      { quem: 'gilmar', texto: 'Amanhã a equipe do turno vai para Recife. Levem casaco de frio, não. Levem protetor solar.', gesto: 'apontar' },
      { quem: 'neide', texto: 'Vou colar uma etiqueta no nobreak. Bem grande. Com o desenho de uma cafeteira chorando.', gesto: 'sim', expr: 'sorriso' },
    ],
  },
];
