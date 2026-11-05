import * as THREE from 'three';

export const XI_SPECIAL = {
  id: 'great-firewall',
  name: 'Great Firewall Counter-Shield',
  startupFrames: 14,
  activeFrames: 14,
  recoveryFrames: 22,
  damage: 15,
  range: 3.5,
  auraCost: 30,
  auraGain: 12,
  hitStopFrames: 6,
  knockback: new THREE.Vector3(0.12, 0.03, 0),
} as const;

export const XI_ULTIMATE = {
  id: 'jade-dragon-orbit',
  name: 'Jade Dragon Orbit',
  auraCost: 100,
  startupFrames: 40,
  activeFrames: 38,
  recoveryFrames: 45,
  damage: 37,
  hitStopFrames: 10,
  cameraZoom: 0.74,
  cameraShake: 0.8,
  timeScale: 0.18,
  color: 0xdd2222,
} as const;

export function createXiRig(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'XiRig';
  const skin = new THREE.MeshStandardMaterial({ color: 0xc89065, roughness: 0.8 });
  const suit = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.7 });
  const redTie = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.5 });
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.68, 4, 10), suit);
  torso.position.y = 1.14;
  torso.castShadow = true;
  root.add(torso);
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.04), redTie);
  tie.position.set(0, 1.15, 0.22);
  root.add(tie);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 16, 12), skin);
  head.position.y = 1.95;
  head.scale.set(0.95, 1.05, 0.95);
  root.add(head);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.305, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.48),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }),
  );
  hair.position.y = 1.99;
  root.add(hair);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.54, 4, 8), suit);
    arm.position.set(side * 0.5, 1.14, 0);
    root.add(arm);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.52, 4, 8), suit);
    leg.position.set(side * 0.2, 0.36, 0);
    root.add(leg);
  }
  return root;
}
