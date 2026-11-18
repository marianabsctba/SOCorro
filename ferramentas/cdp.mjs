// Teste no navegador de verdade: Edge headless com GPU, controlado por CDP.
// Uso: node tools/cdp.mjs <url> <roteiro.json> <pasta-de-saida>
// Roteiro: lista de passos { "eval": "expr" } | { "espera": ms } | { "foto": "nome.png" } | { "tecla": "KeyE", "segura": ms }
import { spawn, execSync } from 'node:child_process';
import { rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';

const [url, roteiroArq, saida = 'D:/Temp/soc'] = process.argv.slice(2);
mkdirSync(saida, { recursive: true });
const porta = 9400 + Math.floor(Math.random() * 500);
const perfil = 'D:/Temp/soc/cdp/perfil' + Date.now();
const matar = () => { try { execSync(`powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='msedge.exe'\\" | Where-Object { $_.CommandLine -like '*soc/cdp/perfil*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`, { stdio: 'ignore' }); } catch { /* nada */ } };
spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`, '--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--window-size=1280,720', 'about:blank']);
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
await esperar(2500);
const alvos = await (await fetch(`http://127.0.0.1:${porta}/json`)).json();
const ws = new WebSocket(alvos.find((a) => a.type === 'page').webSocketDebuggerUrl);
let id = 0; const pend = {};
const env = (method, params = {}) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend[m.id]) { pend[m.id](m.result ?? m.error); delete pend[m.id]; }
  if (m.method === 'Page.javascriptDialogOpening') ws.send(JSON.stringify({ id: ++id, method: 'Page.handleJavaScriptDialog', params: { accept: true, promptText: '0x2a' } }));
  if (m.method === 'Runtime.exceptionThrown') console.log('EXCEÇÃO:', m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text);
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) console.log('CONSOLE', m.params.type, m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 300));
};
await new Promise((r) => { ws.onopen = r; });
await env('Page.enable'); await env('Runtime.enable');
// página sempre ativa e com foco: sem isso o navegador sem tela congela os quadros entre uma foto e outra
await env('Emulation.setFocusEmulationEnabled', { enabled: true }).catch(() => {});
await env('Page.bringToFront').catch(() => {});
const LARG = Number(process.env.LARG || 1280), ALT = Number(process.env.ALT || 720);
await env('Emulation.setDeviceMetricsOverride', { width: LARG, height: ALT, deviceScaleFactor: 1, mobile: LARG < 700 });
await env('Page.navigate', { url });
const inicio = Date.now();
for (;;) {
  const r = await env('Runtime.evaluate', { expression: process.env.PRONTO || '!!window.__soc', returnByValue: true });
  if (r?.result?.value && r.result.value !== 'carregando') break;
  if (Date.now() - inicio > 90000) { console.log('carregamento não terminou'); break; }
  await esperar(400);
}
console.log('carregou em', ((Date.now() - inicio) / 1000).toFixed(1), 's');
const roteiro = JSON.parse(readFileSync(roteiroArq, 'utf8'));
for (const p of roteiro) {
  if (p.espera) await esperar(p.espera);
  if (p.eval) {
    const r = await env('Runtime.evaluate', { expression: p.eval, returnByValue: true, awaitPromise: true });
    const v = r?.result?.value ?? r?.exceptionDetails?.exception?.description ?? r?.result?.description;
    console.log('>', p.rotulo || p.eval.slice(0, 60), '=>', typeof v === 'object' ? JSON.stringify(v) : v);
  }
  if (p.tecla) {
    await env('Input.dispatchKeyEvent', { type: 'keyDown', code: p.tecla, key: p.key || p.tecla });
    if (p.segura) await esperar(p.segura);
    await env('Input.dispatchKeyEvent', { type: 'keyUp', code: p.tecla, key: p.key || p.tecla });
  }
  if (p.foto) {
    const shot = await env('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
    writeFileSync(`${saida}/${p.foto}`, Buffer.from(shot.data, 'base64'));
    console.log('foto', p.foto);
  }
}
matar();
// o perfil do navegador de teste é descartável: apaga para não lotar o disco (cada execução criava um novo)
await esperar(800);
try { rmSync(perfil, { recursive: true, force: true }); } catch { /* nada */ }
process.exit(0);
