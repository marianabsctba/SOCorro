// Ato 2, dias 53 a 60: tuning de geolocalização, hunting, grupos privilegiados, auditoria, engenharia de detecção, ameaça interna, mentoria e prova.
import type { Dia, Registro } from '../../tipos';
import { rng, hora, porHora, USUARIOS } from '../../util';

// ---------- dia 53: geolocalização e VPN ----------
function registrosGeo(): (Registro & { malicioso: 0 | 1 })[] {
  const r = rng(5301);
  const base = '2026-03-24T08:00:00';
  const out: (Registro & { malicioso: 0 | 1 })[] = [];
  for (let i = 0; i < 30; i++) {
    out.push({ hora: hora(base, r.int(0, 36000)), usuario: r.um(USUARIOS), pais: 'Estados Unidos', ip: `152.67.20.${r.int(10, 40)}`, rede: 'vpn_corporativa', app: r.um(['Outlook', 'Teams', 'SharePoint']), mfa: 'aprovado', dispositivo_gerenciado: 'sim', resultado: 'sucesso', malicioso: 0 });
  }
  for (let i = 0; i < 8; i++) {
    out.push({ hora: hora(base, r.int(0, 36000)), usuario: 'paulo.rodrigues', pais: 'Portugal', ip: `89.152.${r.int(1, 254)}.${r.int(1, 254)}`, rede: 'movel', app: r.um(['Outlook', 'Teams']), mfa: 'aprovado', dispositivo_gerenciado: 'sim', resultado: 'sucesso', malicioso: 0 });
  }
  for (let i = 0; i < 6; i++) {
    out.push({ hora: hora(base, r.int(0, 36000)), usuario: r.um(USUARIOS.slice(0, 10)), pais: r.um(['Argentina', 'Uruguai']), ip: `190.${r.int(1, 254)}.${r.int(1, 254)}.${r.int(1, 254)}`, rede: 'residencial', app: 'Teams', mfa: 'aprovado', dispositivo_gerenciado: 'sim', resultado: 'sucesso', malicioso: 0 });
  }
  for (let i = 0; i < 5; i++) {
    out.push({ hora: hora(base, r.int(0, 36000)), usuario: r.um(USUARIOS.slice(0, 10)), pais: 'Paraguai', ip: `181.${r.int(1, 254)}.${r.int(1, 254)}.${r.int(1, 254)}`, rede: 'movel', app: 'Outlook', mfa: 'aprovado', dispositivo_gerenciado: 'não', resultado: 'sucesso', malicioso: 0 });
  }
  out.push({ hora: hora(base, 15000), usuario: 'fernanda.lima', pais: 'Portugal', ip: '185.199.41.7', rede: 'hospedagem', app: 'OfficeHome', mfa: 'aprovado', dispositivo_gerenciado: 'não', resultado: 'sucesso', malicioso: 1 });
  out.push({ hora: hora(base, 21000), usuario: 'carlos.pereira', pais: 'Holanda', ip: '185.107.56.21', rede: 'hospedagem', app: 'IMAP (autenticação legada)', mfa: 'não exigido', dispositivo_gerenciado: 'não', resultado: 'sucesso', malicioso: 1 });
  return porHora(out);
}

// ---------- dia 55: grupos privilegiados ----------
function registrosGrupos(): Registro[] {
  const r = rng(5501);
  const base = '2026-03-26T08:00:00';
  const out: Registro[] = [];
  const gruposComuns = ['GG_Financeiro_Leitura', 'GG_RH_Pastas', 'GG_VPN_Usuarios', 'GG_Impressoras_2Andar', 'GG_Sinistros_Edicao'];
  for (let i = 0; i < 45; i++) {
    out.push({ hora: hora(base, r.int(0, 32000)), evento: 4728, grupo: r.um(gruposComuns), membro: r.um(USUARIOS), alterado_por: r.um(['helpdesk.ana', 'helpdesk.rui']), host: 'SRV-DC-01', ticket: `CHG-${r.int(20000, 29999)}` });
  }
  for (let i = 0; i < 4; i++) {
    out.push({ hora: hora(base, r.int(0, 32000)), evento: 4728, grupo: r.um(gruposComuns), membro: r.um(USUARIOS), alterado_por: 'helpdesk.rui', host: 'SRV-DC-01', ticket: 'nenhum' });
  }
  for (let i = 0; i < 15; i++) {
    out.push({ hora: hora(base, r.int(0, 32000)), evento: 4732, grupo: 'Administradores', membro: 'GG_Suporte_Estacoes', alterado_por: 'svc_sccm', host: r.um(['NB-FIN-014', 'NB-RH-007', 'DT-ATEND-031', 'NB-COM-022']), ticket: `CHG-${r.int(20000, 29999)}` });
  }
  for (let i = 0; i < 8; i++) {
    out.push({ hora: hora(base, r.int(0, 32000)), evento: 4756, grupo: 'UG_Email_Todos', membro: r.um(USUARIOS), alterado_por: 'helpdesk.ana', host: 'SRV-DC-01', ticket: `CHG-${r.int(20000, 29999)}` });
  }
  out.push({ hora: hora(base, 4000), evento: 4728, grupo: 'Domain Admins', membro: 'adm.carlos', alterado_por: 'adm.joao', host: 'SRV-DC-01', ticket: 'CHG-24518' });
  out.push({ hora: hora(base, 18000), evento: 4729, grupo: 'Domain Admins', membro: 'adm.carlos', alterado_por: 'adm.joao', host: 'SRV-DC-01', ticket: 'CHG-24518' });
  out.push({ hora: '2026-03-26T05:47:12Z', evento: 4728, grupo: 'Domain Admins', membro: 'suporte.terceiro', alterado_por: 'adm.joao', host: 'SRV-DC-01', ticket: 'nenhum' });
  out.push({ hora: '2026-03-26T05:48:03Z', evento: 4756, grupo: 'Enterprise Admins', membro: 'suporte.terceiro', alterado_por: 'adm.joao', host: 'SRV-DC-01', ticket: 'nenhum' });
  out.push({ hora: '2026-03-26T05:49:30Z', evento: 4732, grupo: 'Administradores', membro: 'suporte.terceiro', alterado_por: 'adm.joao', host: 'SRV-ARQ-01', ticket: 'nenhum' });
  return porHora(out);
}

// ---------- dia 58: ameaça interna ----------
function registrosDlp(): Registro[] {
  const r = rng(5801);
  const base = '2026-03-30T08:00:00';
  const out: Registro[] = [];
  const acoes = ['download_sharepoint', 'email_externo', 'impressao', 'copia_usb', 'upload_nuvem_pessoal'];
  for (let i = 0; i < 120; i++) {
    const acao = r.um(acoes);
    const pequeno = acao === 'copia_usb' || acao === 'upload_nuvem_pessoal';
    out.push({ hora: hora(base, r.int(0, 36000)), usuario: r.um(USUARIOS), acao, arquivos: r.int(1, pequeno ? 3 : 15), bytes: r.int(20000, pequeno ? 8000000 : 30000000), destino: acao === 'copia_usb' ? 'USB' : acao === 'upload_nuvem_pessoal' ? 'drive-pessoal.exemplo' : acao === 'email_externo' ? 'corretora-parceira.exemplo' : 'interno', classificacao: r.um(['pública', 'interna', 'interna', 'confidencial']) });
  }
  for (let i = 0; i < 6; i++) {
    out.push({ hora: hora(base, r.int(0, 36000)), usuario: 'aline.martins', acao: r.um(['copia_usb', 'upload_nuvem_pessoal']), arquivos: r.int(1, 2), bytes: r.int(100000, 3000000), destino: 'USB', classificacao: 'pública' });
  }
  for (let i = 0; i < 10; i++) {
    out.push({ hora: hora(base, 34000 + i * 120), usuario: 'bruno.carvalho', acao: 'upload_nuvem_pessoal', arquivos: 1, bytes: r.int(200000000, 400000000), destino: 'agencia-video.exemplo', classificacao: 'pública' });
  }
  for (let i = 0; i < 25; i++) {
    out.push({ hora: hora('2026-03-30T22:10:00', i * 90), usuario: 'marcos.gomes', acao: i < 10 ? 'download_sharepoint' : i % 2 ? 'copia_usb' : 'upload_nuvem_pessoal', arquivos: r.int(40, 120), bytes: r.int(150000000, 300000000), destino: i < 10 ? 'interno' : i % 2 ? 'USB' : 'drive-pessoal.exemplo', classificacao: 'confidencial' });
  }
  return porHora(out);
}

export const DIAS_53_60: Dia[] = [
  {
    n: 53,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'O Brasil é grande, a VPN é maior',
    resumo: 'Tuning 3: regra de geolocalização, VPN corporativa, viagem e o MFA que não salva.',
    aula:
      'Regra de "login fora do país" é das mais barulhentas. A **geolocalização de IP é estimativa**: operadora móvel brasileira às vezes aparece em outro país, a **VPN corporativa** sai pela nuvem nos Estados Unidos, gente viaja de verdade. Sem tuning, a regra vira a placa "Dias sem incidente: 0": todo mundo vê e ninguém lê.\n\n' +
      'O tuning bom troca país por **contexto**: tipo de rede (VPN corporativa, residencial, móvel, **hospedagem**), dispositivo gerenciado, MFA, aplicativo, histórico do usuário e viagem registrada. Login vindo de ASN de hospedagem (VPS) quase nunca é funcionário: é proxy, VPN comercial ou infraestrutura de ataque.\n\n' +
      'Duas armadilhas clássicas. **"MFA aprovado, então é legítimo"**: o AiTM do dia 50 entrega login com MFA aprovado. **"O país é o mesmo da viagem"**: o atacante também consegue IP em Portugal. A exclusão de viagem precisa amarrar a pessoa, o país, o período e o dispositivo gerenciado. E **autenticação legada** (IMAP, POP, SMTP AUTH) nem passa por MFA; o certo é bloquear no acesso condicional, não excluir da regra.\n\n' +
      'Toda exclusão de viagem tem **data de validade**. Exceção sem prazo é a lembrança de férias que o atacante usa até o Natal.',
    chegada: [
      { quem: 'keyla', texto: 'A regra de login no exterior disparou 49 vezes. Os Estados Unidos invadiram a Tabajara!', gesto: 'comemorar', expr: 'surpresa' },
      { quem: 'ro', texto: 'Keyla, isso é a VPN corporativa. Ela sai por Miami. A Tabajara inteira mora em Miami, segundo o seu alerta.', gesto: 'cintura' },
      { quem: 'jefferson', texto: 'O paulo.rodrigues está em Lisboa de férias. Ele mandou foto de pastel de nata no grupo.', gesto: 'apontar' },
      { quem: 'vandeco', texto: 'Geolocalização de IP é igual previsão do tempo: ajuda, mas ninguém deveria apostar a vida nela.', expr: 'neutro' },
      { quem: 'gilmar', texto: 'Quero essa regra com metade do barulho até o fim do turno. Sem perder nenhum invasor de verdade.', gesto: 'apontar' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'regra',
        titulo: 'Tuning da regra de login fora do Brasil',
        enunciado: 'A regra alerta todo login com sucesso fora do Brasil. Há VPN corporativa, viagem registrada do paulo.rodrigues (Portugal, notebook da empresa) e gente na fronteira. No meio, duas contas foram usadas por atacante. Escolha as exclusões seguras.',
        regra: 'Login com sucesso em que pais != Brasil: severidade alta, "Acesso internacional suspeito"',
        registros: registrosGeo(),
        exclusoes: [
          { texto: 'Excluir a saída da VPN corporativa (rede=vpn_corporativa)', filtro: 'rede=vpn_corporativa' },
          { texto: 'Excluir a viagem registrada: paulo.rodrigues, em Portugal, com dispositivo gerenciado', filtro: 'usuario=paulo.rodrigues pais=Portugal dispositivo_gerenciado=sim' },
          { texto: 'Excluir dispositivo gerenciado com MFA aprovado', filtro: 'dispositivo_gerenciado=sim mfa=aprovado' },
          { texto: 'Excluir todo login com MFA aprovado', filtro: 'mfa=aprovado' },
          { texto: 'Excluir Portugal, já que tem gente viajando para lá', filtro: 'pais=Portugal' },
        ],
        minReducao: 0.8,
        explicacao: 'VPN corporativa, viagem amarrada a pessoa e dispositivo, e "dispositivo gerenciado com MFA" são exclusões que o atacante não satisfaz nesses dados. Excluir todo MFA aprovado esconderia a fernanda.lima, cuja sessão veio de hospedagem em Portugal com MFA aprovado, o retrato de um AiTM. Excluir Portugal esconderia a mesma coisa. O carlos.pereira entrou por IMAP, autenticação legada sem MFA: isso se resolve bloqueando protocolo legado, não com exclusão. Os cinco logins do Paraguai continuam alertando, e tudo bem: celular pessoal fora do país merece olhar.',
      },
    ],
    saida: [
      { quem: 'keyla', texto: 'De 49 para 7, e os dois ataques continuam lá. Vou emoldurar.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'ro', texto: 'Coloca validade na exceção do paulo. Senão ele volta de Lisboa e a exceção fica de férias para sempre.', gesto: 'apontar' },
    ],
  },
  {
    n: 54,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'Caçar sem esperar o alerta',
    resumo: 'Threat hunting por hipótese: perguntar, procurar, concluir e virar detecção.',
    aula:
      '**Threat hunting** é procurar ameaça que nenhuma regra alertou. Não é olhar log a esmo esperando inspiração: é partir de uma **hipótese** ("se houver Kerberoasting na Tabajara, veremos 4769 com RC4 para muitos SPNs da mesma conta"), saber que dados respondem, procurar e concluir.\n\n' +
      'De onde vêm hipóteses: inteligência de ameaça (o grupo que ataca seguradoras usa tal técnica), lacunas de cobertura no ATT&CK (o que não temos regra para pegar), incidentes recentes de outros clientes e anomalias no ambiente. Uma técnica muito útil é o **empilhamento** (stacking): contar quantas máquinas têm cada valor (processo, serviço, tarefa agendada) e olhar a cauda, o que aparece em uma ou duas máquinas só.\n\n' +
      'Hunting que não achou nada **não é tempo perdido**, desde que fique registrado: hipótese, dados usados, período, consultas e conclusão. Ele mostra que a técnica não estava presente naquele período, ou que faltava dado para responder (e isso é um achado: lacuna de visibilidade).\n\n' +
      'O melhor fim de um hunting é virar **detecção automática**, para ninguém precisar caçar a mesma coisa de novo na mão. Caçador bom deixa armadilha no caminho. Caçador ruim só volta para casa contando história de pescador.',
    chegada: [
      { quem: 'vandeco', texto: 'Hoje ninguém espera alerta. Hoje a gente vai caçar. Peguem café, hipótese e paciência.', gesto: 'apontar' },
      { quem: 'thiaguinho', texto: 'Caçar o quê? Eu trouxe só a coxinha.', gesto: 'ombros' },
      { quem: 'ro', texto: 'Caçar o que as regras da Keyla não pegam. Tem bastante, pode ficar tranquilo.', gesto: 'cruzar' },
      { quem: 'keyla', texto: 'Ei! Mas tudo bem, se acharem eu transformo em regra. Com tuning dessa vez.', expr: 'sorriso' },
      { quem: 'pamela', texto: 'Eu fiz empilhamento das tarefas agendadas do parque. Tem uma que aparece em três máquinas só, com nome de Adobe.', gesto: 'pensar' },
    ],
    fila: { quantidade: 7 },
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Montando uma caçada',
        enunciado: 'O Vandeco quer uma caçada na Tabajara, que sofreu Kerberoasting e webshell no último mês.',
        perguntas: [
          {
            p: 'Qual destas é uma hipótese de hunting bem formulada?',
            opcoes: ['"Vou olhar os logs para ver se acho algo estranho."', '"Se houver outra webshell nos servidores IIS, veremos `w3wp.exe` criando `cmd.exe` ou `powershell.exe` no EDR nos últimos 30 dias."', '"Os hackers estão aqui."', '"Vou rodar todas as regras de novo."'],
            certa: 1,
            explicacao: 'Hipótese de hunting diz o comportamento, onde ele aparece e o período. Assim dá para saber quais dados consultar e quando parar.',
          },
          {
            p: 'O que é empilhamento (stacking)?',
            opcoes: ['Empilhar alertas para fechar em lote', 'Contar a frequência de um valor (processo, serviço, tarefa) no parque e investigar o que é raro', 'Colocar vários monitores um em cima do outro', 'Somar a severidade dos alertas'],
            certa: 1,
            explicacao: 'O que está em 3 mil máquinas costuma ser o padrão. O que aparece em 3 é a cauda, onde o estranho costuma estar.',
          },
          {
            p: 'A caçada não achou nada. O que fazer?',
            opcoes: ['Apagar as consultas e fingir que não aconteceu', 'Registrar hipótese, dados, período, consultas e conclusão, incluindo lacunas de visibilidade encontradas', 'Repetir até achar alguma coisa', 'Abrir incidente mesmo assim'],
            certa: 1,
            explicacao: 'Resultado negativo documentado é informação. E descobrir que faltava log para responder é um achado que vira melhoria.',
          },
          {
            p: 'Qual é o melhor desfecho de uma caçada que encontrou algo?',
            opcoes: ['Contar para a equipe no café', 'Tratar o incidente e transformar o padrão em detecção automática, testada', 'Guardar a consulta no bloco de notas', 'Mandar o print para o cliente'],
            certa: 1,
            explicacao: 'O ciclo fecha quando a descoberta manual vira regra: na próxima vez, o alerta chega sozinho.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'vandeco', texto: 'A tarefa "Adobe" das três máquinas era um minerador de cripto. Caça boa. Volto a contar dessa em 2040.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'thiaguinho', texto: 'Eu ajudei comendo a coxinha em silêncio. Concentração também é trabalho em equipe.', gesto: 'sim' },
    ],
  },
  {
    n: 55,
    site: 'alfa',
    turno: 'madrugada',
    titulo: 'Admin de madrugada',
    resumo: 'Grupos privilegiados alterados: 4728, 4732 e 4756, ticket e horário.',
    aula:
      'Colocar uma conta em grupo privilegiado é o atalho preferido de quem quer ficar no ambiente (`T1098`, Account Manipulation). O Windows registra no controlador de domínio: **4728** (membro adicionado a grupo **global** de segurança, como Domain Admins), **4732** (grupo **local** de domínio ou local da máquina, como Administradores) e **4756** (grupo **universal**, como Enterprise Admins). As remoções correspondentes são 4729, 4733 e 4757.\n\n' +
      'Os campos que importam: quem alterou (`SubjectUserName`), quem entrou (`MemberName` ou `MemberSid`), qual grupo (`TargetUserName`) e em qual máquina. Cruze com a **gestão de mudanças**: alteração em Domain Admins sem ticket aprovado, de madrugada, para uma conta de terceiro, é alerta de alta prioridade, venha de quem vier.\n\n' +
      'Grupos que merecem regra própria: Domain Admins, Enterprise Admins, Schema Admins, Administrators do domínio, Account Operators, Backup Operators, DnsAdmins e Group Policy Creator Owners. Também vale monitorar alteração no `AdminSDHolder`, que propaga permissões para as contas protegidas.\n\n' +
      'Se a conta que alterou é de um administrador real, a hipótese não é "o admin enlouqueceu", é "a credencial do admin está com outra pessoa". Confirme com ele por telefone, não pelo chat. Às 2h47 da manhã, admin de verdade está dormindo ou trabalhando com ticket aberto.',
    chegada: [
      { quem: 'narrador', texto: 'Madrugada. A garoa bate na janela, o ar-condicionado faz um ruído de turbina e alguém virou Domain Admin.' },
      { quem: 'thiaguinho', texto: 'Tem um monte de 4728. Deve ser o helpdesk trabalhando até tarde. Gente dedicada.', gesto: 'ombros' },
      { quem: 'ro', texto: 'O helpdesk da Tabajara vai embora às 18h e não sabe nem o caminho do estacionamento depois disso.', gesto: 'cruzar' },
      { quem: 'telefone', texto: 'Meu jovem, é o Leôncio. Não é nada da cooperativa, só não consegui dormir e lembrei de vocês.' },
      { quem: 'vandeco', texto: 'Procura grupo de admin sem ticket. Admin sem ticket de madrugada é igual visita sem convite: alguém abriu a porta.', expr: 'neutro' },
    ],
    fila: { quantidade: 6 },
    missoes: [
      {
        tipo: 'siem',
        titulo: 'Quem virou admin sem pedir',
        enunciado: 'Alterações de grupo no AD da Tabajara (4728, 4729, 4732, 4756). Toda mudança legítima tem ticket CHG. O helpdesk às vezes esquece o ticket em grupo comum, o que é ruim, mas não é o foco agora.',
        registros: registrosGrupos(),
        pergunta: 'Qual conta foi adicionada ao Domain Admins sem ticket?',
        resposta: 'suporte.terceiro',
        gabarito: 'grupo=*Admins ticket=nenhum | tabela hora,evento,grupo,membro,alterado_por | ordenar hora',
        dica: 'Filtre grupos privilegiados e mudanças sem ticket: `grupo=*Admins ticket=nenhum`. Depois `| tabela hora,evento,grupo,membro,alterado_por | ordenar hora`.',
        explicacao: 'Às 02:47 (horário de Brasília) a conta `adm.joao` adicionou `suporte.terceiro` ao Domain Admins (4728), um minuto depois ao Enterprise Admins (4756) e em seguida aos Administradores locais do SRV-ARQ-01 (4732), tudo sem ticket. A entrada do adm.carlos tem CHG e foi removida (4729) no mesmo dia, como manda a mudança. Próximo passo: remover a `suporte.terceiro` dos grupos (documentando), confirmar com o adm.joao por telefone e tratar a credencial dele como comprometida até prova em contrário.',
      },
    ],
    saida: [
      { quem: 'thiaguinho', texto: 'Liguei pro adm.joao. Ele estava dormindo e acordou bem bravo. Mas não foi ele.', gesto: 'pensar' },
      { quem: 'ro', texto: 'Então a credencial dele passeou sozinha. Escala pra resposta a incidente e anota o horário da ligação.', gesto: 'apontar' },
    ],
  },
  {
    n: 56,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'Auditoria com o CEO no corredor',
    resumo: 'Evidência, retenção de log, ISO 27001 e cadeia de custódia, com visita ilustre.',
    aula:
      'Auditor não quer saber se o SOC é bom, quer **evidência** de que o SOC faz o que diz que faz: ticket com horário, consulta registrada, relatório assinado, exceção com validade, revisão periódica feita. A frase "a gente sempre faz assim" não é evidência, é depoimento.\n\n' +
      'A **ISO/IEC 27001:2022** traz no Anexo A controles que o SOC encosta todo dia: **8.15** registro de eventos (logging), **8.16** monitoramento de atividades, **8.17** sincronização de relógio, **5.24 a 5.28** gestão de incidentes, incluindo **5.28** coleta de evidências. Relógio sincronizado é controle, e não só manha do Vandeco.\n\n' +
      'Retenção de log vem de contrato, de norma e de lei. No Brasil, o **Marco Civil da Internet** (Lei 12.965/2014) manda o provedor de conexão guardar registros por 1 ano (art. 13) e o provedor de aplicação por 6 meses (art. 15). O contrato do MSSP costuma pedir mais. Log que não existe mais não ajuda investigação nenhuma, e log guardado demais com dado pessoal sem motivo também é problema de LGPD.\n\n' +
      '**Cadeia de custódia** é o registro de quem coletou, quando, como, onde guardou e quem manipulou cada evidência. No processo penal brasileiro ela está nos arts. 158-A a 158-F do Código de Processo Penal (incluídos pela Lei 13.964/2019). Na prática do SOC: calcular **hash** (SHA-256) na coleta, guardar cópia de trabalho separada da original e anotar cada passo. Evidência sem cadeia vira opinião com anexo.',
    chegada: [
      { quem: 'gilmar', texto: 'Atenção: hoje tem auditoria. E o CEO da Insônia vai passar pelo corredor. Escondam a cadeira rasgada.', gesto: 'apontar', expr: 'surpresa' },
      { quem: 'ro', texto: 'E a placa de "Dias sem incidente: 0"? Viramos para a parede ou atualizamos para zero de novo?', gesto: 'cruzar' },
      { quem: 'jefferson', texto: 'ISO 27001 cai em concurso! Finalmente meu estudo serve para o trabalho.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'neide', texto: 'O CEO pediu a senha do Wi-Fi. Eu dei a dos visitantes. Ele ficou ofendido.', gesto: 'ombros' },
      { quem: 'vandeco', texto: 'Auditor é igual sogra: não adianta arrumar só a sala, ela vai abrir o armário.', expr: 'neutro' },
    ],
    fila: { quantidade: 7 },
    evento: 'auditoria',
    missoes: [
      {
        tipo: 'quiz',
        titulo: 'Perguntas da auditora',
        enunciado: 'A auditora pede evidências enquanto o CEO observa do corredor, segurando um café da cafeteira nova.',
        perguntas: [
          {
            p: 'A auditora pergunta como você prova que o alerta crítico de ontem foi tratado dentro do SLA. O que mostrar?',
            opcoes: ['Contar como foi', 'O ticket com horário de criação, de reconhecimento, ações registradas e encerramento, ligado ao alerta do Vigia', 'Um print do videowall', 'A palavra do Gilmar'],
            certa: 1,
            explicacao: 'Evidência é registro verificável com horário. O ticket ligado ao alerta mostra MTTA e MTTR reais.',
          },
          {
            p: 'Qual controle do Anexo A da ISO/IEC 27001:2022 trata de sincronização de relógio?',
            opcoes: ['5.1', '8.17', '6.3', '7.4'],
            certa: 1,
            explicacao: 'O controle 8.17 (Clock synchronization). Sem relógio sincronizado, a linha do tempo de um incidente não fecha e o log perde valor como evidência.',
          },
          {
            p: 'Pelo Marco Civil da Internet, por quanto tempo o provedor de aplicação deve guardar os registros de acesso?',
            opcoes: ['30 dias', '6 meses', '5 anos', 'Para sempre'],
            certa: 1,
            explicacao: 'Art. 15 da Lei 12.965/2014: 6 meses para provedor de aplicação. O provedor de conexão guarda registros de conexão por 1 ano (art. 13). Contratos podem exigir mais.',
          },
          {
            p: 'Você coletou um arquivo de log para um caso que pode virar processo. O que garante a cadeia de custódia?',
            opcoes: ['Salvar na área de trabalho com nome "evidencia_final_2"', 'Calcular o hash na coleta, registrar quem, quando e como coletou, guardar a original protegida e trabalhar numa cópia', 'Mandar por e-mail para todo mundo para não perder', 'Imprimir'],
            certa: 1,
            explicacao: 'O hash prova que o arquivo não mudou; o registro de cada manuseio prova quem teve acesso. É o que os arts. 158-A a 158-F do CPP exigem no processo penal.',
          },
          {
            p: 'A auditora encontra uma exclusão de regra criada em 2021, sem dono e sem validade. Qual é a falha?',
            opcoes: ['Nenhuma, exclusão velha é exclusão testada', 'Falta governança: toda exceção precisa de dono, justificativa, ticket e data de revisão', 'A regra está velha demais', 'Faltou colocar ATT&CK'],
            certa: 1,
            explicacao: 'Exceção eterna é ponto cego permanente. A revisão periódica com evidência é o que a auditoria procura.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'A auditora elogiou nossos tickets. O CEO elogiou o café. Dia histórico.', gesto: 'comemorar', expr: 'sorriso' },
      { quem: 'ro', texto: 'E ninguém sentou na cadeira rasgada. Isso também entra no relatório?', expr: 'neutro' },
    ],
  },
  {
    n: 57,
    site: 'alfa',
    turno: 'tarde',
    titulo: 'O alerta que não tocou',
    resumo: 'Engenharia de detecção com a Keyla: falso negativo, cobertura e teste de regra.',
    aula:
      'Falso positivo incomoda. **Falso negativo** mata: é o ataque que aconteceu e nenhuma regra viu. Ele não aparece em painel nenhum, por isso só se descobre de três jeitos: incidente que chega por fora (o cliente liga), hunting e **teste de detecção**.\n\n' +
      'Engenharia de detecção trata regra como código: tem requisito (qual técnica, em qual fonte), **teste com amostra verdadeira** (o evento que precisa disparar) e **amostra benigna** (o que não pode disparar), revisão por outra pessoa, versão e documentação. Projetos abertos de emulação, como o Atomic Red Team, geram atividade controlada mapeada no ATT&CK para validar se a regra acorda.\n\n' +
      '**Cobertura** não é "tenho uma regra com o ID da técnica". Cobertura real considera: a fonte de log existe e chega ao SIEM? Os campos estão mapeados? A regra dispara com variações (outro nome de arquivo, outro processo pai)? O alerta chega a alguém dentro do SLA? Matriz ATT&CK toda pintada de verde com regra que nunca foi testada é só arte abstrata.\n\n' +
      'Monitore também a **saúde das fontes**: um coletor parado faz todas as regras daquela fonte virarem falso negativo de uma vez, em silêncio. Alerta de "fonte sem eventos há X horas" é das regras mais valiosas e menos glamourosas do SOC.',
    chegada: [
      { quem: 'keyla', texto: 'Descobri uma coisa horrível: a minha regra de webshell não pegou a webshell da Tabajara. Ela nunca disparou.', expr: 'triste' },
      { quem: 'ro', texto: 'Bem-vinda ao falso negativo, Keyla. Ele não faz barulho. É por isso que ele é perigoso.', gesto: 'sim' },
      { quem: 'keyla', texto: 'O EDR do servidor manda o processo pai como `ParentProcessName` e a regra procura `ParentImage`.', gesto: 'pensar' },
      { quem: 'vandeco', texto: 'Regra sem teste é promessa de político: bonita, e ninguém sabe se funciona.', expr: 'neutro' },
      { quem: 'gilmar', texto: 'Quero um plano para isso não se repetir. Com planilha. E com quem está no turno ajudando, cargo oficial ou acúmulo de função.', gesto: 'apontar' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'escolha',
        titulo: 'Ajudando a Keyla',
        enunciado: 'A Keyla pede sua opinião sobre o que fazer primeiro.',
        opcoes: [
          {
            texto: 'Criar um processo de teste: cada regra nova ou alterada roda com uma amostra que deve disparar e outra que não deve, antes de ir para produção.',
            reacao: [
              { quem: 'keyla', texto: 'Teste de unidade para regra! Vou fazer para todas as minhas filhas.', gesto: 'comemorar', expr: 'sorriso' },
              { quem: 'ro', texto: 'Finalmente a gente vai saber quais filhas trabalham.', gesto: 'cruzar' },
            ],
            efeitos: { reputacao: 10, energia: -5 },
          },
          {
            texto: 'Criar alerta de saúde das fontes: avisar quando um coletor ficar horas sem mandar evento.',
            reacao: [
              { quem: 'vandeco', texto: 'Essa é a regra mais chata e mais útil do mundo. Aprovada.', gesto: 'sim' },
              { quem: 'keyla', texto: 'Ela já descobriu que o coletor da padaria está parado desde terça.', expr: 'surpresa' },
            ],
            efeitos: { reputacao: 10 },
          },
          {
            texto: 'Pintar a matriz ATT&CK de verde para o relatório do cliente e resolver depois.',
            reacao: [
              { quem: 'ro', texto: 'Matriz verde e regra quebrada. É a definição de maquiagem.', gesto: 'nao', expr: 'bravo' },
              { quem: 'gilmar', texto: 'O cliente ia gostar. Até o próximo incidente.', expr: 'triste' },
            ],
            efeitos: { reputacao: -10, sanidade: -5 },
          },
        ],
      },
      {
        tipo: 'quiz',
        titulo: 'Falso negativo e cobertura',
        enunciado: 'Responda sobre a regra de webshell que não disparou.',
        perguntas: [
          {
            p: 'Por que a regra não disparou?',
            opcoes: ['Porque não existia webshell', 'Porque o campo esperado (`ParentImage`) não existe naquela fonte; a regra nunca casou com nada', 'Porque a severidade estava baixa', 'Porque era madrugada'],
            certa: 1,
            explicacao: 'Mapeamento de campo errado é causa clássica de falso negativo. Teste com evento real da própria fonte teria mostrado antes.',
          },
          {
            p: 'O que é cobertura de detecção de verdade?',
            opcoes: ['Ter uma regra com o ID de cada técnica', 'Fonte chegando, campos mapeados, regra testada com variações e alerta chegando a alguém dentro do SLA', 'Ter muitas regras', 'Ter a matriz colorida'],
            certa: 1,
            explicacao: 'Cada elo pode quebrar: fonte, campo, lógica, roteamento do alerta. Só o teste ponta a ponta mostra que a técnica é detectada.',
          },
          {
            p: 'Qual é um jeito seguro de validar se a regra dispara?',
            opcoes: ['Esperar um ataque real', 'Emular a técnica em ambiente controlado e autorizado, com testes mapeados no ATT&CK, e conferir o alerta', 'Pedir para o Kevin clicar em phishing', 'Desligar o EDR e ver o que acontece'],
            certa: 1,
            explicacao: 'Emulação autorizada e controlada gera exatamente o evento que a regra precisa ver, sem risco para o cliente.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'keyla', texto: 'Arrumei o campo e testei. Ela disparou na primeira. Chorei um pouquinho.', expr: 'sorriso' },
      { quem: 'neide', texto: 'Chorar de alegria no trabalho é raro, {nome}. Guarda esse dia.', gesto: 'acenar' },
    ],
  },
  {
    n: 58,
    site: 'alfa',
    turno: 'noite',
    titulo: 'A despedida com pendrive',
    resumo: 'Ameaça interna: DLP, aviso prévio e quem baixou tudo antes de sair.',
    aula:
      '**Ameaça interna** é quem já tem acesso legítimo e usa para o mal (ou por descuido). O caso mais comum no SOC: a pessoa pediu demissão, vai para o concorrente e leva a carteira de clientes. O acesso é válido, o login é normal, o antivírus não vê nada. Quem vê é o **DLP** (prevenção de perda de dados) e a correlação com o RH.\n\n' +
      'Sinais: volume muito acima do histórico da pessoa, **download em massa** do SharePoint ou do servidor de arquivos (`T1213`, Data from Information Repositories), cópia para **USB** (`T1052.001`), upload para **nuvem pessoal** (`T1567.002`), e-mail para conta pessoal, tudo concentrado depois do aviso prévio e em horário estranho. Arquivo classificado como **confidencial** pesa mais que vídeo institucional.\n\n' +
      'Ruído comum: marketing subindo vídeo pesado para a agência, gente copiando apresentação pública para o pendrive do evento. Por isso o contexto do RH (quem está de saída) e a **classificação** do dado contam mais que o tamanho bruto.\n\n' +
      'Cuidado jurídico: investigação de funcionário envolve LGPD, política interna e, às vezes, direito do trabalho. O SOC **registra fatos e preserva evidência**; quem decide medida disciplinar é RH e jurídico. Nada de confrontar a pessoa pelo chat. E nada de olhar o conteúdo pessoal dela além do necessário, por mais curiosidade que dê.',
    chegada: [
      { quem: 'thiaguinho', texto: 'O DLP da Tabajara está gritando. Alguém está copiando o mundo para um pendrive.', gesto: 'apontar', expr: 'surpresa' },
      { quem: 'ro', texto: 'O RH avisou semana passada que o marcos.gomes e a aline.martins pediram demissão. Coincidência é uma palavra bonita.', gesto: 'cruzar' },
      { quem: 'jefferson', texto: 'Pedir demissão é um direito. Levar a carteira de clientes no bolso já é outro artigo.', gesto: 'pensar' },
      { quem: 'vandeco', texto: 'Ameaça interna não invade nada. Ela só usa o crachá até o último dia. Às vezes até depois.', expr: 'neutro' },
      { quem: 'gilmar', texto: 'Só fatos no ticket. Nada de opinião sobre o caráter de ninguém. O jurídico lê tudo.', gesto: 'nao' },
    ],
    fila: { quantidade: 8 },
    missoes: [
      {
        tipo: 'siem',
        titulo: 'Quem levou mais na saída',
        enunciado: 'Eventos de DLP da Tabajara. Estão de aviso prévio: `marcos.gomes` e `aline.martins`. O marketing (`bruno.carvalho`) sobe vídeos grandes para a agência todo dia.',
        registros: registrosDlp(),
        pergunta: 'Entre quem está de aviso prévio, quem tirou mais bytes por USB ou nuvem pessoal?',
        resposta: 'marcos.gomes',
        gabarito: 'usuario=marcos.gomes OU usuario=aline.martins | onde acao=copia_usb OU acao=upload_nuvem_pessoal | somar bytes por usuario | ordenar -soma',
        dica: 'Filtre as duas pessoas com `usuario=marcos.gomes OU usuario=aline.martins`, depois as saídas com `| onde acao=copia_usb OU acao=upload_nuvem_pessoal` e some: `| somar bytes por usuario | ordenar -soma`.',
        explicacao: 'O marcos.gomes baixou centenas de arquivos confidenciais do SharePoint às 22h e, logo depois, copiou para USB e subiu para nuvem pessoal, em sequência, cerca de 3 GB. A aline.martins copiou poucos arquivos públicos. O bruno.carvalho tem volume maior, mas de vídeo público para a agência, no horário de trabalho. Próximos passos: preservar os logs com hash, registrar só fatos no ticket e acionar RH e jurídico conforme o procedimento do cliente. Bloqueio de USB e de acesso é decisão deles, com o SOC executando.',
      },
    ],
    saida: [
      { quem: 'thiaguinho', texto: 'Escrevi o ticket só com fatos. Foi difícil não colocar um emoji de olhinho.', gesto: 'pensar' },
      { quem: 'ro', texto: 'O emoji de olhinho é o primeiro passo para depor em audiência. Fez bem.', gesto: 'sim', expr: 'sorriso' },
    ],
  },
  {
    n: 59,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'O Kevin de novo',
    resumo: 'Mentoria: ensinar quem chegou agora, sem bufar (ou bufando pouco).',
    aula:
      'Todo SOC vive de transferência de conhecimento. A pessoa que entrou ontem vai cometer os mesmos erros que todo mundo cometeu, e a pergunta é se ela vai cometê-los num ticket de treino ou num incidente do hospital. **Mentoria** é parte do trabalho de quem já sabe, não favor.\n\n' +
      'Técnicas que funcionam: **parear** no alerta (a pessoa nova pilota, você navega), pedir que ela explique o raciocínio antes de dar a resposta, transformar erro em checklist ("antes de fechar como falso positivo: conferi origem, conta, processo pai e histórico?") e revisar ticket com comentário específico, não com "tá errado".\n\n' +
      '**Segurança psicológica** é o que faz a pessoa nova perguntar em vez de chutar. Quem tem medo de parecer burro fecha alerta para não perguntar, e o custo disso aparece como falso negativo no mês seguinte. Errar no SOC é normal; esconder o erro é que é grave.\n\n' +
      'Documente o que você explica mais de duas vezes: vira página na Wiki do SOC (que precisa mesmo de alguma página escrita depois de 2019). Quem ensina aprende duas vezes, e quem documenta não precisa ensinar a terceira.',
    chegada: [
      { quem: 'gilmar', texto: 'Contratamos um N1 novo. Ele também se chama Kevin. Não é parente. O RH achou engraçado.', gesto: 'ombros' },
      { quem: 'kevin', texto: 'Agora tem dois Kevin. Eu sou o Kevin que aprendeu a não fechar tudo como falso positivo. Mais ou menos.', gesto: 'acenar', expr: 'sorriso' },
      { quem: 'ro', texto: 'O Kevin novo já fechou três alertas em lote e perguntou onde fica a máquina de salgado. Está indo rápido.', gesto: 'cruzar' },
      { quem: 'gilmar', texto: 'Quero que quem está no turno acompanhe o novato hoje. Sim, é acúmulo de função. Sim, eu sei. Sim, vai ter bolo.', gesto: 'apontar' },
      { quem: 'pamela', texto: 'Eu fiz um checklist de triagem para os novos. Ninguém leu, mas está lá.', gesto: 'pensar' },
    ],
    fila: { quantidade: 7 },
    missoes: [
      {
        tipo: 'escolha',
        titulo: 'O novato fechou o alerta errado',
        enunciado: 'O Kevin novo fechou como falso positivo um alerta de `powershell -enc` vindo do Word. Era verdadeiro positivo, e você pegou na revisão. Como você conduz?',
        opcoes: [
          {
            texto: 'Sentar junto, reabrir o alerta, pedir que ele explique o raciocínio e montar com ele um checklist de "antes de fechar".',
            reacao: [
              { quem: 'kevin', texto: 'O novo disse que nunca tinha ouvido falar de processo pai. Agora ele fala disso no almoço.', expr: 'sorriso' },
              { quem: 'ro', texto: 'Mentoria sem bufar. Estou chocada e um pouco orgulhosa.', gesto: 'sim' },
            ],
            efeitos: { reputacao: 10, sanidade: 5, energia: -5 },
          },
          {
            texto: 'Corrigir o ticket sozinho e não falar nada para não constranger.',
            reacao: [
              { quem: 'ro', texto: 'Bonito, mas amanhã ele fecha outro igual. Erro corrigido em silêncio é erro que volta.', gesto: 'nao' },
              { quem: 'gilmar', texto: 'O MTTR ficou ótimo. A lição, nem tanto.', expr: 'neutro' },
            ],
            efeitos: { reputacao: -5 },
          },
          {
            texto: 'Mostrar a Pâmela e o checklist dela para o novato, e pedir que os dois revisem juntos os próximos dez alertas.',
            reacao: [
              { quem: 'pamela', texto: 'Alguém leu meu checklist! E ainda me chamou para ensinar. Vou contar para minha mãe.', gesto: 'comemorar', expr: 'sorriso' },
              { quem: 'vandeco', texto: 'Dar crédito para quem fez é a parte da mentoria que ninguém ensina. Bem lembrado.', expr: 'neutro' },
            ],
            efeitos: { reputacao: 10, sanidade: 5 },
          },
          {
            texto: 'Mandar no grupo do turno: "olha o que o novato fez" com print.',
            reacao: [
              { quem: 'socorro', texto: 'Vi daqui de Recife. Exposição em grupo não ensina, só faz a pessoa esconder o próximo erro.', gesto: 'nao', expr: 'bravo' },
              { quem: 'kevin', texto: 'Já fizeram isso comigo. Eu parei de perguntar por seis meses.', expr: 'triste' },
            ],
            efeitos: { reputacao: -15, sanidade: -10 },
          },
        ],
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Amanhã é a prova. Quem passar vira N3 de verdade. Quem não passar continua fazendo o trabalho do N3 sem o salário, como manda a tradição.', gesto: 'apontar' },
      { quem: 'neide', texto: 'Dorme bem hoje, {nome}. Prova boa se faz com café e com sono, nessa ordem não.', gesto: 'acenar', expr: 'sorriso' },
    ],
  },
  {
    n: 60,
    site: 'alfa',
    turno: 'manhã',
    titulo: 'Prova para N3',
    resumo: 'A prova que separa quem investiga de quem só investiga e não recebe por isso.',
    aula:
      'Revisão do ato: investigação começa por **hipótese** e cresce por **pivôs** até fechar o **escopo**; linha do tempo só fecha com tudo em **UTC**. **ATT&CK** organiza o comportamento em tática, técnica e subtécnica. **Tuning** bom usa exclusão específica, com dono e validade, e nunca esconde o ataque; **Sigma** documenta e porta detecção.\n\n' +
      'Nos logs do Windows: **4769 com 0x17** para muitos SPNs é Kerberoasting; **4624 tipo 3 + 7045** em sequência é movimento lateral; **Sysmon 10** no LSASS pede exclusão por caminho e assinatura; **Sysmon 13, 4698, 7045 e Sysmon 19 a 21** são persistência; **4728, 4732 e 4756** são grupos privilegiados.\n\n' +
      'Fora do Windows: **W3C** com POST de um IP só em `.aspx` estranho é webshell; **bytes enviados** de madrugada para destino novo é exfiltração; regra de caixa de entrada com **ForwardTo** externo e consentimento OAuth são persistência em e-mail; **CloudTrail** com `GetCallerIdentity` e rajada de `AccessDenied` é credencial exposta; **NXDOMAIN** em massa de um host é DGA; `vssadmin`, `wbadmin` e `bcdedit` fora de contexto é **P1**. **BEC** passa em SPF, DKIM e DMARC; **AiTM** passa no MFA comum.\n\n' +
      'E o que não é log: **RTO e RPO**, failover com canal alternativo, lições aprendidas **sem culpados**, evidência com **cadeia de custódia**, ameaça interna com RH e jurídico. Boa prova. O tomate está ligado.',
    chegada: [
      { quem: 'gilmar', texto: 'Dia de prova. Nota mínima 70. Liguei o tomate, mas é só de enfeite. Ou não.', gesto: 'apontar' },
      { quem: 'ro', texto: 'Respira. Você já fez tudo isso de verdade nos últimos trinta dias. A prova só pede para escrever.', gesto: 'sim', expr: 'sorriso' },
      { quem: 'vandeco', texto: 'Na minha prova para N3, em 2004, a pergunta era "o que é isso?" e um disquete. Vocês estão com sorte.', expr: 'neutro' },
      { quem: 'thiaguinho', texto: 'Trouxe coxinha da sorte. Inteira dessa vez.', gesto: 'comemorar' },
      { quem: 'socorro', texto: 'Recife está torcendo. Sem gritar, mas torcendo.', gesto: 'acenar' },
    ],
    fila: { quantidade: 6 },
    missoes: [
      {
        tipo: 'prova',
        titulo: 'Prova de promoção para N3',
        enunciado: 'Quinze perguntas sobre investigação, detecção e resposta. Nota mínima: 70.',
        notaMinima: 70,
        promoveA: 'N3',
        perguntas: [
          {
            p: 'Qual frase é uma hipótese de investigação?',
            opcoes: ['"Deve ser ataque."', '"A conta camila.ribeiro foi usada de outro host: os 4769 vêm de um IP que não é a estação dela."', '"Vou olhar tudo."', '"O SIEM está errado."'],
            certa: 1,
            explicacao: 'Hipótese testável diz o que os dados mostrariam se ela fosse verdadeira.',
          },
          {
            p: 'O gateway de e-mail registra 11:12 UTC e o Sysmon registra 08:19 BRT. Qual veio primeiro?',
            opcoes: ['O Sysmon', 'O e-mail (08:12 BRT)', 'Aconteceram juntos', 'Não dá para saber'],
            certa: 1,
            explicacao: '11:12 UTC são 08:12 em Brasília (UTC-3), sete minutos antes do evento do Sysmon.',
          },
          {
            p: 'Password spraying é qual subtécnica do ATT&CK?',
            opcoes: ['T1110.001', 'T1110.003', 'T1078', 'T1003.001'],
            certa: 1,
            explicacao: '`T1110.003`: uma senha em muitas contas. `T1110.001` é guessing, muitas senhas na mesma conta.',
          },
          {
            p: 'A impressora gera 4625 sem parar com a conta svc_scanner. Qual exclusão é segura?',
            opcoes: ['usuario=svc_*', 'logon_tipo=3', 'usuario=svc_scanner host_origem=IMP-2ANDAR-01', 'status=0xC000006A'],
            certa: 2,
            explicacao: 'Combinar conta e origem cala só a impressora. As outras escondem spraying.',
          },
          {
            p: 'Numa regra Sigma, o que faz a lista em `falsepositives`?',
            opcoes: ['Exclui os itens da detecção', 'Só documenta; quem exclui é um filtro usado na `condition`', 'Muda a severidade', 'Desliga a regra'],
            certa: 1,
            explicacao: '`falsepositives` avisa quem lê. A exclusão de verdade é um bloco de filtro com `not` na condição.',
          },
          {
            p: 'Vários 4769 da mesma conta, para nove SPNs diferentes em 30 segundos, com criptografia 0x17. O que é?',
            opcoes: ['Login normal', 'Kerberoasting (T1558.003)', 'Password spraying', 'Golden ticket'],
            certa: 1,
            explicacao: 'RC4 pedido para muitos serviços em sequência é o padrão de quem quer quebrar a senha das contas de serviço fora da rede.',
          },
          {
            p: 'Que eventos em sequência no host de destino indicam uso de PsExec?',
            opcoes: ['4625 e 4740', '4624 tipo 3, 5145 em ADMIN$ e 7045 com o serviço PSEXESVC', '4688 do notepad', '1102'],
            certa: 1,
            explicacao: 'Logon de rede, gravação do binário no compartilhamento administrativo e instalação do serviço.',
          },
          {
            p: 'Para excluir o antivírus de uma regra de acesso ao LSASS (Sysmon 10), o que usar?',
            opcoes: ['O nome do processo', 'Caminho completo e assinatura (ou hash)', 'Toda assinatura da Microsoft', 'O host'],
            certa: 1,
            explicacao: 'Nome qualquer um copia, e binário assinado da Microsoft (como rundll32) também é usado em dump de LSASS.',
          },
          {
            p: 'Um domínio de 2 dias tem 0 detecções em serviços de reputação. Conclusão?',
            opcoes: ['É seguro', 'Ausência de informação; decidir com idade, DNS passivo, hospedagem e contexto', 'É malicioso', 'Subir o arquivo do cliente para confirmar'],
            certa: 1,
            explicacao: 'Reputação não é veredito. E arquivo de cliente não vai para serviço público.',
          },
          {
            p: 'Sysmon 19, 20 e 21 indicam qual persistência?',
            opcoes: ['Chave Run', 'Assinatura de eventos WMI (T1546.003)', 'Tarefa agendada', 'Serviço'],
            certa: 1,
            explicacao: 'Filtro (19), consumidor (20) e ligação entre eles (21).',
          },
          {
            p: 'RTO de 2 horas e RPO de 15 minutos significam:',
            opcoes: ['Voltar em até 2 horas, perdendo no máximo 15 minutos de dados', 'Voltar em 15 minutos, perdendo 2 horas', 'Testar o plano a cada 2 horas', 'Backup a cada 2 horas'],
            certa: 0,
            explicacao: 'RTO é tempo para voltar; RPO é quanto dado, medido em tempo, pode ser perdido.',
          },
          {
            p: 'Uma regra de caixa de entrada nova encaminha e-mails com "boleto" e "PIX" para um domínio gratuito. Além de remover a regra, o que é essencial?',
            opcoes: ['Só trocar a senha', 'Revogar sessões e tokens, remover consentimentos OAuth suspeitos e procurar regras iguais em outras caixas', 'Desligar o Outlook', 'Nada, a regra já foi removida'],
            certa: 1,
            explicacao: 'Sessão roubada e aplicativo autorizado sobrevivem à troca de senha.',
          },
          {
            p: 'No CloudTrail, `GetCallerIdentity` seguido de uma rajada de `AccessDenied` de um IP novo sugere:',
            opcoes: ['Pipeline com defeito', 'Credencial exposta sendo testada por terceiro', 'Atualização da AWS', 'Usuário esqueceu a senha do console'],
            certa: 1,
            explicacao: '"Quem sou eu" e depois tentativa e erro do que a credencial alcança. Desative a credencial e revise o que deu certo.',
          },
          {
            p: 'Por que o MFA por código não impede um phishing AiTM?',
            opcoes: ['Porque o código expira', 'Porque o proxy repassa o login real e captura o cookie de sessão depois do MFA', 'Porque o AiTM quebra criptografia', 'Impede, sim'],
            certa: 1,
            explicacao: 'O atacante usa a sessão autenticada. MFA resistente a phishing (FIDO2) não responde em domínio falso.',
          },
          {
            p: 'Alguém foi adicionado ao Domain Admins às 2h47, sem ticket, por um admin real. Qual é a hipótese de trabalho?',
            opcoes: ['O admin trabalhou até tarde', 'Credencial do admin comprometida até confirmação por canal independente', 'Erro do log', 'Benigno, porque o admin é real'],
            certa: 1,
            explicacao: 'Evento 4728 em grupo privilegiado fora de mudança aprovada é alta prioridade. Confirme por telefone e trate como comprometida enquanto isso.',
          },
        ],
      },
    ],
    saida: [
      { quem: 'gilmar', texto: 'Prova entregue. Seja qual for a nota, amanhã tem fila. E o tomate continua contando.', gesto: 'sim' },
      { quem: 'ro', texto: 'O ato 2 acabou. O que vem agora é maior, mais quente e tem hospital no meio. Dorme.', expr: 'neutro' },
      { quem: 'vandeco', texto: 'Passando ou não, agora você já viu coisa que eu só vi em 2003. Isso não sai do currículo.', expr: 'sorriso' },
    ],
  },
];
