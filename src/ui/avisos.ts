// Avisos no canto da tela: honrarias novas e recados rápidos.
import { HONRARIA_POR_ID } from '../conteudo/honrarias';
import { tirarNovas } from '../motor/carreira';
import { esc } from '../motor/texto';
import * as Som from '../motor/som';

export function aviso(titulo: string, texto: string, icone = '📣', ms = 5200) {
  const box = document.getElementById('avisos');
  if (!box) return;
  const d = document.createElement('div');
  d.className = 'aviso';
  d.innerHTML = `<span class="ic">${icone}</span><b>${esc(titulo)}</b>${esc(texto)}`;
  box.append(d);
  setTimeout(() => d.remove(), ms);
}

export function avisarNovas() {
  for (const id of tirarNovas()) {
    const h = HONRARIA_POR_ID.get(id);
    if (!h) continue;
    Som.promocao();
    aviso(`Honraria: ${h.nome}`, h.descricao, h.icone, 7000);
  }
}
