# Bíblia do SOCorro

Guia de tom, mundo e elenco para quem escreve conteúdo. O contrato técnico está em `src/conteudo/tipos.ts`.

## A ideia

90 dias dentro de um SOC de verdade, contados com humor ácido e brasileiro. Quem joga entra como analista N1, pode subir para N2 e N3/CSIRT, ficar N1 para sempre ou largar tudo para vender arte na praia. É um curso completo de SOC disfarçado de jogo: **tudo que se aprende aqui precisa valer na vida prática** (IDs de evento reais, campos de log reais, comandos reais, normas reais, métricas reais).

## Regras de escrita

- Português do Brasil com acentuação correta. **Nunca usar travessão** (nem o longo, nem o meio-travessão; o teste procura os dois). Use vírgula, dois-pontos, parênteses ou frase nova.
- Humor ácido sempre, com a empresa, o cliente, o sistema, a burocracia e a vida de turno. **Nunca** com quem joga, nunca com gênero, raça, corpo ou região. Piada com sotaque ou costume local pode, desde que carinhosa.
- Técnica de verdade: Event ID 4625 é falha de logon, logon tipo 10 é RDP, Sysmon 1 é criação de processo, `-EncodedCommand` é base64 de UTF-16LE, prazo de comunicação à ANPD é de 3 dias úteis (Resolução CD/ANPD nº 15/2024), NIST SP 800-61, RFC 3227, MITRE ATT&CK com IDs certos. Se não tiver certeza de um número, não invente: escreva de forma que continue verdadeiro.
- Defesa sempre. Ataques aparecem como **o que o SOC vê nos logs** e como detectar, conter e responder. Nada de passo a passo ofensivo.
- Dados fictícios: IPs de exemplo, empresas inventadas, pessoas inventadas. Domínios maliciosos inventados (ex.: `boletos-tabajara-2via[.]top`). Nada de chave, token ou senha que pareça real (o GitHub bloqueia segredo no push).
- Gênero de quem joga: `{forma feminina|forma masculina|forma neutra}`, palavra inteira, ex.: `{cansada|cansado|cansade}`, `{a nova analista|o novo analista|e nove analiste}`. Prefira frases neutras ("você", "quem está no turno"); use o marcador só quando precisar. A forma neutra é a piada do sistema de RH, nunca de quem joga.
- `{nome}` é o nome de quem joga. `código` em crase, **negrito** com dois asteriscos.

## O mundo

**Insônia Segurança Gerenciada Ltda.**, um SOC terceirizado (MSSP). Lema no crachá: "Insônia: a gente não dorme (não é escolha)".

- **SOC Alfa, Curitiba.** O principal. Videowall com mapa de ataques que é só animação, ar-condicionado a 16 °C, cadeira gamer com assento rasgado, cafeteira que é o ativo mais crítico do prédio, placa "Dias sem incidente: 0" que ninguém atualiza porque é sempre zero. Garoa na janela.
- **SOC Bravo, Recife.** O site de contingência, ativo-ativo. Calor, ventilador de teto, bolo de rolo na copa, Dona Socorro no comando. Lenda interna: o SOC Bravo é só um print do Alfa (é um final secreto).
- Ferramentas (nomes inventados): **Vigia SIEM** (o SIEM, com mini-linguagem de consulta), **Guarita EDR**, **Canivete** (decodificador), **Chamadão** (sistema de tickets, que cai toda segunda), **Bate-Papo Corporativo** (o chat), **Wiki do SOC** (desatualizada desde 2019).

### Clientes (ids em `ClienteId`)

- `tabajara`: **Tabajara Seguros S.A.**, seguradora de Curitiba. Impressora de 2009, estagiária que saiu de lá (piada interna com o jogo Crachá Provisório), RH que manda planilha com CPF por e-mail.
- `prefeitura`: **Prefeitura de Pindaíba do Sul**. Windows 7 no protocolo, vereador que posta tudo no Instagram, senha `Prefeitura@2019` reaproveitada.
- `hospital`: **Hospital Santa Paciência das Causas Perdidas**. Equipamento médico que não pode reiniciar, plantão 24h, prontuário que não pode parar. Alvo do ransomware no ato 3.
- `cooperativa`: **Cooperativa Agro Pasto Ralo**, interior do Paraná. Diretor Dr. Leôncio, que clica em tudo, liga às 3h e transfere R$ 380 mil num golpe de BEC.
- `padaria`: **Panificadora Migalha de Byte**, rede de padarias com e-commerce. Tem EDR e não tem backup. Black Friday do sonho.
- `insonia`: a própria Insônia (o SOC também é atacado e também gera falso positivo).

## Elenco (ids em `PersonagemId`)

- `gilmar`: **Gilmar**, coordenador do SOC Alfa, 52 anos. Cronometra o MTTR com timer de cozinha em forma de tomate, fala em KPI, ama planilha, no fundo protege a equipe. Bordão: "Abriu ticket? Então não aconteceu."
- `ro`: **Rosângela, a Rô**, N2, 14 anos de turno. Ironia como idioma nativo, sabe tudo, ensina bufando. Bordão: "Falso positivo é igual boleto: sempre tem mais um."
- `vandeco`: **Seu Wanderley, o Vandeco**, CSIRT/N3, 58 anos. Lê PCAP de olho, "já vi esse malware em 2003", café sem açúcar, histórias de guerra intermináveis e sempre úteis.
- `thiaguinho`: **Thiaguinho**, turno da noite, 24 anos. Entrega a fila com 400 alertas e uma coxinha mordida, fecha alerta em lote, dorme de olho aberto. Bom coração, péssimo ticket.
- `keyla`: **Keyla**, engenharia de detecção. Escreve regra que dispara com tudo, defende cada uma como filha. Aprende tuning com você ao longo do jogo.
- `neide`: **Dona Neide**, da limpeza. Sabe a senha do Wi-Fi de todos os andares, já desligou o nobreak para ligar o aspirador, dá os melhores conselhos de vida do prédio.
- `leoncio`: **Dr. Leôncio**, diretor da Cooperativa Agro Pasto Ralo. Clica em tudo, liga às 3h, chama todo mundo de "meu jovem", acha que antivírus é seguro de vida.
- `socorro`: **Dona Socorro**, coordenadora do SOC Bravo (Recife). Calma, firme, resolve. "Aqui a gente não grita com incidente, a gente conversa com ele."
- `nildo`: **Josenildo, o Nildo**, N2 do SOC Bravo. Rápido, engraçado, rivalidade amistosa com Curitiba.
- `kevin`, `brenda`, `jefferson`, `pamela`: colegas N1. Kevin fecha tudo como falso positivo, Brenda escala tudo, Jefferson estuda para concurso no turno, Pâmela é a mais competente e ninguém percebe.
- Também podem falar: `voce` (quem joga), `narrador`, `telefone` (voz do outro lado da linha), `chat` (mensagem no Bate-Papo).

## A carreira

- **Ato 1, N1 (dias 1 a 30):** triagem. Fila cheia de falso positivo, SLA, ticket, passagem de turno. Prova para N2 no dia 30.
- **Ato 2, N2 (dias 31 a 60):** investigação, consultas no Vigia, tuning de regra, ATT&CK, Sigma, phishing e BEC, failover para o SOC Bravo. Prova para N3 no dia 60.
- **Ato 3, N3/CSIRT (dias 61 a 90):** resposta a incidente completa, forense, comunicação, ANPD, hunting, purple team, a quadrilha que volta.

Se a pessoa não passa na prova, continua N1 (ou N2) e recebe o trabalho do nível de cima "sem o salário" (acúmulo de função, piada recorrente). As falas dos dias 31+ não devem pressupor o cargo: falam com quem está no turno.

## Flags de decisão (para os finais)

Use em `efeitos.flag` nas missões de escolha:

- `coach`: aceitou virar coach de carreira no TikTok.
- `concorrente`: aceitou a proposta do concorrente (R$ 300 a mais).
- `gerente`: aceitou virar gerente.
- `concurso`: decidiu estudar para concurso público.
- `ransomware_fechado`: fechou como falso positivo o alerta que era o ransomware (cagada grave).
- `cagada`: qualquer outra cagada grave (ex.: isolou o servidor do prontuário sem avisar).
