// Monta o roteiro que joga vários dias pela interface: node ferramentas/jogar-dias.mjs 2,5,8 > roteiro.json
import { readFileSync } from 'node:fs';
const dias = (process.argv[2] || '1').split(',').map(Number);
const robo = readFileSync(new URL('./robo-dia.js', import.meta.url), 'utf8');
const passos = [
  { espera: 3000 },
  { eval: "__soc.clicar('Verdadeiro positivo')" },
  { espera: 400 },
  { eval: "document.querySelector('#nome').value='Robô'; __soc.clicar('Imprimir')" },
  { espera: 400 },
  { eval: "__soc.clicar('Entendi')" },
  { espera: 600 },
];
for (const d of dias) {
  passos.push({ eval: `__soc.irParaDia(${d}); location.reload(); 'ok'`, rotulo: `ir para o dia ${d}` });
  passos.push({ espera: 5000 });
  passos.push({ eval: robo, rotulo: 'robô carregado' });
  passos.push({ eval: 'window.__robo()', rotulo: `dia ${d}` });
}
console.log(JSON.stringify(passos));
