// Ato 2, dias 46 a 52: SOC Bravo, M365, lições do failover, nuvem, quishing e AiTM, DGA e precursores de ransomware.
import type { Dia, Registro } from '../../tipos';
import { rng, hora, porHora, USUARIOS, HOSTS } from '../../util';
import { codificarBase64Utf16 } from '../../../motor/canivete';

const DOMINIO = 'tabajara.exemplo';

// ---------- dia 47: regra de caixa de entrada ----------
function registrosM365(): Registro[] {
  const r = rng(4701);
  const base = '2026-03-18T10:00:00';
  const ipBr = () => `${r.um([177, 179, 187, 189, 200, 201])}.${r.int(1, 254)}.${r.int(1, 254)}.${r.int(1, 254)}`;
  const out: Registro[] = [];
  for (let i = 0; i < 60; i++) out.push({ hora: hora(base, r.int(0, 40000)), operacao: 'UserLoggedIn', usuario: `${r.um(USUARIOS)}@${DOMINIO}`, ip_cliente: ipBr(), pais: 'BR', resultado: 'Succeeded' });
  for (let i = 0; i < 30; i++) out.push({ hora: hora(base, r.int(0, 40000)), operacao: 'MailItemsAccessed', usuario: `${r.um(USUARIOS)}@${DOMINIO}`, ip_cliente: ipBr(), pais: 'BR', resultado: 'Succeeded' });
  for (let i = 0; i < 5; i++) out.push({ hora: hora(base, r.int(0, 40000)), operacao: 'New-InboxRule', usuario: `${r.um(USUARIOS)}@${DOMINIO}`, ip_cliente: ipBr(), pais: 'BR', regra: r.um(['Newsletters', 'Avisos do RH', 'Chamadão']), acao_regra: 'MoveToFolder', resultado: 'Succeeded' });
  out.push({ hora: hora(base, 3600), operacao: 'New-InboxRule', usuario: `paulo.rodrigues@${DOMINIO}`, ip_cliente: ipBr(), pais: 'BR', regra: 'Cópia para a secretaria', acao_regra: 'ForwardTo', encaminhar_para: `secretaria.diretoria@${DOMINIO}`, resultado: 'Succeeded' });
  for (let i = 0; i < 2; i++) out.push({ hora: hora(base, r.int(0, 40000)), operacao: 'Consent to application', usuario: `${r.um(USUARIOS)}@${DOMINIO}`, ip_cliente: ipBr(), pais: 'BR', aplicativo: 'Agenda de Salas', permissoes: 'User.Read', resultado: 'Succeeded' });
  const ip = '185.107.56.21';
  out.push({ hora: '2026-03-18T06:12:44Z', operacao: 'UserLoggedIn', usuario: `fernanda.lima@${DOMINIO}`, ip_cliente: ip, pais: 'NL', resultado: 'Succeeded' });
  out.push({ hora: '2026-03-18T06:14:02Z', operacao: 'New-InboxRule', usuario: `fernanda.lima@${DOMINIO}`, ip_cliente: ip, pais: 'NL', regra: '.', acao_regra: 'ForwardTo, MarkAsRead, MoveToFolder:RSS', palavras: 'boleto, pagamento, transferência, PIX', encaminhar_para: 'fin.tabajara@caixapostal-gratis.top', resultado: 'Succeeded' });
  out.push({ hora: '2026-03-18T06:16:30Z', operacao: 'Consent to application', usuario: `fernanda.lima@${DOMINIO}`, ip_cliente: ip, pais: 'NL', aplicativo: 'Leitor PDF Seguro', permissoes: 'Mail.Read, Mail.Send, offline_access', resultado: 'Succeeded' });
  for (let i = 0; i < 6; i++) out.push({ hora: hora('2026-03-18T06:18:00', i * 50), operacao: 'MailItemsAccessed', usuario: `fernanda.lima@${DOMINIO}`, ip_cliente: ip, pais: 'NL', resultado: 'Succeeded' });
  return porHora(out);
}

// ---------- dia 49: CloudTrail ----------
function registrosCloudTrail(): Registro[] {
  const r = rng(4901);
  const base = '2026-03-20T11:00:00';
  const out: Registro[] = [];
  const corp = '200.150.10.20';
  const ev = (t: string, nome: string, fonte: string, usuario: string, ip: string, ua: string, regiao: string, erro: string, bucket = '-') =>
    out.push({ hora: t, eventName: nome, eventSource: fonte, usuario, sourceIPAddress: ip, userAgent: ua, awsRegion: regiao, errorCode: erro, bucket });
  const rotina: [string, string][] = [['PutObject', 's3.amazonaws.com'], ['GetObject', 's3.amazonaws.com'], ['DescribeInstances', 'ec2.amazonaws.com'], ['UpdateFunctionCode', 'lambda.amazonaws.com']];
  for (let i = 0; i < 60; i++) {
    const [nome, fonte] = r.um(rotina);
    ev(hora(base, r.int(0, 30000)), nome, fonte, 'svc-deploy-ci', corp, 'aws-sdk-go-v2/1.25', 'sa-east-1', '-', fonte.startsWith('s3') ? 'tabajara-site-estatico' : '-');
  }
  ev(hora(base, 5000), 'GetBucketPolicy', 's3.amazonaws.com', 'svc-deploy-ci', corp, 'aws-sdk-go-v2/1.25', 'sa-east-1', 'AccessDenied', 'tabajara-sinistros-anexos');
  ev(hora(base, 9000), 'PutObject', 's3.amazonaws.com', 'svc-deploy-ci', corp, 'aws-sdk-go-v2/1.25', 'sa-east-1', 'AccessDenied', 'tabajara-logs');
  for (let i = 0; i < 20; i++) {
    ev(hora(base, r.int(0, 30000)), r.um(['ConsoleLogin', 'DescribeInstances', 'ListBuckets', 'GetMetricData']), 'signin.amazonaws.com', r.um(['ana.oliveira', 'rafael.costa', 'lucas.ferreira']), corp, 'Mozilla/5.0 (console)', 'sa-east-1', '-');
  }
  ev(hora(base, 2000), 'PutObject', 's3.amazonaws.com', 'dev-relatorios', corp, 'Boto3/1.34', 'sa-east-1', '-', 'tabajara-relatorios');
  ev(hora(base, 2100), 'GetObject', 's3.amazonaws.com', 'dev-relatorios', corp, 'Boto3/1.34', 'sa-east-1', '-', 'tabajara-relatorios');
  // a credencial do usuário dev-relatorios aparece usada de um IP de fora
  const ip = '103.77.41.9';
  const ua = 'aws-cli/2.15.0 Linux';
  let t = 26000;
  const visto = (nome: string, fonte: string, erro: string, bucket = '-', regiao = 'us-east-1') => ev(hora(base, (t += r.int(4, 30))), nome, fonte, 'dev-relatorios', ip, ua, regiao, erro, bucket);
  visto('GetCallerIdentity', 'sts.amazonaws.com', '-');
  visto('ListBuckets', 's3.amazonaws.com', '-');
  for (const b of ['tabajara-logs', 'tabajara-backup-rds', 'tabajara-site-estatico', 'tabajara-folha', 'tabajara-sinistros-anexos']) visto('GetBucketAcl', 's3.amazonaws.com', b === 'tabajara-sinistros-anexos' ? '-' : 'AccessDenied', b, 'sa-east-1');
  for (const n of ['ListUsers', 'CreateUser', 'CreateAccessKey', 'AttachUserPolicy', 'ListRoles']) visto(n, 'iam.amazonaws.com', 'AccessDenied');
  for (const n of ['DescribeInstances', 'RunInstances']) visto(n, 'ec2.amazonaws.com', 'AccessDenied');
  visto('ListObjects', 's3.amazonaws.com', '-', 'tabajara-sinistros-anexos', 'sa-east-1');
  visto('DeleteBucketPublicAccessBlock', 's3.amazonaws.com', '-', 'tabajara-sinistros-anexos', 'sa-east-1');
  visto('PutBucketPolicy', 's3.amazonaws.com', '-', 'tabajara-sinistros-anexos', 'sa-east-1');
  return porHora(out);
}

// ---------- dia 51: DGA ----------
function registrosDns(): Registro[] {
  const r = rng(5101);
  const base = '2026-03-22T09:00:00';
  const out: Registro[] = [];
  const legit = ['outlook.office365.com', 'teams.microsoft.com', 'www.google.com', 'portal.tabajara.exemplo', 'www.gov.br', 'login.microsoftonline.com', 'cdn.jsdelivr.net', 'update.guarita-edr.exemplo', 'www.bb.com.br', 'api.whatsapp.com'];
  const ipR = () => `${r.int(13, 200)}.${r.int(1, 254)}.${r.int(1, 254)}.${r.int(1, 254)}`;
  for (let i = 0; i < 200; i++) out.push({ hora: hora(base, r.int(0, 30000)), host: r.um(HOSTS), consulta: r.um(legit), tipo: 'A', resposta: 'NOERROR', ip_resolvido: ipR(), idade_dominio_dias: 3000 });
  for (const h of HOSTS.slice(0, 7)) out.push({ hora: hora(base, r.int(0, 30000)), host: h, consulta: 'wpad.tabajara.local', tipo: 'A', resposta: 'NXDOMAIN', ip_resolvido: '-', idade_dominio_dias: '-' });
  const erros: [string, string][] = [['NB-RH-007', 'outlok.office365.com'], ['NB-COM-022', 'www.gogle.com'], ['DT-ATEND-031', 'portal.tabajra.exemplo']];
  for (const [h, d] of erros) out.push({ hora: hora(base, r.int(0, 30000)), host: h, consulta: d, tipo: 'A', resposta: 'NXDOMAIN', ip_resolvido: '-', idade_dominio_dias: '-' });
  const letras = 'bcdfghjklmnpqrstvwxzaeiou';
  const tlds = ['.top', '.xyz', '.info', '.biz'];
  for (let i = 0; i < 42; i++) {
    let nome = '';
    const n = r.int(12, 18);
    for (let k = 0; k < n; k++) nome += letras[r.int(0, letras.length - 1)];
    const resolveu = i === 37;
    out.push({ hora: hora('2026-03-22T13:40:00', i * 3), host: 'DT-CAIXA-05', consulta: nome + r.um(tlds), tipo: 'A', resposta: resolveu ? 'NOERROR' : 'NXDOMAIN', ip_resolvido: resolveu ? '194.87.12.66' : '-', idade_dominio_dias: resolveu ? 1 : '-' });
  }
  return porHora(out);
}

// ---------- dia 52: o que o EDR registrou (texto do alerta, invertido e codificado pelo coletor) ----------
const NOTA_EDR =
  'Guarita EDR | host NB-FIN-014 | pai: powershell.exe | filho: vssadmin.exe | acao: exclusao de copias de sombra | MITRE T1490 | seguidos por wbadmin.exe e bcdedit.exe';
const ENTRADA_EDR = codificarBase64Utf16([...NOTA_EDR].reverse().join(''));

export const DIAS_46_52: Dia[] = [
  {
    n: 46,
    site: 'bravo',
    turno: 'tarde',
    titulo: 'Bem-vindos ao Bravo',
    resumo: 'Operar no site de contingência: processos diferentes, mesma fila, mesmo SLA.',
    aula:
      'Chegar no site de contingência não é chegar de férias. A primeira hora tem roteiro: confirmar **acesso** (conta, VPN, MFA, permissão no Vigia e no Chamadão a partir da rede do Bravo), ver a **fila** e os SLAs em risco, e receber a lista do que estava em investigação. O cliente não quer saber em que cidade está o analista, quer saber se o alerta dele foi visto.\n\n' +
      'Dois sites, dois jeitos de trabalhar. O certo não é "o meu" nem "o seu": é o **procedimento documentado da operação**. Quando os playbooks divergem (prioridade, quem acionar, prazo de escalonamento), siga o que está aprovado para aquele cliente e registre a divergência para padronizar depois. Bairrismo no meio de incidente é o melhor amigo do atacante.\n\n' +
      'Confira o **RPO na prática**: o que se perdeu entre a última replicação e a queda? Ticket com anotação pela metade, alerta reconhecido no Alfa que aparece como novo no Bravo, investigação que só existia na cabeça de alguém. Revalide tudo que estava em andamento.\n\n' +
      'Curiosidade útil: Recife está em UTC-3, igual a Brasília. A diferença de horário entre os sites é zero. A de temperatura é de uns vinte graus, e essa nenhum NTP corrige.',
    chegada: [
      { quem: 'socorro', texto: 'Sejam bem-vindos ao Bravo. Aqui tem ventilador, bolo de rolo e procedimento. A gente segue o procedimento primeiro, o bolo espera.', gesto: 'acenar', expr: 'sorriso' },
      { quem: 'nildo', texto: 'Curitiba chegou! Trouxeram casaco? Aqui o ar-condicionado é o mar.', gesto: 'apontar', expr: 'sorriso' },
      { quem: 'ro', texto: 'Nildo, a gente veio trabalhar, não fazer turismo. Onde fica a tomada que ninguém pode desligar?', gesto: 'cruzar' },
      { quem: 'nildo', texto: 'Tem etiqueta. Foi a primeira coisa que a Dona Socorro mandou fazer quando soube da cafeteira de vocês.', gesto: 'ombros' },
      { quem: 'socorro', texto: 'Quem está no turno pega a fila, com acúmulo de função ou sem. Cargo a gente discute depois do café.', gesto: 'sim' },
      { quem: 'brenda', texto: 'No Alfa a gente escala P2 em 30 minutos. Aqui é em 20? Escalo agora pra garantir?', expr: 'surpresa' },
    ],
    fila: { quantidade: 9 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Primeiro turno em Recife',
        enunciado: 'Você acabou de sentar numa estação do SOC Bravo, com a fila do Alfa e a do Bravo juntas.',
        perguntas: [
          {
            p: 'Qual é a primeira coisa a fazer ao assumir a estação?',
            opcoes: ['Pegar bolo de rolo', 'Confirmar acesso ao Vigia, ao Chamadão e ao EDR, e ver os SLAs em risco e as investigações em andamento', 'Fechar em lote os alertas antigos do Alfa', 'Reconfigurar o painel do jeito de Curitiba'],
            certa: 1,
            explicacao: 'Sem acesso não há operação, e sem a lista do que estava em andamento o failover vira recomeço do zero. O bolo vem logo depois.',
          },
          {
            p: 'O playbook do Bravo manda escalar P2 em 20 minutos; o do Alfa, em 30. O que seguir?',
            opcoes: ['O do Alfa, porque é o principal', 'O procedimento aprovado no contrato do cliente, registrando a divergência para padronizar', 'O que for mais confortável', 'Nenhum, decide na hora'],
            certa: 1,
            explicacao: 'SLA é compromisso contratual. Divergência entre sites é problema de processo a resolver depois, não desculpa para atrasar escalonamento.',
          },
          {
            p: 'Um alerta que estava "em investigação" no Alfa aparece como "novo" no Bravo. O que isso indica?',
            opcoes: ['O alerta se curou sozinho', 'Perda de dados dentro do RPO da replicação; é preciso revalidar o estado e as anotações com quem investigava', 'Erro do Nildo', 'Pode fechar, alguém já viu'],
            certa: 1,
            explicacao: 'Estado de ticket e anotação recente são os primeiros a se perder numa queda. Revalidar evita duas pessoas no mesmo alerta e alerta sem ninguém.',
          },
          {
            p: 'O que é um SOC ativo-ativo?',
            opcoes: ['Os dois sites operam ao mesmo tempo e um pode absorver a carga do outro', 'Um site trabalha e o outro só liga se o primeiro cair', 'Um SOC com dois turnos', 'Um SOC que nunca tira férias'],
            certa: 0,
            explicacao: 'No ativo-ativo o Bravo já trabalhava com fila própria; a queda do Alfa só aumentou a carga. No ativo-passivo, o segundo site precisaria ser ligado antes.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'socorro', texto: 'Primeiro turno sem grito. Assim que eu gosto.', gesto: 'sim', expr: 'sorriso' },
      { quem: 'nildo', texto: 'Amanhã eu mostro como se consulta M365 rápido. Estilo Recife: sem frio e sem pressa errada.', gesto: 'apontar' },
    ],
  },
  {
    n: 47,
    site: 'bravo',
    turno: 'manhã',
    titulo: 'A caixa que encaminha sozinha',
    resumo: 'M365: regra de caixa de entrada maliciosa e consentimento OAuth.',
    aula:
      'Quem invade uma caixa de e-mail quer ficar sem ser visto. Os dois sinais mais comuns no log: **regra de caixa de entrada** que encaminha mensagens para fora e esconde respostas (`T1114.003`, Email Forwarding Rule, e `T1564.008`, Email Hiding Rules), e **consentimento OAuth** para um aplicativo desconhecido, que mantém acesso à caixa mesmo depois da troca de senha (`T1528`).\n\n' +
      'No **log de auditoria unificado** do Microsoft 365, procure as operações `New-InboxRule`, `Set-InboxRule` e `UpdateInboxRules`, olhando os parâmetros `ForwardTo`, `RedirectTo`, `DeleteMessage`, `MarkAsRead` e `MoveToFolder`. Regra com nome de um caractere (`.`), palavras-chave de dinheiro ("boleto", "PIX") e destino em domínio gratuito é quase uma assinatura. O consentimento aparece como `Consent to application`, com as permissões pedidas.\n\n' +
      'O contexto fecha o caso: login (`UserLoggedIn`) de país incomum minutos antes, a regra criada do mesmo IP, e depois `MailItemsAccessed` em sequência. Regra legítima existe (diretor encaminhando para a secretaria, dentro do domínio), por isso olhe o destino.\n\n' +
      'Resposta: remover a regra e o consentimento (documentando antes), **revogar as sessões** e os tokens de atualização, trocar a senha, revisar o MFA e procurar a mesma regra em outras caixas. Trocar só a senha e esquecer o aplicativo OAuth é trancar a porta e deixar a chave com o vizinho.',
    chegada: [
      { quem: 'nildo', texto: 'Bom dia! A Tabajara ligou: o fornecedor recebeu e-mail da fernanda.lima pedindo troca de conta. Ela jura que não mandou.', gesto: 'acenar' },
      { quem: 'socorro', texto: 'Antes de concluir qualquer coisa, a gente olha o log de auditoria. Com calma e com filtro.', gesto: 'sim' },
      { quem: 'ro', texto: 'Aposto um bolo de rolo que tem regra encaminhando pra fora.', gesto: 'cruzar' },
      { quem: 'nildo', texto: 'Aposta aceita. Se não tiver, você admite que o Bravo é melhor.', expr: 'sorriso' },
      { quem: 'vandeco', texto: 'Em 2010 era o mesmo golpe, só que com POP3. O atacante muda de roupa, não de profissão.', expr: 'neutro' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'siem',
        titulo: 'Quem encaminha para fora',
        enunciado: 'Log de auditoria do M365 da Tabajara. Existe regra legítima encaminhando para dentro do domínio `tabajara.exemplo`. Ache a conta comprometida.',
        registros: registrosM365(),
        pergunta: 'Qual conta tem a regra que encaminha para fora do domínio? (como aparece no campo usuario)',
        resposta: 'fernanda.lima@tabajara.exemplo',
        gabarito: 'operacao=New-InboxRule encaminhar_para=* encaminhar_para!=*@tabajara.exemplo | tabela hora,usuario,encaminhar_para,ip_cliente,regra',
        dica: 'Filtre `operacao=New-InboxRule encaminhar_para=*` para ver só regras com encaminhamento e tire o domínio interno com `encaminhar_para!=*@tabajara.exemplo`. Use `| tabela hora,usuario,encaminhar_para` para ler melhor.',
        explicacao: 'A fernanda.lima logou da Holanda às 06:12 UTC e, dois minutos depois, do mesmo IP, criou a regra "." que encaminha mensagens com "boleto", "pagamento" e "PIX" para um domínio gratuito, marca como lida e move para RSS. Em seguida consentiu o aplicativo "Leitor PDF Seguro" com `Mail.Read`, `Mail.Send` e `offline_access`. A regra do paulo.rodrigues encaminha para a secretaria, dentro do domínio, e é legítima.',
      },
      {
        tipo: 'quiz',
        titulo: 'O aplicativo que ficou',
        enunciado: 'A senha da fernanda.lima foi trocada. O aplicativo "Leitor PDF Seguro" continua com consentimento.',
        perguntas: [
          {
            p: 'Por que a troca de senha não basta?',
            opcoes: ['Porque a senha nova pode ser fraca', 'Porque o consentimento OAuth com `offline_access` dá ao aplicativo token de atualização que continua valendo', 'Porque o M365 demora um mês para aplicar', 'Basta, sim'],
            certa: 1,
            explicacao: 'O aplicativo autorizado não usa a senha da pessoa. É preciso remover o consentimento e revogar as sessões e os tokens.',
          },
          {
            p: 'Qual medida preventiva reduz esse risco na organização inteira?',
            opcoes: ['Bloquear o Outlook', 'Restringir o consentimento de usuários a aplicativos de editores verificados ou exigir aprovação do administrador', 'Desligar o log de auditoria', 'Proibir PDF'],
            certa: 1,
            explicacao: 'Com fluxo de aprovação, o usuário não autoriza sozinho um aplicativo desconhecido a ler e enviar e-mails.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'ro', texto: 'Nildo, me deve um bolo de rolo.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'nildo', texto: 'Pago com prazer. Mas o filtro fui eu que mostrei, viu?', gesto: 'ombros' },
    ],
  },
  {
    n: 48,
    site: 'bravo',
    turno: 'tarde',
    titulo: 'Lições da cafeteira',
    resumo: 'Antes de voltar ao Alfa: lições aprendidas do failover, sem caçar culpado.',
    aula:
      'A reunião de **lições aprendidas** acontece logo depois do evento, com a memória fresca. Ela responde: o que aconteceu, o que funcionou, o que não funcionou, por quê, e **o que muda**, com dono e prazo. Ata sem ação com responsável é só um diário.\n\n' +
      'O formato que funciona é o **pós-mortem sem culpados**: a pergunta não é "quem desligou o nobreak?", é "por que foi possível desligar o nobreak sem perceber?". Tomada sem etiqueta, nobreak acessível, plano impresso numa gaveta, chat no mesmo prédio que caiu. Quando o foco vira culpar uma pessoa, a próxima pessoa esconde o erro, e erro escondido é incidente adiado.\n\n' +
      'Métricas do failover entram no relatório: horário da queda, horário do acionamento, horário em que o Bravo assumiu a fila (o **RTO real**), o que se perdeu (o **RPO real**), SLAs estourados e clientes afetados. Compare com o que o plano prometia.\n\n' +
      'O **failback** também é planejado: voltar com tudo testado e numa janela de menor movimento. Voltar correndo numa segunda-feira, no horário em que o Chamadão cai, é pedir uma segunda temporada.',
    chegada: [
      { quem: 'socorro', texto: 'Antes de vocês voltarem para Curitiba, a gente senta e conversa. Sem dedo apontado.', gesto: 'sim' },
      { quem: 'gilmar', texto: 'Eu queria começar pedindo desculpas. A cafeteira era minha. E ela nem ficou tão boa.', expr: 'triste' },
      { quem: 'socorro', texto: 'Gilmar, a pergunta aqui não é quem. É por que uma tomada de nobreak estava solta para qualquer cafeteira.', gesto: 'nao' },
      { quem: 'nildo', texto: 'E por que o telefone da gente estava numa gaveta, e não no celular de todo mundo.', gesto: 'apontar' },
      { quem: 'neide', texto: 'E por que ninguém pergunta pra limpeza onde fica cada tomada. Eu sei de todas.', gesto: 'cintura' },
    ],
    fila: { quantidade: 6 },
    missoes: [
      {
        tipo: 'escolha',
        titulo: 'A sua proposta na reunião',
        enunciado: 'A Dona Socorro pede para cada pessoa do turno trazer uma ação para o relatório de lições aprendidas. Qual é a sua?',
        opcoes: [
          {
            texto: 'Propor o pós-mortem sem culpados: causa raiz na tomada sem proteção e no plano esquecido, com ações, donos e prazos.',
            reacao: [
              { quem: 'socorro', texto: 'Isso. Processo bom é aquele que aguenta gente cansada às 7h da manhã.', gesto: 'sim', expr: 'sorriso' },
              { quem: 'gilmar', texto: 'Vou colocar na planilha com prazo e dono. Pela primeira vez, a planilha vai servir para algo.', gesto: 'comemorar' },
            ],
            efeitos: { reputacao: 10, sanidade: 5 },
          },
          {
            texto: 'Propor teste semestral de failover com o Bravo, incluindo o canal alternativo de comunicação.',
            reacao: [
              { quem: 'nildo', texto: 'Teste de verdade, com fila de verdade? Gostei. Assim a gente vê Curitiba sofrendo de novo, de forma controlada.', expr: 'sorriso' },
              { quem: 'ro', texto: 'Mais trabalho, mas do tipo que evita trabalho maior. Aprovo bufando.', gesto: 'cruzar' },
            ],
            efeitos: { reputacao: 10, energia: -10 },
          },
          {
            texto: 'Propor proibir cafeteira no SOC Alfa.',
            reacao: [
              { quem: 'ro', texto: 'Você quer um motim? Porque é assim que se começa um motim.', expr: 'bravo' },
              { quem: 'socorro', texto: 'O problema não é a cafeteira, é a tomada. Proibir o café só tira o café e deixa a tomada.', gesto: 'nao' },
            ],
            efeitos: { reputacao: -5, sanidade: -5 },
          },
          {
            texto: 'Registrar no relatório que a causa foi "erro humano do coordenador".',
            reacao: [
              { quem: 'socorro', texto: '"Erro humano" é onde a investigação para de pensar. Na próxima, quem errar vai esconder.', gesto: 'nao', expr: 'neutro' },
              { quem: 'gilmar', texto: 'Justo. Mas dói.', expr: 'triste' },
            ],
            efeitos: { reputacao: -10 },
          },
        ],
      },
    ],
    saida: [
      { quem: 'socorro', texto: 'Voltem com calma. E levem bolo de rolo, que aí no frio ele dura mais.', gesto: 'acenar', expr: 'sorriso' },
      { quem: 'nildo', texto: 'Se cair de novo, a gente está aqui. Mas não derruba de propósito, viu?', gesto: 'apontar' },
    ],
  },
  {
    n: 49,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'A chave no repositório público',
    resumo: 'Nuvem: CloudTrail, credencial exposta usada de fora e bucket que ficou público.',
    aula:
      'Na AWS, o **CloudTrail** registra as chamadas de API: `eventName`, `eventSource`, `userIdentity`, `sourceIPAddress`, `userAgent`, `awsRegion` e `errorCode`. É o 4624 da nuvem: quem fez, o quê, de onde e se deu certo.\n\n' +
      'Credencial de acesso esquecida em código publicado é um dos incidentes de nuvem mais comuns (`T1552.001`, Credentials In Files, levando a `T1078.004`, Cloud Accounts). O padrão nos logs: primeiro um `GetCallerIdentity` ("quem sou eu?"), depois enumeração (`ListBuckets`, `GetBucketAcl`, `ListUsers`) com muitos **`AccessDenied`**, vindo de um IP e de um `userAgent` que aquela credencial nunca usou. Muitas negações em sequência são o barulho de alguém testando o que a chave alcança.\n\n' +
      'Quando acha uma permissão, o próximo passo costuma ser dados (`T1530`, Data from Cloud Storage): `ListObjects`, `GetObject`, ou mexer na exposição do bucket, como `DeleteBucketPublicAccessBlock` e `PutBucketPolicy`. Bucket público com anexo de sinistro tem dado pessoal, e isso aciona jurídico e avaliação de comunicação à ANPD.\n\n' +
      'Resposta: **desativar a credencial** imediatamente, restaurar o bloqueio de acesso público, revisar tudo que aquela identidade fez no período, girar segredos relacionados e apagar a credencial do histórico do repositório (apagar só o último commit não basta). Prevenção: identidades temporárias em vez de chave fixa, varredura de segredo no repositório e privilégio mínimo. A chave do dev-relatorios podia ler relatórios. Por que ela mexia em política de bucket é uma pergunta para a reunião.',
    chegada: [
      { quem: 'gilmar', texto: 'De volta a Curitiba! O nobreak agora tem cadeado. E a cafeteira tem tomada própria, com etiqueta.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'ro', texto: 'Ótimo. Enquanto vocês comemoravam, a nuvem da Tabajara começou a receber visita.', gesto: 'cruzar' },
      { quem: 'jefferson', texto: 'Nuvem cai em concurso. Mas acho que não desse jeito.', gesto: 'pensar' },
      { quem: 'vandeco', texto: 'Antigamente o vagabundo tinha que invadir o servidor. Hoje ele acha a chave num repositório e entra pela porta da frente.', expr: 'neutro' },
      { quem: 'pamela', texto: 'O CloudTrail tem um monte de AccessDenied de um IP que eu nunca vi. Vale a pena olhar quem.', gesto: 'apontar' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'siem',
        titulo: 'Quem bateu em tantas portas',
        enunciado: 'CloudTrail da conta AWS da Tabajara. O pipeline `svc-deploy-ci` e as pessoas da TI usam o IP corporativo 200.150.10.20. Ache a identidade cuja credencial foi usada de fora.',
        registros: registrosCloudTrail(),
        pergunta: 'Qual usuário IAM teve mais negações (AccessDenied) vindas de um único IP?',
        resposta: 'dev-relatorios',
        gabarito: 'errorCode=AccessDenied | contar por usuario,sourceIPAddress | ordenar -total',
        dica: 'Comece por `errorCode=AccessDenied | contar por usuario,sourceIPAddress | ordenar -total`. Depois veja tudo o que esse usuário fez com `usuario=... | tabela hora,eventName,sourceIPAddress,errorCode,bucket`.',
        explicacao: 'A identidade `dev-relatorios` costuma usar o IP corporativo. De repente aparece em 103.77.41.9 com `aws-cli`, faz `GetCallerIdentity`, `ListBuckets` e uma dúzia de chamadas negadas, até achar o que alcança: lista o bucket `tabajara-sinistros-anexos`, remove o bloqueio de acesso público e troca a política. O `svc-deploy-ci` também tem duas negações, mas do IP de sempre e na rotina. Desative a credencial agora, restaure o bloqueio e meça o que foi acessado.',
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Credencial desativada, bucket fechado, jurídico avisado. O tomate está orgulhoso.', gesto: 'sim' },
      { quem: 'ro', texto: 'E o dev que publicou a chave vai ganhar um treinamento. Sem culpa, mas com slide.', expr: 'sorriso' },
    ],
  },
  {
    n: 50,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'O QR code e o espelho',
    resumo: 'Quishing e phishing com proxy AiTM que rouba a sessão, MFA e tudo.',
    aula:
      '**Quishing** é phishing com QR code. O link fica dentro de uma imagem (no corpo do e-mail ou num PDF), o filtro de URL do gateway muitas vezes não lê, e a pessoa escaneia com o celular pessoal, fora do proxy e do EDR da empresa. O pretexto clássico: "atualize seu MFA", "seu holerite está disponível", "multa pendente".\n\n' +
      'O destino costuma ser um **proxy AiTM** (Adversary-in-the-Middle, `T1557`): uma página que repassa em tempo real a tela de login verdadeira. A pessoa digita a senha, aprova o MFA, entra normalmente, e o proxy guarda o **cookie de sessão** (`T1539`, Steal Web Session Cookie). Com o cookie, o atacante não precisa de senha nem de MFA: ele reaproveita a sessão já autenticada.\n\n' +
      'O que aparece nos logs de entrada: login com MFA aprovado vindo de IP de hospedagem, logo em seguida a mesma sessão sendo usada de outro IP ou país, dispositivo não gerenciado, `User-Agent` diferente do que a pessoa usa. Depois vêm os sinais do dia 47: regra de caixa de entrada e e-mail interno de phishing saindo da conta.\n\n' +
      'Defesa: **MFA resistente a phishing** (FIDO2, chaves de acesso ou Windows Hello), que amarra a autenticação ao domínio verdadeiro e não funciona na página espelho; acesso condicional exigindo dispositivo gerenciado; e, na resposta, **revogar as sessões**, não só trocar a senha. Código de SMS é melhor que nada, mas um espelho bem feito copia até o sorriso.',
    chegada: [
      { quem: 'brenda', texto: 'Chegou um PDF com QR code dizendo que meu MFA vai expirar. Escaneei pra ver. Escalo eu mesma?', expr: 'surpresa' },
      { quem: 'ro', texto: 'Brenda, era o simulado de phishing da Keyla. Você vai ganhar um certificado de participação. Em forma de treinamento.', gesto: 'cruzar' },
      { quem: 'keyla', texto: 'Meu simulado pegou 31% da Insônia! Estou feliz e preocupada ao mesmo tempo.', expr: 'sorriso' },
      { quem: 'vandeco', texto: 'O de verdade chegou na Tabajara ontem, igualzinho. A diferença é que esse não dá certificado, dá relatório pra ANPD.', expr: 'neutro' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'MFA aprovado, conta perdida',
        enunciado: 'A conta da camila.ribeiro aprovou MFA às 10:02 de um IP de hospedagem e, às 10:05, a mesma sessão aparece em outro país criando regra de caixa de entrada.',
        perguntas: [
          {
            p: 'Por que o QR code ajuda o golpe a passar pelos controles?',
            opcoes: ['QR code é criptografado', 'O link fica numa imagem que o filtro de URL pode não ler, e a pessoa abre no celular pessoal, fora do proxy e do EDR', 'QR code sempre é seguro', 'O antivírus não roda às terças'],
            certa: 1,
            explicacao: 'O quishing tira o clique do computador monitorado e leva para um aparelho sem as proteções da empresa.',
          },
          {
            p: 'Como o atacante entrou se o MFA foi aprovado pela própria camila?',
            opcoes: ['Ele adivinhou o código', 'O proxy AiTM repassou o login real e capturou o cookie de sessão emitido depois do MFA', 'O MFA estava desligado', 'A camila passou a senha por telefone'],
            certa: 1,
            explicacao: 'O AiTM não quebra o MFA, ele espera a pessoa passar pelo MFA e rouba o resultado: a sessão autenticada (`T1539`).',
          },
          {
            p: 'Qual é a ação de resposta mais importante, além da troca de senha?',
            opcoes: ['Revogar todas as sessões e tokens da conta e revisar regras e consentimentos criados', 'Mandar a camila reiniciar o celular', 'Bloquear o QR code no navegador', 'Nenhuma, a troca de senha derruba tudo'],
            certa: 0,
            explicacao: 'Cookie de sessão roubado continua válido até expirar ou ser revogado. Troca de senha sozinha pode não encerrar a sessão do atacante.',
          },
          {
            p: 'Que tipo de MFA não funciona numa página espelho AiTM?',
            opcoes: ['Código por SMS', 'Push com número', 'FIDO2 ou chave de acesso, que amarra a autenticação ao domínio verdadeiro', 'Pergunta secreta'],
            certa: 2,
            explicacao: 'FIDO2 verifica criptograficamente a origem: no domínio falso, a chave simplesmente não responde. SMS e push podem ser repassados pelo proxy.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'keyla', texto: 'Próximo simulado vai ser com QR code em caixa de pizza. Brincadeira. Ou não.', gesto: 'pensar' },
      { quem: 'brenda', texto: 'Eu fiz o treinamento. Agora desconfio até do cardápio da padaria.', expr: 'neutro' },
    ],
  },
  {
    n: 51,
    site: 'alfa',
    turno: 'noite',
    titulo: 'Domínios que ninguém digitou',
    resumo: 'DGA: rajada de NXDOMAIN com nomes aleatórios e domínios recém-registrados.',
    aula:
      'Malware precisa achar o servidor de comando. Para não depender de um domínio fixo (que seria bloqueado logo), algumas famílias usam **DGA** (Domain Generation Algorithm, `T1568.002`): geram dezenas ou milhares de nomes por dia a partir de uma semente, e o operador registra só um ou dois. O resto não existe.\n\n' +
      'No DNS isso aparece como uma **rajada de NXDOMAIN** do mesmo host, para nomes longos, aleatórios, sem palavra nenhuma (`kqzvbtrlmhpfxw.top`), muitas vezes em TLDs baratos, com intervalos regulares. Quando um deles resolve, a resposta aponta para um IP que vale ouro como IOC, e o domínio costuma ter **um ou dois dias de idade**.\n\n' +
      'Ruído que confunde: `wpad` não resolvendo (todo Windows procura), erro de digitação (`gogle.com`), CDN com nome aleatório que **resolve** normalmente. O que separa é a combinação: muitos nomes distintos não resolvendo, a partir de um host só, em pouco tempo.\n\n' +
      'Detecção prática: contar domínios distintos com NXDOMAIN por host, medir a **entropia** do nome, e alertar acesso a domínio **recém-registrado** (NRD, menos de 30 dias). Bloquear NRD no DNS corporativo derruba muita campanha, e quase nenhum funcionário precisa de site com três dias de vida. Quase. Sempre tem alguém que comprou um curso de cripto ontem.',
    chegada: [
      { quem: 'thiaguinho', texto: 'O DNS da Tabajara está cheio de NXDOMAIN. Deve ser a internet cansada.', gesto: 'ombros' },
      { quem: 'vandeco', texto: 'Internet não cansa, Thiaguinho. Quem cansa é o malware procurando a casa do chefe.', expr: 'neutro' },
      { quem: 'thiaguinho', texto: 'Igual eu procurando o crachá às 6h.', gesto: 'pensar' },
      { quem: 'ro', texto: 'Todo Windows do mundo procura o `wpad` e não acha. Não sai acusando todas as máquinas, procura quem pediu nome demais.', gesto: 'apontar' },
    ],
    fila: { quantidade: 7 },
    missoes: [
      {
        tipo: 'siem',
        titulo: 'O host que procura domínio aleatório',
        enunciado: 'Consultas DNS da Tabajara. Há `wpad` e erros de digitação no meio. Ache o host com comportamento de DGA.',
        registros: registrosDns(),
        pergunta: 'Qual host consultou mais domínios distintos que não existem (NXDOMAIN)?',
        resposta: 'DT-CAIXA-05',
        gabarito: 'resposta=NXDOMAIN | distintos consulta por host | ordenar -distintos',
        dica: 'Use `resposta=NXDOMAIN | distintos consulta por host | ordenar -distintos`. Depois procure o único que resolveu: `host=DT-CAIXA-05 resposta=NOERROR`.',
        explicacao: 'O DT-CAIXA-05 pediu mais de 40 nomes aleatórios em cerca de dois minutos, um a cada 3 segundos, quase todos NXDOMAIN. Um resolveu para 194.87.12.66, domínio com um dia de vida: esse é o IOC para bloquear e caçar em outros hosts. Os outros NXDOMAIN são `wpad` e erros de digitação, um por máquina. Próximo passo: isolar o caixa conforme o playbook e verificar no EDR qual processo fez as consultas.',
      },
    ],
    saida: [
      { quem: 'thiaguinho', texto: 'Bloqueei o IP e anotei na passagem de turno. Sem coxinha no papel dessa vez.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'vandeco', texto: 'Tá virando analista de verdade, Thiaguinho. Daqui a pouco começa a contar história de 2003 também.', expr: 'sorriso' },
    ],
  },
  {
    n: 52,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'Os sinais antes da tempestade',
    resumo: 'Precursores de ransomware: mexer em cópias de sombra, catálogo de backup e recuperação do boot.',
    aula:
      'Antes de cifrar, o ransomware tenta tirar da vítima o caminho de volta. É a técnica `T1490` (Inhibit System Recovery): apagar as **cópias de sombra** do Windows, o **catálogo de backup** local e desligar a **recuperação automática** da inicialização. Nos logs, isso aparece como execução de binários nativos: `vssadmin.exe`, `wmic.exe` (classe `shadowcopy`), `wbadmin.exe` e `bcdedit.exe`.\n\n' +
      'Por serem ferramentas do próprio Windows, o antivírus pode não reclamar. O que denuncia é o **contexto**: processo pai estranho (`powershell.exe` com `-EncodedCommand`, `cmd.exe` saindo de pasta temporária, um binário desconhecido), conta de usuário comum ou de serviço sem relação com backup, vários desses binários em sequência de segundos, em várias máquinas ao mesmo tempo, fora de janela de mudança.\n\n' +
      'Detecção: Sysmon 1 ou `4688` com esses binários e argumentos de exclusão ou de desligar recuperação; o log de aplicação do VSS; e, no EDR, regra de comportamento que já bloqueia a ação. Esse alerta é **P1 automático**: se ele dispara, a criptografia pode estar a minutos. Isolar primeiro e explicar depois é o raro caso em que o playbook manda correr.\n\n' +
      'E lembre: cópia de sombra não é backup. Backup de verdade fica fora do alcance da máquina infectada (offline ou imutável). A Padaria Migalha de Byte tem EDR e não tem backup. Ninguém conta isso pra ela num dia de Black Friday.',
    chegada: [
      { quem: 'gilmar', texto: 'O Guarita mandou um alerta codificado do NB-FIN-014. Veio de trás para frente e em base64. Até o alerta está com medo.', gesto: 'apontar', expr: 'surpresa' },
      { quem: 'ro', texto: 'O coletor da Tabajara inverte o texto para "proteger" o log. Proteção criativa, utilidade zero.', gesto: 'cruzar' },
      { quem: 'vandeco', texto: 'Quando aparece gente mexendo em cópia de sombra, a cifragem vem logo atrás. É o trovão antes da chuva.', expr: 'neutro' },
      { quem: 'kevin', texto: 'Ferramenta do Windows... falso positivo?', gesto: 'ombros' },
      { quem: 'ro', texto: 'Kevin, decodifica antes de fechar. Hoje não. Hoje não mesmo.', gesto: 'nao', expr: 'bravo' },
    ],
    fila: { quantidade: 7 },
    missoes: [
      {
        tipo: 'decodificar',
        titulo: 'O alerta de trás para frente',
        enunciado: 'O coletor do cliente gravou o texto do alerta em base64 de UTF-16LE e, antes disso, invertido. Use o Canivete para ler.',
        entrada: ENTRADA_EDR,
        receita: ['base64', 'utf16le', 'inverter'],
        pergunta: 'Qual binário nativo o powershell.exe chamou primeiro, segundo o alerta?',
        resposta: 'vssadmin',
        explicacao: 'Base64, depois UTF-16LE (o mesmo formato do `-EncodedCommand`), depois inverter. O alerta mostra `powershell.exe` chamando `vssadmin.exe` para excluir cópias de sombra, seguido de `wbadmin.exe` e `bcdedit.exe`: o pacote clássico de `T1490`. Esse alerta é P1: isolar o NB-FIN-014, procurar a mesma sequência em outras máquinas e acionar a resposta a incidente.',
      },
      {
        tipo: 'quiz',
        titulo: 'Depois de ler o alerta',
        enunciado: 'O texto decodificado mostra a sequência no NB-FIN-014.',
        perguntas: [
          {
            p: 'Qual prioridade e ação são adequadas?',
            opcoes: ['P4, abrir ticket para a semana que vem', 'P1: isolar o host imediatamente e procurar a mesma sequência em outras máquinas', 'P3, pedir para o usuário reiniciar', 'Fechar, porque são ferramentas do Windows'],
            certa: 1,
            explicacao: 'Inibir a recuperação é preparação de ransomware. O tempo entre isso e a cifragem pode ser de minutos.',
          },
          {
            p: 'Por que cópia de sombra não substitui backup?',
            opcoes: ['Porque ocupa pouco espaço', 'Porque fica na mesma máquina e pode ser apagada por quem tiver privilégio nela, como mostra este alerta', 'Porque é mais lenta', 'Substitui, sim'],
            certa: 1,
            explicacao: 'Backup que protege de ransomware fica fora do alcance da máquina infectada: offline, imutável ou em outro domínio de credenciais.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Host isolado em quatro minutos. O tomate nem esquentou.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'kevin', texto: 'Vou colar um post-it no monitor: "ferramenta do Windows não é álibi".', gesto: 'sim' },
    ],
  },
];
