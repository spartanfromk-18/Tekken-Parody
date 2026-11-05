import * as THREE from 'three';

export const DOGE_SPECIAL = {
  id: 'shiba-spin',
  name: 'Much Wow Shiba Spin',
  startupFrames: 10,
  activeFrames: 14,
  recoveryFrames: 20,
  damage: 13,
  range: 2.8,
  auraCost: 30,
  auraGain: 15,
  hitStopFrames: 5,
  knockback: new THREE.Vector3(0.15, 0.08, 0),
} as const;

export const DOGE_ULTIMATE = {
  id: 'moon-rocket-slam',
  name: 'To The Moon Rocket Slam',
  auraCost: 100,
  startupFrames: 35,
  activeFrames: 40,
  recoveryFrames: 42,
  damage: 35,
  hitStopFrames: 9,
  cameraZoom: 0.75,
  cameraShake: 0.8,
  timeScale: 0.2,
  color: 0xffaa00,
} as const;

export function createDogeRig(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'DogeRig';
  const fur = new THREE.MeshStandardMaterial({ color: 0xd49b57, roughness: 0.85 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xf5eedc, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.58, 4, 10), fur);
  body.position.y = 1.05;
  body.castShadow = true;
  root.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), fur);
  head.position.y = 1.82;
  root.add(head);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 4), fur);
    ear.position.set(side * 0.22, 2.12, 0);
    ear.rotation.z = side * -0.2;
    root.add(ear);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.48, 4, 8), cream);
    leg.position.set(side * 0.18, 0.32, 0);
    root.add(leg);
  }
  return root;
}
