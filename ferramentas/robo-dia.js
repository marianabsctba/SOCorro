// Robô que joga o dia atual pela interface de verdade (cliques no DOM), do menu até o fechamento.
// É injetado pelo ferramentas/jogar-dias.mjs depois de cada recarga. Devolve um resumo do que viu.
window.__robo = async function jogarDia(fotos = {}) {
  const w = (ms) => new Promise((r) => setTimeout(r, ms));
  const s = window.__soc;
  const q = (sel) => document.querySelector(sel);
  const problemas = [];
  const esperarAte = async (cond, ms = 15000) => {
    const t0 = performance.now();
    while (!cond()) {
      if (performance.now() - t0 > ms) return false;
      await w(150);
    }
    return true;
  };
  // clica nas falas até a cena acabar de verdade (entre uma fala e outra a pessoa pode estar andando)
  const passarDialogos = async (ms = 90000) => {
    const t0 = performance.now();
    await w(300);
    while (performance.now() - t0 < ms) {
      if (q('.dialogo')) {
        q('.dialogo').click();
        await w(450);
        continue;
      }
      if (s.modo !== 'cena') return;
      await w(200);
    }
    problemas.push('diálogo não terminou');
  };

  // menu: continuar a carreira
  if (!(await esperarAte(() => q('[data-r="continuar"]')))) return { erro: 'menu sem continuar' };
  q('[data-r="continuar"]').click();
  if (!(await esperarAte(() => [...document.querySelectorAll('.cartao button')].some((b) => b.innerText.includes('ponto de entrada'))))) return { erro: 'sem cartão do dia' };
  const cartao = q('.cartao')?.innerText.split('\n').slice(0, 3).join(' | ');
  s.clicar('ponto de entrada');
  await w(1200);
  await passarDialogos();
  if (!(await esperarAte(() => s.modo === 'livre'))) problemas.push('não voltou ao modo livre: ' + s.modo);
  s.interagir('estacao');
  if (!(await esperarAte(() => q('.console')))) return { erro: 'console não abriu', cartao };
  const t = s.turno;
  const dia = t.dia.n;

  // fila: responde certo (o objetivo é exercitar a interface, não a pontuação)
  for (let i = 0; i < t.fila.length; i++) {
    q(`[data-al="${i}"]`)?.click();
    await w(80);
    const m = t.fila[i].modelo;
    q(`[data-ver="${m.veredito}"]`)?.click();
    await w(60);
    const j = t.fila[i].justificativas.findIndex((x) => x.certa);
    q(`[data-just="${j}"]`)?.click();
    await w(60);
    if (m.veredito === 'tp') {
      q(`[data-acao="${s.estado().nivel === 'N1' ? 'escalar' : m.acao}"]`)?.click();
      await w(60);
    }
    const b = q('[data-a="fechar-alerta"]');
    if (!b || b.disabled) problemas.push(`alerta ${m.id}: não deu para fechar`);
    b?.click();
    await w(100);
    if (!t.fila[i].resposta) problemas.push(`alerta ${m.id}: sem resposta`);
  }

  // missões, cada tipo do seu jeito
  for (let i = 0; i < t.missoes.length; i++) {
    const em = t.missoes[i];
    const m = em.m;
    q('[data-aba="missoes"]')?.click();
    await w(100);
    q(`[data-mi="${i}"]`)?.click();
    await w(150);
    if (fotos[m.tipo]) {
      window.__fotoPedida = `${dia}_${m.tipo}`;
      await w(1500);
    }
    if (m.tipo === 'quiz' || m.tipo === 'prova') {
      for (let k = 0; k < m.perguntas.length; k++) {
        q(`[data-perg="${k}"][data-op="${m.perguntas[k].certa}"]`)?.click();
        await w(60);
      }
      if (m.tipo === 'prova') {
        q('[data-a="entregar-prova"]')?.click();
        await w(150);
      }
    } else if (m.tipo === 'siem' || m.tipo === 'decodificar') {
      // abre a ferramenta e volta, para exercitar o caminho que a pessoa faz
      q(m.tipo === 'siem' ? '[data-a="abrir-vigia"]' : '[data-a="abrir-canivete"]')?.click();
      await w(150);
      if (m.tipo === 'siem') {
        const c = q('#consulta');
        if (c) c.value = m.gabarito;
        s.clicar('Rodar consulta');
        await w(200);
        if (q('.retorno.ruim')) problemas.push(`dia ${dia}: gabarito deu erro no Vigia`);
      }
      q('[data-aba="missoes"]')?.click();
      await w(100);
      q(`[data-mi="${i}"]`)?.click();
      await w(100);
      const r = q('#resp');
      if (r) r.value = m.resposta;
      q('[data-a="responder-siem"],[data-a="responder-dec"]')?.click();
      await w(150);
    } else if (m.tipo === 'ordenar') {
      for (let alvo = 0; alvo < m.itens.length; alvo++) {
        let p = em.respostas.ordem.indexOf(alvo);
        while (p > alvo) {
          q(`[data-sobe="${p}"]`)?.click();
          await w(40);
          p--;
        }
      }
      q('[data-a="conferir-ordem"]')?.click();
      await w(150);
    } else if (m.tipo === 'regra') {
      const ataques = m.registros.filter((r) => r.malicioso);
      m.exclusoes.forEach((x, k) => {
        const segura = !ataques.some((r) => s.filtro(x.filtro, r));
        const cb = q(`[data-excl="${k}"]`);
        if (cb && segura) {
          cb.checked = true;
          cb.dispatchEvent(new Event('change'));
        }
      });
      q('[data-a="aplicar-regra"]')?.click();
      await w(150);
    } else if (m.tipo === 'escolha') {
      // a primeira opção que não liga final nem pesa na sanidade
      const k = Math.max(0, m.opcoes.findIndex((o) => !o.efeitos?.flag && (o.efeitos?.sanidade ?? 0) >= 0));
      q(`[data-esc="${k}"]`)?.click();
      await w(150);
    }
    if (!em.feita) problemas.push(`dia ${dia}: missão ${i + 1} (${m.tipo}) não concluiu`);
    else if (em.max && em.pontos < em.max) problemas.push(`dia ${dia}: missão ${i + 1} (${m.tipo}) ${em.pontos}/${em.max} mesmo respondendo certo`);
  }

  // encerra, ouve a saída e lê o fechamento
  const enc = q('[data-a="encerrar"]');
  if (!enc || enc.disabled) problemas.push('não dá para encerrar o turno');
  enc?.click();
  await w(800);
  await passarDialogos();
  if (!(await esperarAte(() => [...document.querySelectorAll('.cartao button')].some((b) => /Ir para casa/.test(b.innerText)), 20000))) return { dia, erro: 'sem tela de fechamento', problemas };
  const fechamento = q('.cartao').innerText.replace(/\s+/g, ' ').slice(0, 260);
  s.clicar('Ir para casa');
  await w(1500);
  const final = q('.final') ? q('.final').innerText.split('\n').slice(0, 3).join(' | ') : null;
  return { dia, cartao, alertas: t.fila.length, missoes: t.missoes.map((x) => `${x.m.tipo}:${x.pontos}/${x.max}`).join(' '), fechamento, final, problemas };
};
'ok';
