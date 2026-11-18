// Os finais possíveis. O motor escolhe um (src/motor/carreira.ts) e a tela de final mostra o texto.
export interface Final {
  id: string;
  titulo: string;
  subtitulo: string;
  texto: string[]; // parágrafos
  icone: string;
  cor: string;
}

export const FINAIS: Record<string, Final> = {
  praia: {
    id: 'praia',
    titulo: 'Arte na Praia',
    subtitulo: 'Itacaré, Bahia. Nenhum alerta em 300 km.',
    icone: '🏖️',
    cor: '#f2a65a',
    texto: [
      'Você levantou, devolveu o crachá para a Dona Neide ("eu sabia, {minha filha|meu filho|meu bem}") e pegou o primeiro ônibus para a Bahia.',
      'Hoje vende quadros de pôr do sol na areia. O mais vendido é um videowall pintado em aquarela, com o título "Dias sem incidente: ∞".',
      'De vez em quando um turista pergunta o que você fazia antes. Você responde "eu triava falso positivo" e ele acha que é uma técnica de pintura.',
      'Seu celular corporativo está no fundo do mar. O Dr. Leôncio ainda liga para ele às 3h. Os peixes atendem.',
    ],
  },
  burnout: {
    id: 'burnout',
    titulo: 'Galinhas em Minas',
    subtitulo: 'A sanidade chegou a zero. As galinhas, não.',
    icone: '🐔',
    cor: '#c9a227',
    texto: [
      'Num certo turno você olhou para a fila, a fila olhou para você, e nenhum dos dois piscou. O Gilmar mandou você para casa. Você foi para muito mais longe que isso.',
      'Hoje cria galinhas caipiras no sul de Minas. Cada uma tem nome de técnica do ATT&CK. A T1059 bota dois ovos por dia.',
      'O galinheiro tem porta com duas fechaduras, cerca segmentada e um cachorro chamado EDR. Velhos hábitos.',
      'Lembre na vida real: fadiga de alerta é coisa séria. Pausa, rodízio, terapia e um coordenador que escuta salvam mais SOC do que qualquer ferramenta.',
    ],
  },
  demitido: {
    id: 'demitido',
    titulo: 'Desligamento Por Justa Causa (do Alerta)',
    subtitulo: 'Fechou como falso positivo o que não era.',
    icone: '📦',
    cor: '#d64545',
    texto: [
      'O alerta estava lá, vermelho, crítico, com a palavra "ransomware" no título. Você clicou em "falso positivo" com a mesma convicção de quem fecha pop-up.',
      'O RH te chamou numa sala sem janela. O Gilmar não disse nada, só desligou o timer de tomate. Foi a coisa mais triste que você já viu.',
      'A caixa de papelão tinha sua caneca, um post-it escrito "SEMPRE LER O LOG" e a coxinha do Thiaguinho, que ninguém teve coragem de jogar fora.',
      'Moral da história real: severidade alta com evidência de execução nunca se fecha sem investigar. Na dúvida, escala. Ninguém é demitido por escalar.',
    ],
  },
  n1: {
    id: 'n1',
    titulo: 'N1 Para Sempre',
    subtitulo: 'Bolsista vitalício da fila.',
    icone: '♾️',
    cor: '#6c8ebf',
    texto: [
      'Noventa dias depois, você continua N1. As provas não passaram, mas a fila também não passa nunca, então vocês se entendem.',
      'O RH te deu uma plaquinha: "Patrimônio Histórico da Triagem". Ela fica ao lado da placa "Dias sem incidente: 0", que também nunca muda.',
      'Os N1 novos te chamam de lenda. Você ensina tudo para eles, que viram N2 em um mês. É o ciclo da vida do SOC.',
      'Daqui a 15 anos alguém vai encontrar seu crachá provisório numa gaveta e achar que é arqueologia.',
    ],
  },
  pleno: {
    id: 'pleno',
    titulo: 'Mais Um Ano de 12x36',
    subtitulo: 'Nem herói, nem vilão: analista.',
    icone: '🔁',
    cor: '#7aa874',
    texto: [
      'Você ficou. Não virou líder, não virou coach, não foi para a praia. Ficou, e isso no SOC já é um ato de coragem.',
      'A fila diminuiu um pouco porque você ajudou a Keyla a ajustar as regras. O Gilmar colocou isso no relatório como "iniciativa da coordenação".',
      'Na festa de fim de ano você ganhou um panetone e um aviso de que o turno da noite está precisando de gente.',
      'Amanhã tem mais. Sempre tem mais.',
    ],
  },
  lider: {
    id: 'lider',
    titulo: 'Líder do CSIRT',
    subtitulo: 'Do crachá de papelão à sala de crise.',
    icone: '🛡️',
    cor: '#3fb59f',
    texto: [
      'Noventa dias, um ransomware num hospital, um BEC de R$ 380 mil e uma quadrilha que voltou para a prefeitura. Você esteve em todos.',
      'O Vandeco se aposentou e deixou a caneca para você. Por dentro está escrito "eu já vi esse malware em 2003". Agora é seu bordão.',
      'Você lidera o CSIRT da Olho Vivo. A primeira coisa que fez foi proibir reunião de incidente sem pauta e a segunda foi comprar uma cafeteira para o nobreak não ser mais disputado.',
      'Quando um N1 novo te pergunta como chegou lá, você responde a verdade: "lendo log, perguntando muito e escrevendo ticket direito".',
    ],
  },
  gerente: {
    id: 'gerente',
    titulo: 'Gerente (Perdeu a Alma)',
    subtitulo: 'Agora você faz PowerPoint.',
    icone: '📊',
    cor: '#8a6fbf',
    texto: [
      'Você aceitou o cargo de gerente. Ganhou uma sala com porta, uma cadeira que não está rasgada e 47 reuniões por semana.',
      'Seu último log foi lido há três meses. Hoje você fala "sinergia", "alavancar" e "vamos tangibilizar o risco" sem sentir vergonha.',
      'O Gilmar te deu o timer de tomate numa cerimônia simbólica. Você cronometra reuniões que poderiam ter sido um e-mail.',
      'Às vezes, de madrugada, você abre o Vigia escondido só para rodar um `contar por ip`. É o seu jeito de lembrar quem foi.',
    ],
  },
  coach: {
    id: 'coach',
    titulo: 'Coach de Carreira no TikTok',
    subtitulo: '"De N1 a 30 mil em 90 dias", o curso.',
    icone: '📱',
    cor: '#e05fa0',
    texto: [
      'Você gravou um vídeo dançando na frente do videowall com a legenda "POV: você triou 400 falsos positivos". Viralizou.',
      'Hoje vende o curso "De N1 a 30 mil em 90 dias" por 12 parcelas de R$ 97. O módulo 1 é "Mindset de Red Team". O módulo 2 é "Como falar ‘zero trust’ no LinkedIn".',
      'A Rô assistiu um vídeo seu e mandou só um emoji de caveira. Foi a crítica mais dura da sua vida.',
      'O Thiaguinho comprou o curso. Continua dormindo no turno, mas agora com mentalidade de crescimento.',
    ],
  },
  concorrente: {
    id: 'concorrente',
    titulo: 'Fui Para o Concorrente Por R$ 300',
    subtitulo: 'O SOC é outro. A fila é a mesma.',
    icone: '💸',
    cor: '#d98c3f',
    texto: [
      'Você aceitou a proposta: R$ 300 a mais, vale-refeição de R$ 32 e "ambiente jovem e descontraído", que na prática é um pufe.',
      'No primeiro dia, abriu o SIEM novo e viu a mesma regra de "Mimikatz" disparando com o mesmo antivírus. Sentiu saudade e déjà vu ao mesmo tempo.',
      'O Gilmar te mandou mensagem: "as portas estão abertas, mas a cadeira gamer já foi pro Kevin". Doeu.',
      'Seis meses depois, a Olho Vivo comprou o concorrente. Você voltou sem ter saído. O universo do MSSP é pequeno.',
    ],
  },
  concurso: {
    id: 'concurso',
    titulo: 'Passou no Concurso',
    subtitulo: 'Estabilidade, finalmente. E um Windows XP.',
    icone: '🏛️',
    cor: '#4f7cac',
    texto: [
      'Você estudou nos intervalos, nas madrugadas e durante a passagem de turno do Thiaguinho (ele nem percebeu). Passou para analista de TI num tribunal.',
      'No primeiro dia descobriu que o SOC do tribunal é você, um ventilador e um antivírus de 2016. Abriu um processo administrativo pedindo um SIEM. Previsão de resposta: 2031.',
      'O Jefferson, que estudava com você, passou também. Vocês almoçam juntos e falam mal do edital.',
      'Pelo menos ninguém liga às 3h da manhã. O expediente acaba às 17h e o servidor de e-mail também.',
    ],
  },
  secreto: {
    id: 'secreto',
    titulo: 'O SOC Bravo Era Um Print',
    subtitulo: 'Final secreto.',
    icone: '🖼️',
    cor: '#9b59b6',
    texto: [
      'Você juntou as três pistas: a marca d\'água no videowall, o mar que dobrava na janela e o Paint aberto no monitor do Nildo. O SOC Bravo é um print do SOC Alfa, tirado em 2019 para passar na auditoria de continuidade.',
      'Dona Socorro, o Nildo e o bolo de rolo existem, garantem eles. Recife também. Só o site de contingência é que era uma imagem bem iluminada num telão alugado.',
      'Você levou a descoberta ao Gilmar. Ele te ofereceu silêncio e uma promoção, nessa ordem. A auditoria do ano que vem vai ser com vídeo.',
      'Lição real (é sério): plano de continuidade que nunca foi testado é só um documento bonito. Teste o failover. De verdade. Com a cafeteira desligada.',
    ],
  },
};
