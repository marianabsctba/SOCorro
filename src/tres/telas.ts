// Telas desenhadas em canvas: monitores das estações, videowall e placas.
// Poucas texturas compartilhadas, redesenhadas algumas vezes por segundo.
import * as THREE from 'three';

type Desenho = (g: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

interface Tela {
  tex: THREE.CanvasTexture;
  g: CanvasRenderingContext2D;
  w: number;
  h: number;
  desenho: Desenho;
  intervalo: number;
  ultimo: number;
}

const telas: Tela[] = [];
export const estadoTelas = { fila: 37, eps: 4200, site: 'alfa' as 'alfa' | 'bravo', diaSemIncidente: 0, mttr: 0 };

function criar(w: number, h: number, desenho: Desenho, intervalo = 0.5): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const t: Tela = { tex, g, w, h, desenho, intervalo, ultimo: -99 };
  desenho(g, w, h, 0);
  tex.needsUpdate = true;
  telas.push(t);
  return tex;
}

export function atualizarTelas(t: number) {
  for (const x of telas) {
    if (t - x.ultimo < x.intervalo) continue;
    x.ultimo = t;
    x.desenho(x.g, x.w, x.h, t);
    x.tex.needsUpdate = true;
  }
}

export function limparTelas() {
  for (const x of telas) x.tex.dispose();
  telas.length = 0;
}

function semente(n: number) {
  let s = n;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const SEV = ['#3fb59f', '#e0b23c', '#e8772e', '#d64545'];
const REGRAS = ['Falha de logon em massa', 'PowerShell codificado', 'Viagem impossível', 'Mimikatz detectado', 'DNS suspeito', 'Acesso a categoria proibida', 'Varredura de portas', 'Macro do Office', 'MFA negado repetido', 'Regra de caixa de entrada', 'Conexão para país de risco', 'Arquivo em quarentena', 'Logon fora do horário', 'Certificado vencido', 'Scanner não autorizado'];
const CLIENTES = ['TABAJARA', 'PREF. PINDAÍBA', 'HOSP. S. JUDAS', 'COOP. BOI GORDO', 'PÃO DE LÓ', 'OLHO VIVO'];

/** monitor do analista: lista de alertas do Vigia rolando */
export function telaSiem(var_: number) {
  return criar(256, 160, (g, w, h, t) => {
    g.fillStyle = '#0e1420';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#18233a';
    g.fillRect(0, 0, w, 16);
    g.fillStyle = '#e05fa0';
    g.font = 'bold 10px sans-serif';
    g.fillText('VIGIA SIEM', 6, 11);
    g.fillStyle = '#8fa3c7';
    g.fillText(`fila: ${estadoTelas.fila}`, w - 60, 11);
    const r = semente(Math.floor(t / 2.5) * 31 + var_ * 977);
    g.font = '8px monospace';
    for (let i = 0; i < 12; i++) {
      const y = 22 + i * 11.5;
      const sev = Math.floor(r() * 4);
      g.fillStyle = i % 2 ? '#121b2c' : '#0e1420';
      g.fillRect(0, y - 8, w, 11.5);
      g.fillStyle = SEV[sev];
      g.fillRect(3, y - 6, 4, 8);
      g.fillStyle = '#c8d3e8';
      g.fillText(REGRAS[Math.floor(r() * REGRAS.length)].slice(0, 26), 11, y);
      g.fillStyle = '#6b7c9e';
      g.fillText(CLIENTES[Math.floor(r() * CLIENTES.length)].slice(0, 12), 170, y);
    }
  }, 1.2 + (var_ % 3) * 0.4);
}

/** segundo monitor: gráfico de eventos por segundo ou terminal */
export function telaGrafico(var_: number) {
  return criar(256, 160, (g, w, h, t) => {
    g.fillStyle = '#0b111b';
    g.fillRect(0, 0, w, h);
    if (var_ % 2) {
      g.fillStyle = '#7ee787';
      g.font = '8px monospace';
      const r = semente(Math.floor(t * 2) + var_);
      const linhas = ['$ tail -f /var/log/auth.log', 'Failed password for root from', 'Accepted publickey for deploy', 'EventID=4625 LogonType=3', 'EventID=4624 LogonType=10', 'sysmon: ProcessCreate powershell.exe', 'dns query: telemetria.cdn-abc.net', 'proxy ALLOW spotify.com 200', 'fw DENY tcp 445 from 185.x.x.x', 'edr: quarentena concluída'];
      for (let i = 0; i < 16; i++) g.fillText(linhas[Math.floor(r() * linhas.length)], 4, 10 + i * 9.5);
      return;
    }
    g.strokeStyle = '#1d2a40';
    for (let i = 0; i < 6; i++) {
      g.beginPath();
      g.moveTo(0, 20 + i * 24);
      g.lineTo(w, 20 + i * 24);
      g.stroke();
    }
    g.fillStyle = '#8fa3c7';
    g.font = 'bold 9px sans-serif';
    g.fillText('EPS (eventos por segundo)', 6, 12);
    g.strokeStyle = '#3fb59f';
    g.lineWidth = 2;
    g.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const v = Math.sin((x + t * 30 + var_ * 50) / 23) * 18 + Math.sin((x + t * 50) / 7) * 6 + Math.sin((x * 3 + t * 90) / 13) * 4;
      const y = 95 - v;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    g.fillStyle = '#e05fa0';
    g.font = 'bold 14px sans-serif';
    g.fillText(`${Math.round(estadoTelas.eps + Math.sin(t) * 300)} EPS`, 6, 150);
  }, 0.4);
}

/** videowall: mapa de ataques que é só animação */
export function telaMapa() {
  const pontos = [
    [0.27, 0.62], [0.31, 0.7], [0.29, 0.66], [0.18, 0.35], [0.52, 0.3], [0.56, 0.28], [0.72, 0.38], [0.78, 0.42], [0.62, 0.55], [0.84, 0.7], [0.49, 0.25], [0.7, 0.3],
  ];
  return criar(512, 288, (g, w, h, t) => {
    const fundo = g.createLinearGradient(0, 0, 0, h);
    fundo.addColorStop(0, '#05080f');
    fundo.addColorStop(1, '#0c1526');
    g.fillStyle = fundo;
    g.fillRect(0, 0, w, h);
    // continentes de mentirinha, em pontinhos
    g.fillStyle = '#1e3350';
    const r = semente(7);
    for (let i = 0; i < 1600; i++) {
      const x = r();
      const y = r();
      const terra = (x > 0.15 && x < 0.35 && y > 0.25 && y < 0.85 && !(y < 0.5 && x > 0.28)) || (x > 0.45 && x < 0.9 && y > 0.18 && y < 0.55) || (x > 0.48 && x < 0.62 && y > 0.5 && y < 0.8) || (x > 0.8 && x < 0.92 && y > 0.65 && y < 0.8);
      if (terra) g.fillRect(x * w, y * h, 2, 2);
    }
    const alvo = [0.31, 0.7]; // Curitiba, mais ou menos
    for (let i = 0; i < pontos.length; i++) {
      const fase = (t * 0.5 + i * 0.37) % 1;
      const [x0, y0] = pontos[i];
      const cx = (x0 + alvo[0]) / 2;
      const cy = Math.min(y0, alvo[1]) - 0.2;
      g.strokeStyle = ['#e05fa0', '#e8772e', '#d64545', '#e0b23c'][i % 4];
      g.globalAlpha = 0.25;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x0 * w, y0 * h);
      g.quadraticCurveTo(cx * w, cy * h, alvo[0] * w, alvo[1] * h);
      g.stroke();
      g.globalAlpha = 1;
      const u = fase;
      const bx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * alvo[0];
      const by = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * alvo[1];
      g.fillStyle = g.strokeStyle;
      g.beginPath();
      g.arc(bx * w, by * h, 3, 0, 6.3);
      g.fill();
    }
    g.fillStyle = '#ffffff';
    g.font = 'bold 15px sans-serif';
    g.fillText('MAPA DE AMEAÇAS EM TEMPO REAL*', 12, 22);
    g.fillStyle = '#6b7c9e';
    g.font = '10px sans-serif';
    g.fillText('*é um GIF. Comprado em 2019. Impressiona cliente em visita.', 12, h - 10);
  }, 0.08);
}

/** videowall: indicadores do Gilmar */
export function telaKpi() {
  return criar(512, 288, (g, w, h, t) => {
    g.fillStyle = '#0b111b';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff';
    g.font = 'bold 16px sans-serif';
    g.fillText('INDICADORES DO TURNO', 14, 26);
    const caixas: [string, string, string][] = [
      ['Fila', String(estadoTelas.fila), estadoTelas.fila > 30 ? '#d64545' : '#3fb59f'],
      ['MTTA', `${4 + Math.round(Math.sin(t / 9) * 2)} min`, '#e0b23c'],
      ['MTTR', `${38 + Math.round(Math.sin(t / 13) * 7)} min`, '#e8772e'],
      ['Falso positivo', '71%', '#e05fa0'],
    ];
    caixas.forEach(([rot, val, cor], i) => {
      const x = 14 + (i % 2) * 250;
      const y = 44 + Math.floor(i / 2) * 118;
      g.fillStyle = '#141d2e';
      g.fillRect(x, y, 234, 104);
      g.fillStyle = '#8fa3c7';
      g.font = '14px sans-serif';
      g.fillText(rot, x + 12, y + 24);
      g.fillStyle = cor;
      g.font = 'bold 44px sans-serif';
      g.fillText(val, x + 12, y + 80);
    });
  }, 1);
}

/** videowall: a placa que nunca muda */
export function telaDiasSemIncidente() {
  return criar(512, 288, (g, w, h, t) => {
    g.fillStyle = '#101010';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#e0b23c';
    g.fillRect(0, 0, w, 10);
    g.fillRect(0, h - 10, w, 10);
    g.fillStyle = '#ffffff';
    g.font = 'bold 26px sans-serif';
    g.textAlign = 'center';
    g.fillText('DIAS SEM INCIDENTE', w / 2, 60);
    g.fillStyle = Math.sin(t * 3) > -0.6 ? '#d64545' : '#7a2020';
    g.font = 'bold 150px sans-serif';
    g.fillText(String(estadoTelas.diaSemIncidente), w / 2, 220);
    g.fillStyle = '#888';
    g.font = '13px sans-serif';
    g.fillText('recorde histórico: 0', w / 2, 262);
    g.textAlign = 'left';
  }, 0.5);
}

/** videowall do Bravo: o mesmo mapa, só que com uma marca d'água muito suspeita */
export function telaPrint() {
  const base = telaMapa();
  const cv = base.image as HTMLCanvasElement;
  return criar(512, 288, (g, w, h) => {
    g.drawImage(cv, 0, 0, w, h);
    g.globalAlpha = 0.16;
    g.fillStyle = '#ffffff';
    g.font = 'bold 18px sans-serif';
    g.fillText('Captura de tela 2019-03-12 141502.png', 90, 150);
    g.globalAlpha = 1;
  }, 0.08);
}

/** placa de parede ou cartaz */
export function cartaz(linhas: string[], fundo = '#f4f0e6', cor = '#1b1b1b', w = 256, h = 160) {
  return criar(w, h, (g) => {
    g.fillStyle = fundo;
    g.fillRect(0, 0, w, h);
    g.fillStyle = cor;
    g.textAlign = 'center';
    const tam = Math.floor(h / (linhas.length + 1.2));
    linhas.forEach((l, i) => {
      g.font = `${i === 0 ? 'bold ' : ''}${i === 0 ? tam : Math.floor(tam * 0.7)}px sans-serif`;
      g.fillText(l, w / 2, tam * (i + 1.05));
    });
    g.textAlign = 'left';
  }, 9999);
}

/** janela: garoa de Curitiba ou mar de Recife (com uma dobra no pôster...) */
export function telaJanela(site: 'alfa' | 'bravo') {
  return criar(512, 256, (g, w, h, t) => {
    if (site === 'alfa') {
      // Curitiba de noite: céu de chumbo, prédios com janelas acesas e garoa eterna
      const c = g.createLinearGradient(0, 0, 0, h);
      c.addColorStop(0, '#0b1020');
      c.addColorStop(1, '#27304a');
      g.fillStyle = c;
      g.fillRect(0, 0, w, h);
      const r = semente(3);
      for (let i = 0; i < 18; i++) {
        const x = r() * w;
        const bw = 26 + r() * 52;
        const bh = 70 + r() * 150;
        const perto = r() < 0.5;
        g.fillStyle = perto ? '#0d1220' : '#161d30';
        g.fillRect(x, h - bh, bw, bh);
        // janelas acesas (algumas piscam: é o pessoal do turno da noite de outros SOCs)
        for (let jy = h - bh + 8; jy < h - 6; jy += 10)
          for (let jx = x + 4; jx < x + bw - 4; jx += 8) {
            const v = r();
            if (v < 0.32) {
              g.fillStyle = v < 0.06 && Math.sin(t * 2 + jx) > 0.6 ? '#7fd8ff' : '#f4d79a';
              g.globalAlpha = perto ? 0.85 : 0.5;
              g.fillRect(jx, jy, 3, 4);
            }
          }
        g.globalAlpha = 1;
      }
      // garoa
      g.strokeStyle = 'rgba(190,210,255,0.25)';
      const rr = semente(Math.floor(t * 10));
      for (let i = 0; i < 90; i++) {
        const x = rr() * w;
        const y = rr() * h;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x - 2, y + 9);
        g.stroke();
      }
    } else {
      const c = g.createLinearGradient(0, 0, 0, h);
      c.addColorStop(0, '#5fb6e8');
      c.addColorStop(0.55, '#bfe6f7');
      c.addColorStop(0.56, '#1f8fb5');
      c.addColorStop(1, '#2aa8c4');
      g.fillStyle = c;
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#ffe9a8';
      g.beginPath();
      g.arc(w * 0.78, h * 0.2, 22, 0, 6.3);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i < 6; i++) {
        const y = h * 0.62 + i * 14 + Math.sin(t + i) * 2;
        g.beginPath();
        g.moveTo(0, y);
        for (let x = 0; x < w; x += 16) g.lineTo(x, y + Math.sin(x / 30 + t * 2 + i) * 2);
        g.stroke();
      }
      // a dobra do pôster (as ondas "andam" mas o vinco nunca sai do lugar)
      g.strokeStyle = 'rgba(0,0,0,0.12)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(w * 0.5, 0);
      g.lineTo(w * 0.5, h);
      g.stroke();
      g.lineWidth = 1;
    }
  }, 0.12);
}

/** tela do Nildo no Bravo: o Paint aberto (terceira pista) */
export function telaPaint() {
  return criar(256, 160, (g, w, h) => {
    g.fillStyle = '#f0f0f0';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#d6d6d6';
    g.fillRect(0, 0, w, 14);
    g.fillStyle = '#222';
    g.font = '8px sans-serif';
    g.fillText('soc_bravo_FINAL_v3_agoravai.png - Paint', 4, 10);
    g.fillStyle = '#0b111b';
    g.fillRect(20, 24, 216, 120);
    g.fillStyle = '#e05fa0';
    g.font = 'bold 12px sans-serif';
    g.fillText('SOC BRAVO', 30, 44);
    g.fillStyle = '#3fb59f';
    g.fillRect(30, 60, 80, 50);
    g.fillRect(130, 60, 80, 50);
    g.fillStyle = '#1166ff';
    g.fillRect(150, 100, 30, 30);
  }, 9999);
}
