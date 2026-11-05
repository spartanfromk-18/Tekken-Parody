import * as THREE from 'three';

export const TUNG_TUNG_PALETTE = {
  primary: 0x9c6a3f,
  secondary: 0x3a2417,
};

export const WOODEN_CLUB_STRING = [
  { id: 'club-1', startupFrames: 6, activeFrames: 4, recoveryFrames: 10, damage: 7 },
  { id: 'club-2', startupFrames: 4, activeFrames: 3, recoveryFrames: 9, damage: 6 },
  { id: 'club-finisher', startupFrames: 12, activeFrames: 5, recoveryFrames: 24, damage: 18 },
];

export function createTungTungRig(): THREE.Group {
  const root = new THREE.Group();
  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x9a6336, roughness: 0.85 });
  
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 1.3, 10), woodMaterial);
  body.position.y = 1.1;
  root.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), woodMaterial);
  head.scale.set(0.8, 1, 0.8);
  head.position.y = 2;
  root.add(head);

  return root;
}
