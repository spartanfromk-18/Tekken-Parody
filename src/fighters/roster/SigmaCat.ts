import * as THREE from 'three';

export const SIGMA_SPECIAL = {
  id: 'stoic-parry',
  name: 'Meowing Stoic Parry',
  startupFrames: 4,
  activeFrames: 10,
  recoveryFrames: 18,
  damage: 12,
  range: 2.5,
  auraCost: 25,
  auraGain: 12,
  hitStopFrames: 6,
  knockback: new THREE.Vector3(0.1, 0.02, 0),
} as const;

export const SIGMA_ULTIMATE = {
  id: 'laser-glare',
  name: 'Mogging Laser Glare',
  auraCost: 100,
  startupFrames: 38,
  activeFrames: 38,
  recoveryFrames: 40,
  damage: 38,
  hitStopFrames: 10,
  cameraZoom: 0.72,
  cameraShake: 0.75,
  timeScale: 0.18,
  color: 0x9933ff,
} as const;

export function createSigmaCatRig(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'SigmaCatRig';
  const fur = new THREE.MeshStandardMaterial({ color: 0x2b2d42, roughness: 0.75 });
  const accent = new THREE.MeshStandardMaterial({ color: 0x8d99ae, roughness: 0.8 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.6, 4, 10), fur);
  body.position.y = 1.08;
  body.castShadow = true;
  root.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), fur);
  head.position.y = 1.85;
  root.add(head);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 4), accent);
    ear.position.set(side * 0.18, 2.15, 0);
    root.add(ear);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.5, 4, 8), fur);
    leg.position.set(side * 0.16, 0.33, 0);
    root.add(leg);
  }
  return root;
}
