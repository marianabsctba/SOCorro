import './estilo.css';
import { iniciar } from './jogo';

iniciar().catch((e) => {
  console.error(e);
  const app = document.getElementById('app');
  if (app) app.innerHTML = `<div class="carregando"><b>SOC<i>orro</i></b><span>Deu ruim no carregamento. Abra um ticket (ou recarregue a página).</span></div>`;
});
