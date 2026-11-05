import * as THREE from 'three';

export const RAHUL_SPECIAL = {
  id: 'bharat-jodo-marathon-dash',
  name: 'Bharat Jodo Marathon Dash',
  startupFrames: 12,
  activeFrames: 16,
  recoveryFrames: 24,
  damage: 14,
  range: 3.8,
  auraCost: 35,
  auraGain: 14,
  hitStopFrames: 5,
  knockback: new THREE.Vector3(0.14, 0.04, 0),
} as const;

export const RAHUL_ULTIMATE = {
  id: 'khatakhat-barrage',
  name: 'Khatakhat Barrage',
  auraCost: 100,
  startupFrames: 36,
  activeFrames: 42,
  recoveryFrames: 44,
  damage: 36,
  hitStopFrames: 9,
  cameraZoom: 0.76,
  cameraShake: 0.75,
  timeScale: 0.2,
  color: 0x69bfff,
} as const;

export function createRahulRig(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'RahulGandhiRig';

  const skin = new THREE.MeshStandardMaterial({ color: 0xb87954, roughness: 0.84 });
  const kurta = new THREE.MeshStandardMaterial({ color: 0xf5f3eb, roughness: 0.88 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x17191f, roughness: 0.95 });
  const beardMat = new THREE.MeshStandardMaterial({ color: 0x29282a, roughness: 0.95 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.68, 4, 10), kurta);
  torso.position.y = 1.13;
  torso.scale.set(0.98, 1, 0.78);
  torso.castShadow = true;
  root.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), skin);
  head.position.y = 1.96;
  head.scale.set(0.91, 1.08, 0.92);
  root.add(head);

  const hairMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.315, 14, 9, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairMat,
  );
  hairMesh.position.set(0, 2.01, -0.015);
  hairMesh.rotation.z = -0.08;
  root.add(hairMesh);

  const beardMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.235, 12, 8, 0, Math.PI * 2, Math.PI * 0.53, Math.PI * 0.42),
    beardMat,
  );
  beardMesh.position.set(0, 1.82, 0.085);
  beardMesh.scale.set(0.92, 0.72, 0.88);
  root.add(beardMesh);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 8), skin);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 1.93, 0.29);
  root.add(nose);

  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.024, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0x17191f }),
    );
    eye.position.set(side * 0.11, 2.01, 0.275);
    root.add(eye);

    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.56, 4, 8), kurta);
    arm.position.set(side * 0.46, 1.13, 0);
    arm.rotation.z = side * -0.12;
    root.add(arm);

    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.54, 4, 8), kurta);
    leg.position.set(side * 0.18, 0.37, 0);
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
