import type * as THREE from 'three';

export const materialConfigs = {
  basic: (three: typeof THREE, texture: THREE.Texture) => 
    new three.MeshBasicMaterial({
      map: texture,
    }),
  lambert: (three: typeof THREE, texture: THREE.Texture) => 
    new three.MeshLambertMaterial({
      map: texture,
    }),
  phong: (three: typeof THREE, texture: THREE.Texture) => 
    new three.MeshPhongMaterial({
      map: texture,
    }),
  standard: (three: typeof THREE, texture: THREE.Texture) => 
    new three.MeshStandardMaterial({
      map: texture,
      roughness: 0.5,
      metalness: 0.0,
    }),
  physical: (three: typeof THREE, texture: THREE.Texture) => 
    new three.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.5,
      metalness: 0.0,
    }),
};

export type MaterialType = keyof typeof materialConfigs;
