// Honrarias: as medalhas que o RH não reconhece, mas a equipe sim.
import type { Honraria } from './tipos';

export const HONRARIAS: Honraria[] = [
  { id: 'cracha', nome: 'Crachá Definitivo (por enquanto)', descricao: 'Sobreviveu ao primeiro turno. O crachá ainda é de papelão.', icone: '🪪' },
  { id: 'fp10', nome: 'Farejador de Falso Positivo', descricao: 'Fechou 10 alertas como falso positivo ou benigno, e estava certo.', icone: '🐕' },
  { id: 'fp100', nome: 'Mestre do Falso Positivo', descricao: '100 ruídos fechados com razão. A Keyla pediu para você parar de humilhar as regras dela.', icone: '🧙' },
  { id: 'escala_tudo', nome: 'Escala Tudo', descricao: 'Escalou 5 falsos positivos como se fosse o fim do mundo. A Brenda ficou orgulhosa.', icone: '🧯' },
  { id: 'sem_ler', nome: 'Fechou Sem Ler', descricao: 'Respondeu um alerta em menos de 4 segundos. O Thiaguinho chorou de emoção.', icone: '🙈' },
  { id: 'relampago', nome: 'MTTA de Fórmula 1', descricao: '20 alertas certos em menos de 20 segundos cada. O timer de tomate do Gilmar não acompanha.', icone: '🏎️' },
  { id: 'caneca_ouro', nome: 'Caneca de Ouro', descricao: '50 cafés na carreira. A cafeteira já te chama pelo nome.', icone: '🏆' },
  { id: 'taquicardia', nome: 'Taquicardia Corporativa', descricao: '4 cafés num turno só. Seus olhos estão vendo pacotes de rede.', icone: '☕' },
  { id: 'vampiro', nome: 'Vampiro do SOC', descricao: '5 turnos de noite ou madrugada. A luz do sol agora é um IOC.', icone: '🦇' },
  { id: 'leoncio', nome: 'Atendeu o Dr. Leôncio e Sobreviveu', descricao: 'Três da manhã, "meu jovem", e você manteve a calma.', icone: '📞' },
  { id: 'decorou_wiki', nome: 'Decorou a Wiki (a de 2019)', descricao: '5 missões de perguntas sem errar nenhuma.', icone: '📚' },
  { id: 'fluente', nome: 'Fala SIEM Fluente', descricao: '50 consultas no Vigia. Você sonha em pipe.', icone: '🔎' },
  { id: 'canivete', nome: 'Canivete Suíço Paraguaio', descricao: '10 receitas no Canivete. Base64 já não te assusta.', icone: '🔪' },
  { id: 'n2', nome: 'Saiu da Fila (Mais ou Menos)', descricao: 'Promoção a N2. A fila continua lá, mas agora ela te respeita.', icone: '📈' },
  { id: 'n3', nome: 'Olheiras Nível CSIRT', descricao: 'Promoção a N3/CSIRT. O Vandeco te ofereceu café sem açúcar: é um rito.', icone: '🦉' },
  { id: 'acumulo', nome: 'Acúmulo de Função', descricao: 'Fez trabalho do nível de cima recebendo salário do nível de baixo. Muito realista.', icone: '🧾' },
  { id: 'passaporte', nome: 'Passaporte Recife', descricao: 'Primeiro turno no SOC Bravo. Comeu bolo de rolo em horário de expediente.', icone: '🌴' },
  { id: 'failover', nome: 'Sobrevivente do Failover', descricao: 'O Alfa caiu e o SOC continuou de pé. Alguém ligou a cafeteira no nobreak.', icone: '🔌' },
  { id: 'black_friday', nome: 'Sobrevivente da Black Friday', descricao: 'A padaria vendeu sonho e você vendeu a alma para o WAF.', icone: '🛒' },
  { id: 'neide', nome: 'Afilhada da Dona Neide', descricao: 'Conversou 5 vezes com a Dona Neide. Agora você também sabe a senha do Wi-Fi do 4º andar.', icone: '🧹' },
  { id: 'mes1', nome: 'Um Mês Sem Pedir Demissão', descricao: '30 dias de SOC. Isso, no mercado, já é sênior.', icone: '🗓️' },
  { id: 'mes2', nome: 'Dois Meses e Ainda Sorri', descricao: '60 dias. O sorriso é de nervoso, mas conta.', icone: '😬' },
  { id: 'turno_perfeito', nome: 'Turno Perfeito', descricao: 'Nota 100 num dia. Ninguém acreditou, então você abriu um ticket.', icone: '💯' },
  { id: 'segunda', nome: 'Dia de Segunda', descricao: 'Nota abaixo de 30 num dia. Acontece. O Chamadão também caiu.', icone: '🫠' },
  { id: 'ar', nome: 'Inimigo Público do Gilmar', descricao: 'Subiu o ar-condicionado para 23 °C. O SOC inteiro te agradeceu em silêncio.', icone: '🥶' },
  { id: 'coxinha', nome: 'Arqueologia da Coxinha', descricao: 'Encontrou a coxinha mordida do Thiaguinho. Ela tem data de 2024.', icone: '🥟' },
  { id: 'conspiracao', nome: 'Teórico da Conspiração', descricao: 'Achou uma pista de que o SOC Bravo é só um print.', icone: '🕵️' },
  { id: 'funcionario_mes', nome: 'Funcionário do Mês', descricao: 'Média 80 ou mais no fim do mês. O mês tinha um funcionário: você.', icone: '🖼️' },
  { id: 'por_um_fio', nome: 'Por Um Fio', descricao: 'Fechou um turno com a sanidade abaixo de 15. Respira.', icone: '🧵' },
  { id: 'dias_zero', nome: 'Dias Sem Incidente: 0', descricao: 'Chegou ao dia 90. A placa continua marcando zero.', icone: '🪧' },
  { id: 'cagada', nome: 'Fechou o Que Não Devia', descricao: 'Classificou como ruído um verdadeiro positivo grave. O Vandeco viu.', icone: '💥' },
  { id: 'plantao', nome: 'Plantonista Raiz', descricao: '3 madrugadas. Você já reconhece o Dr. Leôncio pelo toque do telefone.', icone: '🌙' },
];

export const HONRARIA_POR_ID = new Map(HONRARIAS.map((h) => [h.id, h]));
