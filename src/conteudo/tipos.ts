// Contrato do conteúdo do SOCorro. Tudo que o jogo mostra sai destes tipos,
// e tests/conteudo.test.ts confere se cada missão tem solução de verdade.
//
// Marcadores de texto:
//   {f|m|n}  forma de gênero de quem joga (analista / analista... ou estagiária|estagiário|estagiárie)
//   {nome}   nome de quem joga
//   `código` vira fonte monoespaçada, **negrito** vira negrito, \n quebra linha

export type Nivel = 'N1' | 'N2' | 'N3';
export type Site = 'alfa' | 'bravo';
export type Turno = 'manhã' | 'tarde' | 'noite' | 'madrugada';

export type PersonagemId =
  | 'gilmar' // coordenador do SOC Alfa, cronometra MTTR com timer de cozinha
  | 'ro' // Rosângela, N2, 14 anos de turno, ironia como idioma nativo
  | 'vandeco' // Seu Wanderley, CSIRT/N3, "já vi esse malware em 2003"
  | 'thiaguinho' // turno da noite, entrega a fila com 400 alertas e uma coxinha mordida
  | 'keyla' // engenharia de detecção, escreve regra que dispara com tudo
  | 'neide' // limpeza, sabe a senha do Wi-Fi de todos os andares
  | 'leoncio' // Dr. Leôncio, diretor da Cooperativa Agro Pasto Ralo, clica em tudo e liga às 3h
  | 'socorro' // Dona Socorro, coordenadora do SOC Bravo (Recife)
  | 'nildo' // Josenildo, N2 do SOC Bravo
  | 'kevin' // colega N1
  | 'brenda' // colega N1
  | 'jefferson' // colega N1
  | 'pamela'; // colega N1

export type Falante = PersonagemId | 'voce' | 'narrador' | 'telefone' | 'chat';

export type Gesto = 'acenar' | 'apontar' | 'sim' | 'nao' | 'ombros' | 'pensar' | 'cintura' | 'cruzar' | 'comemorar';
export type Expressao = 'sorriso' | 'surpresa' | 'bravo' | 'triste' | 'neutro';

export interface Fala {
  quem: Falante;
  texto: string;
  gesto?: Gesto;
  expr?: Expressao;
}

/** clientes atendidos pela Insônia Segurança Gerenciada */
export type ClienteId = 'tabajara' | 'prefeitura' | 'hospital' | 'cooperativa' | 'padaria' | 'insonia';

export type Fonte = 'EDR' | 'SIEM' | 'Firewall' | 'Proxy' | 'E-mail' | 'M365' | 'IDS' | 'AD' | 'DNS' | 'Nuvem' | 'WAF' | 'VPN' | 'DLP' | 'Antivírus';
export type Severidade = 'baixa' | 'média' | 'alta' | 'crítica';

/** fp = falso positivo (a regra errou); bp = benigno verdadeiro (aconteceu, mas é esperado/autorizado); tp = verdadeiro positivo */
export type Veredito = 'fp' | 'bp' | 'tp';

/** o que fazer com um verdadeiro positivo. Em N1, "escalar" sempre conta como certo. */
export type Acao = 'escalar' | 'isolar' | 'bloquear' | 'resetar' | 'incidente';

export interface Justificativa {
  texto: string;
  certa: boolean;
}

/** modelo de alerta para a fila. {var} nos textos é trocado por um valor sorteado de vars[var]. */
export interface ModeloAlerta {
  id: string;
  /** nível a partir do qual o alerta aparece na fila */
  nivel: Nivel;
  cliente: ClienteId | 'qualquer';
  regra: string; // nome da regra que disparou, do jeito que aparece no SIEM
  fonte: Fonte;
  severidade: Severidade; // severidade que a regra deu (muitas vezes exagerada)
  mitre?: string; // ex.: T1059.001
  titulo: string;
  logs: string[]; // linhas de log cruas e realistas (Sysmon, 4625, firewall, proxy...)
  contexto: string[]; // enriquecimento: dono do ativo, CMDB, reputação, histórico, ticket de mudança
  vars?: Record<string, string[]>;
  veredito: Veredito;
  acao?: Acao; // obrigatório quando veredito = 'tp'
  justificativas: Justificativa[]; // 3 ou 4, exatamente uma certa
  explicacao: string; // o porquê, didático (é o "curso")
  piada?: string; // comentário ácido depois da resposta
  peso?: number; // frequência relativa na fila (padrão 1)
}

export interface Pergunta {
  p: string;
  opcoes: string[];
  certa: number;
  explicacao: string;
}

export type Registro = Record<string, string | number>;

export interface Efeitos {
  sanidade?: number; // -100..100
  energia?: number;
  reputacao?: number;
  flag?: string; // marca uma decisão (usada nos finais)
  honraria?: string; // concede uma honraria pelo id
}

/** operações do Canivete (ferramenta de decodificação do jogo) */
export type OpCanivete = 'base64' | 'hex' | 'url' | 'rot13' | 'inverter' | 'utf16le' | `xor:${number}`;

export type Missao =
  | {
      tipo: 'quiz';
      titulo: string;
      enunciado: string;
      anexo?: string; // bloco de texto cru: cabeçalho de e-mail, log, script
      perguntas: Pergunta[];
    }
  | {
      /** investigação com o mini-SIEM: a pessoa consulta os registros e digita a resposta */
      tipo: 'siem';
      titulo: string;
      enunciado: string;
      registros: Registro[];
      pergunta: string;
      resposta: string; // comparação sem diferenciar maiúsculas e espaços
      gabarito: string; // consulta que mostra a resposta na primeira linha (o teste roda)
      dica: string;
      explicacao: string;
    }
  | {
      tipo: 'ordenar';
      titulo: string;
      enunciado: string;
      itens: string[]; // na ordem certa; o jogo embaralha
      explicacao: string;
    }
  | {
      /** tuning de regra: escolher exclusões que matam o falso positivo sem cegar o SOC */
      tipo: 'regra';
      titulo: string;
      enunciado: string;
      regra: string; // texto da regra atual
      registros: (Registro & { malicioso: 0 | 1 })[];
      exclusoes: { texto: string; filtro: string }[]; // filtro na sintaxe do mini-SIEM
      minReducao: number; // fração mínima de falsos positivos eliminados (0..1)
      explicacao: string;
    }
  | {
      tipo: 'decodificar';
      titulo: string;
      enunciado: string;
      entrada: string;
      receita: OpCanivete[]; // a sequência que revela a resposta (o teste confere)
      pergunta: string;
      resposta: string;
      explicacao: string;
    }
  | {
      /** decisão sem resposta certa única; mexe nos recursos e nas flags dos finais */
      tipo: 'escolha';
      titulo: string;
      enunciado: string;
      opcoes: { texto: string; reacao: Fala[]; efeitos?: Efeitos }[];
    }
  | {
      /** prova de promoção */
      tipo: 'prova';
      titulo: string;
      enunciado: string;
      perguntas: Pergunta[];
      notaMinima: number; // 0..100
      promoveA: Nivel;
    };

export type Evento =
  | 'queda_alfa' // o SOC Alfa cai e todo mundo vai para o Bravo
  | 'visita_ceo'
  | 'black_friday'
  | 'auditoria'
  | 'happy_hour'
  | 'simulado'
  | 'plantao'
  | 'aniversario';

export interface Dia {
  n: number; // 1..90
  site: Site;
  turno: Turno;
  titulo: string;
  resumo: string; // uma linha para o cartão do dia
  /** a aula do dia: o conteúdo prático que se aprende (é o "curso"). 2 a 5 parágrafos curtos. */
  aula: string;
  chegada: Fala[]; // cena ao chegar
  fila: { quantidade: number; alertas?: string[] }; // quantos alertas sorteados + ids obrigatórios
  missoes: Missao[]; // 0 a 2
  saida?: Fala[]; // cena ao bater o ponto
  evento?: Evento;
}

export interface Honraria {
  id: string;
  nome: string;
  descricao: string;
  icone: string; // um emoji
}
