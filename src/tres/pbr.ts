// Materiais fotográficos (texturas CC0 do Poly Haven convertidas para WebP em public/ambiente/texturas).
import * as THREE from 'three';

const BASE = `${import.meta.env.BASE_URL}ambiente/texturas/`;
const ARM = new Set(['leafy_grass', 'medieval_red_brick', 'old_wood_floor']);
const tl = new THREE.TextureLoader();
const cache = new Map<string, THREE.Texture>();

function tex(arquivo: string, rep: [number, number], cor: boolean): THREE.Texture {
  const chave = `${arquivo}|${rep.join('x')}`;
  let t = cache.get(chave);
  if (!t) {
    t = tl.load(BASE + arquivo + '.webp?v=' + __VERSAO__);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rep[0], rep[1]);
    t.anisotropy = 8;
    if (cor) t.colorSpace = THREE.SRGBColorSpace;
    cache.set(chave, t);
  }
  return t;
}

export type Superficie = 'tijolo' | 'pedra' | 'reboco' | 'assoalho' | 'paralelepipedo' | 'telhado' | 'chao_mata' | 'grama' | 'concreto';
const ID: Record<Superficie, string> = {
  tijolo: 'medieval_red_brick',
  pedra: 'castle_brick_07',
  reboco: 'beige_wall_001',
  assoalho: 'old_wood_floor',
  paralelepipedo: 'cobblestone_floor_04',
  telhado: 'red_slate_roof_tiles_01',
  chao_mata: 'forest_ground_04',
  grama: 'leafy_grass',
  concreto: 'concrete_wall_003',
};

/** material com cor, relevo (normal) e aspereza; rep = quantas vezes a textura repete na superfície */
export function pbr(s: Superficie, rep: [number, number], extra: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial {
  const id = ID[s];
  return new THREE.MeshStandardMaterial({
    map: tex(`${id}_cor`, rep, true),
    normalMap: tex(`${id}_normal`, rep, false),
    roughnessMap: tex(`${id}_${ARM.has(id) ? 'arm' : 'aspereza'}`, rep, false),
    roughness: 1,
    metalness: 0,
    ...extra,
  });
}
