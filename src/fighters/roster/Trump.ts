import * as THREE from 'three';

export const TRUMP_SPECIAL = {
  id: 'tariff-wall',
  name: 'Tariff Wall Barrier',
  startupFrames: 16,
  activeFrames: 12,
  recoveryFrames: 26,
  damage: 17,
  range: 3.2,
  auraCost: 35,
  auraGain: 14,
  hitStopFrames: 7,
  knockback: new THREE.Vector3(0.16, 0.05, 0),
} as const;

export const TRUMP_ULTIMATE = {
  id: 'golden-tower-drop',
  name: 'Tremendous Golden Tower Drop',
  auraCost: 100,
  startupFrames: 44,
  activeFrames: 35,
  recoveryFrames: 46,
  damage: 40,
  hitStopFrames: 10,
  cameraZoom: 0.7,
  cameraShake: 0.9,
  timeScale: 0.17,
  color: 0xffd700,
} as const;

export function createTrumpRig(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'TrumpRig';
  const skin = new THREE.MeshStandardMaterial({ color: 0xd8ab78, roughness: 0.8 });
  const suit = new THREE.MeshStandardMaterial({ color: 0x12233b, roughness: 0.7 });
  const redTie = new THREE.MeshStandardMaterial({ color: 0xd92b2b, roughness: 0.5 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0xe5c158, roughness: 0.85 });
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.44, 0.7, 4, 10), suit);
  torso.position.y = 1.15;
  torso.castShadow = true;
  root.add(torso);
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.04), redTie);
  tie.position.set(0, 1.15, 0.24);
  root.add(tie);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.33, 16, 12), skin);
  head.position.y = 1.96;
  head.scale.set(1.02, 1.05, 0.98);
  root.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.33, 12, 8), hairMat);
  hair.position.set(0, 2.12, -0.04);
  hair.scale.set(1.05, 0.4, 1.1);
  root.add(hair);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.54, 4, 8), suit);
    arm.position.set(side * 0.52, 1.15, 0);
    root.add(arm);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.52, 4, 8), suit);
    leg.position.set(side * 0.21, 0.36, 0);
    root.add(leg);
  }
  return root;
}
