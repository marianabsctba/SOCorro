import type { Dia } from '../../tipos';
import { aula } from './comum';
import { mfaDia26 } from './registros';
import { codificarBase64 } from '../../../motor/canivete';

const LINK_DIA25 = encodeURIComponent(codificarBase64('https://login-tabajara-seguros.top/office365/entrar?u=patricia.alves'));

export const DIAS_22_30: Dia[] = [
  {
    n: 22,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'O robô que trabalha de madrugada',
    resumo: 'Conta de serviço, logon fora do horário e a GMUD aprovada que transforma susto em benigno.',
    aula: aula(
      '**Conta de serviço** é a conta que um sistema usa para rodar: backup, banco de dados, integração, antivírus. Ela trabalha de madrugada, em fim de semana e no Natal, e não reclama. Por isso alerta de "logon fora do horário" dispara com ela o tempo todo. Contas de serviço costumam fazer logon tipo **5** (serviço), **4** (lote, tarefa agendada) ou **3** (rede).',
      'A **GMUD** (gestão de mudança, o famoso "change") é o registro aprovado de uma alteração: o que será feito, em quais ativos, por quem, com qual conta, em qual **janela** de horário e com plano de retorno. Alerta que bate exatamente com uma GMUD aprovada (mesmo ativo, mesma conta, dentro da janela) é **benigno verdadeiro**, e a GMUD é a evidência no ticket.',
      'Mas confira tudo, não só a existência da GMUD. Logon **fora da janela**, em **ativo que não está na lista**, ou com **tipo de logon que não combina** (conta de serviço fazendo logon tipo 2 ou 10, interativo ou RDP, como se fosse gente) é sinal de abuso. Atacante adora conta de serviço: senha que não expira, privilégio alto e ninguém olhando.',
      'Boas práticas que o SOC pode recomendar: contas de serviço com nome padronizado (`svc_`), sem logon interativo (política "Negar logon local" e "Negar logon via Serviços de Área de Trabalho Remota"), senha longa e rotacionada, ou contas gerenciadas pelo próprio AD (gMSA). E GMUD com janela realista, não "das 00h às 23h59, todo dia, para sempre".',
    ),
    chegada: [
      { quem: 'brenda', texto: 'A conta svc_backup logou às 2h no servidor de banco da Tabajara! De madrugada! Escalei para o Vandeco, a Rô, o Gilmar e o papa.', gesto: 'apontar', expr: 'surpresa' },
      { quem: 'ro', texto: 'Brenda, é o backup. Ele roda às 2h desde 2017. Tem GMUD, tem janela, tem até aniversário.', expr: 'neutro' },
      { quem: 'vandeco', texto: 'Se o backup não rodar às 2h, aí sim me liga.', gesto: 'cruzar' },
      { quem: 'jefferson', texto: 'Mas como a gente sabe que é o backup mesmo e não alguém usando a conta do backup?', gesto: 'pensar' },
      { quem: 'vandeco', texto: 'Essa pergunta vale mais que o seu concurso inteiro, garoto. Senta que eu explico.', expr: 'sorriso' },
    ],
    fila: { quantidade: 7 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Confere com a GMUD',
        enunciado: 'A GMUD-2026-0412 da Tabajara diz: "Backup completo do SRV-SQL-02 pela conta svc_backup, diariamente das 01h00 às 04h00 (Brasília), responsável: TI Infraestrutura". Analise os alertas da semana.',
        perguntas: [
          {
            p: 'Alerta: `svc_backup`, logon tipo 5 no SRV-SQL-02 às 02:03 de Brasília. Classificação:',
            opcoes: ['Benigno verdadeiro, citando a GMUD-2026-0412 no ticket', 'Falso positivo: o logon não aconteceu', 'Verdadeiro positivo: horário fora do expediente', 'Escalar ao N2 por precaução'],
            certa: 0,
            explicacao: 'Conta, ativo, tipo de logon e horário batem com a mudança aprovada. O logon aconteceu (não é FP) e é esperado. A GMUD é a evidência que sustenta o veredito.',
          },
          {
            p: 'Alerta: `svc_backup`, logon **tipo 10** (RDP) no SRV-SQL-02 às 02:40, vindo de uma estação do comercial. O que muda?',
            opcoes: ['Muda tudo: conta de serviço não faz RDP, e a origem não tem relação com o backup; escalar', 'Nada, está dentro da janela da GMUD', 'É benigno, alguém da TI pode ter precisado', 'É falso positivo de tipo de logon'],
            certa: 0,
            explicacao: 'Estar dentro da janela não basta. Logon interativo remoto com conta de serviço, a partir de uma estação comum, é uso indevido da credencial, seja por gente de dentro, seja por atacante.',
          },
          {
            p: 'Alerta: `svc_backup`, logon tipo 5 no **SRV-ARQ-01** às 02:15. A GMUD cita só o SRV-SQL-02.',
            opcoes: ['Fora do escopo da GMUD: confirmar com o responsável antes de fechar como benigno', 'Benigno, porque o horário bate', 'Fechar como FP', 'Isolar o servidor de arquivos imediatamente'],
            certa: 0,
            explicacao: 'Pode ser um job de backup que ninguém documentou (acontece muito) ou abuso da conta. A resposta é perguntar ao responsável da GMUD e registrar. Se for legítimo, a GMUD precisa ser atualizada.',
          },
          {
            p: 'Qual recomendação reduz o risco de abuso de contas de serviço?',
            opcoes: ['Negar logon interativo e RDP para contas de serviço e usar contas gerenciadas (gMSA) quando possível', 'Dar a mesma senha para todas as contas de serviço, para facilitar', 'Desligar o alerta de logon fora do horário', 'Colocar as contas de serviço no grupo Domain Admins para não dar erro'],
            certa: 0,
            explicacao: 'Restringir o tipo de logon reduz a superfície, e gMSA rotaciona a senha automaticamente. Colocar conta de serviço no Domain Admins "para não dar erro" é um clássico de relatório de pentest.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'brenda', texto: 'Desescalei o papa.', gesto: 'sim' },
      { quem: 'ro', texto: 'Ele agradece. Tava ocupado.', expr: 'sorriso' },
    ],
  },
  {
    n: 23,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'O scanner que bate cartão',
    resumo: 'Scanner de vulnerabilidade autorizado gera alerta. Exceção é bem-vinda, desde que tenha escopo, dono e validade.',
    aula: aula(
      'Scanner de vulnerabilidade faz exatamente o que um atacante faz no reconhecimento: varre portas, testa serviços, tenta logins com credencial, dispara assinaturas do IDS. Quando é autorizado, o alerta é **benigno verdadeiro**. Quando o mesmo alerta aparece 2 mil vezes por semana, a solução é uma **exceção** (supressão, lista de permissão).',
      'Exceção bem feita é **estreita**: origem específica (o IP do scanner), destinos do escopo, regras específicas (varredura, assinaturas de IDS) e, se possível, janela de horário. E sempre com **dono** (quem pediu), **justificativa**, **referência** (ticket ou GMUD) e **data de validade** ou revisão. Exceção sem validade é janela que ninguém lembra de fechar.',
      'O perigo da exceção larga: "ignorar tudo que vier do 10.20.1.50". Se alguém comprometer o scanner (que tem credenciais privilegiadas e acesso a toda a rede), ele fica invisível para o SOC. Por isso a exceção cobre o que o scanner **faz**, não o que o scanner **é**: se o IP do scanner aparecer fazendo RDP, criando serviço ou baixando arquivo da internet, isso precisa alertar.',
      'Revise as exceções periodicamente: o scanner mudou de IP? O contrato com a empresa de pentest acabou? Exceção de projeto encerrado é lixo perigoso. E sim, a Wiki do SOC tem exceções de 2019 para um IP que hoje é a impressora do 3º andar.',
    ),
    chegada: [
      { quem: 'keyla', texto: 'O scanner de vulnerabilidade da prefeitura disparou 2.300 alertas. Eu quero criar uma exceção: tudo que vier dele, ignora.', gesto: 'cintura' },
      { quem: 'ro', texto: 'Ótimo, e quando invadirem o scanner, ele vira o funcionário invisível do mês.', expr: 'neutro' },
      { quem: 'keyla', texto: 'Mas quem invade um scanner?', expr: 'surpresa' },
      { quem: 'vandeco', texto: 'Quem quer a máquina que tem credencial de administrador e acesso a tudo, minha filha. É o crachá mestre do prédio.', gesto: 'pensar' },
      { quem: 'neide', texto: 'Igual minha chave. Abre todas as salas. Por isso eu nunca deixo em cima da mesa.', expr: 'sorriso' },
    ],
    fila: { quantidade: 7 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Exceção com prazo de validade',
        enunciado: 'Ajude a Keyla a escrever a exceção do scanner da prefeitura sem cegar o SOC.',
        perguntas: [
          {
            p: 'Qual exceção é a mais adequada?',
            opcoes: ['Suprimir as regras de varredura e de IDS com origem 10.20.1.50, destinos do escopo, terças das 20h às 23h, dono: TI da prefeitura, validade: 6 meses', 'Suprimir todos os alertas com origem 10.20.1.50', 'Suprimir a regra de varredura para qualquer origem', 'Desligar o IDS nas terças à noite'],
            certa: 0,
            explicacao: 'Estreita em origem, regras, destinos e horário, com dono e validade. As outras escondem demais: qualquer atividade do scanner, qualquer varredura de qualquer pessoa, ou o IDS inteiro.',
          },
          {
            p: 'Com a exceção ativa, o IP do scanner aparece fazendo logon tipo 10 no controlador de domínio às 3h de uma quinta. Isso:',
            opcoes: ['Deve alertar e ser investigado: não é varredura, está fora da janela e é RDP', 'Está coberto pela exceção, pode ignorar', 'É falso positivo do scanner', 'É normal, scanner faz RDP'],
            certa: 0,
            explicacao: 'A exceção cobre o comportamento esperado do scanner. RDP interativo no DC, fora da janela, não é varredura: pode ser alguém usando a máquina do scanner como ponte.',
          },
          {
            p: 'Por que a exceção precisa de data de validade?',
            opcoes: ['Porque o contexto muda (IP, contrato, escopo) e exceção esquecida vira ponto cego', 'Porque o SIEM apaga exceções sem data', 'Para gerar mais tickets', 'Não precisa, exceção é permanente por natureza'],
            certa: 0,
            explicacao: 'Projetos acabam, IPs são reaproveitados, empresas de pentest são trocadas. A validade força alguém a reavaliar, em vez de a exceção virar herança maldita.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'keyla', texto: 'Escrevi a exceção com dono, escopo e validade. Ela tem até nome: "EXC-PREF-SCAN-2026". Ela é minha filha agora.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'ro', texto: 'Pelo menos essa filha tem data para sair de casa.' },
    ],
  },
  {
    n: 24,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'CPF no ticket não é evidência, é problema',
    resumo: 'LGPD no dia a dia do SOC: dado pessoal em ticket, mascarar, minimizar e quando o assunto sobe para a ANPD.',
    aula: aula(
      'A **LGPD** (Lei 13.709/2018) vale para o SOC também. **Dado pessoal** é qualquer informação que identifica ou pode identificar uma pessoa: nome, CPF, e-mail, IP associado a alguém, matrícula. **Dado pessoal sensível** (art. 5º, II) inclui saúde, biometria, origem racial ou étnica, convicção religiosa, opinião política, vida sexual e dado genético. O prontuário do hospital é sensível do começo ao fim.',
      'Um dos princípios da lei é a **necessidade** (art. 6º, III): tratar só o mínimo necessário para a finalidade. No ticket, isso vira prática: em vez de colar a planilha com 3 mil CPFs que vazou, escreva "planilha com aproximadamente 3 mil CPFs de segurados, hash SHA-256 tal, anexada no repositório de evidências com acesso restrito". Se precisar citar um CPF, **mascare**: `***.456.789-**`.',
      'Log também é dado pessoal. Retenção tem que ter finalidade e prazo, e acesso tem que ser controlado. Print de tela com dado de cliente no grupo de mensagens, evidência no seu notebook pessoal e "vou mandar a planilha pro meu e-mail para olhar em casa" são incidentes que o próprio SOC cria.',
      'Quando há **incidente de segurança com dado pessoal** que possa gerar risco ou dano relevante aos titulares, o controlador (o cliente) deve comunicar a **ANPD** e os titulares; pela Resolução CD/ANPD nº 15/2024, o prazo é de **3 dias úteis** a partir do conhecimento. Quem decide e comunica é o cliente, com o encarregado (DPO) e o jurídico. O papel do SOC é detectar, registrar o momento do conhecimento e avisar o cliente rápido, com fatos.',
    ),
    chegada: [
      { quem: 'gilmar', texto: 'Chegou uma reclamação da Tabajara. Um ticket nosso tinha uma planilha colada com 3 mil CPFs. Inteira. No corpo do ticket.', gesto: 'cruzar', expr: 'bravo' },
      { quem: 'thiaguinho', texto: 'Era evidência! O RH mandou a planilha por e-mail para fora e eu provei colando ela.', expr: 'surpresa' },
      { quem: 'ro', texto: 'Você investigou um vazamento vazando de novo, Thiaguinho. É uma pirâmide de vazamentos.', expr: 'neutro' },
      { quem: 'jefferson', texto: 'LGPD cai em todo concurso. Art. 5º, dado pessoal; art. 6º, princípios. Eu sei de cor.', gesto: 'comemorar' },
      { quem: 'ro', texto: 'Então você vai revisar os tickets do Thiaguinho. Todos. Com amor.' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Ticket enxuto, titular protegido',
        enunciado: 'Revise os casos da semana com a lupa da LGPD.',
        perguntas: [
          {
            p: 'Você precisa registrar no ticket que um e-mail com dados de segurados saiu da Tabajara. Qual registro está melhor?',
            opcoes: ['"Planilha com cerca de 3 mil CPFs e nomes de segurados, SHA-256 registrado, cópia no repositório de evidências com acesso restrito"', 'Colar a planilha inteira para não perder a evidência', 'Colar só as 10 primeiras linhas, como amostra', 'Não registrar nada para não expor os dados'],
            certa: 0,
            explicacao: 'Descreve o que é, quanto é e onde está a evidência, sem espalhar os dados. Não registrar também é erro: o incidente precisa de documentação, só que com minimização.',
          },
          {
            p: 'No hospital, um alerta envolve o acesso indevido a prontuários. Esses dados são:',
            opcoes: ['Dados pessoais sensíveis, porque são dados de saúde', 'Dados públicos, porque o hospital é conhecido', 'Dados anonimizados, porque têm número de prontuário', 'Dados corporativos, sem relação com a LGPD'],
            certa: 0,
            explicacao: 'Dado de saúde é sensível pelo art. 5º, II. Número de prontuário não anonimiza nada: identifica o paciente dentro do hospital. Isso aumenta a gravidade e a cautela no manuseio.',
          },
          {
            p: 'Confirmado o incidente com dado pessoal que pode causar dano relevante, quem comunica a ANPD e em que prazo?',
            opcoes: ['O controlador (o cliente), em 3 dias úteis, apoiado pelo encarregado e pelo jurídico', 'O SOC, em 24 horas', 'O analista N1 que achou, por e-mail, imediatamente', 'Ninguém, a comunicação é opcional'],
            certa: 0,
            explicacao: 'A obrigação é do controlador. A Resolução CD/ANPD nº 15/2024 fixou o prazo de 3 dias úteis. O SOC ajuda registrando a linha do tempo, inclusive quando o cliente tomou conhecimento.',
          },
          {
            p: 'Qual é a forma correta de mascarar um CPF num ticket?',
            opcoes: ['`***.456.789-**`', '`123.456.789-00` em negrito, para destacar', 'O CPF completo, mas em anexo zipado', 'O CPF em base64'],
            certa: 0,
            explicacao: 'Mascarar esconde parte do número e mantém o suficiente para referência. Base64 não é proteção: qualquer pessoa decodifica no Canivete em dois segundos.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'thiaguinho', texto: 'Apaguei a planilha do ticket e pedi para o Chamadão expurgar o histórico.', gesto: 'sim' },
      { quem: 'gilmar', texto: 'E o Chamadão?' },
      { quem: 'thiaguinho', texto: 'Caiu. É segunda-feira.', gesto: 'ombros' },
    ],
  },
  {
    n: 25,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'hxxp e outros palavrões',
    resumo: 'URL ofuscada, encurtador, defang e codificação de URL: ler o link sem clicar nele.',
    aula: aula(
      '**Defang** é desarmar um indicador para que ninguém clique sem querer: `http` vira `hxxp`, o ponto vira `[.]`, às vezes o `@` vira `[@]`. Em ticket, e-mail e chat, IOC vai **sempre** defangado. Link clicável de phishing no Bate-Papo Corporativo é armadilha para o colega.',
      '**Codificação de URL** (percent-encoding) troca caracteres por `%` e o código hexadecimal: `%3A` é `:`, `%2F` é `/`, `%3D` é `=`, `%40` é `@`, `%20` é espaço. Phishing usa isso para esconder o destino dentro de um parâmetro, e muitas vezes empilha camadas: um parâmetro `url=` com base64 dentro, codificado de novo para URL.',
      '**Encurtadores** e redirecionadores escondem o destino final. Para expandir sem visitar, use serviços de expansão de link ou consulte a reputação da URL, e se precisar abrir, faça em navegador isolado ou sandbox, nunca na sua estação. Outra pegadinha clássica: em `https://www.tabajaraseguros.com.br@login-falso.top/`, tudo antes do `@` é "usuário" e o domínio de verdade é o que vem depois.',
      'No Canivete, a ordem importa: desfaça as camadas de fora para dentro. Primeiro a codificação de URL (**url**), depois o que aparecer (**base64**, por exemplo). O resultado é o destino real, que vira IOC para o ticket e para a busca no proxy: quem mais acessou isso?',
    ),
    chegada: [
      { quem: 'chat', texto: 'Kevin: gente olha esse link de phishing que chegou na Tabajara https://encurta.exemplo/r?go=... cliquem pra ver que bizarro' },
      { quem: 'ro', texto: 'KEVIN. DEFANG. AGORA.', expr: 'bravo' },
      { quem: 'kevin', texto: 'Mas é só um link!', gesto: 'ombros' },
      { quem: 'vandeco', texto: 'Link de phishing no chat do SOC é igual granada no amigo secreto, garoto.' },
      { quem: 'chat', texto: 'Kevin: hxxps://encurta[.]exemplo/r?go=... melhor?' },
      { quem: 'ro', texto: 'Melhor. Agora descobre para onde ele vai sem clicar.', gesto: 'sim' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'decodificar',
        titulo: 'Para onde vai o encurtado',
        enunciado: `O link do e-mail recebido pela Patrícia, da Tabajara, já defangado:\n\n\`hxxps://encurta[.]exemplo/r?go=${LINK_DIA25}\`\n\nO valor do parâmetro \`go\` esconde o destino. Cole só ele no Canivete e desfaça as camadas.`,
        entrada: LINK_DIA25,
        receita: ['url', 'base64'],
        pergunta: 'Qual é o domínio de destino real?',
        resposta: 'login-tabajara-seguros.top',
        explicacao: 'Primeiro **url** transforma `%3D` em `=` e devolve um base64; depois **base64** revela `https://login-tabajara-seguros[.]top/office365/entrar?u=patricia.alves`. Página falsa de login do Office 365, já com o usuário da vítima preenchido para parecer legítima. IOC para o ticket (defangado) e busca no proxy por qualquer acesso ao domínio.',
      },
    ],
    saida: [
      { quem: 'kevin', texto: 'Eu podia ter clicado, mas não cliquei. Isso é crescimento pessoal.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'ro', texto: 'É o mínimo, Kevin. Mas tá bom, vou anotar como crescimento.' },
    ],
  },
  {
    n: 26,
    site: 'alfa',
    turno: 'madrugada',
    titulo: 'Aprova aí, só para parar de apitar',
    resumo: 'Fadiga de MFA: quando o atacante tem a senha e aposta no seu sono.',
    aula: aula(
      '**Fadiga de MFA** ou push bombing (MITRE T1621, Multi-Factor Authentication Request Generation) acontece quando o atacante já tem a senha (phishing, vazamento, spraying) e dispara notificação de aprovação atrás de notificação, de madrugada, até a pessoa aprovar para o celular parar de tocar. Foi parte de intrusões famosas, como a da Uber em 2022.',
      'O que aparece no log do provedor de identidade: **muitas solicitações de MFA** para o mesmo usuário em pouco tempo, resultados **negado** ou **sem resposta** em sequência, horário estranho, IP e localização incomuns, e no fim **um aprovado**. Esse aprovado é o momento da invasão: sessão válida para o atacante.',
      'Resposta: tratar como conta comprometida. **Revogar sessões e tokens**, trocar a senha, revisar o que a sessão fez (regras de caixa de entrada, novos métodos de MFA cadastrados, downloads), bloquear o IP e falar com o usuário pelo telefone, não pelo e-mail. Ninguém leva bronca por ter aprovado às 2h; leva orientação.',
      'Prevenção que o SOC recomenda: **correspondência de número** (number matching), em que a pessoa digita no celular o número mostrado na tela de login, contexto na notificação (local e aplicativo), limite de tentativas, e métodos resistentes a phishing (FIDO2, chaves de segurança). No Vigia: `resultado!=aprovado | contar por usuario | ordenar -total` mostra quem está sendo bombardeado.',
    ),
    chegada: [
      { quem: 'narrador', texto: '2h50. O Thiaguinho tirou o tênis. A Rô foi pegar café pela quarta vez. O SIEM pisca uma regra nova: "MFA_NEGADO_EXCESSIVO".' },
      { quem: 'ro', texto: 'Essa regra é minha, não da Keyla. Então quando ela pisca, eu levanto.', gesto: 'apontar', expr: 'neutro' },
      { quem: 'thiaguinho', texto: 'Uma vez meu celular apitou 20 vezes de madrugada e eu aprovei para conseguir dormir.', expr: 'neutro' },
      { quem: 'ro', texto: 'Thiaguinho. Isso foi quando?' },
      { quem: 'thiaguinho', texto: 'Ah, foi do meu e-mail pessoal. Acho. Espero.', gesto: 'ombros', expr: 'surpresa' },
      { quem: 'ro', texto: 'Amanhã a gente troca sua senha. Hoje a gente salva alguém da Tabajara.' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'siem',
        titulo: 'Apitou até ceder',
        enunciado: 'Você tem os registros de MFA do dia da Tabajara: gente normal aprovando de dia, alguém que esqueceu o celular na mesa e um bombardeio de madrugada. Ache a vítima.',
        registros: mfaDia26(),
        pergunta: 'Qual usuário sofreu push bombing e acabou aprovando a solicitação?',
        resposta: 'juliana.santos',
        gabarito: 'resultado!=aprovado | contar por usuario | ordenar -total | topo 5',
        dica: 'Tire os aprovados e conte por usuário: `resultado!=aprovado | contar por usuario | ordenar -total`. Depois veja a história completa com `usuario=juliana* | tabela hora,app,resultado,ip_origem,cidade`.',
        explicacao: '`juliana.santos` recebeu 22 solicitações de MFA para a VPN em menos de meia hora, a partir das 02:10, de `77.91.124.56` (Amsterdã), negou ou ignorou todas e aprovou às 02:39. O atacante tinha a senha dela. O `bruno.carvalho` tem 3 sem resposta à tarde, de Curitiba, no IP da empresa: celular esquecido, não ataque. Ação: P1, revogar sessões da VPN, trocar a senha, bloquear o IP, ligar para a usuária e recomendar number matching.',
      },
    ],
    saida: [
      { quem: 'ro', texto: 'Revogamos a sessão às 3h05. O atacante ficou 25 minutos dentro. Poderia ser 25 dias.', gesto: 'sim', expr: 'sorriso' },
      { quem: 'thiaguinho', texto: 'Troquei minha senha pessoal agora. Tinha 14 sessões abertas. Uma era em Jacarta.', expr: 'surpresa' },
    ],
  },
  {
    n: 27,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'O dia mais feliz do Gilmar',
    resumo: 'Métricas de SOC com conta de verdade: MTTA, MTTR, volume e taxa de falso positivo.',
    aula: aula(
      '**MTTA** (Mean Time to Acknowledge): tempo médio entre o alerta chegar e alguém assumir. **MTTR**: tempo médio até resolver ou responder, e cada SOC define no contrato se o "R" é resposta, contenção ou resolução, então leia a definição antes de comparar números. Também aparecem **MTTD** (tempo até detectar) e tempo de escalonamento.',
      'Média é soma dividida por quantidade. Cinco alertas reconhecidos em 4, 6, 10, 2 e 8 minutos dão MTTA de 30 ÷ 5 = **6 minutos**. Cuidado: um único alerta esquecido por 6 horas destrói a média. Por isso SOC maduro também olha **mediana** e percentil 90 (o tempo em que 90% dos alertas foram atendidos).',
      '**Taxa de falso positivo** = falsos positivos ÷ total de alertas classificados. Com 1.200 alertas e 960 FP, a taxa é 80%. Alta, mas comum, e é o mapa de onde fazer tuning: agrupe por regra e veja quais regras geram mais FP. **Volume por analista** ajuda a dimensionar turno: 1.200 alertas para 4 pessoas num turno de 12 horas são 300 por pessoa, 25 por hora, um a cada 2,4 minutos.',
      'Métrica é para melhorar o processo, não para torturar gente. Se a meta for "fechar rápido", as pessoas fecham rápido, inclusive o que não deviam (Lei de Goodhart: quando a medida vira meta, deixa de ser boa medida). Meça também qualidade: tickets reabertos, verdadeiros positivos perdidos, escalonamentos devolvidos.',
    ),
    chegada: [
      { quem: 'narrador', texto: 'O Gilmar chegou às 6h. Trouxe bolo. O Tomatinho está enfeitado com uma fita.' },
      { quem: 'gilmar', texto: 'Hoje é o dia do relatório mensal de métricas. É como o Natal, mas com planilha!', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'ro', texto: 'Ele fica assim todo mês. Não contraria, que o bolo é bom.', expr: 'neutro' },
      { quem: 'kevin', texto: 'Meu MTTR é o melhor do SOC! Fecho tudo em 40 segundos!', gesto: 'comemorar' },
      { quem: 'gilmar', texto: 'E sua taxa de tickets reabertos é 61%, Kevin. Métrica tem dois lados, igual torrada.', gesto: 'apontar' },
      { quem: 'pamela', texto: 'Eu montei a planilha de mediana e percentil 90 que você pediu ano passado.', expr: 'neutro' },
      { quem: 'gilmar', texto: 'Alguém montou! Quem foi? Vou dar um ponto na planilha.' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Conta de padaria',
        enunciado: 'O Gilmar quer o relatório do mês com conta conferida. Calculadora é permitida. Planilha também. O Tomatinho está observando.',
        perguntas: [
          {
            p: 'Cinco alertas críticos foram reconhecidos em 3, 5, 7, 4 e 6 minutos. Qual é o MTTA?',
            opcoes: ['5 minutos', '7 minutos', '25 minutos', '4 minutos'],
            certa: 0,
            explicacao: 'Soma: 3 + 5 + 7 + 4 + 6 = 25 minutos. Dividido por 5 alertas: 5 minutos. 7 é o pior caso, 25 é a soma, não a média.',
          },
          {
            p: 'No mês, o SOC classificou 2.000 alertas: 1.500 FP, 300 BP e 200 TP. Qual é a taxa de falso positivo?',
            opcoes: ['75%', '90%', '85%', '10%'],
            certa: 0,
            explicacao: '1.500 ÷ 2.000 = 0,75, ou 75%. Benigno verdadeiro não é falso positivo: somar os dois (90%) esconde que 300 alertas acertaram e só precisavam de exceção.',
          },
          {
            p: 'O MTTR do mês foi de 20 minutos em 99 alertas e de 600 minutos em 1 alerta esquecido no fim de semana. A média geral é:',
            opcoes: ['25,8 minutos, puxada pelo alerta esquecido', '20 minutos', '310 minutos', '600 minutos'],
            certa: 0,
            explicacao: '(99 × 20 + 600) ÷ 100 = (1.980 + 600) ÷ 100 = 25,8. Um único caso muda a média em quase 30%. A mediana continuaria 20, por isso vale olhar as duas.',
          },
          {
            p: 'O turno tem 4 analistas, 12 horas e 960 alertas. Quanto tempo, em média, cada analista tem por alerta?',
            opcoes: ['3 minutos', '12 minutos', '1 minuto', '45 segundos'],
            certa: 0,
            explicacao: '960 ÷ 4 = 240 alertas por pessoa. 12 horas são 720 minutos; 720 ÷ 240 = 3 minutos por alerta, sem contar pausa, ligação e passagem de turno. É assim que se argumenta tuning e contratação com número.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Mediana, percentil 90, taxa por regra. Eu poderia chorar.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'ro', texto: 'Ele vai chorar. Todo mês ele chora. Guarda um pedaço de bolo para a Pâmela, que ela fez tudo.', gesto: 'apontar' },
    ],
  },
  {
    n: 28,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'O vale-refeição bloqueado',
    resumo: 'Simulado de phishing interno: é benigno, mas reportar é ouro.',
    evento: 'simulado',
    aula: aula(
      '**Simulado de phishing** é uma campanha controlada, autorizada pela empresa, que manda e-mails falsos para os próprios funcionários para medir e treinar. É benigno por definição, mas o SOC deve tratar todo reporte como real **até confirmar** que é do simulado, porque golpista também manda e-mail de "vale-refeição bloqueado".',
      'Como confirmar: a equipe de conscientização avisa o SOC antes (datas, remetentes, domínios, IPs da plataforma de simulação), e essas informações ficam registradas. Confere-se o remetente, o domínio dos links e os cabeçalhos com o que foi informado. Bateu tudo: benigno verdadeiro, com a referência da campanha no ticket. Não bateu: phishing real, segue o playbook.',
      'As métricas que importam no simulado não são só a **taxa de clique**. A mais valiosa é a **taxa de reporte**, e o **tempo até o primeiro reporte**: num ataque real, é ele que dispara a resposta. Uma empresa com 10% de clique e 60% de reporte se defende melhor que uma com 5% de clique e ninguém reportando.',
      'Quem clica não é a piada da empresa. Simulado que humilha ensina as pessoas a esconder o clique, e clique escondido é o pior cenário para o SOC. Agradeça o reporte, sempre, inclusive de quem clicou e depois reportou: essa pessoa acabou de salvar a sua madrugada.',
    ),
    chegada: [
      { quem: 'narrador', texto: '14h. Chega na caixa de todo mundo da Insônia: "URGENTE: seu vale-refeição foi BLOQUEADO. Regularize em até 2 horas."' },
      { quem: 'jefferson', texto: 'Se bloquearem meu vale-refeição, eu paro de estudar e vou viver de luz.', expr: 'surpresa' },
      { quem: 'brenda', texto: 'Já escalei para o CSIRT, o Vandeco, a diretoria e a Dona Neide.', gesto: 'apontar' },
      { quem: 'neide', texto: 'Eu não tenho e-mail, meu bem. Mas obrigada pela consideração.', expr: 'sorriso' },
      { quem: 'gilmar', texto: '(cantarolando, sem olhar para ninguém) Nada a declarar. Nada mesmo. Hoje é um dia comum.', gesto: 'ombros' },
      { quem: 'ro', texto: 'O Gilmar cantarolando é o maior IOC de simulado que existe.', expr: 'neutro' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'escolha',
        titulo: 'O vale-refeição é seu, a decisão também',
        enunciado: 'O e-mail do vale-refeição bloqueado chegou para você também. O link aponta para um domínio que você não conhece. O que você faz?',
        opcoes: [
          {
            texto: 'Usar o botão "Reportar phishing" do e-mail e seguir o trabalho.',
            reacao: [
              { quem: 'narrador', texto: 'Uma tela aparece: "Parabéns! Você foi a terceira pessoa a reportar este simulado."' },
              { quem: 'gilmar', texto: 'Terceiro reporte em 4 minutos! Isso vai para a planilha com destaque em verde.', gesto: 'comemorar', expr: 'sorriso' },
            ],
            efeitos: { reputacao: 8, sanidade: 3 },
          },
          {
            texto: 'Mandar no chat geral "NÃO CLIQUEM, É GOLPE" com o link para todo mundo ver.',
            reacao: [
              { quem: 'chat', texto: 'Kevin: qual link? esse aqui? cliquei pra ver' },
              { quem: 'ro', texto: 'Avisar é bom. Avisar com link clicável é distribuir a isca. Reporte pelo canal e, se for avisar, sem link.', expr: 'bravo' },
            ],
            efeitos: { reputacao: -3 },
          },
          {
            texto: 'Clicar para ver se é golpe mesmo, afinal você trabalha num SOC.',
            reacao: [
              { quem: 'narrador', texto: 'A página mostra: "Opa! Este foi um simulado. Assista ao vídeo de 3 minutos."' },
              { quem: 'vandeco', texto: 'Trabalhar no SOC não dá imunidade, dá responsabilidade. Mas já que clicou, reporta. Clicar e reportar é muito melhor que clicar e esconder.', gesto: 'pensar' },
            ],
            efeitos: { reputacao: -5, sanidade: -3 },
          },
          {
            texto: 'Apagar o e-mail e não falar nada.',
            reacao: [
              { quem: 'ro', texto: 'Você se salvou e deixou o resto do prédio no escuro. O reporte é o que avisa o SOC que tem campanha rolando.', expr: 'neutro' },
            ],
            efeitos: { reputacao: -2 },
          },
        ],
      },
      {
        tipo: 'quiz',
        titulo: 'Simulado não é pegadinha',
        enunciado: 'Depois do simulado, a Rô quer ter certeza de que todo mundo entendeu a lição. Inclusive o Kevin.',
        perguntas: [
          {
            p: 'Chega um reporte de phishing durante a semana do simulado. Antes de fechar como benigno, você deve:',
            opcoes: ['Conferir remetente, domínio dos links e cabeçalhos com os dados da campanha informados ao SOC', 'Fechar como benigno, é semana de simulado', 'Perguntar no chat se alguém sabe se é simulado', 'Clicar no link para ver se aparece a tela do simulado'],
            certa: 0,
            explicacao: 'Golpista não respeita calendário de simulado. Só é benigno se bater com o que a equipe de conscientização registrou. Clicar para conferir é exatamente o que não se faz.',
          },
          {
            p: 'Qual métrica mostra melhor se a empresa está preparada para um phishing real?',
            opcoes: ['Taxa de reporte e tempo até o primeiro reporte', 'Só a taxa de clique', 'Quantidade de e-mails enviados no simulado', 'Quantos funcionários assistiram ao vídeo'],
            certa: 0,
            explicacao: 'Num ataque real, alguém sempre clica. O que muda o resultado é a rapidez com que alguém reporta e o SOC reage.',
          },
          {
            p: 'Como classificar no SIEM o reporte de um e-mail que é, comprovadamente, do simulado?',
            opcoes: ['Benigno verdadeiro, com a referência da campanha', 'Falso positivo', 'Verdadeiro positivo', 'Não registrar'],
            certa: 0,
            explicacao: 'O e-mail existe e foi corretamente reportado, mas é autorizado. Por isso benigno verdadeiro, com a evidência da campanha. FP seria se nada tivesse acontecido.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Resultado: 18% clicaram, 54% reportaram. O Kevin clicou duas vezes.', gesto: 'cintura' },
      { quem: 'kevin', texto: 'A segunda foi para confirmar a primeira!', expr: 'surpresa' },
    ],
  },
  {
    n: 29,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'Ninguém é firewall',
    resumo: 'Saúde mental no turno: fadiga de alerta, pausa, sono e pedir ajuda.',
    evento: 'happy_hour',
    aula: aula(
      '**Fadiga de alerta** é real e tem efeito técnico: depois de centenas de falsos positivos, o cérebro começa a classificar no automático, e é aí que o verdadeiro positivo passa. Não é falta de caráter, é limite humano. É por isso que tuning de regra também é cuidado com a equipe.',
      'Pausas curtas e regulares melhoram a atenção, não atrapalham o SLA. Levante, beba água, olhe para longe da tela. No 12x36, o sono depois do turno da noite é parte do trabalho: quarto escuro, celular longe, e não marque a reforma da cozinha para o dia de folga depois da madrugada.',
      '**Pedir ajuda é processo**, não fraqueza. Caso complexo, cliente agressivo, erro grave: chame o N2, o coordenador, o colega do lado. Um SOC saudável tem ambiente sem culpados (blameless): discute o que falhou no processo, não quem é burro. Quem esconde erro por medo é o risco que nenhum SIEM detecta.',
      'Se o cansaço virou tristeza constante, ansiedade que não passa, insônia, ou pensamentos ruins, procure apoio: serviço de saúde, psicólogo, a rede de apoio. O **CVV** atende de graça, 24 horas, pelo telefone **188** e pelo site. Nenhuma fila de alerta vale mais que você.',
    ),
    chegada: [
      { quem: 'narrador', texto: 'Sexta-feira. A placa ainda diz "Dias sem incidente: 0". Alguém escreveu embaixo, a caneta: "e dias sem café: 0 também".' },
      { quem: 'gilmar', texto: 'Pessoal, a empresa liberou happy hour hoje no bar da esquina. Uma rodada é por conta da casa. Uma. Rodada. Registrada em planilha.', gesto: 'acenar', expr: 'sorriso' },
      { quem: 'thiaguinho', texto: 'Eu vou, mas só se tiver coxinha. Inteira dessa vez.', gesto: 'comemorar' },
      { quem: 'ro', texto: 'Eu vou ficar meia hora. Em 14 anos de turno aprendi: quem não descansa vira alerta.', expr: 'neutro' },
      { quem: 'neide', texto: 'Meu bem, você tá com uma cara de quem dormiu três horas. Hoje, quando sair, sai mesmo. O computador não sente sua falta, eu juro.', expr: 'sorriso' },
      { quem: 'vandeco', texto: 'Em 2008 eu fiquei 40 horas acordado num incidente. Resolvi tudo e depois dormi no carro, no estacionamento, com o motor ligado. Não façam isso. É a única história minha que não serve para nada.', gesto: 'nao' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'escolha',
        titulo: 'Fim de turno de sexta',
        enunciado: 'O turno acabou. A fila tem 30 alertas de baixa prioridade, todos com dono no próximo turno. O happy hour começa em 15 minutos. Você está {cansada|cansado|cansade}. O que você faz?',
        opcoes: [
          {
            texto: 'Ir ao happy hour, conversar com a equipe e voltar para casa cedo.',
            reacao: [
              { quem: 'ro', texto: 'Saber parar também é técnica. Senta aqui, que eu conto do incidente de 2015 que eu nunca contei nem para o Gilmar.', gesto: 'acenar', expr: 'sorriso' },
              { quem: 'thiaguinho', texto: 'Tem coxinha inteira! É um dia histórico!', gesto: 'comemorar' },
            ],
            efeitos: { sanidade: 15, energia: -5, reputacao: 2 },
          },
          {
            texto: 'Ir direto para casa dormir. A semana foi pesada.',
            reacao: [
              { quem: 'neide', texto: 'Isso, meu bem. Dormir também é processo. Eu falei no primeiro dia.', expr: 'sorriso' },
            ],
            efeitos: { energia: 20, sanidade: 8 },
          },
          {
            texto: 'Ficar mais três horas zerando a fila, para começar a segunda limpo.',
            reacao: [
              { quem: 'gilmar', texto: 'Agradeço, mas não quero. A fila tem dono no próximo turno. Hora extra todo dia não é dedicação, é sintoma. Vai para casa.', gesto: 'nao' },
              { quem: 'narrador', texto: 'Você fecha 30 alertas. Na segunda, chegam 300.' },
            ],
            efeitos: { sanidade: -15, energia: -20, reputacao: 2 },
          },
          {
            texto: 'Antes de ir, conversar com o Gilmar sobre o cansaço e pedir para revisar a escala do mês.',
            reacao: [
              { quem: 'gilmar', texto: 'Obrigado por falar. Sério. Vou mexer na escala e colocar a regra V7 da Keyla na lista de tuning, que metade do cansaço daqui tem nome e versão.', gesto: 'sim', expr: 'sorriso' },
              { quem: 'keyla', texto: '(de longe) Eu ouvi! Mas tudo bem. Ela precisa mesmo.', expr: 'triste' },
            ],
            efeitos: { sanidade: 10, energia: 5, reputacao: 3 },
          },
        ],
      },
    ],
    saida: [
      { quem: 'ro', texto: 'Segunda é a prova para N2. Não estuda no fim de semana. Dorme. Quem dorme acerta mais que quem decora.', gesto: 'apontar' },
    ],
  },
  {
    n: 30,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'A prova para N2',
    resumo: 'Trinta dias de fila, ticket e café. Hoje é dia de mostrar que sabe triar sem pedir ajuda ao Kevin.',
    aula: aula(
      'Revisão do ato. **Veredito**: FP (a regra errou), BP (aconteceu e é esperado), TP (aconteceu e é malicioso). **Prioridade** é impacto vezes urgência, não a severidade da regra. **Ticket**: o quê, quando (com fuso), onde, evidência, ação, próximo passo. Nada de "verificado ok".',
      '**Windows**: 4624 sucesso, 4625 falha, 4634 logoff, 4672 privilégios especiais, 4740 conta bloqueada, 4771 falha de pré-autenticação Kerberos. Logon tipo 2 interativo, 3 rede, 5 serviço, 7 desbloqueio, 10 RDP. Força bruta: um usuário, muitas senhas. Spraying: muitos usuários por IP. **Sysmon**: 1 processo, 3 rede, 11 arquivo, 13 registro, 22 DNS. Office como pai de interpretador é alerta forte.',
      '**Rede e web**: proxy (olhe o que sai, não o que entra), DNS (subdomínios longos e distintos por domínio), firewall (portas distintas por IP), WAF (mesmo user-agent em muitos IPs no login). **E-mail**: Received de baixo para cima, SPF no Return-Path, DKIM em `d=`, DMARC alinhado ao From. **PowerShell** `-EncodedCommand` é base64 de UTF-16LE. URL: defang e decodificação em camadas.',
      '**Processo e pessoas**: exceção estreita, com dono e validade; GMUD confere ativo, conta, tipo de logon e janela; LGPD minimiza dado em ticket, ANPD em 3 dias úteis é obrigação do controlador; MTTA e MTTR são médias, olhe também a mediana. E fadiga de MFA termina em revogar sessão. Boa prova. Respira.',
    ),
    chegada: [
      { quem: 'narrador', texto: 'Segunda-feira, 8h. O Chamadão caiu, como sempre. A sala de reunião tem uma mesa, uma cadeira, um computador e o Tomatinho.' },
      { quem: 'gilmar', texto: 'É a prova para N2. Nota mínima 70. O Tomatinho está aqui só para dar clima. Ele não está ligado. Talvez.', gesto: 'apontar', expr: 'neutro' },
      { quem: 'ro', texto: 'Lê o enunciado inteiro. A pergunta mente igual título de alerta.', gesto: 'cruzar' },
      { quem: 'vandeco', texto: 'Na minha prova, em 2001, a pergunta era "o que é um vírus". Eu escrevi quatro páginas. Ganhei 6. Disseram que era "prolixo".', gesto: 'pensar' },
      { quem: 'pamela', texto: 'Boa sorte. Você vai bem.', expr: 'sorriso' },
      { quem: 'kevin', texto: 'Se eu passar, vou fechar tudo como falso positivo, só que no N2.', gesto: 'comemorar' },
      { quem: 'ro', texto: 'Por isso que você não vai fazer a prova hoje, Kevin.', expr: 'neutro' },
    ],
    fila: { quantidade: 5 },
    missoes: [
      {
        tipo: 'prova',
        titulo: 'Prova de promoção para N2',
        enunciado: 'Quinze perguntas sobre o que você viveu no Ato 1. Nota mínima: 70. O Tomatinho está observando, desligado (talvez).',
        notaMinima: 70,
        promoveA: 'N2',
        perguntas: [
          {
            p: 'O alerta "Força bruta" mostra 200 falhas da conta de serviço de uma impressora, que está com a senha antiga depois de uma troca. Veredito:',
            opcoes: ['Falso positivo, com recomendação de atualizar a credencial na impressora', 'Verdadeiro positivo', 'Benigno verdadeiro', 'Falso negativo'],
            certa: 0,
            explicacao: 'Não há ataque de adivinhação de senha: a regra errou o diagnóstico. A ação é corrigir a credencial e, se repetir, ajustar a regra.',
          },
          {
            p: 'Qual combinação indica logon por RDP com conta administrativa?',
            opcoes: ['4624 com logon tipo 10, seguido de 4672', '4625 com logon tipo 3', '4634 com logon tipo 2', '4771 com código 0x18'],
            certa: 0,
            explicacao: 'Tipo 10 é RemoteInteractive (RDP), e 4672 marca privilégios especiais atribuídos ao logon. 4771 com 0x18 é senha errada no Kerberos.',
          },
          {
            p: 'Qual consulta do Vigia separa melhor password spraying de força bruta?',
            opcoes: ['`evento=4625 | distintos usuario por ip_origem | ordenar -distintos`', '`evento=4625 | contar por usuario`', '`evento=4624 | contar por ip_origem`', '`evento=4634 | topo 10`'],
            certa: 0,
            explicacao: 'Spraying é muitos usuários distintos a partir de um IP, com poucas tentativas cada. Contar por usuário mostra só a força bruta barulhenta.',
          },
          {
            p: 'Um e-mail tem `spf=pass`, `dkim=pass header.d=tabajara-segur0s.top` e `dmarc=fail header.from=tabajaraseguros.com.br`. Conclusão:',
            opcoes: ['O domínio parecido autenticou a si mesmo, mas não está alinhado com o From: forte indício de falsificação', 'É legítimo, SPF e DKIM passaram', 'O DMARC do cliente está mal configurado', 'É impossível concluir qualquer coisa pelo cabeçalho'],
            certa: 0,
            explicacao: 'DMARC verifica o alinhamento com o From visível. O golpista autenticou o próprio domínio com zero no lugar do "o".',
          },
          {
            p: 'Qual é a melhor linha de evidência num ticket?',
            opcoes: ['"4624 tipo 10 às 03:13 UTC (00:13 BRT) de 185.143.77.20 no SRV-SQL-02, seguido de 4672"', '"Acesso muito suspeito, verificado"', '"Verificado ok"', '"Ver anexo"'],
            certa: 0,
            explicacao: 'Fato, com ID de evento, horário com fuso, origem e destino. Qualquer pessoa refaz o raciocínio a partir dela.',
          },
          {
            p: 'No proxy, qual padrão é mais preocupante?',
            opcoes: ['POST a cada 5 minutos para domínio sem categoria, enviando muito mais do que recebe', 'Download de 2 GB de um domínio de streaming de música', 'Acesso ao gov.br no horário de almoço', 'Muitos GET para o webmail da empresa'],
            certa: 0,
            explicacao: 'Periodicidade, volume de saída e destino desconhecido indicam C2 ou exfiltração. Streaming recebe muito e envia pouco, e é só música.',
          },
          {
            p: 'O que diferencia túnel de DNS de uma CDN com nomes compridos?',
            opcoes: ['O túnel gera muitos subdomínios longos e distintos para o mesmo domínio, normalmente de um host', 'A CDN usa nomes mais curtos', 'O túnel sempre usa registro AAAA', 'Não há diferença observável no log'],
            certa: 0,
            explicacao: 'A CDN repete poucos nomes longos; o túnel cria um nome novo a cada pedaço de dado. Contar subdomínios distintos por domínio separa os dois.',
          },
          {
            p: 'O antivírus quarentenou um anexo do cliente. Para checar reputação, você:',
            opcoes: ['Pesquisa o hash SHA-256, sem subir o arquivo em serviço público', 'Sobe o arquivo num site público de análise', 'Abre o arquivo na sua máquina', 'Considera resolvido, porque foi quarentenado'],
            certa: 0,
            explicacao: 'Subir arquivo de cliente em serviço público pode expor o conteúdo a terceiros. E quarentena não garante que o arquivo não executou antes.',
          },
          {
            p: 'Viagem impossível com o mesmo dispositivo, MFA aprovado no próprio celular e IP de saída de VPN conhecida. Classificação mais provável:',
            opcoes: ['Benigno verdadeiro, com registro e eventual exceção documentada', 'Verdadeiro positivo, porque a distância é grande', 'Falso negativo', 'Incidente P1'],
            certa: 0,
            explicacao: 'O logon aconteceu e a regra funcionou, mas o contexto (VPN, mesmo dispositivo, MFA legítimo) explica a localização.',
          },
          {
            p: 'Um IP aparece com 40 portas de destino distintas bloqueadas em 40 segundos, e duas permitidas (80 e 443). Isso é:',
            opcoes: ['Varredura de portas (T1046); as portas permitidas mostram o que ficou exposto', 'Força bruta', 'Credential stuffing', 'Tráfego normal de navegação'],
            certa: 0,
            explicacao: 'Muitas portas distintas por IP em pouco tempo é varredura. O allow no meio é o que o atacante descobriu.',
          },
          {
            p: 'Regra de severidade baixa "Novo serviço instalado" no controlador de domínio, às 3h, sem GMUD. Prioridade:',
            opcoes: ['Alta (P1): ativo mais crítico, fora de horário, sem mudança aprovada', 'P4, porque a regra é baixa', 'Fechar como benigno', 'Aguardar a próxima ocorrência'],
            certa: 0,
            explicacao: 'Prioridade vem do impacto e da urgência. A severidade da regra é genérica e não conhece o ativo.',
          },
          {
            p: '`powershell.exe -NoP -W Hidden -Enc SQBFAFgA...` Como decodificar o conteúdo com segurança?',
            opcoes: ['Base64 e depois UTF-16LE, no Canivete, sem executar', 'Rodar o comando numa máquina de teste da Tabajara', 'Só base64, o resultado já sai em texto puro UTF-8', 'Rot13 e depois base64'],
            certa: 0,
            explicacao: 'O -EncodedCommand é base64 de texto em UTF-16LE. Só o base64 deixa um zero entre cada letra. E nunca se executa para descobrir.',
          },
          {
            p: 'Na Pirâmide da Dor, qual indicador é o mais difícil para o atacante trocar?',
            opcoes: ['TTPs (táticas, técnicas e procedimentos)', 'Hash', 'Endereço IP', 'Nome de domínio'],
            certa: 0,
            explicacao: 'Mudar o jeito de operar exige reaprender e reconstruir. Hash, IP e domínio são trocados em minutos.',
          },
          {
            p: 'No Sysmon, qual evento registra a persistência em `HKCU\\...\\CurrentVersion\\Run`?',
            opcoes: ['13, valor de registro alterado', '1, criação de processo', '3, conexão de rede', '22, consulta DNS'],
            certa: 0,
            explicacao: 'O evento 13 (RegistryEvent, Value Set) mostra o TargetObject e o valor gravado. O 12 registra criação e exclusão de chave.',
          },
          {
            p: 'Uma usuária recebeu 22 pushes de MFA de madrugada, de outro país, e aprovou o último. Primeira resposta:',
            opcoes: ['Tratar como conta comprometida: revogar sessões, trocar a senha e investigar o que a sessão fez', 'Orientar a usuária a não aprovar da próxima vez e fechar', 'Fechar como benigno, o MFA foi aprovado', 'Desativar o MFA dela para parar os pushes'],
            certa: 0,
            explicacao: 'É fadiga de MFA (T1621). O atacante tem a senha e agora tem sessão válida. Revogar é urgente; orientar vem depois.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Prova entregue. O resultado sai no sistema. Se o Chamadão voltar, sai hoje.', gesto: 'sim' },
      { quem: 'neide', texto: 'Passando ou não, meu bem, você aprendeu. Isso ninguém tira. Nem o RH.', expr: 'sorriso' },
    ],
  },
];
