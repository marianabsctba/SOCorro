// A equipe viva: cada pessoa tem uma cadeira e uma rotina (digitar, falar ao telefone, levantar para o café,
// o Gilmar rondando com o timer, a Dona Neide passando, o Thiaguinho cochilando de madrugada).
import * as THREE from 'three';
import { Humano } from './humanos';
import type { Assento, Sala } from './soc';
import { Navegacao } from './nav';
import type { PersonagemId, Site, Turno } from '../conteudo/tipos';

export interface Membro {
  id: PersonagemId;
  h: Humano;
  cadeira: Assento | null;
  ocupado: boolean; // em cena (falando com quem joga): a rotina espera
  proxima: number; // segundos até a próxima decisão
  fazendo: 'sentado' | 'andando' | 'cafe' | 'ronda' | 'conversa' | 'em_pe';
}

/** altura do assento: o quadril da animação sentada fica nesta altura com a raiz no chão */
// medido: na animação sentada o quadril fica 0,26 m atrás da raiz e 0,55 m acima dela
export const AJUSTE_SENTADO = { y: -0.02, frente: 0.3 };

const ESCALA: Record<Site, Record<'dia' | 'noite', PersonagemId[]>> = {
  alfa: {
    dia: ['gilmar', 'ro', 'keyla', 'kevin', 'brenda', 'pamela', 'jefferson', 'vandeco', 'neide'],
    noite: ['thiaguinho', 'jefferson', 'vandeco', 'neide', 'pamela'],
  },
  bravo: {
    dia: ['socorro', 'nildo', 'ro', 'vandeco', 'kevin', 'pamela'],
    noite: ['nildo', 'thiaguinho', 'vandeco'],
  },
};

// quem senta onde (índice em sala.assentos; o 14 é o de quem joga)
const LUGAR: Partial<Record<PersonagemId, number>> = {
  ro: 6,
  keyla: 2,
  kevin: 12,
  brenda: 13,
  pamela: 8,
  jefferson: 11,
  vandeco: 4,
  thiaguinho: 10,
  nildo: 1,
  socorro: 7,
};

export class Equipe {
  membros = new Map<PersonagemId, Membro>();
  nav: Navegacao;
  constructor(public sala: Sala) {
    this.nav = new Navegacao(sala);
  }

  /** monta a equipe do turno; extras entram mesmo fora da escala (quem fala na cena do dia) */
  montar(site: Site, turno: Turno, extras: PersonagemId[] = []) {
    const base = ESCALA[site][turno === 'noite' || turno === 'madrugada' ? 'noite' : 'dia'];
    const ids = [...new Set([...base, ...extras])];
    for (const id of ids) {
      const h = new Humano(id);
      const lugar = LUGAR[id];
      const cadeira = lugar !== undefined ? this.sala.assentos[lugar] : null;
      const m: Membro = { id, h, cadeira, ocupado: false, proxima: 5 + Math.random() * 30, fazendo: 'em_pe' };
      this.membros.set(id, m);
      this.sala.grupo.add(h.raiz);
      if (cadeira) this.sentar(m);
      else {
        const p = this.pontoLivre(id);
        h.raiz.position.set(p.x, 0, p.z);
        h.raiz.rotation.y = Math.random() * 6.28;
        m.fazendo = 'em_pe';
      }
      h.pronto.then(() => {
        if (m.fazendo === 'sentado') this.rotinaSentada(m, true);
        else h.tocar('parado', 0);
      });
    }
  }

  private pontoLivre(id: PersonagemId) {
    const p = this.sala.pontos;
    if (id === 'gilmar' || id === 'socorro') return p.gilmar;
    if (id === 'neide') return { x: -9.5, z: 6.5 };
    if (id === 'leoncio') return { x: 6.3, z: 3.8 };
    return { x: 7 + Math.random() * 2, z: 2 + Math.random() * 2 };
  }

  private sentar(m: Membro) {
    const c = m.cadeira!;
    m.h.sentado = true;
    m.h.raiz.position.set(c.x, AJUSTE_SENTADO.y, c.z - AJUSTE_SENTADO.frente);
    m.h.raiz.rotation.y = c.ry;
    m.h.olharPara(c.x, c.z - 3, true);
    m.fazendo = 'sentado';
  }

  private rotinaSentada(m: Membro, inicio = false) {
    m.h.tocar('parado', inicio ? 0 : 0.3);
    if (m.id === 'thiaguinho' && Math.random() < 0.7) m.h.gesto('cochilar');
    else if (Math.random() < 0.15) m.h.gesto('telefone');
    else m.h.gesto('digitar');
  }

  private levantar(m: Membro) {
    m.h.pararGesto();
    m.h.sentado = false;
    if (m.cadeira) m.h.raiz.position.set(m.cadeira.x, 0, m.cadeira.z + 0.35);
    m.h.tocar('parado', 0.2);
  }

  /** leva alguém até um ponto pelos corredores */
  async andarAte(m: Membro, alvo: { x: number; z: number }, vel = 1.1) {
    if (m.fazendo === 'sentado') this.levantar(m);
    m.fazendo = 'andando';
    const de = { x: m.h.raiz.position.x, z: m.h.raiz.position.z };
    await m.h.irPara(this.nav.caminho(de, alvo), vel);
  }

  async voltarAoLugar(m: Membro) {
    if (!m.cadeira) {
      m.fazendo = 'em_pe';
      m.h.tocar('parado');
      return;
    }
    await m.h.irPara(this.nav.caminho({ x: m.h.raiz.position.x, z: m.h.raiz.position.z }, { x: m.cadeira.x, z: m.cadeira.z + 0.35 }), 1.1);
    if (m.ocupado) return;
    this.sentar(m);
    this.rotinaSentada(m);
  }

  private async irAoCafe(m: Membro) {
    const c = this.sala.pontos.cafe;
    await this.andarAte(m, { x: c.x - Math.random() * 0.4, z: c.z + (Math.random() - 0.5) * 0.8 });
    if (m.ocupado) return;
    m.fazendo = 'cafe';
    m.h.olharPara(11.5, 4.6);
    m.h.tocar('mexendo');
    await esperar(1500);
    m.h.tocar('parado');
    m.h.gesto('beber');
    await esperar(3300);
    if (m.ocupado) return;
    await this.voltarAoLugar(m);
  }

  private async ronda(m: Membro) {
    // o coordenador para atrás de alguém, cruza os braços e olha a tela (o terror de todo N1)
    const alvos = [...this.membros.values()].filter((x) => x.cadeira && x.fazendo === 'sentado');
    const alvo = alvos[Math.floor(Math.random() * alvos.length)];
    if (!alvo?.cadeira) return;
    m.fazendo = 'ronda';
    await m.h.irPara(this.nav.caminho({ x: m.h.raiz.position.x, z: m.h.raiz.position.z }, { x: alvo.cadeira.x + 0.5, z: alvo.cadeira.z + 0.75 }), 1.0);
    if (m.ocupado) return;
    m.h.olharPara(alvo.cadeira.monitor.x, alvo.cadeira.monitor.z);
    m.h.gesto('cruzar', 5);
    await esperar(5500);
    if (m.ocupado) return;
    const p = this.pontoLivre(m.id);
    await m.h.irPara(this.nav.caminho({ x: m.h.raiz.position.x, z: m.h.raiz.position.z }, p), 1.0);
    m.fazendo = 'em_pe';
  }

  private async passeio(m: Membro) {
    m.fazendo = 'andando';
    const pts = [
      { x: -9.5, z: 6.5 },
      { x: -6, z: 3.1 },
      { x: 1, z: 3.1 },
      { x: 5.3, z: 0.1 },
      { x: 5.3, z: -2.9 },
      { x: -2, z: -6.2 },
    ];
    const p = pts[Math.floor(Math.random() * pts.length)];
    await m.h.irPara(this.nav.caminho({ x: m.h.raiz.position.x, z: m.h.raiz.position.z }, p), 0.8);
    if (m.ocupado) return;
    m.h.tocar('mexendo');
    await esperar(2500);
    m.h.tocar('parado');
    m.fazendo = 'em_pe';
  }

  /**
   * ninguém atravessa ninguém: quem está em pé e perto demais de outra pessoa (ou de quem joga)
   * é empurrado para o lado, devagar, sem cair dentro de móvel; quem está sentado não sai do lugar
   */
  private desviar(dt: number, jogador?: { x: number; z: number }) {
    const R = 0.62;
    const lista = [...this.membros.values()];
    const empurra = (m: Membro, dx: number, dz: number) => {
      const p = m.h.raiz.position;
      const nx = p.x + dx;
      const nz = p.z + dz;
      if (this.nav.livreEm(nx, nz)) {
        p.x = nx;
        p.z = nz;
      } else if (this.nav.livreEm(nx, p.z)) p.x = nx;
      else if (this.nav.livreEm(p.x, nz)) p.z = nz;
    };
    const k = Math.min(1, dt * 6);
    for (let i = 0; i < lista.length; i++) {
      const a = lista[i];
      const pa = a.h.raiz.position;
      const aFixo = a.h.sentado;
      if (jogador && !aFixo) {
        const dx = pa.x - jogador.x;
        const dz = pa.z - jogador.z;
        const d = Math.hypot(dx, dz);
        if (d < R && d > 1e-4) empurra(a, (dx / d) * (R - d) * k, (dz / d) * (R - d) * k);
      }
      for (let j = i + 1; j < lista.length; j++) {
        const b = lista[j];
        const bFixo = b.h.sentado;
        if (aFixo && bFixo) continue;
        const pb = b.h.raiz.position;
        let dx = pa.x - pb.x;
        let dz = pa.z - pb.z;
        let d = Math.hypot(dx, dz);
        if (d >= R) continue;
        if (d < 1e-4) {
          dx = 1;
          dz = 0;
          d = 1;
        }
        // de frente um para o outro: além de afastar, cada um puxa um pouco para a sua direita
        const lado = 0.35;
        const ux = dx / d;
        const uz = dz / d;
        const sobra = (R - d) * k;
        const fa = aFixo ? 0 : bFixo ? 1 : 0.5;
        const fb = bFixo ? 0 : aFixo ? 1 : 0.5;
        if (fa) empurra(a, (ux - uz * lado) * sobra * fa, (uz + ux * lado) * sobra * fa);
        if (fb) empurra(b, (-ux + uz * lado) * sobra * fb, (-uz - ux * lado) * sobra * fb);
      }
    }
  }

  atualizar(dt: number, jogador?: { x: number; z: number }) {
    this.desviar(dt, jogador);
    for (const m of this.membros.values()) {
      m.h.update(dt);
      if (m.ocupado) continue;
      m.proxima -= dt;
      if (m.proxima > 0) continue;
      m.proxima = 20 + Math.random() * 45;
      if (m.fazendo === 'sentado') {
        const r = Math.random();
        if (r < 0.25) void this.irAoCafe(m);
        else this.rotinaSentada(m);
      } else if (m.fazendo === 'em_pe') {
        if (m.id === 'gilmar' || m.id === 'socorro') void this.ronda(m);
        else if (m.id === 'neide' || !m.cadeira) void this.passeio(m);
        else void this.voltarAoLugar(m);
      }
    }
  }

  /** chama alguém para falar com quem joga: anda até perto, vira e fica disponível */
  async chamar(id: PersonagemId, perto: THREE.Vector3) {
    const m = this.membros.get(id);
    if (!m) return;
    // quem já está em cena ocupa um lugar; o próximo para ao lado, não em cima
    const outros = [...this.membros.values()].filter((x) => x.ocupado && x !== m).length;
    m.ocupado = true;
    const p = m.h.raiz.position;
    const dx = p.x - perto.x;
    const dz = p.z - perto.z;
    const d = Math.hypot(dx, dz);
    if (d > 2.2) {
      if (m.fazendo === 'sentado') this.levantar(m);
      const ang = Math.atan2(dx, dz) + (outros ? (outros % 2 ? 0.7 : -0.7) * Math.ceil(outros / 2) : 0);
      const alvo = { x: perto.x + Math.sin(ang) * 1.4, z: perto.z + Math.cos(ang) * 1.4 };
      m.fazendo = 'conversa';
      await m.h.irPara(this.nav.caminho({ x: p.x, z: p.z }, alvo), 1.7);
    } else if (m.fazendo === 'sentado') m.h.pararGesto();
    m.fazendo = 'conversa';
    m.h.olharPara(perto.x, perto.z);
  }

  liberar(id: PersonagemId) {
    const m = this.membros.get(id);
    if (!m) return;
    m.ocupado = false;
    m.h.tocar(m.h.sentado ? 'parado' : 'parado');
    if (m.h.sentado) this.rotinaSentada(m);
    else void this.voltarAoLugar(m);
  }

  limpar() {
    for (const m of this.membros.values()) this.sala.grupo.remove(m.h.raiz);
    this.membros.clear();
  }
}

export const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
