// Telas 2D: menu, crachá (nome e gênero), cartão do dia, fechamento do turno, pausa e finais.
import type { Dia } from '../conteudo/tipos';
import { FINAIS } from '../conteudo/finais';
import { HONRARIAS } from '../conteudo/honrarias';
import { estado, media, type Genero } from '../motor/estado';
import { cargo, esc, fmt, personaliza } from '../motor/texto';
import * as Som from '../motor/som';

const app = () => document.getElementById('app')!;

function camada(html: string, cls = 'veu'): HTMLElement {
  const d = document.createElement('div');
  d.className = cls;
  d.innerHTML = html;
  app().append(d);
  return d;
}

// linhas de log que aparecem sendo "digitadas" na primeira página
const LOG_ABERTURA = [
  '07:00:00  olhovivo-soc-alfa  EventID=4624 LogonType=2  usuario=voce  resultado=SUCESSO',
  '07:00:01  vigia-siem         fila=412 alertas  falso_positivo=71%  cafe=0',
  '07:00:02  sentinela-edr      host=NB-SOC-15  cadeira=rasgada  severidade=baixa',
  '07:00:03  chamadao           status=FORA_DO_AR  motivo="é segunda-feira"',
  '07:00:04  gilmar             "abriu ticket? então não aconteceu."',
  '07:00:05  telefone           origem=Dr. Leoncio  horario=03:12  tentativas=7',
  '07:00:06  vigia-siem         regra=NOVO_ANALISTA_NA_FILA  disparou=1  confianca=alta',
];

const TICKER = [
  'Mimikatz detectado (era o antivírus)',
  'Viagem impossível: Curitiba → Orlando em 4 min (era a VPN)',
  'Força bruta na Tabajara (era a impressora de 2009)',
  'Túnel DNS suspeito (era o Spotify)',
  'Dr. Leôncio clicou em "veja sua multa"',
  'MFA aprovado na 21ª notificação',
  'Thiaguinho fechou 400 alertas em lote',
  'Cafeteira ligada no nobreak',
  'Dias sem incidente: 0',
];

/** primeira página: a pessoa "classifica" o próprio alerta de chegada */
export function menuInicial(temSave: boolean, diaSave: number): Promise<'novo' | 'continuar'> {
  return new Promise((res) => {
    const d = camada(
      `<div class="abertura">
        <div class="ab-alerta">
          <div class="ab-faixa"><span class="ab-pisca"></span>Alerta #000001 · crítico · Vigia SIEM · SOC Alfa</div>
          <div class="ab-corpo">
            <div class="ab-meta"><span>regra: NOVO_ANALISTA_NA_FILA</span><span>ATT&amp;CK: TA0001 (você entrou)</span><span>cliente: todos</span></div>
            <h1 class="ab-titulo">SOC<i>orro</i></h1>
            <p class="ab-sub">90 dias num SOC de verdade. Falso positivo, café queimado, cliente ligando às 3h e um curso completo de operações de segurança escondido dentro de um jogo.</p>
            <pre class="ab-log" aria-hidden="true"></pre>
            <div class="ab-pergunta">Classifique este alerta:</div>
            <div class="ab-acoes">
              ${temSave ? `<button class="ab-bt ab-tp" data-r="continuar"><b>Verdadeiro positivo</b><span>voltar ao turno do dia ${diaSave}</span></button>` : ''}
              <button class="ab-bt ${temSave ? 'ab-bp' : 'ab-tp'}" data-r="novo"><b>${temSave ? 'Benigno' : 'Verdadeiro positivo'}</b><span>${temSave ? 'apagar tudo e começar outra carreira' : 'assumir o turno e bater o primeiro ponto'}</span></button>
              <button class="ab-bt ab-fp" data-r="como"><b>Falso positivo</b><span>preciso ler o playbook antes (como se joga)</span></button>
            </div>
          </div>
        </div>
        <div class="ab-ticker"><div class="ab-rolo">${[...TICKER, ...TICKER].map((t) => `<span>⚠ ${t}</span>`).join('')}</div></div>
        <div class="ab-assina">
          <span class="ab-powered">Powered by <b>Mariana BS</b></span>
          <span class="ab-aviso">Olho Vivo Segurança Gerenciada é fictícia, assim como clientes, IPs e tragédias · <a href="https://github.com/marianabsctba/SOCorro" target="_blank" rel="noopener">código</a></span>
        </div>
      </div>`,
      'menu',
    );
    // o log vai sendo escrito, linha a linha, como um SIEM ao vivo
    const pre = d.querySelector('.ab-log') as HTMLElement;
    let linha = 0;
    let col = 0;
    const tique = window.setInterval(() => {
      if (!d.isConnected || linha >= LOG_ABERTURA.length) {
        clearInterval(tique);
        return;
      }
      col += 3;
      const feitas = LOG_ABERTURA.slice(0, linha).join('\n');
      pre.textContent = (feitas ? feitas + '\n' : '') + LOG_ABERTURA[linha].slice(0, col) + '▌';
      if (col >= LOG_ABERTURA[linha].length) {
        linha++;
        col = 0;
      }
    }, 28);
    d.querySelectorAll<HTMLElement>('[data-r]').forEach((b) =>
      b.addEventListener('click', async () => {
        Som.clique();
        const r = b.dataset.r!;
        if (r === 'como') {
          await comoSeJoga();
          return;
        }
        if (r === 'novo' && temSave && !confirm('Começar de novo apaga a carreira salva. Tem certeza?')) return;
        clearInterval(tique);
        d.remove();
        res(r as 'novo' | 'continuar');
      }),
    );
  });
}

export function comoSeJoga(): Promise<void> {
  return new Promise((res) => {
    const d = camada(`<div class="cartao"><h2>Como se joga</h2>
      <p>Cada dia é um turno no SOC. Você chega, ouve o briefing da equipe, senta na sua estação (o post-it amarelo diz "SUA ESTAÇÃO") e abre o <b>Vigia</b>.</p>
      <p><b>Fila:</b> cada alerta tem logs crus e enriquecimento. Você decide se é <b>falso positivo</b> (a regra viu errado), <b>benigno</b> (aconteceu, mas era esperado) ou <b>verdadeiro positivo</b> (e qual ação tomar). A justificativa vale ponto também.</p>
      <p><b>Missões:</b> investigações no Vigia com consultas de verdade, decodificação no Canivete, ajuste de regra, perguntas, decisões. A <b>Wiki do SOC</b> tem a aula do dia: é o curso.</p>
      <p>Nos dias 30 e 60 tem prova de promoção. Passou, sobe. Não passou, faz o trabalho de cima sem o salário de cima, como manda a tradição.</p>
      <p>Cuide da <b>energia</b> (café na copa, no máximo 4 por turno) e da <b>sanidade</b>. Bata o ponto no relógio ao lado da porta quando terminar.</p>
      <p class="fraco">Controles: clique na tela para olhar com o mouse, WASD anda, Shift corre, E interage, Esc pausa. No celular: arraste à esquerda para andar, à direita para olhar, botão E para interagir.</p>
      <div class="linha-bt"><button class="bt">Entendi</button></div></div>`);
    d.querySelector('button')!.addEventListener('click', () => {
      d.remove();
      res();
    });
  });
}

export function cracha(): Promise<{ nome: string; genero: Genero }> {
  return new Promise((res) => {
    let genero: Genero = 'f';
    const d = camada(`<div class="cartao"><span class="etiqueta rosa">RH · Olho Vivo</span><h2>Seu crachá</h2>
      <p class="fraco">O sistema do RH é de 2011 e só aceita três formas de tratamento. Ele também não aceita acento no nome, mas a gente aceita.</p>
      <h3>Nome no crachá</h3><input class="campo" id="nome" maxlength="24" placeholder="como a equipe vai te chamar">
      <h3>O crachá te chama de</h3>
      <div class="opcoes" id="gen">
        <button class="opcao sel" data-g="f">a analista</button>
        <button class="opcao" data-g="m">o analista</button>
        <button class="opcao" data-g="n">e analiste <span class="fraco">(o sistema do RH travou, mas aceitou)</span></button>
      </div>
      <div class="linha-bt"><button class="bt" id="ok">Imprimir crachá (de papelão)</button></div></div>`);
    d.querySelectorAll<HTMLElement>('[data-g]').forEach((b) =>
      b.addEventListener('click', () => {
        genero = b.dataset.g as Genero;
        d.querySelectorAll('[data-g]').forEach((x) => x.classList.toggle('sel', x === b));
        Som.clique();
      }),
    );
    const ok = () => {
      const nome = (d.querySelector('#nome') as HTMLInputElement).value.trim() || 'Analista';
      d.remove();
      res({ nome, genero });
    };
    d.querySelector('#ok')!.addEventListener('click', ok);
    d.querySelector('#nome')!.addEventListener('keydown', (e) => (e as KeyboardEvent).key === 'Enter' && ok());
    (d.querySelector('#nome') as HTMLInputElement).focus();
  });
}

const ICONE_TURNO = { manhã: '🌅', tarde: '☀️', noite: '🌙', madrugada: '🦉' };

export function cartaoDia(dia: Dia): Promise<void> {
  return new Promise((res) => {
    const e = estado();
    const d = camada(`<div class="cartao"><div class="dia-num">Dia ${dia.n}<small> de 90</small></div>
      <h2>${esc(dia.titulo)}</h2><p>${fmt(dia.resumo)}</p>
      <div class="meta" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px"><span class="etiqueta rosa">${ICONE_TURNO[dia.turno]} turno da ${dia.turno}</span><span class="etiqueta">SOC ${dia.site === 'alfa' ? 'Alfa · Curitiba' : 'Bravo · Recife'}</span><span class="etiqueta">${cargo(e.nivel)}</span><span class="etiqueta">${dia.fila.quantidade} alertas na fila · ${dia.missoes.length} missão(ões)</span></div>
      <div class="linha-bt"><button class="bt">Bater o ponto de entrada</button></div></div>`);
    d.querySelector('button')!.addEventListener('click', () => {
      Som.ponto();
      d.remove();
      res();
    });
  });
}

export function fechamento(info: { dia: Dia; nota: number; alertas: number; acertos: number; missoes: number; promovido?: string; reprovou?: boolean; honrarias: string[] }): Promise<void> {
  return new Promise((res) => {
    const e = estado();
    const frase =
      info.nota >= 90 ? 'O Gilmar parou o timer de tomate e sorriu. Ninguém sabe o que isso significa.' : info.nota >= 70 ? 'Turno honesto. O ticket ficou bem escrito, o café acabou na hora certa.' : info.nota >= 45 ? 'Deu para o gasto. A Rô suspirou de um jeito neutro, o que é quase um elogio.' : 'Dia difícil. Amanhã a fila vai estar lá de novo, mas você também.';
    const hs = info.honrarias.map((id) => HONRARIAS.find((h) => h.id === id)).filter(Boolean);
    const d = camada(`<div class="cartao"><span class="etiqueta rosa">Fim do dia ${info.dia.n}</span><h2>Ponto batido.</h2><p class="fraco">${frase}</p>
      <div class="placar"><div><b>${info.nota}</b><span>nota do dia</span></div><div><b>${info.acertos}/${info.alertas}</b><span>alertas certos</span></div><div><b>${media()}</b><span>média geral</span></div><div><b>${e.sanidade}</b><span>sanidade</span></div></div>
      ${info.promovido ? `<div class="retorno bom"><b>Promoção: ${cargo(info.promovido as 'N2')}.</b> ${info.promovido === 'N3' ? 'Bem-vind{a|o|e} ao CSIRT. O Vandeco te ofereceu café sem açúcar. É um rito, aceite.' : 'Você saiu da fila. A fila não saiu de você.'}</div>` : ''}
      ${info.reprovou ? `<div class="retorno ruim"><b>Não passou na prova.</b> Continua ${cargo(e.nivel)}. O trabalho do nível de cima continua vindo, porque o SOC não espera ninguém.</div>` : ''}
      ${hs.length ? `<h3>Honrarias do dia</h3><div class="honras">${hs.map((h) => `<div class="honra"><span class="ic">${h!.icone}</span><div><b>${esc(h!.nome)}</b><div class="fraco">${esc(h!.descricao)}</div></div></div>`).join('')}</div>` : ''}
      <div class="linha-bt"><button class="bt">Ir para casa (dormir 6 horas, se der)</button></div></div>`);
    d.innerHTML = personaliza(d.innerHTML);
    d.querySelector('button')!.addEventListener('click', () => {
      d.remove();
      res();
    });
  });
}

export function telaFinal(id: string): Promise<void> {
  return new Promise((res) => {
    const f = FINAIS[id] ?? FINAIS.pleno;
    const e = estado();
    const total = Object.keys(e.honrarias).length;
    const d = camada(`<div class="cartao final" style="border-color:${f.cor}"><div class="ic">${f.icone}</div><span class="etiqueta" style="color:${f.cor}">Final</span><h2>${esc(f.titulo)}</h2><p class="fraco">${esc(f.subtitulo)}</p>
      ${f.texto.map((t) => `<p>${fmt(t)}</p>`).join('')}
      <div class="placar"><div><b>${e.notas.length}</b><span>dias trabalhados</span></div><div><b>${media()}</b><span>média</span></div><div><b>${cargo(e.nivel)}</b><span>cargo final</span></div><div><b>${total}/${HONRARIAS.length}</b><span>honrarias</span></div></div>
      <p class="fraco">Existem 11 finais. Este foi um deles.</p>
      <div class="linha-bt"><button class="bt">Voltar ao menu</button></div></div>`);
    d.querySelector('button')!.addEventListener('click', () => {
      d.remove();
      res();
    });
  });
}

export function pausa(): Promise<'voltar' | 'praia' | 'menu' | 'como'> {
  return new Promise((res) => {
    const p = Som.preferencias();
    const d = camada(`<div class="cartao"><h2>Pausa para o café</h2><p class="fraco">O SLA continua correndo. Brincadeira. Aqui ele para.</p>
      <h3>Som</h3><label style="display:flex;gap:10px;align-items:center"><input type="range" min="0" max="1" step="0.05" value="${p.volume}" id="vol"> volume</label>
      <label style="display:flex;gap:10px;align-items:center;margin-top:6px"><input type="checkbox" id="mudo" ${p.mudo ? 'checked' : ''}> sem som</label>
      <div class="linha-bt"><button class="bt" data-r="voltar">Voltar ao turno</button><button class="bt sec" data-r="como">Como se joga</button><button class="bt sec" data-r="menu">Salvar e sair para o menu</button></div>
      <h3>Largar tudo</h3><p class="fraco">Existe vida fora do SOC. Ela fica em Itacaré e vende quadro na areia.</p>
      <div class="linha-bt"><button class="bt perigo" data-r="praia">Largar tudo e vender arte na praia</button></div></div>`);
    d.querySelector('#vol')!.addEventListener('input', (e) => Som.ajustar({ volume: Number((e.target as HTMLInputElement).value) }));
    d.querySelector('#mudo')!.addEventListener('change', (e) => Som.ajustar({ mudo: (e.target as HTMLInputElement).checked }));
    d.querySelectorAll<HTMLElement>('[data-r]').forEach((b) =>
      b.addEventListener('click', () => {
        const r = b.dataset.r as 'voltar' | 'praia' | 'menu' | 'como';
        if (r === 'praia' && !confirm('Tem certeza? O Dr. Leôncio vai sentir sua falta (às 3h da manhã).')) return;
        d.remove();
        res(r);
      }),
    );
  });
}
