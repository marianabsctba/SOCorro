// Ato 3, dias 61 a 70: o ciclo de resposta, o ransomware no hospital, o BEC do Dr. Leôncio e a proposta do concorrente.
import type { Dia } from '../../tipos';
import { registrosDia62, registrosDia65, registrosDia69 } from './registros';

export const DIAS_61_70: Dia[] = [
  // -------------------------------------------------------------------------
  {
    n: 61,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'O ciclo que ninguém segue',
    resumo: 'NIST SP 800-61: preparar, detectar, conter, erradicar, recuperar e aprender.',
    aula: [
      'O **NIST SP 800-61** é o guia de resposta a incidentes mais citado do mundo. Na revisão 2, o ciclo tem quatro fases: **Preparação**; **Detecção e Análise**; **Contenção, Erradicação e Recuperação**; e **Atividade Pós-Incidente**. A revisão 3, publicada em 2025, encaixa a resposta nas funções do NIST CSF 2.0 (Governar, Identificar, Proteger, Detectar, Responder, Recuperar), mas a lógica não mudou: se preparar, perceber, estancar, limpar, voltar e aprender.',
      '**Preparação** é tudo o que existe antes do alerta: playbook revisado, contatos do cliente atualizados (inclusive jurídico e encarregado de dados, o DPO), acesso testado às ferramentas, backup que já foi restaurado alguma vez e matriz de escalonamento. Incidente não é hora de descobrir que a senha do console do EDR está num post-it na mesa de quem saiu de férias.',
      '**Detecção e análise** confirmam se é incidente e definem o escopo: quais hosts, contas e dados, desde quando, com qual severidade. Depois vem a **contenção** (impedir que piore: isolar host, desabilitar conta, segmentar rede), a **erradicação** (remover a causa: malware, persistência, conta criada pelo atacante) e a **recuperação** (voltar a operar com monitoramento reforçado). A ordem importa: erradicar antes de conter é enxugar gelo com o freezer aberto.',
      'A **atividade pós-incidente** fecha o ciclo: reunião de lições aprendidas, ações com dono e prazo, ajuste de detecção e de playbook. O ciclo é circular, o que se aprende volta para a preparação. Se a reunião termina com "a culpa foi do estagiário", o ciclo quebrou e o próximo incidente já está agendado.',
    ].join('\n\n'),
    chegada: [
      { quem: 'gilmar', texto: 'Bom dia! Hoje começa uma fase nova. Vocês vão atender incidente do começo ao fim. E eu comprei um tomate novo.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'narrador', texto: 'Gilmar coloca sobre a mesa um timer de cozinha em forma de tomate. É maior que o antigo. Tem alarme mais alto.' },
      { quem: 'ro', texto: 'O antigo morreu cronometrando o MTTR do Thiaguinho. Não aguentou a espera.', expr: 'neutro' },
      { quem: 'vandeco', texto: 'Em 2003 a gente não tinha NIST nenhum. A gente tinha um caderno espiral e um ramal que ninguém atendia. O caderno funcionava melhor que muito playbook que eu vejo hoje.', gesto: 'pensar' },
      { quem: 'keyla', texto: 'Eu imprimi o SP 800-61 inteiro. Grifei de cinco cores. Ninguém vai me pegar desprevenida.', gesto: 'apontar', expr: 'sorriso' },
      { quem: 'ro', texto: 'Ótimo. Quando o ransomware chegar, a gente joga as folhas grifadas nele.' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'ordenar',
        titulo: 'O incidente da Tabajara, na ordem certa',
        enunciado: 'O Guarita EDR pegou um processo suspeito no notebook do financeiro da Tabajara. Gilmar quer o atendimento descrito fase por fase, do jeito que o NIST manda. Coloque os passos na ordem.',
        itens: [
          'Preparação: playbook revisado, contatos do cliente e acessos às ferramentas testados',
          'Detecção: alerta do Guarita EDR com processo suspeito no NB-FIN-014',
          'Análise: confirmar o verdadeiro positivo, definir escopo e severidade',
          'Contenção: isolar o notebook pelo EDR e desabilitar a conta afetada',
          'Erradicação: remover a persistência e o artefato malicioso',
          'Recuperação: reimagem, devolução ao usuário e monitoramento reforçado',
          'Pós-incidente: lições aprendidas com ações, donos e prazos',
        ],
        explicacao: 'O ciclo do NIST SP 800-61 começa antes do alerta (preparação), passa por detectar e analisar (confirmar e definir escopo), conter antes de erradicar (para o atacante não reagir enquanto você limpa), recuperar com vigilância e termina aprendendo. Pular a análise leva a conter o host errado; pular a contenção deixa o atacante assistir você limpar.',
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Sete fases, sete passos. Se todo incidente fosse assim, eu aposentava o tomate.', expr: 'sorriso' },
      { quem: 'neide', texto: 'Ninguém aposenta tomate, seu Gilmar. Tomate a gente usa até virar molho.' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 62,
    site: 'alfa',
    turno: 'madrugada',
    titulo: 'Hora zero no Santa Paciência',
    resumo: 'Ransomware no hospital. Os arquivos cifrados mostram o estrago; o paciente zero está horas antes.',
    aula: [
      'Ransomware moderno quase sempre é **dupla extorsão**: a quadrilha copia os dados antes de cifrar e ameaça publicar. A cifragem (**T1486**, Data Encrypted for Impact) é o último ato de uma peça que começou horas ou dias antes: acesso inicial, execução, comunicação com o C2, descoberta, movimento lateral e a tentativa de impedir a recuperação apagando cópias de sombra (**T1490**, Inhibit System Recovery, o famoso `vssadmin delete shadows`).',
      'O **paciente zero** é o primeiro host comprometido, não o primeiro host cifrado. Quem olha só os arquivos `.sjt` aparecendo acha o servidor de arquivos e conclui errado. Para achar a origem, volte no tempo: qual foi o primeiro processo estranho? Quem foi o processo pai? Houve conexão externa logo em seguida?',
      'Sinais clássicos de acesso inicial por e-mail: anexo malicioso (**T1566.001**), execução pelo usuário (**T1204.002**) e extensão dupla para enganar o olho (**T1036.007**, como `laudo.pdf.exe`). No Sysmon, o evento 1 mostra o processo e o pai; o evento 3 mostra a conexão; o evento 11 mostra arquivos criados. Processo filho do `OUTLOOK.EXE` com extensão dupla é praticamente uma confissão assinada.',
      'Em hospital, a pergunta técnica anda junto com a clínica: o que está parado afeta paciente? Avise a liderança do plantão para acionar a contingência em papel antes de qualquer outra coisa. Prontuário que não abre não é só um ticket P1, é um médico decidindo sem histórico.',
    ].join('\n\n'),
    chegada: [
      { quem: 'telefone', texto: 'Aqui é a enfermeira-chefe do Santa Paciência. Os computadores da recepção estão com um papel de parede de caveira e os arquivos terminam com ".sjt". Isso é normal?', expr: 'surpresa' },
      { quem: 'thiaguinho', texto: 'Eu ia fechar como falso positivo, mas a caveira tem uma carteira de bitcoin embaixo. Achei que valia escalar.', gesto: 'ombros' },
      { quem: 'vandeco', texto: 'Bom instinto, menino. Caveira com carteira nunca é falso positivo.', gesto: 'sim' },
      { quem: 'vandeco', texto: 'Já vi esse filme em 2003, só que a caveira era em ASCII. Primeiro a gente acha por onde entrou. Os arquivos cifrados são a fumaça, eu quero o fósforo.', gesto: 'pensar' },
      { quem: 'gilmar', texto: 'Timer ligado. Quatro e cinquenta da manhã, e o tomate já está suando.', gesto: 'apontar' },
      { quem: 'ro', texto: 'Liga pro hospital e manda acionar a contingência em papel. A gente acha o culpado, eles salvam gente. Cada um no seu.' },
    ],
    fila: { quantidade: 6 },
    missoes: [
      {
        tipo: 'siem',
        titulo: 'Achar o paciente zero',
        enunciado: 'O Vigia trouxe seis horas de Sysmon das estações e servidores do Hospital Santa Paciência. Os arquivos `.sjt` começaram a aparecer às 4h55. Ache o host onde tudo começou.',
        registros: registrosDia62(),
        pergunta: 'Qual é o host do paciente zero?',
        resposta: 'DT-RECEP-04',
        gabarito: 'processo=*.pdf.exe | ordenar hora | tabela host,hora,usuario,processo,processo_pai',
        dica: 'Os `.sjt` (`evento=11 arquivo=*.sjt | ordenar hora`) mostram o estrago, não a origem. Volte no tempo pelos processos: `evento=1 processo_pai=OUTLOOK.EXE | ordenar hora` e desconfie de extensão dupla.',
        explicacao: 'Às 2h13 a `aline.martins`, na DT-RECEP-04, abriu `laudo_exame_0931.pdf.exe` direto do cache do Outlook (T1566.001 e T1204.002, com extensão dupla T1036.007). Trinta segundos depois veio a conexão para `179.61.204.33:443`, depois o `rundll32` carregando uma DLL de `ProgramData` e a descoberta de administradores do domínio. A NB-ENF-11 abriu o mesmo anexo às 4h10, mas é a segunda vítima, não a primeira. O `vssadmin` e os `.sjt` no SRV-ARQ-HSP são o fim da história, quase três horas depois.',
      },
    ],
    saida: [
      { quem: 'vandeco', texto: 'Achou o fósforo. Agora o incêndio tem endereço.', gesto: 'sim', expr: 'sorriso' },
      { quem: 'gilmar', texto: 'Registra no Chamadão com a linha do tempo. Abriu ticket? Então aconteceu. Infelizmente, desta vez aconteceu mesmo.' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 63,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'Contém, mas não desliga',
    resumo: 'Contenção no hospital: segmentar, isolar pelo EDR, preservar memória e respeitar a prioridade clínica.',
    aula: [
      'Contenção é ganhar tempo sem destruir evidência. A de **curto prazo** estanca agora (isolar host pelo EDR, desabilitar contas comprometidas, bloquear o C2 no firewall, cortar SMB entre segmentos). A de **longo prazo** segura a operação enquanto a erradicação acontece (VLAN de quarentena, regras temporárias, contas novas para a TI trabalhar).',
      '**Não desligue a máquina** sem pensar. Desligar apaga a memória: processos, conexões abertas, chaves de cifragem que às vezes ainda estão lá, comandos executados. O isolamento pelo EDR corta a rede e mantém o host vivo e acessível para coleta. Se não tiver EDR, desconectar o cabo é melhor que tirar da tomada.',
      'Movimento lateral de ransomware adora SMB (**T1021.002**, porta 445) e RDP (**T1021.001**, porta 3389). Bloquear 445 e 3389 entre as estações e entre segmentos costuma frear a propagação sem derrubar o hospital. Credenciais de administrador usadas pelo atacante precisam ser trocadas, de preferência a partir de uma máquina limpa.',
      'Em hospital, a contenção passa pela **prioridade clínica**. Ventilador, bomba de infusão, monitor de UTI e o PACS da tomografia não são reiniciados por quem está no SOC: a engenharia clínica e a liderança assistencial precisam estar na conversa. Isolar o servidor do prontuário sem avisar o plantão pode parar a emergência inteira. Contenção boa é a que o diretor clínico entende antes de acontecer.',
    ].join('\n\n'),
    chegada: [
      { quem: 'brenda', texto: 'Escalei para o Gilmar, para o Vandeco, para a Rô, para o CEO e para o padre do hospital. Por via das dúvidas.', gesto: 'ombros', expr: 'surpresa' },
      { quem: 'ro', texto: 'O padre pelo menos é do ramo de causas perdidas. Combina com o nome do cliente.' },
      { quem: 'kevin', texto: 'Por que não desliga tudo de uma vez? Desligou, parou, fechou o ticket.', gesto: 'ombros' },
      { quem: 'vandeco', texto: 'Porque a memória é a testemunha, Kevin. Desligar a máquina é mandar a testemunha embora antes do depoimento.', gesto: 'nao' },
      { quem: 'neide', texto: 'Eu vou dizer uma coisa: quando eu desliguei o nobreak pra ligar o aspirador, também achei que ia resolver.', expr: 'neutro' },
      { quem: 'gilmar', texto: 'Ninguém desliga nada sem falar com a engenharia clínica. Lá tem gente respirando por aparelho.', gesto: 'apontar', expr: 'bravo' },
    ],
    fila: { quantidade: 7 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Contenção com paciente na cama',
        enunciado: 'O ransomware está se espalhando pelo Santa Paciência. Hora de decidir a contenção sem matar ninguém (no sentido literal).',
        perguntas: [
          {
            p: 'A DT-RECEP-04 (paciente zero) ainda está ligada e cifrando o compartilhamento. O que fazer primeiro?',
            opcoes: ['Isolar pelo Guarita EDR, mantendo a máquina ligada para coleta de memória', 'Desligar da tomada para parar a cifragem na hora', 'Formatar a máquina imediatamente', 'Mandar a usuária reiniciar e ver se melhora'],
            certa: 0,
            explicacao: 'O isolamento corta a rede (para de cifrar o compartilhamento e de falar com o C2) e preserva a memória, onde estão processos, conexões e às vezes material da chave. Desligar e formatar destroem evidência; reiniciar destrói evidência e ainda pode disparar persistência.',
          },
          {
            p: 'O ransomware se propaga entre estações por compartilhamentos administrativos. Qual contenção de rede costuma frear isso sem parar o hospital?',
            opcoes: ['Bloquear SMB (445) e RDP (3389) entre estações e entre segmentos', 'Bloquear a porta 443 para a internet em todo o hospital', 'Desligar o switch central', 'Trocar o Wi-Fi de visitantes'],
            certa: 0,
            explicacao: 'SMB (T1021.002) e RDP (T1021.001) são as vias favoritas de movimento lateral. Cortar 445 e 3389 entre estações quase não afeta o atendimento, enquanto bloquear 443 geral ou desligar o switch central para o prontuário e o laboratório junto.',
          },
          {
            p: 'O servidor do PACS (imagens de tomografia) mostra arquivos `.sjt` em uma pasta. A emergência está usando o PACS agora. Qual é o caminho certo?',
            opcoes: ['Acionar a liderança clínica e a engenharia clínica, combinar a janela e a contingência, e só então isolar', 'Isolar imediatamente sem avisar, porque segurança vem primeiro', 'Deixar como está até o fim do plantão', 'Pedir para a emergência parar de fazer tomografia'],
            certa: 0,
            explicacao: 'Em ambiente de saúde a prioridade é a vida do paciente. Isolar sem avisar pode deixar um médico sem a imagem de um AVC no meio do atendimento. A decisão técnica é sua, a janela é combinada com quem cuida do paciente, e a contingência (laudo impresso, outro equipamento) entra antes do corte.',
          },
          {
            p: 'A conta `adm.ti` foi usada pelo atacante no servidor de arquivos. Qual é a ação de contenção mais adequada?',
            opcoes: ['Desabilitar a conta, criar credencial nova para a TI a partir de máquina limpa e revisar onde ela tem privilégio', 'Trocar a senha da `adm.ti` pelo próprio notebook infectado do administrador', 'Apenas avisar o titular para tomar cuidado', 'Excluir a conta e todos os logs relacionados'],
            certa: 0,
            explicacao: 'Conta privilegiada comprometida precisa ser cortada, e a nova credencial não pode ser digitada em máquina infectada (o atacante leria na hora). Excluir a conta e os logs apaga a trilha que a investigação ainda vai precisar.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Contenção feita e ninguém da UTI ficou sem monitor. Hoje o tomate dorme feliz.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'brenda', texto: 'Posso desescalar o padre?' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 64,
    site: 'alfa',
    turno: 'noite',
    titulo: 'A memória não mente',
    resumo: 'Forense de memória: pslist, pstree, netscan e malfind no dump do servidor de arquivos.',
    aula: [
      'A memória RAM guarda o que o disco não conta: processos em execução, conexões abertas, linhas de comando, código injetado que nunca tocou o disco. O **Volatility 3** é a ferramenta aberta mais usada para ler um dump de memória. Os plugins têm nomes que se explicam: `windows.pslist`, `windows.pstree`, `windows.netscan`, `windows.cmdline`, `windows.malfind`.',
      '`windows.pslist` percorre a lista de processos ativos; `windows.psscan` varre a memória procurando estruturas de processo, inclusive os que se escondem da lista (diferença entre os dois é sinal de alerta). `windows.pstree` mostra a árvore pai e filho: `svchost.exe` legítimo nasce de `services.exe`; um `svchost.exe` filho de `explorer.exe` ou com nome torto (`svch0st.exe`) merece atenção.',
      '`windows.netscan` lista conexões e portas, com PID e endereço remoto. Cruze com a lista de processos: qual programa está falando com aquele IP externo na 443? `windows.malfind` procura regiões de memória com permissão de execução e escrita (`PAGE_EXECUTE_READWRITE`) que não pertencem a nenhum arquivo mapeado, assinatura comum de injeção de processo (**T1055**). Um cabeçalho `MZ` numa dessas regiões é um executável inteiro vivendo onde não devia.',
      'Malfind dá falso positivo, sim: navegador e software com JIT (Java, .NET) alocam memória executável legitimamente. Por isso o achado vale quando se combina: processo estranho, pai estranho, conexão estranha e região injetada no mesmo PID. Um indício é fofoca; quatro juntos são depoimento.',
    ].join('\n\n'),
    chegada: [
      { quem: 'vandeco', texto: 'Trouxe o dump de memória do SRV-ARQ-HSP. Trinta e dois gigas. Coletado antes de alguém ter a brilhante ideia de reiniciar.', gesto: 'apontar', expr: 'sorriso' },
      { quem: 'thiaguinho', texto: 'Eu ia reiniciar. Juro. Mas a Rô olhou pra mim.', gesto: 'ombros' },
      { quem: 'ro', texto: 'Eu só olhei. O olhar é meu EDR pessoal.' },
      { quem: 'keyla', texto: 'Se a gente achar a injeção, eu escrevo uma regra nova. Ela vai disparar com tudo, mas com carinho.', expr: 'sorriso' },
      { quem: 'vandeco', texto: 'Memória é igual síndico de prédio: lembra de tudo que você fez, inclusive o que você jura que não fez.', gesto: 'pensar' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Lendo o dump do servidor de arquivos',
        enunciado: 'Saída resumida do Volatility 3 sobre o dump do SRV-ARQ-HSP. Leia com calma e responda.',
        anexo: [
          '$ vol -f SRV-ARQ-HSP.mem windows.pstree',
          'PID    PPID   ImageFileName        CreateTime',
          '4      0      System               2026-03-01 06:02:11',
          '* 612  4      smss.exe             2026-03-01 06:02:12',
          '** 788 612    wininit.exe          2026-03-01 06:02:15',
          '*** 904 788   services.exe         2026-03-01 06:02:16',
          '**** 1220 904 svchost.exe          2026-03-01 06:02:19',
          '**** 1388 904 VeeamAgent.exe       2026-03-01 06:02:40',
          '* 2244 2208   explorer.exe         2026-03-14 04:47:55',
          '** 5120 2244  cmd.exe              2026-03-14 04:51:30',
          '*** 6120 5120 svhost32.exe         2026-03-14 04:54:58',
          '*** 6188 5120 vssadmin.exe         2026-03-14 04:52:03',
          '',
          '$ vol -f SRV-ARQ-HSP.mem windows.netscan',
          'Proto  LocalAddr          ForeignAddr           State        PID   Owner',
          'TCPv4  10.40.1.15:445     10.40.12.44:51022     ESTABLISHED  4     System',
          'TCPv4  10.40.1.15:49811   179.61.204.33:443     ESTABLISHED  6120  svhost32.exe',
          'TCPv4  10.40.1.15:49790   10.40.1.50:6160       ESTABLISHED  1388  VeeamAgent.exe',
          '',
          '$ vol -f SRV-ARQ-HSP.mem windows.malfind',
          'PID   Process        Start VPN     Protection               Hexdump',
          '6120  svhost32.exe   0x1c40000     PAGE_EXECUTE_READWRITE   4d 5a 90 00 03 00 00 00  MZ......',
          '1220  svchost.exe    0x2a10000     PAGE_EXECUTE_READ        48 89 5c 24 08 57 48 83  H.\\$.WH.',
        ].join('\n'),
        perguntas: [
          {
            p: 'Qual processo é o principal suspeito?',
            opcoes: ['svhost32.exe (PID 6120)', 'svchost.exe (PID 1220)', 'VeeamAgent.exe (PID 1388)', 'System (PID 4)'],
            certa: 0,
            explicacao: 'O `svhost32.exe` imita o nome do `svchost.exe` (T1036, Masquerading), nasceu de um `cmd.exe` filho do `explorer.exe` às 4h54 (o legítimo nasce de `services.exe` no boot), fala com o IP externo e tem região injetada. Quatro indícios no mesmo PID.',
          },
          {
            p: 'O que a linha do `windows.netscan` com o PID 6120 mostra?',
            opcoes: ['Uma conexão estabelecida do processo suspeito para 179.61.204.33 na porta 443, o mesmo IP visto no paciente zero', 'Que o servidor está compartilhando arquivos normalmente', 'Uma conexão com o servidor de backup', 'Que a máquina está desligada'],
            certa: 0,
            explicacao: 'Conexão estabelecida para fora, na 443, com o mesmo IP que a DT-RECEP-04 contatou às 2h13. Isso liga o servidor ao paciente zero e vira IOC para bloquear em todo o hospital. A conexão do System na 445 é o próprio compartilhamento.',
          },
          {
            p: 'Por que a saída do `windows.malfind` para o PID 6120 é grave?',
            opcoes: ['Região com execução e escrita, sem arquivo mapeado, começando com MZ: um executável carregado direto na memória', 'Porque todo processo com malfind é malware', 'Porque PAGE_EXECUTE_READWRITE é o padrão de qualquer programa', 'Porque o hexdump está em inglês'],
            certa: 0,
            explicacao: '`4d 5a` é `MZ`, o começo de um executável Windows. Numa região `PAGE_EXECUTE_READWRITE` sem arquivo por trás, é forte indício de injeção (T1055). A linha do `svchost.exe` legítimo é só leitura e execução, sem MZ, e malfind sozinho dá falso positivo com JIT.',
          },
          {
            p: 'Qual achado reforça que o atacante tentou impedir a recuperação?',
            opcoes: ['O vssadmin.exe (PID 6188) filho do mesmo cmd.exe, dois minutos antes da cifragem', 'O VeeamAgent.exe conectado ao servidor de backup', 'O smss.exe criado no boot', 'O explorer.exe existir'],
            certa: 0,
            explicacao: 'O `vssadmin` saindo do mesmo `cmd.exe` que gerou o `svhost32.exe` combina com o `vssadmin delete shadows /all /quiet` visto no Sysmon (T1490). O Veeam conectado é o backup legítimo, e vale verificar se a cópia está protegida antes que alguém mexa nele.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'vandeco', texto: 'Esse eu imprimo e coloco no mural. Ao lado da foto do disquete de 2003.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'keyla', texto: 'Regra nova: processo com nome parecido com svchost, pai errado e conexão externa. Só vai disparar com tudo que for suspeito. Eu acho.' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 65,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'Quem apagou o log',
    resumo: 'EVTX: 1102 é log limpo, 4688 é processo criado, 7045 é serviço instalado.',
    aula: [
      'Atacante esperto tenta apagar o rastro, e apagar o rastro deixa rastro. Limpar o log de Segurança gera o **Event ID 1102** (o log de auditoria foi apagado) no próprio canal Security; limpar o canal System gera o **104**. A técnica no ATT&CK é **T1070.001** (Clear Windows Event Logs). Log limpo fora de manutenção agendada é alerta crítico por definição.',
      'O **4688** (Security) registra a criação de processo. Com a política "incluir linha de comando" ligada, ele mostra o comando inteiro, quase um Sysmon 1 de pobre. Se a política estiver desligada, você vê que o `wevtutil.exe` rodou, mas não vê o `cl Security`. Revise a política de auditoria antes do incidente, não durante.',
      'O **7045** (System) registra um serviço novo instalado, com nome, caminho do binário e tipo de início. Serviço é persistência clássica e também a forma como ferramentas de execução remota rodam código (**T1543.003**, Windows Service, e **T1569.002**, Service Execution). Sinais ruins: binário em `C:\\Windows\\Temp` ou `C:\\Users\\Public`, nome genérico tipo "atualizador", instalação por conta humana fora de janela de mudança. O **4697** no Security é o primo do 7045, quando a auditoria correspondente está ligada.',
      'E a lição de ouro: se o log local foi limpo, ele ainda pode existir no SIEM. Encaminhamento centralizado é exatamente para isso. O atacante apaga a lousa da sala, mas a foto da lousa já está no celular de alguém.',
    ].join('\n\n'),
    chegada: [
      { quem: 'ro', texto: 'O SRV-LAB-01 está estranhamente limpo. Log de segurança com três eventos. Nem servidor recém-instalado é tão organizado.', gesto: 'cruzar' },
      { quem: 'jefferson', texto: 'Isso cai em concurso? Event ID 1102? Porque eu já decorei todos os artigos da Lei 8.112 mas nenhum Event ID.', gesto: 'pensar' },
      { quem: 'ro', texto: 'Cai na vida, Jefferson. A vida é a banca mais injusta que existe.' },
      { quem: 'gilmar', texto: 'O hospital quer saber se o laboratório foi afetado. Os exames de sangue da UTI dependem disso. Prioridade.', gesto: 'apontar' },
      { quem: 'vandeco', texto: 'O sujeito apagou o log local. Coitado. Esqueceu que a gente manda cópia de tudo pro Vigia desde o ano passado.', expr: 'sorriso' },
    ],
    fila: { quantidade: 9 },
    missoes: [
      {
        tipo: 'siem',
        titulo: 'O serviço do laboratório',
        enunciado: 'Doze horas de eventos de Windows dos servidores do hospital, já no Vigia. Alguém limpou o log de Segurança de um deles. Descubra onde, e qual serviço foi instalado ali minutos antes.',
        registros: registrosDia65(),
        pergunta: 'Qual é o nome do serviço instalado no servidor onde o log foi limpo?',
        resposta: 'SvcAtualizaLab',
        gabarito: 'evento=7045 host=SRV-LAB-01 | tabela servico,host,hora,usuario,imagem',
        dica: 'Comece por `evento=1102` para achar o host. Depois veja os serviços instalados nele: `evento=7045 host=NOME_DO_HOST`. Compare com os 7045 dos outros servidores.',
        explicacao: 'O 1102 aparece só no SRV-LAB-01, às 3h33, feito pela `adm.ti`. Dois minutos antes, a mesma conta entrou por rede (4624 tipo 3, vindo da DT-RECEP-04), instalou o serviço `SvcAtualizaLab` com binário em `C:\\Windows\\Temp` (7045, T1543.003), o serviço rodou (4688) e o `wevtutil cl Security` limpou o log (T1070.001). Os 7045 do `GuaritaUpdater` nos outros servidores são a atualização do EDR, iguais em todos, em `Program Files` e na janela da mudança.',
      },
    ],
    saida: [
      { quem: 'ro', texto: 'Apagou o log e esqueceu da cópia. É o tipo de criminoso que eu respeito pouco.', expr: 'neutro' },
      { quem: 'jefferson', texto: 'Anotei. 1102, 104, 4688, 7045. Vou fazer flashcard junto com a 8.112.' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 66,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'A sala de crise',
    resumo: 'Comunicação: jurídico, ANPD em 3 dias úteis e quem decide sobre resgate (spoiler: não é o SOC).',
    aula: [
      'Pela LGPD (art. 48), o **controlador** comunica à ANPD e aos titulares o incidente que possa acarretar risco ou dano relevante. A **Resolução CD/ANPD nº 15/2024** fixou o prazo: **3 dias úteis** a partir do conhecimento de que o incidente afetou dados pessoais, com possibilidade de complementar as informações depois. Dado de saúde é **dado pessoal sensível** (art. 5º, II), o que pesa muito na avaliação de risco.',
      'Quem é controlador aqui é o hospital. A Insônia é **operadora**: apoia com fatos, linha do tempo, escopo e evidências, mas quem assina a comunicação é o hospital, com o encarregado (DPO) e o jurídico. O SOC não manda e-mail para a ANPD por conta própria, e também não esconde do cliente o que achou.',
      '**Pagar resgate é decisão da diretoria com o jurídico**, nunca do SOC. Pagamento não garante chave funcionando, não garante que os dados vazados sejam apagados, financia o crime e pode trazer problema legal conforme quem está do outro lado. O papel do SOC é dar à diretoria informação boa: o que foi cifrado, se o backup está íntegro, quanto tempo leva restaurar, o que vazou.',
      'Na sala de crise, fale em fatos e prazos: "confirmado", "em investigação", "não sabemos ainda". Registre cada decisão com hora e responsável. E nunca, jamais, responda o chat da quadrilha sem autorização. A quadrilha adora um analista carente de atenção.',
    ].join('\n\n'),
    chegada: [
      { quem: 'narrador', texto: 'Sala de reunião do hospital, em videoconferência. Diretor-geral, diretora clínica, jurídico, a DPO do hospital, e a câmera do SOC, onde aparece quem está no turno e, ao fundo, o tomate do Gilmar.' },
      { quem: 'telefone', texto: 'Diretor-geral falando. A quadrilha pede 40 bitcoins. O SOC acha que a gente paga? Vocês são os especialistas.', expr: 'bravo' },
      { quem: 'gilmar', texto: '(cochichando) Cuidado com essa resposta. Ela vai para a ata.', gesto: 'pensar' },
      { quem: 'chat', texto: 'Rô: respira. Fato, prazo e quem decide. Nada de opinião sobre bitcoin.' },
      { quem: 'vandeco', texto: 'Em 2003 o resgate era um e-mail com erro de português. Hoje tem portal de atendimento, SLA e chat ao vivo. Profissionalizaram a desgraça.' },
    ],
    fila: { quantidade: 6 },
    missoes: [
      {
        tipo: 'escolha',
        titulo: 'O que dizer na sala de crise',
        enunciado: 'O diretor-geral quer uma resposta do SOC sobre o resgate e sobre "avisar alguém". O que você diz?',
        opcoes: [
          {
            texto: 'Apresentar os fatos (escopo, backup íntegro, tempo estimado de restauração, indício de vazamento), lembrar que resgate é decisão da diretoria com o jurídico e que o prazo da ANPD é de 3 dias úteis.',
            reacao: [
              { quem: 'telefone', texto: 'Jurídico falando. Era exatamente isso que eu precisava ouvir. A DPO já está montando a comunicação à ANPD.', expr: 'sorriso' },
              { quem: 'gilmar', texto: 'Fato, prazo e quem decide. Eu choraria se não estivesse cronometrando.', gesto: 'comemorar', expr: 'sorriso' },
            ],
            efeitos: { reputacao: 15, sanidade: 5 },
          },
          {
            texto: 'Dizer que você mesmo pode negociar com a quadrilha pelo chat do portal, para conseguir um desconto.',
            reacao: [
              { quem: 'telefone', texto: 'Jurídico falando. Por favor, ninguém do SOC entra nesse chat. Ninguém. Isso vai para a ata.', expr: 'bravo' },
              { quem: 'ro', texto: 'Parabéns, agora a quadrilha tem um contato comercial na Insônia. Desfaz isso antes que ela te mande proposta de parceria.', gesto: 'cruzar' },
            ],
            efeitos: { reputacao: -20, sanidade: -10, flag: 'cagada' },
          },
          {
            texto: 'Sugerir esperar uns 30 dias para comunicar a ANPD, "quando tiver certeza de tudo".',
            reacao: [
              { quem: 'telefone', texto: 'DPO do hospital falando. O prazo é de 3 dias úteis a partir do conhecimento. A gente comunica o que sabe e complementa depois. Trinta dias é multa com laço de fita.', expr: 'bravo' },
              { quem: 'vandeco', texto: 'Certeza de tudo, só no pós-incidente. E olhe lá.', gesto: 'nao' },
            ],
            efeitos: { reputacao: -10 },
          },
        ],
      },
    ],
    saida: [
      { quem: 'neide', texto: 'Ouvi pela porta. Quem paga sequestro de computador ganha cliente fiel do sequestrador. Igual vendedor de consórcio.', expr: 'neutro' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 67,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'Restaurar não é dar Ctrl+Z',
    resumo: 'Recuperação: 3-2-1, cópia imutável, ponto de restauração limpo e restauração testada.',
    aula: [
      'A regra **3-2-1** do backup: **3** cópias dos dados, em **2** tipos de mídia diferentes, com **1** cópia fora do local. A versão moderna é **3-2-1-1-0**: mais **1** cópia offline ou imutável (que nem o administrador consegue apagar antes do prazo) e **0** erros na verificação de restauração. Ransomware sabe onde mora o backup e apaga primeiro; por isso imutabilidade não é luxo.',
      'Recuperar começa antes de restaurar: confirme que a ameaça foi erradicada e que as credenciais privilegiadas foram trocadas. Restaurar em cima de rede ainda comprometida é reformar a casa com o ladrão dormindo no sofá. Escolha o **ponto de restauração** anterior ao acesso inicial (a linha do tempo da análise diz qual é), não só anterior à cifragem.',
      'Restaure por **prioridade de negócio**, que em hospital é prioridade clínica: prontuário, laboratório, farmácia e imagens antes do faturamento e do RH. O **RTO** (tempo para voltar) e o **RPO** (quanto dado se aceita perder) deveriam estar no plano de continuidade. Se não estavam, agora você descobre na marra quais são.',
      'Valide com quem usa: a farmácia confere o estoque, o laboratório confere os laudos. Religue a rede por etapas, com monitoramento reforçado nos dias seguintes, porque quadrilha que perde o acesso costuma tentar voltar. E um backup que nunca foi restaurado é só uma esperança com nome bonito.',
    ].join('\n\n'),
    chegada: [
      { quem: 'gilmar', texto: 'O hospital quer tudo de volta até o meio-dia. Eu disse que até o meio-dia a gente devolve a esperança.', gesto: 'ombros' },
      { quem: 'pamela', texto: 'Conferi o backup imutável. Está íntegro, último ponto limpo é de 13 de março às 23h, antes do anexo ser aberto.', gesto: 'sim' },
      { quem: 'ro', texto: 'Quem conferiu? A Pâmela. De novo. Alguém dá um aumento pra essa menina antes que o concorrente dê.' },
      { quem: 'thiaguinho', texto: 'Por que não restaura o de ontem às 4h? É mais recente, perde menos coisa.', gesto: 'pensar' },
      { quem: 'vandeco', texto: 'Porque às 4h o atacante já estava lá dentro, menino. Restaurar backup infectado é reprise de filme de terror.', gesto: 'nao' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'ordenar',
        titulo: 'Plano de recuperação do Santa Paciência',
        enunciado: 'Monte a sequência de recuperação que vai para a diretoria do hospital.',
        itens: [
          'Confirmar que a ameaça foi erradicada e que as credenciais privilegiadas foram trocadas',
          'Escolher o ponto de restauração anterior ao acesso inicial, conferindo a linha do tempo',
          'Verificar a integridade da cópia imutável antes de usar',
          'Restaurar primeiro os sistemas críticos para o paciente: prontuário, laboratório, farmácia e PACS',
          'Validar com as áreas usuárias que dados e sistemas estão íntegros',
          'Religar a rede por etapas, com monitoramento reforçado',
          'Registrar o RTO e o RPO alcançados e atualizar o plano de continuidade',
        ],
        explicacao: 'Sem erradicação e troca de credenciais, a restauração vira recontaminação. O ponto certo é anterior ao acesso inicial (2h13 do dia 14), não só à cifragem. Integridade antes de usar, prioridade clínica na fila, validação por quem conhece o dado, religação gradual e, no fim, números reais de RTO e RPO para corrigir o plano.',
      },
    ],
    saida: [
      { quem: 'pamela', texto: 'O prontuário voltou. A emergência saiu do papel.', expr: 'sorriso' },
      { quem: 'gilmar', texto: 'Seis horas e quarenta minutos de RTO. Vou pôr na planilha com borda dupla.', gesto: 'comemorar' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 68,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'Ninguém vai para a fogueira',
    resumo: 'Pós-incidente sem culpados: causa raiz, linha do tempo e ações com dono e prazo.',
    aula: [
      'A reunião de **lições aprendidas** (post-mortem) deve acontecer logo, de preferência em até duas semanas, enquanto a memória está fresca. O formato **sem culpados** (blameless) parte da ideia de que pessoas erram dentro de sistemas que permitem o erro. Se a recepcionista abriu o anexo, a pergunta é por que o anexo chegou, por que executou e por que ninguém viu por três horas.',
      'Use os **cinco porquês** para chegar à causa raiz. Abriu o `.pdf.exe`? Por quê? O Windows escondia a extensão. Por quê? Padrão nunca alterado. Por quê? Ninguém revisou a política de estações. E por aí vai, até chegar em algo que dá para consertar. "Erro humano" nunca é causa raiz; é o lugar onde a investigação desistiu.',
      'O relatório tem: resumo, linha do tempo com horários, causa raiz, o que funcionou, o que não funcionou e **ações com dono e prazo**. Ação sem dono é desejo. Exemplos reais deste caso: bloquear executáveis em anexo no gateway de e-mail, mostrar extensões, regra para extensão dupla, cópia imutável (que salvou o hospital), MFA para contas administrativas.',
      'Métrica boa entra no relatório: tempo de permanência do atacante (dwell time), MTTD, MTTR, quantos hosts, quanto tempo parado. O objetivo não é achar herói nem vilão, é fazer o próximo incidente ser menor. A Rô resume: culpado a gente arranja em qualquer esquina, solução não.',
    ].join('\n\n'),
    chegada: [
      { quem: 'brenda', texto: 'Já descobri a culpada: a recepcionista que abriu o anexo. Escalei o nome dela para todo mundo.', gesto: 'apontar' },
      { quem: 'ro', texto: 'Desescala, Brenda. Ela abriu um anexo chamado laudo de exame, numa recepção de hospital, às duas da manhã. Era o trabalho dela.', gesto: 'nao', expr: 'bravo' },
      { quem: 'vandeco', texto: 'Em 2003 a gente demitia quem clicava. Resultado: as pessoas pararam de avisar quando clicavam. Pior decisão da década.', gesto: 'pensar' },
      { quem: 'gilmar', texto: 'Hoje é reunião sem culpados. Quem apontar o dedo pra alguém paga o café da semana.', gesto: 'apontar' },
      { quem: 'neide', texto: 'Café da semana nessa sala é caro, viu. Vocês tomam igual motor a diesel.' },
    ],
    fila: { quantidade: 7 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'O post-mortem do Santa Paciência',
        enunciado: 'Hora de escrever o relatório pós-incidente com o hospital. Responda como quem conduz a reunião.',
        perguntas: [
          {
            p: 'Qual frase descreve melhor a causa raiz do incidente?',
            opcoes: ['Executável disfarçado chegou por e-mail, rodou numa estação que escondia extensões e sem bloqueio de execução, e ninguém detectou por quase três horas', 'A recepcionista Aline errou', 'Erro humano', 'Azar'],
            certa: 0,
            explicacao: 'Causa raiz boa aponta falhas de sistema que podem ser corrigidas: filtro de e-mail, configuração da estação, controle de execução, detecção. "Erro humano" e nome de pessoa encerram a análise cedo e fazem as pessoas pararem de reportar.',
          },
          {
            p: 'Qual destas é uma ação pós-incidente bem escrita?',
            opcoes: ['Bloquear anexos executáveis no gateway de e-mail, dono: TI do hospital, prazo: 30 dias, verificação: teste com arquivo inofensivo', 'Melhorar a segurança', 'Conscientizar todo mundo para sempre', 'Comprar uma ferramenta de IA'],
            certa: 0,
            explicacao: 'Ação útil tem o quê, quem, quando e como saber se foi feita. "Melhorar a segurança" é uma intenção, não uma ação, e vai continuar aberta na próxima auditoria.',
          },
          {
            p: 'Por que o formato sem culpados funciona melhor?',
            opcoes: ['Porque as pessoas contam o que realmente aconteceu, inclusive os próprios erros, e isso revela as falhas de processo', 'Porque ninguém é responsável por nada', 'Porque é obrigatório pela LGPD', 'Porque é mais rápido'],
            certa: 0,
            explicacao: 'Sem culpa não significa sem responsabilidade: as ações continuam tendo dono. Significa que quem errou pode contar o erro sem medo, e é desse relato honesto que sai a correção. Com medo, a linha do tempo fica cheia de buracos.',
          },
          {
            p: 'O atacante entrou às 2h13 e o SOC confirmou o incidente às 4h58. Esse intervalo é chamado de quê, no relatório?',
            opcoes: ['Tempo de permanência (dwell time) até a detecção, base para o MTTD', 'RPO', 'RTO', 'SLA de primeira resposta'],
            certa: 0,
            explicacao: 'Dwell time é quanto tempo o atacante ficou dentro antes de ser detectado. RTO e RPO são metas de recuperação; SLA de primeira resposta mede o tempo entre o alerta e o primeiro atendimento. Reduzir o dwell time é o objetivo de quase toda melhoria de detecção.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Ninguém apontou o dedo. Ninguém pagou o café. Primeira vez na história.', expr: 'surpresa' },
      { quem: 'brenda', texto: 'Escalei um pedido de desculpas para a recepcionista.' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 69,
    site: 'alfa',
    turno: 'madrugada',
    titulo: 'Os R$ 380 mil do Dr. Leôncio',
    resumo: 'BEC na Cooperativa Agro Pasto Ralo: domínio parecido, troca de conta bancária e nenhum malware.',
    aula: [
      'O **BEC** (comprometimento de e-mail corporativo) não precisa de malware. O golpe é conversa: alguém se passa por fornecedor ou diretor e pede uma transferência ou a troca da conta bancária de um pagamento. No ATT&CK, o fim da história é **T1657** (Financial Theft); o começo costuma ser phishing (**T1566**) ou uma caixa de e-mail já comprometida.',
      'Domínio parecido passa em **SPF, DKIM e DMARC**, porque o golpista é dono do domínio falso e configura tudo certinho. Os autenticadores provam que o e-mail veio do domínio que diz, não que o domínio é quem você pensa. Olhe letra por letra (`l` virando `i`, `rn` virando `m`), a **idade do domínio**, o **Reply-To** diferente do remetente e a resposta numa conversa antiga (o golpista leu a conversa em algum lugar).',
      'Resposta a BEC é corrida contra o relógio: o cliente aciona o banco **imediatamente** para tentar bloquear ou devolver (no Pix existe o MED, Mecanismo Especial de Devolução; em TED a chance depende da rapidez), registra boletim de ocorrência e preserva os e-mails com cabeçalho completo. O SOC procura regras de encaminhamento e logins estranhos na caixa da vítima, porque às vezes o golpista ainda está lá dentro.',
      'A prevenção é processo, não ferramenta: **toda troca de dados bancários é confirmada por telefone, num número já conhecido**, nunca no número que veio no próprio e-mail. E o alerta de "domínio externo parecido com fornecedor" vale ouro. O Dr. Leôncio, infelizmente, achou que o antivírus cobria isso. Antivírus não é seguro de vida, doutor.',
    ].join('\n\n'),
    chegada: [
      { quem: 'telefone', texto: 'Meu jovem! Aqui é o Leôncio, da Pasto Ralo. São três da manhã, eu sei, mas não consigo dormir. Fiz uma transferência de trezentos e oitenta mil pro fornecedor de adubo e o fornecedor diz que não recebeu.', expr: 'triste' },
      { quem: 'leoncio', texto: 'Mas o e-mail era dele, eu juro! Tinha até o logotipo do pé vermelho. E o antivírus não apitou nada!', gesto: 'ombros', expr: 'surpresa' },
      { quem: 'thiaguinho', texto: '(cobrindo o microfone) Ele liga às três da manhã até quando é verdade. Tô começando a gostar dele.', gesto: 'ombros' },
      { quem: 'ro', texto: 'Doutor, desliga comigo e liga agora para o gerente do banco pedindo bloqueio. Agora. A gente cuida dos e-mails.', gesto: 'apontar' },
      { quem: 'leoncio', texto: 'O gerente do banco dorme, minha jovem!', expr: 'surpresa' },
      { quem: 'ro', texto: 'Hoje não dorme. Hoje ele conhece o senhor.' },
    ],
    fila: { quantidade: 6 },
    missoes: [
      {
        tipo: 'siem',
        titulo: 'O e-mail do adubo',
        enunciado: 'Três dias de logs do gateway de e-mail da Cooperativa Agro Pasto Ralo. O fornecedor legítimo é a Fertilizantes Pé Vermelho, que manda e-mail de `pevermelho-fert.com.br` há anos. Ache o e-mail que pediu a troca da conta.',
        registros: registrosDia69(),
        pergunta: 'Qual domínio o golpista usou para pedir a troca dos dados bancários?',
        resposta: 'pevermeiho-fert.com.br',
        gabarito: 'assunto="*dados banc*" | tabela dominio_remetente,remetente,hora,spf,dmarc,reply_to,idade_dominio_dias',
        dica: 'Compare os domínios: `| contar por dominio_remetente` e leia letra por letra. Ou procure pelo assunto com curinga entre aspas: `assunto="*dados banc*"`.',
        explicacao: 'O domínio `pevermeiho-fert.com.br` troca o `l` por `i`, tem 6 dias de vida, passa em SPF, DKIM e DMARC (o golpista é dono dele) e põe o Reply-To numa caixa postal genérica. Antes de pedir a troca, o golpista respondeu a uma conversa real sobre a NF-e 4471, sinal de que leu e-mails do fornecedor ou da própria cooperativa: vale investigar as duas caixas. Os e-mails com DMARC falhando são só spam de trator, que é ruído, não o golpe.',
      },
    ],
    saida: [
      { quem: 'leoncio', texto: 'O gerente acordou! Disse que vai tentar o bloqueio. Meu jovem, de agora em diante eu ligo pro fornecedor antes de pagar.', gesto: 'sim', expr: 'sorriso' },
      { quem: 'ro', texto: 'Ele vai ligar. Às três da manhã. Pro fornecedor. Coitado do fornecedor.' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 70,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'Trezentos reais de tentação',
    resumo: 'Um concorrente oferece R$ 300 a mais. Lealdade, salário e a cafeteira na balança.',
    aula: [
      'Carreira em segurança é maratona com fila de alerta no meio. Antes de trocar de emprego, compare o pacote inteiro, não só o salário: escala (12x36, 6x1, sobreaviso pago ou não), adicional noturno, plano de saúde, treinamento e certificações pagas, exposição a casos reais e quem vai te ensinar. Um SOC que só fecha falso positivo ensina pouco, por mais bonito que seja o crachá.',
      'Olhe também o lado legal e ético: o **NDA** que você assinou continua valendo depois de sair. Informação de cliente, indicador de incidente, playbook interno e lista de clientes não vão com você para a empresa nova. Levar o "know-how" é ótimo; levar a planilha de clientes é processo.',
      'E converse. Muita gente descobre que dava para negociar onde está, ou que o trabalho novo tem um sobreaviso escondido que come o aumento. Proposta boa sobrevive a perguntas; proposta que exige resposta em uma hora geralmente é a própria pressa vestida de oportunidade.',
    ].join('\n\n'),
    chegada: [
      { quem: 'chat', texto: 'Mensagem privada de uma recrutadora da Muralha Total MSSP: "Oi! Vimos seu trabalho no caso do hospital. Pagamos R$ 300 a mais. Topa? Preciso da resposta até o fim do dia :)"' },
      { quem: 'kevin', texto: 'Eles me mandaram a mesma. Eu fechei como falso positivo.', gesto: 'ombros' },
      { quem: 'ro', texto: 'A Muralha Total? Conheço. A cafeteira deles é de cápsula. Cápsula, gente.', expr: 'bravo', gesto: 'cruzar' },
      { quem: 'neide', texto: 'Trezentos reais dá para muita coisa. Dá para três pizzas grandes. Ou uma pizza grande em Curitiba.', gesto: 'pensar' },
      { quem: 'gilmar', texto: 'Eu ouvi a palavra concorrente? Não ouvi. O tomate também não ouviu.', expr: 'triste' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'escolha',
        titulo: 'A proposta da Muralha Total',
        enunciado: 'A Muralha Total MSSP oferece R$ 300 a mais. A resposta precisa sair hoje. O que você faz?',
        opcoes: [
          {
            texto: 'Aceitar. Trezentos reais são trezentos reais, e cafeteira de cápsula também faz café.',
            reacao: [
              { quem: 'chat', texto: 'Recrutadora: "Que ótimo!! Começa daqui a um mês. Ah, a escala é 6x1 com sobreaviso não remunerado, mas a gente tem pebolim!"' },
              { quem: 'ro', texto: 'Pebolim. Eles têm pebolim. Vai com Deus, e leva um café nosso numa garrafa térmica.', gesto: 'acenar', expr: 'triste' },
            ],
            efeitos: { flag: 'concorrente', sanidade: -5, energia: -5 },
          },
          {
            texto: 'Recusar com educação. Aqui tem caso de verdade, gente boa e uma cafeteira que é patrimônio histórico.',
            reacao: [
              { quem: 'gilmar', texto: 'Eu não ouvi nada, mas se tivesse ouvido, ficaria muito feliz. Vou te dar um tomate de honra.', gesto: 'comemorar', expr: 'sorriso' },
              { quem: 'vandeco', texto: 'Em 2003 me ofereceram cinquenta a mais pra mudar de empresa. A empresa faliu em 2004. Eu tô aqui até hoje.' },
            ],
            efeitos: { reputacao: 5, sanidade: 5 },
          },
          {
            texto: 'Recusar, mas mostrar a proposta para o Gilmar e pedir um aumento.',
            reacao: [
              { quem: 'gilmar', texto: 'Aumento... Vou levar para o comitê. Enquanto isso, posso oferecer um vale-coxinha mensal e prioridade na cadeira que não está rasgada.', gesto: 'pensar' },
              { quem: 'thiaguinho', texto: 'Ninguém nunca me ofereceu vale-coxinha. Agora eu quero uma proposta do concorrente também.', expr: 'surpresa' },
            ],
            efeitos: { reputacao: 2, energia: 5 },
          },
        ],
      },
    ],
    saida: [
      { quem: 'neide', texto: 'Quem fica, fica. Quem vai, leva saudade. Quem leva a planilha de clientes, leva processo.', gesto: 'apontar' },
    ],
  },
];
