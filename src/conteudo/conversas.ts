// Conversa fiada: o que cada pessoa diz quando você chega perto e aperta E fora das cenas do dia.
import type { PersonagemId } from './tipos';

export const CONVERSAS: Record<PersonagemId, string[]> = {
  gilmar: [
    'Não abriu ticket? Então não aconteceu. Fechou ticket sem evidência? Então aconteceu duas vezes.',
    'Meu timer de tomate marca 25 minutos. É o MTTR que eu sonho. Na vida real ele toca três vezes por alerta.',
    'O diretor perguntou por que a fila nunca zera. Eu respondi "porque a internet existe". Ele anotou.',
    'Se o cliente ligar bravo, fala devagar, repete o que ele disse e anota o horário. Funciona com cliente e com sogro.',
    'Não esquece de beber água. Café não conta, por mais que a gente finja.',
  ],
  ro: [
    'Falso positivo é igual boleto: sempre tem mais um.',
    'Antes de escalar, lê o log. Antes de ler o log, lê o nome da regra. Antes de tudo, respira.',
    'Catorze anos de turno. Já vi três SIEMs, cinco gerentes e nenhuma fila vazia.',
    'Ticket bom tem: o que aconteceu, quando, onde, a evidência e o que você fez. Ticket ruim tem "verificado ok".',
    'Não confia em severidade de regra. Quem escreveu a regra estava com medo.',
  ],
  vandeco: [
    'Esse aí eu já vi em 2003. Era num disquete, mas era igualzinho.',
    'Em incidente, a primeira coisa que some é a calma. A segunda é a memória RAM, se alguém desligar a máquina. Não desliga.',
    'Café sem açúcar. Açúcar é para quem ainda tem esperança.',
    'Hipótese primeiro, consulta depois. Quem sai consultando sem pergunta acha resposta para tudo e entende nada.',
    'Linha do tempo, rapaz. Linha do tempo. Sem ela, incidente é só fofoca técnica.',
  ],
  thiaguinho: [
    'Não tô dormindo, tô em modo de economia de energia.',
    'Deixei a fila organizadinha para você: por ordem de chegada. Todas as 400.',
    'Essa coxinha? É de ontem. Ou de anteontem. Ela tem log de criação no meu coração.',
    'Fechei tudo como falso positivo em lote. O Gilmar chamou de "incidente de processo". Eu chamei de produtividade.',
  ],
  keyla: [
    'Minha regra nova pega tudo! Literalmente tudo. É uma característica, não um defeito.',
    'Tuning não é desligar a regra. É ensinar a regra a ter bom senso, coisa que nem todo mundo tem.',
    'Toda exclusão precisa de dono, motivo e data de validade. Exclusão eterna é porta dos fundos com carimbo.',
    'Se você fecha o mesmo falso positivo dez vezes, me avisa. Eu choro, mas ajusto.',
  ],
  neide: [
    'A senha do Wi-Fi do 4º andar? Ah, meu bem, essa todo mundo sabe. Esse é o problema.',
    'Desliguei aquele bichão preto da tomada para ligar o aspirador uma vez. Nunca vi tanta gente correndo.',
    'Você tá com cara de quem não almoçou. Vai almoçar. O alerta espera, a gastrite não.',
    'O moço da noite dorme abraçado no teclado. Eu limpo em volta, com respeito.',
    'Aqui todo mundo reclama da fila, mas ninguém pede para sair. Deve ser o café.',
  ],
  leoncio: [
    'Meu jovem, cliquei num link que dizia "veja sua multa". Mas eu não tinha multa. Agora tenho?',
    'Antivírus é tipo seguro de vida, né? Pago e torço para não usar.',
    'Liguei às 3h porque às 3h vocês atendem rápido. De dia demora.',
  ],
  socorro: [
    'Aqui a gente não grita com incidente. A gente conversa com ele, oferece um bolo de rolo e ele confessa.',
    'Contingência boa é a que foi testada. A que só existe no papel é poesia.',
    'O Alfa liga para cá quando cai. Nós nunca caímos. Dizem que é porque somos um print. Que bobagem, né?',
  ],
  nildo: [
    'Em Curitiba vocês tomam café com casaco. Aqui a gente toma com ventilador. Cada SOC com sua cultura.',
    'Ô, visse, esse alerta aí é falso positivo de manual. Mas confirma no log, que eu também já me lasquei por confiar em mim.',
    'Não mexe no meu monitor, não. Tá aberto um trabalho de arte.',
  ],
  kevin: [
    'Eu fecho tudo como falso positivo. Estatisticamente, eu acerto 70% das vezes!',
    'O que é "contexto"? Tem na Wiki? A Wiki é de 2019?',
    'Eu tava pensando em fazer uma automação que fecha alerta sozinha. O Gilmar me olhou de um jeito estranho.',
  ],
  brenda: [
    'Na dúvida eu escalo. Na certeza eu escalo também. Melhor sobrar do que faltar, né?',
    'A Rô disse que eu escalei a impressora de novo. Ela mereceu.',
    'Escalar não é feio. Feio é fechar o que não devia. Mas escalar tudo também é feio, eu admito.',
  ],
  jefferson: [
    'Shhh. Tô no artigo 37 da Constituição. Princípios da administração pública. LIMPE.',
    'Concurso tem estabilidade. SOC tem estabilidade também: a fila é estável, sempre cheia.',
    'Se eu passar, eu levo você. Se eu não passar, eu volto para a fila. Ganha-ganha.',
  ],
  pamela: [
    'Antes de responder, eu olho o processo pai, o usuário e o horário. Três coisas, resolve metade.',
    'Ninguém percebe quando a gente acerta. Só quando erra. É a vida de SOC.',
    'Se quiser, eu te mostro meu bloco de notas de consultas prontas. Economiza um turno por semana.',
  ],
};
