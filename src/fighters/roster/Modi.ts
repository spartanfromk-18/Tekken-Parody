import * as THREE from 'three';

export const MODI_SPECIAL = {
  id: 'vikas-beam',
  name: 'Vikas Beam',
  startupFrames: 18,
  activeFrames: 12,
  recoveryFrames: 28,
  damage: 16,
  range: 5.5,
  auraCost: 35,
  auraGain: 14,
  hitStopFrames: 6,
  knockback: new THREE.Vector3(0.18, 0.02, 0),
} as const;

export const MODI_ULTIMATE = {
  id: 'aura-surge',
  name: '56-Inch Aura Surge',
  auraCost: 100,
  startupFrames: 42,
  activeFrames: 36,
  recoveryFrames: 48,
  damage: 38,
  hitStopFrames: 10,
  cameraZoom: 0.72,
  cameraShake: 0.85,
  timeScale: 0.18,
  color: 0xff9a3c,
} as const;

export function createModiRig(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Modi';

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 1.05, 8), new THREE.MeshStandardMaterial({ color: 0xf4f0e6, roughness: 0.8 }));
  torso.position.y = 1.05;
  root.add(torso);

  const vestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.43, 0.62, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.6 }));
  vestMesh.position.set(0, 1.2, 0.02);
  root.add(vestMesh);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), new THREE.MeshStandardMaterial({ color: 0xc98d62, roughness: 0.8 }));
  head.position.y = 1.9;
  head.scale.set(1, 1.08, 0.95);
  root.add(head);

  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 8), new THREE.MeshStandardMaterial({ color: 0xf1f1ea, roughness: 0.9 }));
  beard.rotation.x = Math.PI;
  beard.position.set(0, 1.72, 0.2);
  root.add(beard);

  const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.29, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0xdcdcd5, roughness: 0.9 }));
  hairMesh.position.y = 2.02;
  root.add(hairMesh);

  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.72, 6), new THREE.MeshStandardMaterial({ color: 0xf0ead8, roughness: 0.8 }));
    leg.position.set(side * 0.19, 0.45, 0);
    root.add(leg);
  }
  return root;
}
