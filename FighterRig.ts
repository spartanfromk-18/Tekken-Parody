import * as THREE from 'three';

export interface FighterPalette {
  primary: number;
  secondary: number;
}

export function createFighterRig(palette: FighterPalette): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: palette.primary, roughness: 0.4, metalness: 0.2 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xf0c8a0, roughness: 0.6 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: palette.secondary, roughness: 0.3 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), material);
  body.position.y = 1.0;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.3), skinMaterial);
  head.position.y = 1.55;
  head.castShadow = true;
  group.add(head);

  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.1, 0.32), accentMaterial);
  belt.position.y = 0.62;
  group.add(belt);

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), material);
  leftLeg.position.set(-0.14, 0.3, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), material);
  rightLeg.position.set(0.14, 0.3, 0);
  group.add(rightLeg);

  return group;
}
