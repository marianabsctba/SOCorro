// Ato 3, dias 81 a 90: relatório executivo, as tentações da carreira, tabletop, XOR,
// a quadrilha que volta na prefeitura e o aniversário da Insônia.
import type { Dia } from '../../tipos';
import { xorHex } from '../../../motor/canivete';
import { registrosDia87 } from './registros';

const CONFIG_86 = 'versao=3.1;c2=painel-iptu-cobranca.top;porta=8443;intervalo=300;jitter=15;campanha=NORTE-IPTU;modo=furtivo';

export const DIAS_81_90: Dia[] = [
  // -------------------------------------------------------------------------
  {
    n: 81,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'Uma página para a diretoria',
    resumo: 'Relatório executivo: conclusão primeiro, impacto em negócio, decisões pedidas e zero jargão.',
    aula: [
      'Diretoria não lê PCAP. O relatório executivo responde a quatro perguntas em uma página: **o que aconteceu**, **qual foi o impacto no negócio**, **o que já foi feito** e **o que precisamos que vocês decidam**. Comece pela conclusão (o famoso BLUF, bottom line up front): quem só ler o primeiro parágrafo precisa sair sabendo o essencial.',
      'Impacto se mede na língua de quem lê: horas de atendimento paradas, pacientes remarcados, valor financeiro em risco, quantidade de titulares afetados, prazo regulatório (os 3 dias úteis da ANPD). "Comprometimento de 14 endpoints via T1021.002" vira "14 computadores da recepção e do faturamento foram afetados; o atendimento ficou quase sete horas em papel".',
      'Seja honesto sobre a incerteza: separe **confirmado**, **provável** e **em investigação**. Não encha de adjetivo ("ataque altamente sofisticado de nível estatal") sem evidência; a diretoria vai repetir isso para a imprensa. E não esconda o que não funcionou: o relatório executivo é onde se consegue orçamento para consertar.',
      'O detalhe técnico vai em anexo: linha do tempo completa, IOCs, técnicas do ATT&CK, evidências. Termine com **decisões pedidas**, cada uma com custo, prazo e risco de não fazer. Diretor gosta de escolher entre opções claras, não de decifrar um tratado sobre Kerberos.',
    ].join('\n\n'),
    chegada: [
      { quem: 'gilmar', texto: 'A diretoria do hospital quer o relatório do ransomware. Uma página. Eu mandei vinte e três. Eles devolveram com um post-it: "uma página".', gesto: 'ombros', expr: 'triste' },
      { quem: 'vandeco', texto: 'Eu mandaria o PCAP. Fala por si só.' },
      { quem: 'ro', texto: 'Fala para quem lê hexadecimal no café da manhã, Vandeco. O diretor lê o jornal e o extrato.', gesto: 'cruzar' },
      { quem: 'keyla', texto: 'Posso colocar um gráfico de cobertura do ATT&CK? É colorido!', expr: 'sorriso' },
      { quem: 'ro', texto: 'Pode, no anexo. Na primeira página só entra o que custa dinheiro ou vida.' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Reescrevendo para quem decide',
        enunciado: 'Ajude a transformar o relatório de 23 páginas do Gilmar numa página para a diretoria do Hospital Santa Paciência.',
        perguntas: [
          {
            p: 'Qual é a melhor primeira frase do relatório?',
            opcoes: ['Em 14 de março, um ransomware parou o prontuário por quase sete horas; o atendimento seguiu em papel, os dados foram restaurados do backup e há indício de cópia de dados de pacientes, já comunicado à ANPD.', 'O presente documento tem por objetivo descrever o incidente.', 'Um ator de ameaça altamente sofisticado utilizou as técnicas T1566.001, T1204.002 e T1486.', 'Agradecemos a oportunidade de atender o hospital.'],
            certa: 0,
            explicacao: 'A primeira frase já entrega o que aconteceu, o impacto, o que foi feito e o ponto regulatório. As outras opções gastam a única frase que todo mundo lê com formalidade, jargão ou cortesia.',
          },
          {
            p: 'Como descrever o vazamento ainda em análise?',
            opcoes: ['Separar o confirmado (houve envio de 12 GB para fora) do que está em investigação (quais pastas exatamente)', 'Dizer que não houve vazamento até que se prove o contrário', 'Dizer que todos os dados do hospital vazaram, por precaução', 'Não mencionar'],
            certa: 0,
            explicacao: 'Diretoria precisa saber o grau de certeza para decidir. Subestimar leva a decisões erradas e a problema com a ANPD; exagerar gera pânico e custos à toa; omitir é pior que os dois.',
          },
          {
            p: 'Onde entram a linha do tempo detalhada, os IOCs e as técnicas do ATT&CK?',
            opcoes: ['Em anexo técnico, referenciado no texto', 'Na primeira página, em destaque', 'Em lugar nenhum, porque a diretoria não precisa', 'Só no e-mail para o TI'],
            certa: 0,
            explicacao: 'O detalhe técnico é essencial para a equipe de TI, para auditoria e para eventual processo, mas atrapalha a leitura executiva. Anexo resolve os dois públicos.',
          },
          {
            p: 'Qual é a melhor forma de pedir investimento?',
            opcoes: ['Opções com custo, prazo e risco de não fazer: "MFA para administradores, R$ X, 30 dias; sem isso, a mesma conta pode ser usada de novo"', '"Precisamos de mais segurança"', 'Uma lista de 40 ferramentas recomendadas', '"Se não comprarem, a culpa não é nossa"'],
            certa: 0,
            explicacao: 'Decisão boa nasce de opção clara. Custo, prazo e risco de não fazer permitem comparar com outras prioridades do hospital. Pedido vago some na reunião; lista gigante assusta; ameaça queima a relação.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Uma página. Exatamente uma página. A diretoria aprovou o MFA na mesma reunião. Vou chorar no banheiro e já volto.', expr: 'sorriso', gesto: 'comemorar' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 82,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'De N1 a CISO em 7 dias',
    resumo: 'Um coach de carreira convida para gravar vídeos no TikTok. A fila não grava vídeo.',
    aula: [
      'Compartilhar conhecimento é uma das melhores coisas da comunidade de segurança: palestras em eventos locais, artigos, CTFs, mentoria de quem está começando. Ensinar também é a forma mais rápida de descobrir o que você ainda não sabe.',
      'Mas cuidado com o que se publica. **Nada de cliente**: nem nome, nem print de console, nem "olha que caso engraçado aconteceu no hospital ontem". O NDA não tem exceção para engajamento. Print de tela de SIEM com IP, usuário e nome de host de cliente é vazamento com filtro bonito.',
      'Desconfie de promessa milagrosa de carreira: ninguém vira especialista em sete dias, certificação não substitui prática e "renda passiva com cibersegurança" geralmente é a renda ativa de quem vende o curso. A carreira em SOC se constrói com fila, investigação, erro, revisão e gente boa por perto.',
    ].join('\n\n'),
    chegada: [
      { quem: 'chat', texto: 'Mensagem de @MentorFenixDaCarreira (1,2 milhão de seguidores): "Vi seu trabalho no caso do hospital!! Bora gravar a série DE N1 A CISO EM 7 DIAS? Você ensina, eu vendo o curso de R$ 1.997. Divisão 90/10."' },
      { quem: 'kevin', texto: 'Noventa por cento pra você? Que proposta boa!', gesto: 'comemorar' },
      { quem: 'ro', texto: 'Noventa pra ele, Kevin. Noventa pra ele.', gesto: 'cruzar' },
      { quem: 'thiaguinho', texto: 'Eu já tenho um TikTok. Tem 14 seguidores. Doze são bots e dois são a minha mãe em dois celulares.', gesto: 'ombros' },
      { quem: 'vandeco', texto: 'Coach que promete CISO em sete dias nunca passou uma madrugada com o Dr. Leôncio no telefone.' },
    ],
    fila: { quantidade: 9 },
    missoes: [
      {
        tipo: 'escolha',
        titulo: 'O convite do Mentor Fênix',
        enunciado: 'O Mentor Fênix da Carreira quer você na série "De N1 a CISO em 7 dias". O que você responde?',
        opcoes: [
          {
            texto: 'Aceitar. Ring light, frase de efeito e uma dancinha explicando o Event ID 4625.',
            reacao: [
              { quem: 'chat', texto: 'Mentor Fênix: "SENSACIONAL!!! Primeiro vídeo: 5 SEGREDOS QUE O SEU SOC NÃO QUER QUE VOCÊ SAIBA. Traz uns prints do trabalho, engaja muito!"' },
              { quem: 'ro', texto: 'Sem print de cliente, pelo amor de Deus. Fora isso, vai lá. Quero ver a dancinha do 4625. Dancinha de falha de logon tem que ter tropeço.', gesto: 'ombros', expr: 'sorriso' },
            ],
            efeitos: { flag: 'coach', energia: -10, sanidade: 5 },
          },
          {
            texto: 'Recusar e, em vez disso, ajudar de graça no grupo de estudos da comunidade local de segurança.',
            reacao: [
              { quem: 'vandeco', texto: 'Isso. Ensinar de graça, sem prometer milagre. A comunidade cresce, e você cresce junto.', gesto: 'sim', expr: 'sorriso' },
              { quem: 'chat', texto: 'Mentor Fênix: "Você perdeu a chance de faturar 6 dígitos!!" (os seis dígitos eram R$ 1.997,00 com centavos)' },
            ],
            efeitos: { reputacao: 10, sanidade: 5 },
          },
          {
            texto: 'Recusar educadamente e voltar para a fila, que tem 9 alertas e nenhum seguidor.',
            reacao: [
              { quem: 'gilmar', texto: 'A fila agradece. O tomate agradece. Ninguém aqui faz dancinha, mas o MTTR está lindo.', gesto: 'comemorar' },
              { quem: 'thiaguinho', texto: 'Posso ficar com o contato do Mentor? Vai que ele quer os meus 14 seguidores.' },
            ],
            efeitos: { energia: 5 },
          },
        ],
      },
    ],
    saida: [
      { quem: 'neide', texto: 'Meu sobrinho é coach. Ele é coach de coach. Ninguém na família sabe o que ele faz, mas ele está sempre de blazer.', expr: 'neutro' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 83,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'Exercício de mesa na Tabajara',
    resumo: 'Tabletop: testar o plano com a diretoria antes que o incidente teste por você.',
    aula: [
      'O **exercício de mesa** (tabletop) é uma simulação conversada: as pessoas que decidiriam num incidente real se sentam juntas e respondem, passo a passo, a um cenário fictício. Ninguém mexe em servidor; o que se testa é o plano, os papéis, os contatos e as decisões. O NIST tem um guia próprio para isso, o **SP 800-84**, sobre testes, treinamentos e exercícios.',
      'O cenário é dividido em **injects**: novidades soltas no tempo combinado ("são 9h, o EDR mostra arquivos cifrados", "são 10h, um jornalista liga", "são 14h, a quadrilha publica uma amostra dos dados"). Cada inject força uma decisão: quem aciona quem, quem fala com a imprensa, quando comunicar a ANPD, quem autoriza desligar um sistema.',
      'Participam a diretoria, a TI, o jurídico, a comunicação, o encarregado de dados e, claro, o SOC. Regras combinadas antes: sem culpa, sem celular, ninguém sai para "resolver rapidinho". Logo depois do exercício vem o **hot wash**, uma conversa rápida com as impressões ainda quentes.',
      'O produto final é um relatório com as lacunas encontradas (o telefone do jurídico estava errado, ninguém sabia quem autoriza pagar fornecedor de forense) e ações com dono e prazo. E o exercício se repete, porque plano que não é treinado é só um PDF otimista.',
    ].join('\n\n'),
    chegada: [
      { quem: 'gilmar', texto: 'Hoje é tabletop na Tabajara. Eu levei bolacha, crachá com nome e o tomate. O tomate marca o tempo dos injects.', gesto: 'apontar', expr: 'sorriso' },
      { quem: 'telefone', texto: 'Diretor da Tabajara: vou participar, mas preciso sair às 10h para uma reunião importante.' },
      { quem: 'ro', texto: 'O primeiro inject é às 9h30: "o diretor está numa reunião importante e não atende". Ele vai se reconhecer.' },
      { quem: 'vandeco', texto: 'Tabletop é ensaio de peça de teatro. Quem esquece a fala no ensaio ri; quem esquece na estreia chora.' },
      { quem: 'neide', texto: 'Na Tabajara ainda tem aquela impressora de 2009? Leva papel. Ela come.', gesto: 'pensar' },
    ],
    fila: { quantidade: 6 },
    missoes: [
      {
        tipo: 'ordenar',
        titulo: 'Montando o tabletop',
        enunciado: 'Coloque em ordem as etapas de um exercício de mesa bem feito com a Tabajara Seguros.',
        itens: [
          'Definir objetivo, escopo e participantes: diretoria, TI, jurídico, comunicação, encarregado de dados e SOC',
          'Escrever o cenário e os injects com base nos riscos reais da Tabajara',
          'Combinar as regras: sem culpa, sem celular, ninguém sai para resolver rapidinho',
          'Conduzir o exercício soltando os injects no tempo combinado',
          'Fazer o hot wash logo depois, com as impressões ainda quentes',
          'Escrever o relatório com as lacunas e as ações com dono e prazo',
          'Acompanhar as ações e marcar o próximo exercício',
        ],
        explicacao: 'Objetivo e participantes definem tudo o resto; o cenário precisa refletir o risco real (ransomware e BEC numa seguradora, não um ataque a usina nuclear); regras claras evitam que o exercício vire reunião de culpa. O hot wash captura o que se esquece em dois dias, o relatório transforma a conversa em ação e o acompanhamento impede que tudo volte para a gaveta.',
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Lacuna número um: ninguém sabia quem autoriza contratar forense de emergência. Lacuna número dois: a bolacha acabou às 9h15.', gesto: 'ombros' },
      { quem: 'ro', texto: 'A segunda é mais grave.' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 84,
    site: 'alfa',
    turno: 'noite',
    titulo: 'O edital saiu',
    resumo: 'O Jefferson garante que a estabilidade é o melhor EDR da vida. Estudar para concurso?',
    aula: [
      'Segurança da informação também tem carreira no setor público: tribunais, agências reguladoras, bancos públicos, forças policiais, ministérios. Os editais costumam cobrar redes, sistemas operacionais, segurança, normas (como a família ISO/IEC 27000), LGPD, legislação específica e português.',
      'A experiência de SOC conta muito na prova e, principalmente, depois dela: quem já investigou incidente entende o que está sendo perguntado sobre resposta, logs e controles. A diferença é o ritmo: estudo com cronograma, revisão espaçada, questões de bancas anteriores e muita disciplina com o próprio sono.',
      'Não existe escolha errada entre setor público e privado; existe a escolha que combina com o que você quer da vida naquele momento. Só não vale estudar para concurso durante o turno com a fila pegando fogo. Isso é com você, Jefferson.',
    ].join('\n\n'),
    chegada: [
      { quem: 'jefferson', texto: 'Saiu! Saiu o edital! Analista de Tecnologia da Informação, área segurança, Tribunal Regional. Trinta vagas e cadastro reserva!', gesto: 'comemorar', expr: 'surpresa' },
      { quem: 'jefferson', texto: 'Vem estudar comigo. Eu já tenho o cronograma, os flashcards dos Event IDs e um grupo de estudos que acorda às 5h.', gesto: 'apontar' },
      { quem: 'ro', texto: 'Ele estuda há quatro anos. Sabe a Lei 8.112 de trás para frente. Só não sabe fechar um ticket.', gesto: 'cruzar' },
      { quem: 'jefferson', texto: 'No serviço público eu não vou precisar fechar ticket no domingo às 4h.' },
      { quem: 'vandeco', texto: 'Em 2003 eu passei num concurso. Desisti no primeiro dia: o computador da repartição era mais velho que eu.' },
    ],
    fila: { quantidade: 10 },
    missoes: [
      {
        tipo: 'escolha',
        titulo: 'O convite do Jefferson',
        enunciado: 'O Jefferson oferece uma vaga no grupo de estudos para o concurso do Tribunal Regional. O que você decide?',
        opcoes: [
          {
            texto: 'Topar. Cronograma, flashcards e grupo das 5h. A estabilidade chama.',
            reacao: [
              { quem: 'jefferson', texto: 'Agora você está no grupo! Primeira tarefa: a Lei 8.112 inteira até sexta. Depois a gente vê LGPD, que essa você já sabe de cor.', gesto: 'comemorar', expr: 'sorriso' },
              { quem: 'ro', texto: 'Só não estuda no turno. Se o ransomware chegar e você estiver no artigo 117, eu conto para a banca.', gesto: 'apontar' },
            ],
            efeitos: { flag: 'concurso', energia: -10 },
          },
          {
            texto: 'Recusar. O SOC de verdade, com incidente de verdade, ensina mais do que qualquer apostila.',
            reacao: [
              { quem: 'jefferson', texto: 'Tudo bem. Quando eu passar, prometo que não esqueço de vocês. Vou mandar ofício.', gesto: 'acenar' },
              { quem: 'vandeco', texto: 'Ofício em três vias. Com carimbo. Vou emoldurar ao lado do disquete.' },
            ],
            efeitos: { sanidade: 5 },
          },
          {
            texto: 'Recusar, mas pegar a apostila emprestada para usar de apoio do monitor, que está torto.',
            reacao: [
              { quem: 'narrador', texto: 'A apostila de Direito Administrativo tem exatamente a altura que faltava. O monitor fica reto pela primeira vez desde 2019.' },
              { quem: 'jefferson', texto: 'É a edição atualizada! Cuidado com a capa!', expr: 'surpresa' },
            ],
            efeitos: { energia: 5, sanidade: 3 },
          },
        ],
      },
    ],
    saida: [
      { quem: 'neide', texto: 'Concurso é bom. Meu primo passou para gari da prefeitura. Ganha melhor que muito analista e dorme à noite.', gesto: 'pensar' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 85,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'A sala com porta',
    resumo: 'Convite para gerente: planilha, orçamento, reunião e nenhum alerta para triar.',
    aula: [
      'Gerenciar um SOC é outro trabalho, não uma versão melhorada do trabalho técnico. Entram escala e cobertura de turnos, contratação, orçamento, contrato e SLA com cliente, indicadores (MTTA, MTTR, taxa de falso positivo, cobertura de detecção), relatórios para a diretoria e, principalmente, cuidar de gente: fadiga de alerta, burnout, carreira, conflito.',
      'Muitas empresas oferecem a gestão como única forma de crescer, e muita gente boa vira gestora infeliz. Procure saber se existe **carreira em Y**: uma trilha técnica (especialista, engenharia de detecção, threat hunting, resposta a incidentes, arquitetura) com reconhecimento e salário comparáveis à trilha de gestão.',
      'Boas perguntas antes de aceitar: vou ter orçamento e autonomia ou só a culpa? Quem me ensina a gerir? Posso voltar para a trilha técnica se não gostar? Recusar uma promoção para gestão com bons motivos não é falta de ambição; é saber onde você é útil e feliz.',
    ].join('\n\n'),
    chegada: [
      { quem: 'gilmar', texto: 'A diretoria quer abrir uma segunda célula de resposta a incidentes. Precisa de alguém para gerenciar. Lembraram de quem segurou o hospital e o Dr. Leôncio.', gesto: 'apontar', expr: 'sorriso' },
      { quem: 'gilmar', texto: 'Vem com sala, porta, cadeira que não está rasgada e acesso ao orçamento. O orçamento é pequeno, mas a porta é grande.', gesto: 'ombros' },
      { quem: 'ro', texto: 'Eu recusei três vezes. Gosto da fila. A fila não marca reunião de alinhamento.', gesto: 'cruzar' },
      { quem: 'vandeco', texto: 'Eu fui gerente por seis meses em 2004. Descobri que planilha não tem malware para analisar. Pedi para voltar.' },
      { quem: 'pamela', texto: 'Seja qual for a sua decisão, eu fico feliz por você.', expr: 'sorriso' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'escolha',
        titulo: 'O convite para gerente',
        enunciado: 'A diretoria oferece a gerência da nova célula de resposta a incidentes. O que você responde?',
        opcoes: [
          {
            texto: 'Aceitar. Sala com porta, orçamento e a chance de proteger a equipe como o Gilmar faz.',
            reacao: [
              { quem: 'gilmar', texto: 'Então toma. É seu. Um tomate próprio. Cuida bem dele, ele cronometra até o seu almoço.', gesto: 'comemorar', expr: 'sorriso' },
              { quem: 'ro', texto: 'Primeira reunião de alinhamento amanhã às 8h. Eu não vou. Brincadeira. Vou, mas vou bufar.', gesto: 'ombros' },
            ],
            efeitos: { flag: 'gerente', reputacao: 10, energia: -5 },
          },
          {
            texto: 'Recusar e pedir uma trilha técnica: quero continuar caçando, investigando e ensinando.',
            reacao: [
              { quem: 'vandeco', texto: 'Agora você é do clube de quem prefere PCAP a planilha. A gente tem café sem açúcar e histórias de 2003.', gesto: 'sim', expr: 'sorriso' },
              { quem: 'gilmar', texto: 'Vou levar a ideia da carreira em Y para a diretoria. Sem tomate, porque esse é o meu.' },
            ],
            efeitos: { sanidade: 10 },
          },
          {
            texto: 'Recusar e indicar a Pâmela, que faz o trabalho de três pessoas e ninguém percebe.',
            reacao: [
              { quem: 'pamela', texto: 'Eu? Sério? Alguém percebeu?', expr: 'surpresa' },
              { quem: 'ro', texto: 'Finalmente alguém percebeu. Eu percebia, mas achei que era óbvio demais para precisar dizer. Erro meu.', gesto: 'comemorar', expr: 'sorriso' },
            ],
            efeitos: { reputacao: 10, sanidade: 5 },
          },
        ],
      },
    ],
    saida: [
      { quem: 'neide', texto: 'Sala com porta é bom para chorar escondido. Fora isso, é igual à sala sem porta.', expr: 'neutro' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 86,
    site: 'alfa',
    turno: 'madrugada',
    titulo: 'O XOR do implante',
    resumo: 'Engenharia reversa de leve: extrair a configuração cifrada com XOR e virar IOC.',
    aula: [
      'Muito malware guarda a própria configuração (endereço do C2, porta, intervalo de beacon, identificador da campanha) cifrada com **XOR de um byte**. É ofuscação, não criptografia de verdade: `A XOR K = C` e `C XOR K = A`. No ATT&CK, guardar assim é **T1027** (Obfuscated Files or Information), e decodificar em tempo de execução é **T1140** (Deobfuscate/Decode Files or Information).',
      'Como se acha a chave sem executar a amostra: análise estática mostra uma rotina curta que percorre um bloco de bytes fazendo XOR com uma constante. Outra pista clássica: onde o texto original tinha byte zero (`00`), o resultado cifrado mostra a própria chave, porque `0 XOR K = K`. Bloco cheio de um byte repetido costuma entregar a chave de bandeja.',
      'O objetivo do SOC não é entender o malware inteiro, é **extrair indicadores** para defender: domínio e porta do C2 para bloquear e caçar em todos os clientes, intervalo e jitter para ajustar a regra de beacon, identificador de campanha para ligar incidentes diferentes à mesma quadrilha. Indicador extraído da configuração vale mais que hash, que muda a cada compilação.',
      'Regra de ouro: amostra só em ambiente isolado, nada de rodar no notebook do SOC, e nada de subir arquivo de cliente em serviço público de análise sem autorização (consultar o hash pode; enviar o arquivo, não).',
    ].join('\n\n'),
    chegada: [
      { quem: 'vandeco', texto: 'O implante do NB-COM-022, aquele do beacon da Tabajara, tem um bloco de bytes estranho no fim. E uma rotina de seis instruções que faz XOR com 0x5A. Já vi isso em 2003. E em 2009. E semana passada.', gesto: 'pensar' },
      { quem: 'thiaguinho', texto: '0x5A é 90 em decimal. Eu sei porque é o número do meu ônibus.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'vandeco', texto: 'Finalmente o seu ônibus serviu para alguma coisa além de atrasar.' },
      { quem: 'keyla', texto: 'Se a configuração tiver o intervalo e o jitter, eu ajusto a regra de beacon. Ela vai disparar só com o que importa. Dessa vez é sério.', expr: 'sorriso' },
    ],
    fila: { quantidade: 6 },
    missoes: [
      {
        tipo: 'decodificar',
        titulo: 'A configuração escondida',
        enunciado: 'Bloco extraído do implante (em hexadecimal). A rotina de decodificação faz XOR de cada byte com 0x5A, que é 90 em decimal. Use o Canivete para revelar a configuração.',
        entrada: xorHex(CONFIG_86, 90),
        receita: ['hex', 'xor:90'],
        pergunta: 'Qual é o domínio do C2 na configuração?',
        resposta: 'painel-iptu-cobranca.top',
        explicacao: 'Primeiro transforme o texto hexadecimal em bytes, depois faça XOR de cada byte com 90 (0x5A). Sai a configuração: C2 `painel-iptu-cobranca.top` na porta 8443, beacon de 300 segundos com jitter de 15, campanha NORTE-IPTU. Repare que não é o `cdn.planilha-segura.top` do beacon da Tabajara: é um segundo C2, guardado no implante e ainda não visto na rede. O domínio vai para bloqueio e para hunting em todos os clientes, e o nome da campanha acende uma luz: IPTU, norte... a Prefeitura de Pindaíba do Sul precisa ser avisada.',
      },
    ],
    saida: [
      { quem: 'vandeco', texto: 'NORTE-IPTU. Essa turma já passou pela prefeitura. Eles vão voltar.', gesto: 'apontar', expr: 'bravo' },
      { quem: 'thiaguinho', texto: 'Vou avisar o meu ônibus que ele é herói.' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 87,
    site: 'alfa',
    turno: 'noite',
    titulo: 'A quadrilha volta, parte 1',
    resumo: 'Password spraying na VPN da prefeitura, um sucesso no meio de centenas de falhas.',
    aula: [
      '**Password spraying** (**T1110.003**) é tentar poucas senhas comuns em muitos usuários, devagar, para ficar abaixo do limite de bloqueio de conta. A assinatura nos logs é o contrário da força bruta: **muitos usuários distintos por IP**, **uma ou duas tentativas por usuário**, em intervalo regular. Contar falhas por usuário não acha nada; contar usuários distintos por IP acha tudo.',
      'VPN é serviço remoto externo (**T1133**) e um login válido vira **T1078** (Valid Accounts): a partir daí, o atacante é "um servidor público trabalhando de casa". Sinais extras: cliente de VPN diferente do padrão corporativo, horário fora do expediente e login bem-sucedido do mesmo IP que acabou de falhar em dezenas de contas.',
      'Geolocalização não salva: quadrilha brasileira, ou que usa proxy residencial brasileiro, aparece como "BR" igual a todo mundo. Por isso a resposta não é bloquear país, é **MFA na VPN**, bloqueio por comportamento e senha que não seja `Prefeitura@` mais um ano.',
      'Achou a conta comprometida? Derrube a sessão de VPN, desabilite a conta, veja o que ela acessou depois do login (logon tipo 3 e 10 nos servidores, compartilhamentos, exfiltração) e procure a mesma quadrilha nos outros clientes. Neste caso, temos até o nome da campanha.',
    ].join('\n\n'),
    chegada: [
      { quem: 'chat', texto: 'Prefeitura de Pindaíba do Sul: "o sistema de tributos está lento e apareceu uma sessão de VPN de alguém que está de férias".' },
      { quem: 'vandeco', texto: 'Eu falei. NORTE-IPTU. Eles voltaram para o lugar onde foram bem recebidos.', gesto: 'apontar', expr: 'bravo' },
      { quem: 'ro', texto: 'Aposto um café que a senha é Prefeitura@ mais o ano atual. Eles atualizaram a senha. Só o ano.', gesto: 'cruzar' },
      { quem: 'gilmar', texto: 'Timer ligado. E já liguei para a Dona Socorro: o Bravo entra junto se precisar de contenção coordenada.', gesto: 'sim' },
      { quem: 'kevin', texto: 'Todos os logins são do Brasil. Então é tudo legítimo, né?', gesto: 'ombros' },
      { quem: 'ro', texto: 'Kevin, os golpistas também moram no Brasil. Alguns até pagam IPTU.' },
    ],
    fila: { quantidade: 7 },
    missoes: [
      {
        tipo: 'siem',
        titulo: 'A conta que caiu',
        enunciado: 'Oito horas de logs da VPN da prefeitura. No meio dos servidores trabalhando de casa, a quadrilha espalhou senha por todas as contas. Ache a conta que eles conseguiram.',
        registros: registrosDia87(),
        pergunta: 'Qual conta a quadrilha comprometeu?',
        resposta: 'tributos.iptu',
        gabarito: 'ip_origem=152.89.47.120 resultado=sucesso | tabela usuario,hora,ip_origem,cliente_vpn',
        dica: 'Primeiro ache quem espalha senha: `resultado=falha | distintos usuario por ip_origem | ordenar -distintos`. Depois veja se algum desses IPs conseguiu entrar: `ip_origem=O_IP resultado=sucesso`.',
        explicacao: 'Dois IPs tentaram uma vez cada conta, com o cliente `openconnect` em vez do FortiClient corporativo: spraying clássico (T1110.003). O `186.231.77.140` não conseguiu nada. O `152.89.47.120` falhou em 22 contas e entrou na `tributos.iptu` às 22h22, voltando às 0h03 (T1133 e T1078). Os dois IPs são do Brasil, então filtro de país não teria ajudado. Ação: derrubar as sessões, desabilitar a conta, exigir MFA na VPN e verificar o que a conta acessou no sistema de tributos.',
      },
    ],
    saida: [
      { quem: 'vandeco', texto: 'Achamos a porta. Agora precisa fechar todas ao mesmo tempo, senão eles saem pela janela.', gesto: 'pensar' },
      { quem: 'gilmar', texto: 'Amanhã é contenção coordenada com o Bravo. Ninguém se atrasa. O tomate não perdoa.' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 88,
    site: 'alfa',
    turno: 'madrugada',
    titulo: 'A quadrilha volta, parte 2',
    resumo: 'Contenção coordenada entre SOC Alfa e SOC Bravo: um líder, um canal, uma hora H.',
    aula: [
      'Incidente grande precisa de estrutura de comando. Um **líder do incidente** decide e coordena, frentes de trabalho têm responsáveis, existe **um canal único** e um ticket mãe que é a fonte da verdade. Quando dois sites atendem juntos (ativo-ativo, como Alfa e Bravo), a divisão de frentes evita que os dois façam a mesma coisa e ninguém faça a outra.',
      'A contenção contra quadrilha ativa precisa ser **simultânea**. Se você derruba uma conta hoje, um host amanhã e um IP depois de amanhã, a quadrilha percebe, troca de acesso e se esconde melhor. Combina-se uma **hora H**: na mesma janela, contas desabilitadas, sessões derrubadas, IPs e domínios bloqueados e hosts isolados.',
      'Comunicação **fora de banda**: se há chance de o e-mail ou o chat do cliente estarem comprometidos, a coordenação não passa por eles. Telefone, ponte de áudio separada ou canal do próprio SOC. Planejar a contenção num e-mail que o atacante lê é mandar convite para a festa surpresa ao aniversariante.',
      'Depois da hora H vem a parte chata e essencial: trocar credenciais privilegiadas, exigir MFA, caçar persistência nos dois sites e manter monitoramento reforçado. A quadrilha que perdeu o acesso costuma testar a porta de novo nos dias seguintes.',
    ].join('\n\n'),
    chegada: [
      { quem: 'narrador', texto: 'Ponte de áudio aberta entre Curitiba e Recife. De um lado, garoa na janela e ar-condicionado a 16 graus. Do outro, ventilador de teto e bolo de rolo.' },
      { quem: 'socorro', texto: 'Bom dia, Curitiba. O Bravo está pronto. Aqui a gente não grita com incidente, a gente conversa com ele. Hoje a conversa vai ser curta.', gesto: 'acenar' },
      { quem: 'nildo', texto: 'Curitiba, vocês estão me ouvindo bem? O eco aqui está chegando antes da fala. Coisa de print, deve ser.', gesto: 'pensar' },
      { quem: 'gilmar', texto: 'Líder do incidente é o Vandeco. Alfa fica com identidade e VPN, Bravo com endpoints e rede. Hora H às 4h em ponto.', gesto: 'apontar' },
      { quem: 'vandeco', texto: 'E ninguém comenta nada pelo e-mail da prefeitura. Se a quadrilha estiver lendo, que leia sobre o preço do tomate.' },
    ],
    fila: { quantidade: 6 },
    missoes: [
      {
        tipo: 'ordenar',
        titulo: 'Hora H na prefeitura',
        enunciado: 'Coloque na ordem a contenção coordenada entre SOC Alfa e SOC Bravo contra a quadrilha NORTE-IPTU.',
        itens: [
          'Abrir uma ponte única fora de banda entre Alfa e Bravo, com um líder do incidente',
          'Dividir as frentes: Alfa com identidade e VPN, Bravo com endpoints e rede',
          'Combinar a hora H para conter tudo ao mesmo tempo, sem alertar a quadrilha aos poucos',
          'Na hora H, ao mesmo tempo: Alfa desabilita a conta e derruba as sessões de VPN, Bravo bloqueia IPs e domínios do C2 e isola pelo EDR os hosts com o implante, sem desligar',
          'Coletar a memória dos hosts isolados, com hash e cadeia de custódia',
          'Trocar as credenciais privilegiadas e exigir MFA na VPN',
          'Caçar persistência nos dois sites antes de declarar a erradicação',
        ],
        explicacao: 'Primeiro a estrutura (canal seguro e líder), depois a divisão de trabalho, depois o planejamento da hora H. Na hora H, identidade, rede e hosts caem juntos, com os hosts isolados e ligados; logo depois, a memória deles é coletada. Só então a troca de credenciais (de máquina limpa) e o MFA, e a caça à persistência garante que ninguém ficou com uma chave escondida debaixo do tapete.',
      },
    ],
    saida: [
      { quem: 'socorro', texto: 'Hora H cumprida dos dois lados. Recife manda um abraço e um pedaço de bolo de rolo no malote.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'nildo', texto: 'Curitiba, vocês desligaram o microfone no mesmo milissegundo que a gente. Estranho, né? Deixa pra lá.', gesto: 'ombros' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 89,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'A quadrilha volta, parte 3',
    resumo: 'Relatório final, compartilhamento de indicadores com TLP e lições aprendidas da campanha NORTE-IPTU.',
    aula: [
      'O **relatório técnico final** reúne: resumo, escopo (contas, hosts, dados), linha do tempo completa, causa raiz, técnicas do ATT&CK observadas (aqui: T1110.003, T1133, T1078, T1071.001, T1027), indicadores, ações de contenção, erradicação e recuperação, evidências com hash e cadeia de custódia, e as lições aprendidas com dono e prazo.',
      'Indicadores ajudam outras vítimas, e o **TLP** (Traffic Light Protocol, versão 2.0) diz até onde cada informação pode ir: **TLP:RED** só para quem está na reunião; **TLP:AMBER** para a organização e quem precisa saber para se proteger, e **TLP:AMBER+STRICT** só dentro da organização; **TLP:GREEN** para a comunidade, sem publicação aberta; **TLP:CLEAR** pode ser público. Dado pessoal de titular não entra em indicador compartilhado.',
      'Campanha que volta é sinal de causa raiz não resolvida: a mesma senha previsível, VPN sem MFA, ninguém dono da conta de serviço. As lições desta vez precisam ser estruturais. E vale registrar a parte boa: o indicador extraído da configuração com XOR ligou dois incidentes e encurtou a investigação em horas.',
      'Por fim, guarde tudo conforme a política de retenção e o que o contrato e a lei exigem. Incidente de prefeitura pode virar processo, auditoria do tribunal de contas e matéria de jornal anos depois. A evidência bem guardada hoje é a sua defesa daqui a três anos.',
    ].join('\n\n'),
    chegada: [
      { quem: 'gilmar', texto: 'A prefeitura quer o relatório final. O tribunal de contas também. E o vereador quer um resumo para o Instagram.', gesto: 'ombros' },
      { quem: 'ro', texto: 'Para o vereador a gente manda TLP:RED. Ele vai postar do mesmo jeito, mas pelo menos fica registrado que a gente avisou.', gesto: 'cruzar' },
      { quem: 'vandeco', texto: 'Escrevi a linha do tempo à mão primeiro, depois digitei. A letra é horrível, mas a linha do tempo não tem um buraco.' },
      { quem: 'pamela', texto: 'Separei os indicadores: domínio do C2, os dois IPs da VPN, o hash do implante e o nome da campanha. Nenhum dado de contribuinte.', gesto: 'sim' },
      { quem: 'keyla', texto: 'E a regra de beacon nova pegou o mesmo C2 em mais um cliente hoje cedo. Ela disparou só uma vez. Só uma! Eu estou orgulhosa dela.', expr: 'sorriso', gesto: 'comemorar' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'O relatório da NORTE-IPTU',
        enunciado: 'Feche o caso da quadrilha que voltou. Responda sobre o relatório final e o compartilhamento de indicadores.',
        perguntas: [
          {
            p: 'A Insônia quer compartilhar os indicadores da NORTE-IPTU com o grupo de segurança de prefeituras da região, sem publicação aberta. Qual TLP?',
            opcoes: ['TLP:GREEN', 'TLP:RED', 'TLP:CLEAR', 'TLP:AMBER+STRICT'],
            certa: 0,
            explicacao: 'TLP:GREEN permite circular pela comunidade, sem publicação aberta. RED fica entre os presentes, AMBER+STRICT fica só dentro da organização que recebeu, e CLEAR é público. A decisão de compartilhar é do cliente, com o SOC sugerindo o nível.',
          },
          {
            p: 'O que NÃO deve entrar no pacote de indicadores compartilhado?',
            opcoes: ['A planilha de contribuintes com CPF encontrada no vazamento', 'O domínio do C2', 'Os IPs que fizeram password spraying', 'O hash do implante'],
            certa: 0,
            explicacao: 'Indicador é sobre o atacante, não sobre as vítimas. Dado pessoal de titular não ajuda ninguém a se defender e compartilhá-lo seria um novo incidente.',
          },
          {
            p: 'A quadrilha voltou pela mesma porta. Qual lição aprendida é a mais estrutural?',
            opcoes: ['MFA obrigatório na VPN e fim das senhas previsíveis, com dono e prazo', 'Bloquear os dois IPs para sempre', 'Bloquear conexões de fora do Brasil', 'Pedir ao vereador para parar de postar'],
            certa: 0,
            explicacao: 'IP muda em minutos e a quadrilha usa IP brasileiro. A causa raiz é a autenticação fraca na VPN. Bloquear o IP é contenção; MFA e política de senha são correção.',
          },
          {
            p: 'Por que guardar as evidências com hash e cadeia de custódia, se o incidente já acabou?',
            opcoes: ['Porque podem ser exigidas em auditoria, no tribunal de contas ou em processo judicial, às vezes anos depois', 'Não precisa, o incidente acabou', 'Para usar em vídeo do TikTok', 'Porque o SIEM apaga sozinho'],
            certa: 0,
            explicacao: 'Incidente em órgão público pode gerar auditoria, ação judicial e investigação policial. Evidência com hash e cadeia de custódia íntegra continua válida; sem isso, vira só uma história bem contada.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Caso encerrado. A placa de dias sem incidente continua em zero, mas hoje é um zero com orgulho.', expr: 'sorriso' },
      { quem: 'vandeco', texto: 'Essa quadrilha vai contar a história de vocês por aí. Do jeito deles, claro. Com vocês de vilões.', gesto: 'comemorar' },
    ],
  },

  // -------------------------------------------------------------------------
  {
    n: 90,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'Insônia faz aniversário',
    resumo: 'Último dia: avaliação, festa e o que vem depois. A fila continua, a gente também.',
    evento: 'aniversario',
    aula: [
      'Noventa dias depois, o resumo do curso cabe num crachá: **triagem** com contexto (falso positivo, benigno verdadeiro, verdadeiro positivo), **investigação** por hipótese, **detecção** que dispara no ataque e fica quieta no resto, **resposta** no ciclo do NIST (preparar, detectar, conter, erradicar, recuperar, aprender), **evidência** pela ordem de volatilidade e com cadeia de custódia, **comunicação** com fatos, prazos e quem decide, e **LGPD** do primeiro ao último ticket.',
      'Daqui para a frente, o caminho é seu: engenharia de detecção, threat hunting, forense, resposta a incidentes, gestão, setor público, ensino. Mantenha o hábito de laboratório (CTFs, ambientes de teste, desafios de forense abertos), leia relatório de incidente de verdade e escreva sobre o que aprendeu, sem cliente no meio.',
      'E cuide de quem está do lado. SOC é trabalho de equipe: a passagem de turno bem feita, o colega que pergunta "você está bem?" às 4h, a Dona Neide que sabe a senha do Wi-Fi e a solução da vida. Ferramenta muda todo ano; gente boa por perto é o que segura o turno.',
    ].join('\n\n'),
    chegada: [
      { quem: 'narrador', texto: 'O SOC Alfa amanhece com bexigas pretas e laranjas, uma faixa "Insônia: 15 anos sem dormir" e um bolo em forma de cafeteira. O videowall mostra o mapa de ataques, que segue sendo só animação, agora com confete.' },
      { quem: 'gilmar', texto: 'Hoje é dia de festa e de avaliação. Mas a avaliação eu já fiz. Está na planilha. Com borda dupla.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'thiaguinho', texto: 'Eu trouxe coxinha para todo mundo. Inteiras. Nenhuma mordida. Foi difícil.', gesto: 'apontar', expr: 'sorriso' },
      { quem: 'ro', texto: 'Noventa dias. Falso positivo continua igual a boleto, sempre tem mais um. Mas hoje eu deixo a fila esperar dez minutos.', expr: 'sorriso' },
      { quem: 'vandeco', texto: 'Em 2003 eu não tinha uma equipe assim. Tinha um caderno e um ramal. Prefiro vocês. Não contem para o caderno.', gesto: 'pensar' },
      { quem: 'chat', texto: 'Dona Socorro, do Bravo: "Parabéns à Insônia! Mandamos bolo de rolo. Chegou igualzinho ao daí, né? Coincidência."' },
      { quem: 'neide', texto: 'Já liguei o som. Na tomada da copa, viu? No nobreak eu nem encostei. Aprendi.', gesto: 'cintura', expr: 'sorriso' },
    ],
    fila: { quantidade: 6 },
    missoes: [
      {
        tipo: 'escolha',
        titulo: 'A despedida do turno',
        enunciado: 'É o último turno destes 90 dias. A festa já começou e a fila ainda tem seis alertas. Como você se despede?',
        opcoes: [
          {
            texto: 'Pegar o microfone e fazer um discurso agradecendo cada pessoa, do Gilmar à Dona Neide.',
            reacao: [
              { quem: 'gilmar', texto: 'Eu não estou chorando. É o ar-condicionado a 16 graus. Ele resseca os olhos.', expr: 'triste' },
              { quem: 'neide', texto: 'Foi o discurso mais bonito que eu já ouvi nesse prédio. E eu já ouvi o do CEO pedindo para ninguém usar a geladeira dele.', gesto: 'comemorar', expr: 'sorriso' },
            ],
            efeitos: { sanidade: 15, reputacao: 5 },
          },
          {
            texto: 'Subir na cadeira gamer rasgada e trocar a placa "Dias sem incidente" de 0 para 1.',
            reacao: [
              { quem: 'narrador', texto: 'Aplausos. A placa marca 1 pela primeira vez na história. Onze minutos depois, um alerta do Dr. Leôncio chega na fila. A placa volta para 0.' },
              { quem: 'ro', texto: 'Foram os onze minutos mais felizes da minha carreira. Obrigada.', expr: 'sorriso', gesto: 'comemorar' },
            ],
            efeitos: { sanidade: 10, energia: 5 },
          },
          {
            texto: 'Antes de comer o bolo, zerar os seis alertas e deixar a passagem de turno perfeita para o Thiaguinho.',
            reacao: [
              { quem: 'thiaguinho', texto: 'Fila zerada, passagem de turno com o que, quando, onde e próximo passo. Eu nunca recebi uma assim. Vou emoldurar ao lado do disquete do Vandeco.', expr: 'surpresa' },
              { quem: 'vandeco', texto: 'Isso é o que separa quem trabalha num SOC de quem é o SOC. Agora vai comer o bolo, antes que o Thiaguinho coma.', gesto: 'sim', expr: 'sorriso' },
            ],
            efeitos: { reputacao: 10, energia: -5, sanidade: 5 },
          },
          {
            texto: 'Puxar a Dona Neide para dançar no meio do SOC, ao som da rádio sertaneja do atendimento.',
            reacao: [
              { quem: 'neide', texto: 'Finalmente alguém com juízo nesse prédio! Gilmar, larga esse tomate e vem!', gesto: 'comemorar', expr: 'sorriso' },
              { quem: 'gilmar', texto: 'Vou. Mas vou cronometrar. Seis minutos de dança, registrados como pausa programada.', gesto: 'ombros', expr: 'sorriso' },
            ],
            efeitos: { sanidade: 20, energia: -5 },
          },
        ],
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Abriu ticket? Então aconteceu. E esses noventa dias aconteceram, {nome}. Obrigado.', expr: 'sorriso' },
      { quem: 'ro', texto: 'Amanhã tem fila. Sempre tem mais um. Mas hoje, só hoje, a gente comemora.', gesto: 'acenar', expr: 'sorriso' },
      { quem: 'narrador', texto: 'As luzes do videowall piscam. Em Recife, no mesmo segundo, piscam também.' },
    ],
  },
];
