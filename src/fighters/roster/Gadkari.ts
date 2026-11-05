import * as THREE from 'three';

export const GADKARI_SPECIAL = {
  id: 'expressway-flyover',
  name: 'Expressway Flyover',
  startupFrames: 20,
  activeFrames: 8,
  recoveryFrames: 32,
  damage: 18,
  range: 2.1,
  auraCost: 35,
  auraGain: 16,
  hitStopFrames: 8,
  knockback: new THREE.Vector3(0.1, 0.24, 0),
} as const;

export const GADKARI_ULTIMATE = {
  id: 'bulldozer-overdrive',
  name: 'Toll-Free Bulldozer Overdrive',
  auraCost: 100,
  startupFrames: 50,
  activeFrames: 40,
  recoveryFrames: 52,
  damage: 42,
  hitStopFrames: 10,
  cameraZoom: 0.68,
  cameraShake: 1,
  timeScale: 0.16,
  color: 0x62d9ff,
} as const;

export function createGadkariRig(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'NitinGadkariRig';

  const skin = new THREE.MeshStandardMaterial({ color: 0xbd805a, roughness: 0.82 });
  const suitMat = new THREE.MeshStandardMaterial({ color: 0x7b807c, roughness: 0.76 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x292724, roughness: 0.9 });
  const trouserMat = new THREE.MeshStandardMaterial({ color: 0xb8aa8d, roughness: 0.88 });

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.45, 0.67, 4, 10),
    new THREE.MeshStandardMaterial({ color: 0xb8ad91, roughness: 0.82 }),
  );
  torso.position.y = 1.12;
  torso.scale.set(1.15, 1, 0.9);
  torso.castShadow = true;
  root.add(torso);

  const jacket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.43, 0.5, 0.74, 10, 1, true),
    suitMat,
  );
  jacket.position.y = 1.18;
  root.add(jacket);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), skin);
  head.position.y = 1.93;
  head.scale.set(1.06, 1.02, 0.94);
  root.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.305, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.42),
    hairMat,
  );
  hair.position.y = 2.01;
  root.add(hair);

  const spectacleMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a2430,
    metalness: 0.65,
    roughness: 0.3,
  });

  for (const side of [-1, 1]) {
    const lens = new THREE.Mesh(
      new THREE.TorusGeometry(0.075, 0.012, 6, 16),
      spectacleMaterial,
    );
    lens.position.set(side * 0.12, 1.99, 0.27);
    root.add(lens);

    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.5, 4, 8), suitMat);
    arm.position.set(side * 0.5, 1.12, 0);
    arm.rotation.z = side * -0.12;
    root.add(arm);

    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.135, 0.5, 4, 8), trouserMat);
    leg.position.set(side * 0.21, 0.36, 0);
    root.add(leg);
  }

  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  return root;
}
