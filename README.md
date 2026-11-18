# SOCorro

**90 dias dentro de um SOC.** Um curso completo de operações de segurança em forma de jogo 3D no navegador, com muito falso positivo, café, cliente ligando às 3h e humor ácido brasileiro.

**Jogar:** https://marianabsctba.github.io/SOCorro/

Você entra como analista N1 na **Olho Vivo Segurança Gerenciada**, um SOC terceirizado com dois sites redundantes: o **SOC Alfa**, em Curitiba, e o **SOC Bravo**, em Recife. A partir daí pode subir para N2 e N3/CSIRT, continuar N1 para sempre ou largar tudo e ir vender arte na praia.

## Como se joga

Cada dia é um turno. Você chega, ouve a equipe, senta na sua estação e abre o **Vigia**, o SIEM da casa:

- **Fila de alertas:** logs crus de verdade (eventos do Windows, Sysmon, firewall, proxy, DNS, M365, nuvem) com enriquecimento. Você decide se é **falso positivo**, **benigno** (aconteceu, mas era esperado) ou **verdadeiro positivo**, escolhe a justificativa e a ação. Como na vida real, a maior parte é ruído.
- **Missões:** investigação com uma linguagem de consulta que roda de verdade no navegador (`evento=4625 | distintos usuario por ip_origem | onde distintos>5`), decodificação no **Canivete** (Base64, UTF-16LE do PowerShell, URL, hex, XOR), ajuste de regra sem cegar o SOC, linha do tempo, decisões e provas.
- **Wiki do SOC:** a aula do dia. É o curso: IDs de evento, ATT&CK, Sigma, NIST SP 800-61, RFC 3227, LGPD, prazo da ANPD, métricas.

Nos dias 30 e 60 tem prova de promoção. Cuide da energia (café, no máximo 4 por turno) e da sanidade.

Controles: clique para olhar, WASD anda, Shift corre, E interage, Esc pausa. No celular, joystick na esquerda, olhar na direita e botão E.

## O conteúdo

| Ato | Dias | Cargo | O que se aprende |
|---|---|---|---|
| 1 | 1 a 30 | N1 | triagem, logon do Windows, força bruta x spraying, phishing e cabeçalho, ticket, passagem de turno, proxy, DNS, EDR, firewall, PowerShell codificado, IOCs, WAF, Sysmon, LGPD, MFA, métricas |
| 2 | 31 a 60 | N2 | investigação, linha do tempo, ATT&CK, tuning, Sigma, BEC, Kerberoasting, movimento lateral, persistência, webshell, failover para o Bravo, M365, nuvem, quishing, DGA, hunting, auditoria, ameaça interna |
| 3 | 61 a 90 | N3/CSIRT | ransomware num hospital, contenção, forense de memória e de EVTX, comunicação e ANPD, recuperação, pós-incidente, BEC de R$ 380 mil, beacon, cadeia de custódia, purple team, IA no SOC, crise, tabletop, a quadrilha que volta |

São 90 dias, 144 modelos de alerta (N1, N2 e N3), 32 honrarias e 11 finais (promoção a líder do CSIRT, N1 para sempre, arte na praia, demissão, gerente, coach no TikTok, concorrente por R$ 300, concurso público, burnout com galinhas em Minas, mais um ano de 12x36 e um final secreto).

Todas as empresas, pessoas, IPs e domínios são fictícios. Os ataques aparecem só do jeito que o SOC os vê: nos logs.

## Para quem mexe no código

```bash
npm install
npm run dev     # http://localhost:5173/SOCorro/
npm test        # confere que toda missão tem solução e que nenhum texto tem travessão
npm run build
```

- `src/conteudo/`: dias, alertas, honrarias, finais e conversas. O contrato está em `tipos.ts`; tom e elenco em `BIBLIA.md`; a ementa em `EMENTA.md`.
- `src/motor/`: mini-SIEM (`siem.ts`), Canivete, fila, carreira e estado salvo no navegador.
- `src/tres/`: o SOC em 3D (procedural), a equipe com rotina e os humanos animados.
- `src/ui/`: o console do analista e as telas.
- `ferramentas/makehuman/gerar.py`: gera o elenco no Blender com MPFB.

## Créditos

- Pessoas em 3D geradas com [MakeHuman](http://www.makehumancommunity.org/) via MPFB no Blender, com assets CC0.
- Animações da Universal Animation Library, de [Quaternius](https://quaternius.com/) (CC0), adaptadas ao esqueleto do MPFB. Os gestos de escritório (digitar, tomar café, cochilar, falar ao telefone) são montados osso a osso no jogo.
- Texturas de parede do [Poly Haven](https://polyhaven.com/) (CC0). O resto do SOC é procedural.
- Efeitos sonoros CC0 do [OpenGameArt](https://opengameart.org/) e de [Kenney](https://kenney.nl/). O zumbido do ar-condicionado, o teclado dos colegas e o telefone são sintetizados no navegador.
- [Three.js](https://threejs.org/) (MIT).

Powered by Mariana BS.
