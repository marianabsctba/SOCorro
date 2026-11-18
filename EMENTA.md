# Ementa dos 90 dias

Cada dia: tema da aula, tipo da missão principal e evento. "Bravo" indica dia no SOC de Recife. Quem escreve pode ajustar detalhes, mas não o tema.

## Ato 1: N1 (SOC Alfa, Curitiba)

| Dia | Tema da aula | Missão | Observação |
|---|---|---|---|
| 1 | Integração: o que é SOC, MSSP, N1/N2/N3, turnos 12x36, SLA, NDA | quiz | crachá, tour, Gilmar e o timer |
| 2 | A fila: falso positivo, benigno verdadeiro, verdadeiro positivo | quiz | Rô ensina bufando |
| 3 | Anatomia de um alerta: regra, fonte, severidade, contexto, enriquecimento | quiz | |
| 4 | Logon no Windows: 4624, 4625, 4634, 4672, tipos de logon 2, 3, 7, 10 | siem | |
| 5 | Força bruta x password spraying (4625, 4771, distintos usuários por IP) | siem | |
| 6 | Phishing 1: cabeçalho, Received, Return-Path, SPF, DKIM, DMARC | quiz com anexo | |
| 7 | Ticket bem escrito: o que, quando, onde, evidência, ação, próximo passo | ordenar | "verificado ok" é crime |
| 8 | Passagem de turno com o Thiaguinho (fila de 400) | escolha + quiz | turno da noite |
| 9 | Proxy e categorias de URL (o Spotify não é C2) | siem | |
| 10 | DNS: consultas, TXT, túnel x CDN, tamanho e entropia do subdomínio | siem | |
| 11 | Antivírus x EDR: detecção, bloqueio, quarentena, hash, reputação sem subir arquivo do cliente | quiz | |
| 12 | Viagem impossível, VPN, proxy corporativo e egress de nuvem | quiz | |
| 13 | Playbook x runbook: seguir os passos, quando sair do roteiro | ordenar | |
| 14 | Logs de firewall: allow/deny, portas, varredura (portas distintas por IP) | siem | |
| 15 | Prioridade: impacto x urgência, P1 a P4, severidade da regra mente | quiz | |
| 16 | PowerShell codificado: -EncodedCommand é base64 de UTF-16LE | decodificar | |
| 17 | IOCs e a pirâmide da dor (hash, IP, domínio, artefato, ferramenta, TTP) | quiz | |
| 18 | Black Friday da padaria: WAF, bots, credential stuffing | siem | evento black_friday |
| 19 | Falar com cliente: Dr. Leôncio liga às 3h | escolha | evento plantao, madrugada |
| 20 | Macro do Office: winword.exe abrindo powershell.exe (processo pai) | quiz com anexo Sysmon | |
| 21 | Sysmon: eventos 1, 3, 11, 13, 22 | siem | |
| 22 | Conta de serviço e logon fora do horário com GMUD aprovada (benigno) | quiz | |
| 23 | Scanner de vulnerabilidade autorizado gerando alerta: lista de exceção com validade | quiz | |
| 24 | LGPD no dia a dia do SOC: dado pessoal em ticket, mascarar, minimizar | quiz | |
| 25 | URL ofuscada, encurtador, defang (hxxp, [.]) e codificação de URL | decodificar | |
| 26 | Fadiga de MFA (push bombing) | siem | |
| 27 | Métricas: MTTA, MTTR, volume, taxa de falso positivo (com conta) | quiz | Gilmar feliz |
| 28 | Simulado de phishing interno (benigno, mas reporte é ouro) | escolha + quiz | evento simulado |
| 29 | Saúde mental no turno: fadiga de alerta, pausa, pedir ajuda | escolha | evento happy_hour |
| 30 | Prova para N2 | prova (promoveA N2, nota 70, 10+ perguntas) | |

## Ato 2: N2

| Dia | Tema da aula | Missão | Observação |
|---|---|---|---|
| 31 | O que muda no N2: hipótese, investigação, escopo | quiz | |
| 32 | Linha do tempo de incidente | ordenar | |
| 33 | MITRE ATT&CK: tática x técnica x subtécnica, mapear alertas | quiz | |
| 34 | Tuning 1: a impressora que faz força bruta | regra | |
| 35 | Sigma: logsource, detection, condition, falsos positivos | quiz com anexo | |
| 36 | BEC: sem malware, domínio parecido, troca de conta bancária | quiz com anexo | |
| 37 | Kerberoasting: 4769 com criptografia RC4 (0x17) | siem | |
| 38 | Movimento lateral: logon tipo 3, serviço novo 7045, PsExec | siem | |
| 39 | EDR: árvore de processos, isolar ou não isolar | quiz | |
| 40 | Tuning 2: o "Mimikatz" que é o próprio antivírus | regra | |
| 41 | Enriquecimento: reputação não é veredito, idade de domínio, WHOIS, passivo DNS | quiz | |
| 42 | Exfiltração: bytes por destino, horário, protocolo | siem | |
| 43 | Persistência: chave Run, tarefa agendada 4698, serviço, WMI | quiz | |
| 44 | Webshell em servidor web: logs W3C, POST em .aspx estranho | siem | |
| 45 | Queda do SOC Alfa: BCP, DRP, RTO, RPO, failover | ordenar | evento queda_alfa |
| 46 | Chegada no Bravo: Dona Socorro, processos diferentes, mesma fila | quiz | Bravo |
| 47 | M365: regra de caixa de entrada que encaminha, consentimento OAuth | siem | Bravo |
| 48 | Volta ao Alfa: lições aprendidas do failover | escolha | Bravo |
| 49 | Nuvem: CloudTrail, chave de acesso exposta, bucket público | siem | |
| 50 | Quishing (phishing com QR code) e proxy AiTM roubando sessão | quiz | |
| 51 | DGA e domínios recém-registrados | siem | |
| 52 | Precursores de ransomware: vssadmin, wbadmin, bcdedit | decodificar | |
| 53 | Tuning 3: geolocalização e VPN | regra | |
| 54 | Threat hunting por hipótese | quiz | |
| 55 | Grupos privilegiados alterados: 4728, 4732, 4756 | siem | |
| 56 | Auditoria: evidência, retenção de log, ISO 27001, cadeia de custódia | quiz | evento auditoria e visita_ceo |
| 57 | Engenharia de detecção com a Keyla: falso negativo, cobertura | escolha + quiz | |
| 58 | Ameaça interna: DLP, quem pediu demissão e baixou tudo | siem | |
| 59 | Mentoria: o Kevin novo de novo | escolha | |
| 60 | Prova para N3 | prova (promoveA N3, nota 70, 10+ perguntas) | |

## Ato 3: N3/CSIRT

| Dia | Tema da aula | Missão | Observação |
|---|---|---|---|
| 61 | Ciclo de resposta a incidente (NIST SP 800-61) | ordenar | |
| 62 | Ransomware no hospital, hora zero: achar o paciente zero | siem | |
| 63 | Contenção: segmentar, isolar, não desligar (memória), prioridade clínica | quiz | |
| 64 | Forense de memória: conceitos de pslist, netscan, malfind | quiz com anexo | |
| 65 | EVTX: 1102 log limpo, 4688, 7045 | siem | |
| 66 | Comunicação: jurídico, ANPD em 3 dias úteis, resgate é decisão da diretoria | escolha | |
| 67 | Recuperação: backup 3-2-1, imutável, restauração testada | ordenar | |
| 68 | Pós-incidente sem culpados | quiz | |
| 69 | BEC na cooperativa: os R$ 380 mil do Dr. Leôncio, logs de e-mail | siem | |
| 70 | Proposta do concorrente (R$ 300 a mais) | escolha (flag concorrente) | |
| 71 | Ticket dourado e prata: indícios (4769 sem 4768, tempo de vida estranho) | quiz | |
| 72 | Cadeia de suprimentos: atualização do fornecedor | quiz | |
| 73 | Hunting de beacon: periodicidade e jitter | siem | |
| 74 | Coleta forense: ordem de volatilidade (RFC 3227) | ordenar | |
| 75 | Plantão no Bravo (o mistério do print) | quiz | Bravo, evento plantao |
| 76 | Purple team com o Vandeco: emular e validar detecção | quiz | |
| 77 | IA no SOC: injeção de prompt, alucinação, dado de cliente em ferramenta externa | quiz | Bravo |
| 78 | Vazamento na prefeitura: comunicação aos titulares | escolha | |
| 79 | Crise e imprensa: o vereador no Instagram | escolha | |
| 80 | Nuvem: token roubado, revogar sessões, conditional access | siem | |
| 81 | Relatório executivo para a diretoria | quiz | |
| 82 | Convite para virar coach no TikTok | escolha (flag coach) | |
| 83 | Exercício de mesa (tabletop) com a Tabajara | ordenar | |
| 84 | Concurso público? | escolha (flag concurso) | |
| 85 | Convite para gerente | escolha (flag gerente) | |
| 86 | Engenharia reversa de leve: configuração com XOR | decodificar | |
| 87 | A quadrilha volta, parte 1: prefeitura | siem | |
| 88 | Parte 2: contenção coordenada Alfa e Bravo | ordenar | |
| 89 | Parte 3: relatório final e lições aprendidas | quiz | |
| 90 | Último dia: avaliação, festa, o que vem depois | escolha | evento aniversario |
