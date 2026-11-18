// Ato 2, dias 31 a 38: investigação, linha do tempo, ATT&CK, tuning, Sigma, BEC, Kerberoasting, movimento lateral.
import type { Dia, Registro } from '../../tipos';
import { rng, hora, porHora, USUARIOS, HOSTS } from '../../util';

// ---------- dia 34: a impressora que faz força bruta ----------
function registrosImpressora(): (Registro & { malicioso: 0 | 1 })[] {
  const r = rng(3401);
  const base = '2026-03-04T08:00:00';
  const out: (Registro & { malicioso: 0 | 1 })[] = [];
  for (let i = 0; i < 40; i++) {
    out.push({ hora: hora(base, i * 900 + r.int(0, 60)), evento: 4625, usuario: 'svc_scanner', host_origem: 'IMP-2ANDAR-01', ip_origem: '10.20.5.40', alvo: 'SRV-DC-01', logon_tipo: 3, status: '0xC000006A', malicioso: 0 });
  }
  for (let i = 0; i < 12; i++) {
    out.push({ hora: hora(base, i * 3000 + r.int(0, 300)), evento: 4625, usuario: 'svc_monitor', host_origem: 'SRV-MON-01', ip_origem: '10.20.1.15', alvo: 'SRV-DC-01', logon_tipo: 3, status: '0xC000006A', malicioso: 0 });
  }
  for (let i = 0; i < 6; i++) {
    const u = USUARIOS[r.int(0, 9)];
    out.push({ hora: hora(base, r.int(0, 36000)), evento: 4625, usuario: u, host_origem: r.um(['NB-FIN-014', 'NB-RH-007', 'NB-COM-022']), ip_origem: `10.20.${r.int(2, 9)}.${r.int(10, 200)}`, alvo: 'SRV-DC-01', logon_tipo: 3, status: '0xC000006A', malicioso: 0 });
  }
  // o ataque: password spraying a partir de uma estação de atendimento
  const alvos = [...USUARIOS.slice(0, 12), 'svc_backup', 'svc_sql', 'adm.ti', 'teste'];
  alvos.forEach((u, i) => {
    out.push({ hora: hora('2026-03-04T13:10:00', i * 7), evento: 4625, usuario: u, host_origem: 'DT-ATEND-031', ip_origem: '10.20.12.77', alvo: 'SRV-DC-01', logon_tipo: 3, status: u === 'teste' || u === 'adm.ti' ? '0xC0000064' : '0xC000006A', malicioso: 1 });
  });
  return porHora(out);
}

// ---------- dia 37: Kerberoasting ----------
function registrosKerberos(): Registro[] {
  const r = rng(3701);
  const base = '2026-03-07T09:00:00';
  const servicos = ['cifs/SRV-ARQ-01', 'ldap/SRV-DC-01', 'HTTP/intranet.tabajara.local', 'MSSQLSvc/SRV-SQL-02:1433', 'host/DT-TI-002', 'cifs/SRV-ARQ-01'];
  const out: Registro[] = [];
  for (let i = 0; i < 120; i++) {
    const u = r.um(USUARIOS);
    out.push({ hora: hora(base, r.int(0, 28000)), evento: 4769, usuario: `${u}@TABAJARA.LOCAL`, servico: r.um(servicos), criptografia: '0x12', ip_origem: `10.20.${r.int(2, 20)}.${r.int(10, 240)}`, status: '0x0' });
  }
  for (let i = 0; i < 25; i++) {
    const u = r.um(USUARIOS);
    out.push({ hora: hora(base, r.int(0, 28000)), evento: 4768, usuario: `${u}@TABAJARA.LOCAL`, servico: 'krbtgt', criptografia: '0x12', ip_origem: `10.20.${r.int(2, 20)}.${r.int(10, 240)}`, status: '0x0' });
  }
  // ruído chato: sistema legado que só fala RC4
  for (let i = 0; i < 8; i++) {
    const u = r.um(USUARIOS);
    out.push({ hora: hora(base, r.int(0, 28000)), evento: 4769, usuario: `${u}@TABAJARA.LOCAL`, servico: 'HTTP/sinistros-legado.tabajara.local', criptografia: '0x17', ip_origem: `10.20.${r.int(2, 20)}.${r.int(10, 240)}`, status: '0x0' });
  }
  const spns = ['MSSQLSvc/SRV-SQL-02:1433', 'MSSQLSvc/SRV-SQL-03:1433', 'HTTP/svc_portal', 'svc_backup/SRV-ARQ-01', 'svc_relatorios/SRV-BI-01', 'FIMService/SRV-IAM-01', 'svc_sharepoint/SRV-SP-01', 'svc_scanner/IMP-2ANDAR-01', 'exchangeAB/SRV-EX-01'];
  spns.forEach((s, i) => {
    out.push({ hora: hora('2026-03-07T14:31:02', i * 4), evento: 4769, usuario: 'camila.ribeiro@TABAJARA.LOCAL', servico: s, criptografia: '0x17', ip_origem: '10.20.22.91', status: '0x0' });
  });
  return porHora(out);
}

// ---------- dia 38: movimento lateral ----------
function registrosLateral(): Registro[] {
  const r = rng(3801);
  const base = '2026-03-08T08:00:00';
  const out: Registro[] = [];
  for (let i = 0; i < 90; i++) {
    const u = r.um(USUARIOS);
    out.push({ hora: hora(base, r.int(0, 36000)), evento: 4624, host: r.chance(0.8) ? 'SRV-ARQ-01' : 'SRV-SQL-02', usuario: u, logon_tipo: 3, ip_origem: `10.20.${r.int(2, 20)}.${r.int(10, 240)}`, processo: '-' });
  }
  for (let i = 0; i < 30; i++) {
    out.push({ hora: hora(base, r.int(0, 36000)), evento: 4624, host: r.um(HOSTS), usuario: r.um(USUARIOS), logon_tipo: 2, ip_origem: '127.0.0.1', processo: 'C:\\Windows\\System32\\winlogon.exe' });
  }
  ['NB-FIN-014', 'NB-RH-007', 'DT-ATEND-031', 'NB-COM-022', 'DT-CAIXA-05', 'DT-TI-002', 'SRV-ARQ-01', 'SRV-SQL-02'].forEach((h, i) => {
    out.push({ hora: hora('2026-03-08T03:00:00', i * 40), evento: 4624, host: h, usuario: 'svc_sccm', logon_tipo: 3, ip_origem: '10.20.1.10', processo: '-' });
  });
  out.push({ hora: hora(base, 7200), evento: 7045, host: 'DT-TI-002', usuario: 'SYSTEM', logon_tipo: '-', ip_origem: '-', processo: 'Guarita Update Service', servico: 'GuaritaUpd', imagem: 'C:\\Program Files\\Guarita\\guarita-upd.exe' });
  out.push({ hora: hora(base, 7300), evento: 7045, host: 'NB-FIN-014', usuario: 'SYSTEM', logon_tipo: '-', ip_origem: '-', processo: 'Guarita Update Service', servico: 'GuaritaUpd', imagem: 'C:\\Program Files\\Guarita\\guarita-upd.exe' });
  ['SRV-ARQ-01', 'SRV-SQL-02', 'DT-TI-002', 'NB-DIR-001', 'NB-RH-007', 'SRV-DC-01'].forEach((h, i) => {
    const t = 22000 + i * 95;
    out.push({ hora: hora(base, t), evento: 4624, host: h, usuario: 'suporte.ti', logon_tipo: 3, ip_origem: '10.20.14.88', processo: '-' });
    out.push({ hora: hora(base, t + 3), evento: 5145, host: h, usuario: 'suporte.ti', logon_tipo: '-', ip_origem: '10.20.14.88', processo: '-', compartilhamento: '\\\\*\\ADMIN$', arquivo: 'PSEXESVC.exe' });
    out.push({ hora: hora(base, t + 5), evento: 7045, host: h, usuario: 'LocalSystem', logon_tipo: '-', ip_origem: '-', processo: 'PSEXESVC', servico: 'PSEXESVC', imagem: '%SystemRoot%\\PSEXESVC.exe' });
  });
  return porHora(out);
}

export const DIAS_31_38: Dia[] = [
  {
    n: 31,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'Hipótese, não palpite',
    resumo: 'O que muda quando o alerta não acaba no "fechar": hipótese, investigação e escopo.',
    aula:
      'Triagem pergunta "isso é real?". Investigação pergunta "o que aconteceu, desde quando, até onde?". Quem investiga trabalha com **hipótese**: uma frase que dá para provar ou derrubar com dado. "A conta da ana.oliveira foi usada por outra pessoa" é hipótese. "Deve ser hacker" é horóscopo.\n\n' +
      'O método é simples e chato: escreva a hipótese, diga que evidência confirmaria e que evidência derrubaria, vá atrás das duas. Procurar só o que confirma é **viés de confirmação**, o erro mais caro do SOC. Se o 4624 mostra logon tipo 10 de um IP de outro estado, também confira se não existe uma VPN no meio antes de acionar o Gilmar e o timer de tomate.\n\n' +
      'A investigação gira em torno de **pivôs**: usuário, host, IP, hash, domínio, processo. Achou um IOC, procure ele em todas as fontes (AD, EDR, proxy, e-mail, firewall). Cada pivô novo pode aumentar o **escopo**: a lista de contas, máquinas e dados afetados. Escopo fechado cedo demais é incidente que volta na semana seguinte, de chapéu novo.\n\n' +
      'Registre tudo enquanto investiga: consultas feitas, horários (sempre com fuso), o que foi descartado e por quê. A pergunta "vocês olharam o proxy?" vai chegar, e "acho que sim" não é resposta de quem vai depor numa auditoria.',
    chegada: [
      { quem: 'gilmar', texto: 'Bom dia, {nome}. A partir de hoje a fila vem com alertas que não fecham em dois cliques. Você vai investigar. Com o salário de quem estiver no seu cargo, claro.', gesto: 'apontar' },
      { quem: 'ro', texto: 'Promoção, acúmulo de função, chama como quiser. A diferença é que agora a culpa também é sua.', expr: 'sorriso' },
      { quem: 'kevin', texto: 'Eu continuo fechando tudo como falso positivo. Tá dando certo até agora.', gesto: 'ombros' },
      { quem: 'ro', texto: 'Tá dando certo até o dia em que não dá, Kevin. Igual paraquedas.', gesto: 'cruzar' },
      { quem: 'vandeco', texto: 'Em 2003 eu investiguei um worm só com `netstat` e um caderno de capa dura. Hoje vocês têm SIEM e reclamam da cadeira.', expr: 'neutro' },
      { quem: 'gilmar', texto: 'O tomate está ligado. Hipótese primeiro, consulta depois. Abriu ticket? Então não aconteceu.', gesto: 'sim' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Investigação com método',
        enunciado: 'Um alerta mostra logon da conta `ana.oliveira` às 02h47 vindo de um IP que o Vigia geolocaliza em outro estado. Antes de sair consultando tudo, organize a investigação.',
        perguntas: [
          {
            p: 'Qual destas frases é uma hipótese de investigação útil?',
            opcoes: ['"Parece ataque, melhor isolar tudo."', '"A sessão das 02h47 não foi feita pela ana.oliveira: o IP não é da VPN corporativa e o dispositivo não é o notebook dela."', '"Pode ser qualquer coisa, vou olhar os logs."', '"O SIEM errou de novo."'],
            certa: 1,
            explicacao: 'Hipótese boa é testável: diz o que deveria aparecer nos dados (IP fora da faixa da VPN, dispositivo diferente) se ela for verdadeira. As outras são reação, preguiça ou torcida.',
          },
          {
            p: 'Você achou o IP do atacante. Qual é o próximo passo para definir o escopo?',
            opcoes: ['Bloquear o IP e encerrar o ticket.', 'Pivotar: procurar esse IP em todas as fontes e ver que outras contas e hosts ele tocou.', 'Esperar o próximo alerta com esse IP.', 'Pedir para a usuária trocar a senha e pronto.'],
            certa: 1,
            explicacao: 'IOC encontrado vira pivô. Procurar o mesmo IP em AD, VPN, proxy, e-mail e EDR mostra se é uma conta ou dez. Bloquear sem medir o escopo deixa o resto do incidente funcionando.',
          },
          {
            p: 'O que é viés de confirmação numa investigação?',
            opcoes: ['Confirmar o alerta com o cliente antes de investigar.', 'Procurar só a evidência que apoia a hipótese e ignorar a que derruba.', 'Pedir revisão de outra pessoa.', 'Usar duas fontes de log diferentes.'],
            certa: 1,
            explicacao: 'Toda hipótese precisa de um teste que possa derrubá-la. Quem só procura o que confirma acaba "provando" coisa errada com muita convicção.',
          },
          {
            p: 'Ao registrar a investigação no ticket, qual é o detalhe que mais falta e mais atrapalha depois?',
            opcoes: ['A cor do alerta no painel.', 'O fuso horário dos horários anotados.', 'O nome do analista do turno anterior.', 'A versão do navegador do SOC.'],
            certa: 1,
            explicacao: 'Cada fonte grava hora de um jeito (UTC, horário local, horário do servidor errado). Sem fuso, a linha do tempo vira ficção. Anote sempre "UTC" ou "BRT" ao lado.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'ro', texto: 'Primeiro dia investigando e ninguém isolou o servidor do prontuário. Tô quase orgulhosa.', expr: 'sorriso' },
      { quem: 'neide', texto: 'Vai pra casa cedo, {nome}. Hipótese boa nasce de gente que dormiu.', gesto: 'acenar' },
    ],
  },
  {
    n: 32,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'Cada relógio com seu fuso',
    resumo: 'Montar a linha do tempo de um incidente quando cada fonte vive num horário diferente.',
    aula:
      'A **linha do tempo** é a espinha da investigação: cada evento com data, hora, fuso, fonte, host, conta e o que significa. É ela que responde "como entraram, o que fizeram e o que vem depois", e é ela que vai para o relatório final.\n\n' +
      'O primeiro inimigo é o fuso. O gateway de e-mail grava em UTC, o Windows mostra horário local no Visualizador de Eventos (mas guarda o `TimeCreated SystemTime` em UTC), o firewall está com o relógio do dia em que foi instalado. **Normalize tudo para UTC** antes de ordenar e anote a conversão. Brasília é UTC-3 (sem horário de verão desde 2019).\n\n' +
      'O segundo inimigo é o relógio errado. Se o NTP de uma máquina estiver quebrado, os eventos dela andam fora do lugar. Desconfie quando um efeito aparece antes da causa: processo filho criado antes do pai, conexão de saída antes do clique.\n\n' +
      'A sequência clássica de intrusão aparece nos logs mais ou menos assim: entrega (e-mail), execução (Sysmon 1 com processo pai estranho), comando e controle (Sysmon 3 ou firewall), persistência (Sysmon 11 ou 13), credenciais e movimento lateral (4624 tipo 3 em outro host), objetivo (leitura em massa, exfiltração, criptografia). Nem todo ataque segue o roteiro, mas quase todo deixa pegada em cada fase.',
    chegada: [
      { quem: 'thiaguinho', texto: 'Deixei uma linha do tempo pronta pra vocês. Tá no guardanapo da coxinha.', gesto: 'apontar' },
      { quem: 'ro', texto: 'Thiaguinho, metade desses horários tá em UTC e metade tá no fuso da sua cabeça.', expr: 'bravo' },
      { quem: 'thiaguinho', texto: 'Mas a ordem tá certa! Eu acho.', gesto: 'ombros' },
      { quem: 'gilmar', texto: 'Cliente Tabajara, notebook do financeiro, suspeita de macro. Quero a linha do tempo no ticket antes do tomate tocar.', gesto: 'apontar' },
      { quem: 'vandeco', texto: 'Normaliza tudo pra UTC. Uma vez perdi uma tarde porque um switch achava que estava em 1999.', expr: 'neutro' },
    ],
    fila: { quantidade: 7 },
    missoes: [
      {
        tipo: 'ordenar',
        titulo: 'A linha do tempo do NB-FIN-014',
        enunciado: 'Ordene os eventos do incidente na ordem em que aconteceram. Cuidado: algumas fontes estão em UTC e outras no horário de Brasília (BRT, UTC-3).',
        itens: [
          'Gateway de e-mail, 11:12 UTC: entregue `boleto_atrasado.xlsm` para ana.oliveira',
          'Sysmon 1, 08:19:05 BRT: `EXCEL.EXE` cria `powershell.exe -EncodedCommand ...` no NB-FIN-014',
          'Firewall, 11:19:40 UTC: NB-FIN-014 abre conexão TCP para um IP externo na porta 443',
          'Sysmon 11, 08:41 BRT: arquivo `C:\\Users\\Public\\atualiza.exe` criado pelo powershell.exe',
          'AD 4624, 12:05 UTC: logon tipo 3 no SRV-ARQ-01 com a conta ana.oliveira, origem NB-FIN-014',
          'Guarita EDR, 09:30 BRT: leitura em massa de arquivos no compartilhamento do SRV-ARQ-01',
        ],
        explicacao: 'Convertendo tudo para UTC: e-mail 11:12, Excel abrindo PowerShell 11:19:05, conexão de saída 11:19:40, arquivo criado 11:41, logon no servidor 12:05, leitura em massa 12:30. É a sequência entrega, execução, comando e controle, persistência, movimento lateral e objetivo. Quem ordenou pelos números sem converter colocou a macro antes do e-mail chegar.',
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Linha do tempo com fuso anotado. Vou imprimir e pendurar na geladeira.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'thiaguinho', texto: 'Posso ficar com o guardanapo de volta? Tem um resto de coxinha nele.', gesto: 'pensar' },
    ],
  },
  {
    n: 33,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'O mapa do inimigo',
    resumo: 'MITRE ATT&CK: tática, técnica e subtécnica, e como mapear alerta sem chutar.',
    aula:
      'O **MITRE ATT&CK** é uma base pública de comportamentos de atacante observados no mundo real. **Tática** é o objetivo (o "por quê"): Initial Access `TA0001`, Execution `TA0002`, Persistence `TA0003`, Credential Access `TA0006`, Lateral Movement `TA0008`, Exfiltration `TA0010`, Impact `TA0040`. **Técnica** é o "como", e **subtécnica** é o "como, especificamente".\n\n' +
      'Exemplos que você vai ver toda semana: `T1566.001` Spearphishing Attachment, `T1059.001` PowerShell, `T1110.003` Password Spraying, `T1078` Valid Accounts, `T1021.001` Remote Desktop Protocol, `T1003.001` LSASS Memory, `T1053.005` Scheduled Task, `T1486` Data Encrypted for Impact.\n\n' +
      'Mapear alerta para ATT&CK serve para três coisas: falar a mesma língua com o cliente e com outros times, medir **cobertura** (quais técnicas a gente detecta e quais estão no escuro) e ligar detecção a inteligência de ameaça (grupo X usa técnicas Y e Z). Uma técnica pode estar em mais de uma tática: `T1078` aparece em Initial Access, Persistence, Privilege Escalation e Defense Evasion.\n\n' +
      'Mapeie pelo comportamento que o log prova, não pelo nome da regra. Uma regra chamada "Ataque Hacker Crítico" que só vê um `4625` é, no máximo, `T1110`. E não, colocar ATT&CK em todo ticket não deixa o alerta mais verdadeiro. Deixa só mais bonito na reunião do Gilmar.',
    chegada: [
      { quem: 'keyla', texto: 'Mapeei todas as minhas regras no ATT&CK! A de impressora sem papel ficou como `T1485`, Data Destruction.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'ro', texto: 'Keyla, a impressora não está destruindo dados. Ela está destruindo a minha paciência, que não tem ID.', gesto: 'cruzar' },
      { quem: 'gilmar', texto: 'O cliente pediu relatório de cobertura ATT&CK. Eu não sei o que é, mas prometi para sexta.', expr: 'surpresa' },
      { quem: 'vandeco', texto: 'Na minha época a gente chamava isso de "lista do que o vagabundo faz". Agora tem site e ID. Evoluímos.', expr: 'neutro' },
      { quem: 'pamela', texto: 'Eu montei uma planilha com as técnicas que a gente realmente detecta. Ficou meio vazia, mas é honesta.', gesto: 'ombros' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Mapeando alertas no ATT&CK',
        enunciado: 'Mapeie cada comportamento observado nos logs para a técnica ou tática correta.',
        perguntas: [
          {
            p: 'Sysmon 1 mostra `WINWORD.EXE` criando `powershell.exe -EncodedCommand ...`. Qual técnica descreve o que o PowerShell está fazendo?',
            opcoes: ['T1059.001, Command and Scripting Interpreter: PowerShell', 'T1486, Data Encrypted for Impact', 'T1110.003, Password Spraying', 'T1021.001, Remote Desktop Protocol'],
            certa: 0,
            explicacao: 'Execução de comando via PowerShell é `T1059.001`, na tática Execution (`TA0002`). O documento do Word que entregou a macro seria `T1566.001` na fase de Initial Access.',
          },
          {
            p: 'Um único IP gera `4625` para 60 usuários diferentes, uma tentativa para cada. Qual subtécnica?',
            opcoes: ['T1110.001, Password Guessing', 'T1110.003, Password Spraying', 'T1078, Valid Accounts', 'T1003.001, LSASS Memory'],
            certa: 1,
            explicacao: 'Uma senha testada em muitas contas, poucas tentativas em cada, é spraying (`T1110.003`). Muitas senhas na mesma conta seria guessing (`T1110.001`).',
          },
          {
            p: 'Qual é a diferença entre tática e técnica?',
            opcoes: ['Tática é o objetivo do atacante; técnica é o meio de chegar lá.', 'Tática é o malware; técnica é o IP.', 'Tática é o que a regra detecta; técnica é a severidade.', 'São sinônimos; o MITRE só usou duas palavras.'],
            certa: 0,
            explicacao: 'Tática responde "por quê" (ganhar acesso, roubar credencial, mover lateralmente). Técnica responde "como". Subtécnica detalha o como.',
          },
          {
            p: 'Login bem-sucedido com senha correta de uma conta real, feito pelo atacante que comprou a senha num vazamento. Qual técnica?',
            opcoes: ['T1566, Phishing', 'T1078, Valid Accounts', 'T1059, Command and Scripting Interpreter', 'Nenhuma, porque o login deu certo.'],
            certa: 1,
            explicacao: '`T1078` é justamente o atacante usando conta legítima. É uma das técnicas mais difíceis de detectar, porque o log é igual ao de um dia normal: o que denuncia é o contexto (horário, origem, dispositivo).',
          },
        ],
      },
    ],
    saida: [
      { quem: 'keyla', texto: 'Tá bom, tirei o `T1485` da impressora. Coloquei `T1499`, Endpoint Denial of Service.', gesto: 'pensar' },
      { quem: 'ro', texto: 'Amanhã a gente conversa sobre essa impressora. Com calma. E com café.', expr: 'neutro' },
    ],
  },
  {
    n: 34,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'A impressora que faz força bruta',
    resumo: 'Tuning 1: matar o falso positivo pela raiz sem cegar o SOC.',
    aula:
      '**Tuning** é ajustar a regra para ela parar de gritar à toa sem ficar surda. A regra ruim vira ruído, o ruído vira fadiga, e a fadiga faz alguém fechar em lote o alerta que era de verdade. Todo SOC tem uma impressora com senha vencida de conta de serviço gerando `4625` com status `0xC000006A` (senha errada) a cada quinze minutos.\n\n' +
      'Primeiro, conserte a causa quando puder: avisar o cliente para atualizar a senha da `svc_scanner` resolve mais que qualquer exclusão. Enquanto isso, a exclusão deve ser a **mais específica possível**: combinação de conta, host de origem e IP. Excluir por um campo só ("tudo de `svc_*`", "todo logon tipo 3") é desligar a regra com outro nome.\n\n' +
      'Pergunta de ouro antes de aprovar uma exclusão: **se o atacante estivesse aqui, esse filtro esconderia ele?** Spraying vem quase sempre como logon tipo 3 com `0xC000006A` e `0xC0000064` (usuário inexistente), muitas vezes testando contas de serviço. Qualquer filtro que casa com isso é armadilha.\n\n' +
      'Toda exclusão precisa de dono, motivo, ticket e **validade**. Exclusão eterna é o lugar onde atacante mora de graça.',
    chegada: [
      { quem: 'keyla', texto: 'A minha regra de força bruta disparou 52 vezes ontem. Ela está funcionando perfeitamente!', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'ro', texto: 'Funcionando perfeitamente é o ventilador do Thiaguinho. Tua regra está denunciando uma impressora.', gesto: 'cintura' },
      { quem: 'keyla', texto: 'E se a impressora for maliciosa?', expr: 'surpresa' },
      { quem: 'vandeco', texto: 'Já vi impressora comprometida. Mas essa aqui não consegue nem imprimir frente e verso.', expr: 'neutro' },
      { quem: 'gilmar', texto: 'Quero menos alerta e nenhum incidente perdido. As duas coisas. Ao mesmo tempo. Até as seis.', gesto: 'apontar' },
    ],
    fila: { quantidade: 6 },
    missoes: [
      {
        tipo: 'regra',
        titulo: 'Tuning da regra de força bruta da Tabajara',
        enunciado: 'A regra dispara demais por causa da impressora do segundo andar e do servidor de monitoramento. No meio do barulho há um password spraying de verdade. Escolha as exclusões que tiram o falso positivo sem esconder o ataque.',
        regra: 'evento=4625 contra SRV-DC-01, mais de 3 falhas em 1 hora por conta: severidade alta',
        registros: registrosImpressora(),
        exclusoes: [
          { texto: 'Excluir a conta svc_scanner vindo da impressora IMP-2ANDAR-01', filtro: 'usuario=svc_scanner host_origem=IMP-2ANDAR-01' },
          { texto: 'Excluir a conta svc_monitor vindo do SRV-MON-01 (10.20.1.15)', filtro: 'usuario=svc_monitor ip_origem=10.20.1.15' },
          { texto: 'Excluir todas as contas de serviço (svc_*)', filtro: 'usuario=svc_*' },
          { texto: 'Excluir logon tipo 3 (rede), que é onde está o barulho', filtro: 'logon_tipo=3' },
          { texto: 'Excluir status 0xC000006A (senha errada é coisa de usuário)', filtro: 'status=0xC000006A' },
          { texto: 'Excluir origem interna (10.20.*), porque ataque vem de fora', filtro: 'ip_origem=10.20.*' },
        ],
        minReducao: 0.8,
        explicacao: 'As duas exclusões seguras combinam conta e origem, então só calam a impressora e o monitoramento. Excluir `svc_*` esconderia as tentativas do atacante contra `svc_backup` e `svc_sql`. Excluir logon tipo 3, status `0xC000006A` ou rede interna apagaria o spraying inteiro do DT-ATEND-031, que testou 16 contas em pouco mais de 100 segundos. E abra o ticket para trocar a senha da impressora: a melhor exclusão é a que deixa de ser necessária.',
      },
    ],
    saida: [
      { quem: 'keyla', texto: 'Ela ainda dispara, mas agora só quando é sério. Parece até gente.', expr: 'sorriso' },
      { quem: 'neide', texto: 'A impressora do segundo andar? Eu desligo ela da tomada toda noite pra ligar o aspirador. Ajuda?', gesto: 'pensar' },
      { quem: 'ro', texto: 'Neide, você acabou de explicar por que ela perde a senha. Volta amanhã pra gente conversar.', expr: 'surpresa' },
    ],
  },
  {
    n: 35,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'Sigma, a regra que viaja',
    resumo: 'Lendo uma regra Sigma: logsource, detection, condition e falsos positivos.',
    aula:
      '**Sigma** é um formato aberto em YAML para escrever regra de detecção uma vez e converter para a linguagem de vários SIEMs. É o que permite pegar uma detecção publicada pela comunidade e trazer para o Vigia sem reescrever do zero.\n\n' +
      'As partes que importam: `logsource` diz **de onde** vem o dado (`product: windows`, `category: process_creation` significa Sysmon 1 ou `4688`). `detection` tem os blocos de seleção com os campos e modificadores (`|endswith`, `|contains`, `|startswith`, `|re`). Dentro de um bloco, campos diferentes são **E**; uma lista de valores no mesmo campo é **OU**.\n\n' +
      '`condition` amarra os blocos: `selection and not filter`, `1 of selection_*`, `all of selection_*`. É aqui que mora o tuning bem feito, com filtros nomeados e documentados. O campo `falsepositives` é só **documentação**: escrever "SCCM" ali não exclui o SCCM de nada. `level` é a severidade sugerida e `tags` guarda o mapeamento ATT&CK (`attack.t1059.001`).\n\n' +
      'Regra importada precisa de teste no seu ambiente: os nomes de campo mudam de fonte para fonte, e uma regra que não casa com nada não gera falso positivo nenhum. Nem verdadeiro. É a regra perfeita para o relatório e inútil para o cliente.',
    chegada: [
      { quem: 'keyla', texto: 'Achei uma regra Sigma de PowerShell codificado. Copiei, colei, converti e ela não disparou nenhuma vez em uma semana!', gesto: 'comemorar' },
      { quem: 'ro', texto: 'Ou o mundo ficou bonzinho, ou o campo `CommandLine` aqui se chama outra coisa. Adivinha qual.', gesto: 'cruzar' },
      { quem: 'jefferson', texto: 'YAML cai em concurso? Porque se cair eu estudo. Se não, não.', gesto: 'pensar' },
      { quem: 'vandeco', texto: 'YAML é o único idioma em que um espaço a mais derruba um SOC inteiro.', expr: 'neutro' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Lendo a regra da Keyla',
        enunciado: 'Leia a regra Sigma do anexo e responda.',
        anexo:
          "title: PowerShell com comando codificado\n" +
          "status: experimental\n" +
          "logsource:\n" +
          "  product: windows\n" +
          "  category: process_creation\n" +
          "detection:\n" +
          "  selection_img:\n" +
          "    Image|endswith: '\\powershell.exe'\n" +
          "  selection_cli:\n" +
          "    CommandLine|contains:\n" +
          "      - ' -enc '\n" +
          "      - ' -EncodedCommand '\n" +
          "  filter_sccm:\n" +
          "    ParentImage|endswith: '\\CcmExec.exe'\n" +
          "  condition: all of selection_* and not filter_sccm\n" +
          "falsepositives:\n" +
          "  - Scripts de gerenciamento\n" +
          "  - Agente de inventário da Tabajara\n" +
          "level: high\n" +
          "tags:\n" +
          "  - attack.execution\n" +
          "  - attack.t1059.001",
        perguntas: [
          {
            p: 'Que tipo de evento essa regra precisa receber?',
            opcoes: ['Logon do Windows (4624)', 'Criação de processo (Sysmon 1 ou 4688)', 'Consulta DNS (Sysmon 22)', 'Conexão de rede (Sysmon 3)'],
            certa: 1,
            explicacao: '`category: process_creation` é criação de processo. No Windows isso vem do Sysmon evento 1 ou do `4688` com linha de comando habilitada na auditoria.',
          },
          {
            p: 'Os dois valores dentro de `CommandLine|contains` funcionam como:',
            opcoes: ['E: a linha precisa ter os dois', 'OU: basta ter um deles', 'Exclusão', 'Comentário'],
            certa: 1,
            explicacao: 'Lista de valores no mesmo campo é OU. Campos diferentes no mesmo bloco seriam E.',
          },
          {
            p: 'A lista em `falsepositives` exclui o agente de inventário da Tabajara da detecção?',
            opcoes: ['Sim, tudo que está ali é ignorado', 'Não, é só documentação; para excluir é preciso um filtro em `detection` e citá-lo em `condition`', 'Só se o `level` for low', 'Sim, mas só no SOC Bravo'],
            certa: 1,
            explicacao: '`falsepositives` avisa quem lê a regra. Quem exclui é o bloco de filtro (como `filter_sccm`) usado na `condition` com `not`.',
          },
          {
            p: 'A regra converteu sem erro, mas não disparou em uma semana inteira num cliente com 3 mil estações. Qual é o primeiro suspeito?',
            opcoes: ['Ninguém usa PowerShell codificado, ótimo', 'Mapeamento de campos: no SIEM o campo pode se chamar `process.command_line` ou o 4688 pode estar sem linha de comando', 'O `level` precisa ser critical', 'O YAML está bonito demais'],
            certa: 1,
            explicacao: 'Silêncio total é suspeito. Teste a regra com um evento de exemplo e confira nomes de campo e se a fonte realmente envia a linha de comando.',
          },
          {
            p: 'Um atacante executa o PowerShell a partir de um processo chamado `CcmExec.exe` que ele mesmo colocou em `C:\\Users\\Public\\`. O que acontece?',
            opcoes: ['A regra pega, porque a pasta é estranha', 'A regra não pega: o filtro olha só o fim do caminho do pai; o certo seria filtrar o caminho completo e a assinatura', 'O Sigma bloqueia automaticamente', 'O SCCM avisa o SOC'],
            certa: 1,
            explicacao: '`endswith` no nome do processo pai é filtro frouxo. Filtro bom usa caminho completo (`C:\\Windows\\CCM\\CcmExec.exe`) e, se a fonte permitir, assinatura ou hash.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'keyla', texto: 'O campo se chamava `process_command_line`. Agora ela disparou 300 vezes. Isso é bom?', expr: 'surpresa' },
      { quem: 'ro', texto: 'É ótimo. Amanhã você descobre quais dessas 300 são o inventário. Bem-vinda ao tuning.', gesto: 'sim' },
    ],
  },
  {
    n: 36,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'O boleto que não tem vírus',
    resumo: 'BEC: sem malware, com domínio parecido e conta bancária trocada.',
    aula:
      '**BEC** (Business Email Compromise) é golpe sem anexo malicioso e sem link: só texto, urgência e uma conta bancária nova. Ele passa pelo antivírus porque não tem nada para o antivírus ver. O prejuízo médio é bem maior que o de muito ransomware, e o atacante não precisa saber programar, só escrever com educação.\n\n' +
      'Os sinais aparecem no cabeçalho e no contexto: domínio parecido registrado há poucos dias (`agropecas-sul.com.br` x `agropecas-sul-financeiro.com`), `Reply-To` diferente do `From`, pedido de troca de dados bancários, pressa e sigilo ("não comente com ninguém"). Cuidado: **SPF, DKIM e DMARC passando só provam que o e-mail veio do domínio que diz vir**. Se o domínio é do golpista, passa tudo.\n\n' +
      'Quando o golpe usa a caixa real do fornecedor (conta comprometida), o cabeçalho fica limpo. Aí o que denuncia é comportamento: login de origem estranha, regra de caixa de entrada nova, conversa antiga respondida com dado bancário diferente. No ATT&CK, o fingimento é `T1656` (Impersonation) e o acesso à caixa costuma ser `T1078`.\n\n' +
      'A resposta certa nunca é "responder o e-mail perguntando se é golpe". É confirmar por **canal independente**: telefone que já estava no cadastro do fornecedor, não o do rodapé da mensagem. Se o dinheiro já saiu, o tempo manda: acione o banco imediatamente para tentar o bloqueio.',
    chegada: [
      { quem: 'telefone', texto: 'Meu jovem, aqui é o Leôncio. Chegou um e-mail do fornecedor de ração dizendo que mudou de banco. Posso pagar? É urgente, ele disse que é urgente.' },
      { quem: 'ro', texto: 'Quando o fornecedor diz que é urgente e sigiloso, a única coisa urgente é desconfiar.', gesto: 'nao' },
      { quem: 'brenda', texto: 'Escalo pro N3? Pro jurídico? Pra Polícia Federal? Pro papa?', expr: 'surpresa' },
      { quem: 'vandeco', texto: 'BEC é o golpe do bilhete premiado de terno e gravata. Não tem malware, tem lábia.', expr: 'neutro' },
      { quem: 'gilmar', texto: 'Cliente cooperativa, valor alto. Analisa o cabeçalho antes que o Leôncio aperte o botão.', gesto: 'apontar' },
    ],
    fila: { quantidade: 7 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'O fornecedor que mudou de banco',
        enunciado: 'O Dr. Leôncio encaminhou o e-mail. Analise o cabeçalho e o corpo.',
        anexo:
          'Received: from mail.agropecas-sul-financeiro.com (191.33.47.120)\n' +
          '  by mx.pastoralo.coop.br; Tue, 10 Mar 2026 14:02:11 +0000\n' +
          'Authentication-Results: mx.pastoralo.coop.br;\n' +
          '  spf=pass smtp.mailfrom=agropecas-sul-financeiro.com;\n' +
          '  dkim=pass header.d=agropecas-sul-financeiro.com;\n' +
          '  dmarc=pass header.from=agropecas-sul-financeiro.com\n' +
          'From: "Financeiro Agropeças Sul" <cobranca@agropecas-sul-financeiro.com>\n' +
          'Reply-To: agropecas.financeiro@caixapostal-gratis.top\n' +
          'To: leoncio@pastoralo.coop.br\n' +
          'Subject: RES: Pedido 4471 ração bovina | ATUALIZAÇÃO CADASTRAL URGENTE\n' +
          '\n' +
          'Prezado Dr. Leôncio,\n' +
          'Informamos que nossa conta no banco anterior está em auditoria. Por gentileza, realize o\n' +
          'pagamento da NF 4471 (R$ 380.000,00) para a nova conta abaixo ainda hoje, para não\n' +
          'atrasar a entrega. Pedimos sigilo, pois a mudança ainda não foi comunicada aos demais clientes.\n' +
          '\n' +
          '[WHOIS do domínio remetente: criado em 07/03/2026]\n' +
          '[Fornecedor cadastrado na cooperativa: agropecas-sul.com.br, desde 2014]',
        perguntas: [
          {
            p: 'SPF, DKIM e DMARC passaram. Isso quer dizer que o e-mail é legítimo?',
            opcoes: ['Sim, os três passaram, pode pagar', 'Não: provam só que veio de `agropecas-sul-financeiro.com`, que não é o domínio cadastrado do fornecedor', 'Sim, porque o DKIM é assinatura digital', 'Depende do antivírus'],
            certa: 1,
            explicacao: 'Autenticação de e-mail valida o domínio, não a intenção. O golpista registrou o domínio parecido três dias antes e configurou tudo direitinho.',
          },
          {
            p: 'Qual combinação de sinais é a mais forte para BEC aqui?',
            opcoes: ['Assunto com "RES:" e letra maiúscula', 'Domínio parecido criado há 3 dias, `Reply-To` em outro domínio, troca de conta bancária, urgência e pedido de sigilo', 'O e-mail ter chegado às 14h', 'O valor ser redondo'],
            certa: 1,
            explicacao: 'Nenhum sinal sozinho fecha o caso, mas juntos são o retrato de BEC. O `Reply-To` garante que a resposta vá para o golpista mesmo que alguém clique em "responder".',
          },
          {
            p: 'O que orientar o Dr. Leôncio a fazer agora?',
            opcoes: ['Responder o e-mail perguntando se é verdade', 'Ligar para o fornecedor no telefone que já estava no cadastro e não pagar até confirmar', 'Ligar para o número que está na assinatura do e-mail', 'Pagar metade para testar'],
            certa: 1,
            explicacao: 'Confirmação por canal independente. Responder o e-mail ou ligar para o número do rodapé é conversar com o próprio golpista.',
          },
          {
            p: 'Se o e-mail tivesse vindo do domínio verdadeiro `agropecas-sul.com.br`, com tudo passando, o que mudaria na investigação?',
            opcoes: ['Nada, seria legítimo com certeza', 'Hipótese de conta do fornecedor comprometida: avisar o fornecedor e procurar regra de encaminhamento, login estranho e conversas antigas respondidas', 'Seria problema só do fornecedor, encerrar', 'Bloquear o domínio do fornecedor para sempre'],
            certa: 1,
            explicacao: 'BEC com caixa real comprometida é comum. O pedido de troca bancária continua exigindo confirmação por telefone, não importa de onde veio o e-mail.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'telefone', texto: 'Liguei pro número antigo, meu jovem. O fornecedor não mudou de banco nenhum. Ainda bem que eu não cliquei. Dessa vez.' },
      { quem: 'ro', texto: '"Dessa vez." Anota no ticket, que essa frase vai voltar.', expr: 'neutro' },
    ],
  },
  {
    n: 37,
    site: 'alfa',
    turno: 'noite',
    titulo: 'Assando tíquetes',
    resumo: 'Kerberoasting: muitos 4769 com RC4 (0x17) da mesma conta em poucos segundos.',
    aula:
      'No Kerberos, quem já tem um TGT (evento `4768`) pede um tíquete de serviço para cada SPN que quer acessar (evento `4769` no controlador de domínio). Esse tíquete vem cifrado com a senha da **conta de serviço**. No **Kerberoasting** (`T1558.003`), o atacante com qualquer conta de domínio pede tíquetes de vários SPNs e leva para quebrar a senha fora da rede, longe dos seus logs.\n\n' +
      'O que o SOC vê: vários `4769` da mesma conta, para SPNs diferentes, em poucos segundos, com `Ticket Encryption Type` igual a `0x17` (RC4-HMAC). Ambiente moderno usa `0x12` (AES256) ou `0x11` (AES128); RC4 é pedido de propósito porque é mais fácil de quebrar. Usuário comum não precisa de tíquete para o SQL, o backup e o SharePoint no mesmo minuto.\n\n' +
      'Cuidado com o ruído: sistema legado que só fala RC4 gera `0x17` legítimo, mas sempre para o mesmo serviço. O que pesa é a **quantidade de serviços distintos** pedidos pela mesma conta numa janela curta.\n\n' +
      'Defesa: senha longa e aleatória em conta de serviço (ou gMSA, que troca sozinha), desabilitar RC4 onde der, e um **SPN isca** (honey SPN) numa conta que ninguém usa: qualquer `4769` para ele é alerta de alta confiança. Sim, é uma armadilha. Não, não é crueldade.',
    chegada: [
      { quem: 'thiaguinho', texto: 'Turno da noite com vocês? Que honra. Trouxe coxinha pra todo mundo. Já mordi uma pra conferir a qualidade.', gesto: 'acenar', expr: 'sorriso' },
      { quem: 'vandeco', texto: 'O DC da Tabajara gerou um monte de `4769` com RC4 às 14h31. Tem cheiro de forno ligado.', gesto: 'pensar' },
      { quem: 'thiaguinho', texto: 'Forno? Tipo de coxinha?', expr: 'surpresa' },
      { quem: 'vandeco', texto: 'Tipo de tíquete Kerberos sendo assado pra quebrar senha. A coxinha é inocente, Thiaguinho.', expr: 'neutro' },
      { quem: 'ro', texto: 'Sistema legado de sinistros também pede RC4. Então não sai apontando o dedo pra primeira linha que aparecer.', gesto: 'apontar' },
    ],
    fila: { quantidade: 9 },
    missoes: [
      {
        tipo: 'siem',
        titulo: 'Quem pediu tíquete demais',
        enunciado: 'Registros do SRV-DC-01 da Tabajara (`4768` e `4769`). Um sistema legado de sinistros gera RC4 legítimo. Encontre a conta que fez Kerberoasting.',
        registros: registrosKerberos(),
        pergunta: 'Qual conta pediu tíquetes RC4 para mais serviços distintos? (escreva como aparece no campo usuario)',
        resposta: 'camila.ribeiro@TABAJARA.LOCAL',
        gabarito: 'evento=4769 criptografia=0x17 | distintos servico por usuario | ordenar -distintos',
        dica: 'Filtre `evento=4769 criptografia=0x17`, depois conte serviços diferentes por conta com `| distintos servico por usuario` e ordene com `| ordenar -distintos`.',
        explicacao: 'A camila.ribeiro pediu nove SPNs diferentes com RC4 em cerca de 30 segundos, saindo do 10.20.22.91. O legado de sinistros também usa `0x17`, mas cada usuário pede sempre o mesmo serviço. Próximos passos: verificar se a conta da camila foi comprometida (origem, horário, EDR da máquina), trocar a senha das contas de serviço expostas, priorizando as que têm privilégio, e revisar onde o RC4 ainda é permitido.',
      },
    ],
    saida: [
      { quem: 'vandeco', texto: 'Nove SPNs em meio minuto. Ninguém trabalha tão rápido assim de boa vontade.', expr: 'neutro' },
      { quem: 'thiaguinho', texto: 'Vou fechar os outros alertas em lote pra comemorar.', gesto: 'comemorar' },
      { quem: 'ro', texto: 'Não vai, não.', gesto: 'nao', expr: 'bravo' },
    ],
  },
  {
    n: 38,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'Pulando de máquina em máquina',
    resumo: 'Movimento lateral: logon tipo 3, ADMIN$, serviço novo 7045 e o famoso PSEXESVC.',
    aula:
      'Depois de pegar credencial, o atacante anda pela rede. No Windows, o caminho mais visto usa compartilhamentos administrativos (`T1021.002`, SMB/Windows Admin Shares) e execução por serviço (`T1569.002`). A ferramenta PsExec, muito usada por administrador legítimo, também é muito usada por ransomware.\n\n' +
      'A pegada nos logs do host de destino vem em sequência: `4624` com **logon tipo 3** (rede) vindo do IP da máquina de origem, `5145` (acesso a objeto de compartilhamento, se auditado) em `ADMIN$` gravando `PSEXESVC.exe`, e `7045` no log System: serviço novo instalado, nome `PSEXESVC`. Quando a conta vem com privilégio, aparece também o `4672`.\n\n' +
      'Para separar administrador de atacante, olhe o padrão: a ferramenta de gestão (SCCM, inventário) usa conta de serviço conhecida, de servidor conhecido, em horário de janela. O atacante usa conta de gente, de estação de trabalho, em sequência rápida, para hosts que aquela conta nunca tocou. **Um IP de origem tocando muitos hosts com logon tipo 3 em poucos minutos** é o sinal clássico.\n\n' +
      'Contenção: isolar a máquina de origem no EDR, desabilitar ou trocar a senha da conta usada e verificar cada host de destino. Desligar o switch inteiro funciona, mas o Gilmar perde o timer de tomate no meio da confusão.',
    chegada: [
      { quem: 'gilmar', texto: 'O EDR da Tabajara marcou `PSEXESVC` em seis máquinas. O pessoal de TI jura que não foi ninguém. Isso sempre me dá azia.', gesto: 'cintura' },
      { quem: 'kevin', texto: 'PsExec é ferramenta de admin. Falso positivo, fecho?', gesto: 'ombros' },
      { quem: 'ro', texto: 'Faca também é ferramenta de cozinha, Kevin. Depende de onde ela aparece.', gesto: 'cruzar' },
      { quem: 'pamela', texto: 'O SCCM loga em todas as máquinas de madrugada. Tem que separar ele do resto.', gesto: 'pensar' },
      { quem: 'vandeco', texto: 'Procura quem logou tipo 3 em muita máquina com conta de gente. A conta de serviço tem desculpa. Gente, não.', expr: 'neutro' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'siem',
        titulo: 'De onde saiu o PSEXESVC',
        enunciado: 'Registros de vários hosts da Tabajara (`4624`, `5145`, `7045`). O SCCM (`svc_sccm`, 10.20.1.10) faz inventário de madrugada. Ache a origem do movimento lateral.',
        registros: registrosLateral(),
        pergunta: 'Qual IP de origem fez logon tipo 3 em mais hosts usando conta que não é de serviço?',
        resposta: '10.20.14.88',
        gabarito: 'evento=4624 logon_tipo=3 usuario!=svc_* | distintos host por ip_origem | ordenar -distintos',
        dica: 'Use `evento=4624 logon_tipo=3 usuario!=svc_*` para tirar as contas de serviço, depois `| distintos host por ip_origem | ordenar -distintos`. Para conferir, procure `evento=7045 servico=PSEXESVC`.',
        explicacao: 'O 10.20.14.88 logou com a conta `suporte.ti` em seis hosts, um a cada minuto e meio, e em cada um apareceu `5145` gravando `PSEXESVC.exe` em `ADMIN$` seguido de `7045`. O SCCM também toca muitos hosts, mas com conta de serviço, de servidor conhecido, em janela de madrugada. Próximo passo: isolar a máquina do 10.20.14.88, desabilitar a `suporte.ti` e investigar o que foi executado em cada destino.',
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Seis máquinas, uma origem, ticket aberto. Pode ir almoçar. Leva o tomate, não confio no Kevin com ele.', gesto: 'sim' },
      { quem: 'kevin', texto: 'Eu ia fechar como falso positivo. Agora tô com medo do meu histórico.', expr: 'triste' },
    ],
  },
];
