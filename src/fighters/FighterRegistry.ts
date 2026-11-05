import * as THREE from 'three';

export interface FighterParts {
  torso: THREE.Group;
  head: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  punchTrail: THREE.Mesh;
  shockwave: THREE.Mesh;
}

export interface FighterEntry {
  id: string;
  name: string;
  archetype: string;
  accent: string;
  createRig: () => THREE.Group;
}

function material(color: string | number, emissive = 0x000000): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: emissive ? 0.7 : 0,
    roughness: 0.65,
    metalness: 0.15,
  });
}

function addArm(pivot: THREE.Group, skin: THREE.MeshStandardMaterial, accent: string): void {
  const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.22, 4, 8), material(accent));
  sleeve.position.y = -0.12;
  const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.2, 4, 8), skin);
  forearm.position.set(0, -0.28, 0.18);
  forearm.rotation.x = -0.4;
  const fist = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), material(0xf8d28b, 0x332000));
  fist.name = 'fist';
  fist.position.set(0, -0.39, 0.39);
  pivot.add(sleeve, forearm, fist);
}

function addLeg(pivot: THREE.Group, trousers: THREE.MeshStandardMaterial, shoes: THREE.MeshStandardMaterial): void {
  const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.42, 4, 8), trousers);
  leg.position.y = -0.2;
  const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.34), shoes);
  shoe.position.set(0, -0.5, 0.08);
  pivot.add(leg, shoe);
}

function createHumanoidRig(id: string, accent: string): THREE.Group {
  const root = new THREE.Group();
  root.name = `${id}HumanoidRig`;
  const accentMaterial = material(accent, Number.parseInt(accent.slice(1), 16));
  const skin = material(0xc98d62);
  const dark = material(0x17191f);
  const trousers = material(0x29354d);
  const shoes = material(0x080a12);

  const torso = new THREE.Group();
  torso.name = 'torso';
  torso.position.y = 0.95;
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.65, 0.26), accentMaterial);
  body.castShadow = true;
  torso.add(body);
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.29), material(0xf1eee5));
  collar.position.y = 0.25;
  torso.add(collar);

  const head = new THREE.Group();
  head.name = 'head';
  head.position.y = 1.52;
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 10), skin);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.265, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.48), dark);
  hair.position.y = 0.13;
  const eye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.03), dark);
  eye.position.set(0, 0.01, 0.24);
  head.add(face, hair, eye);

  const leftArmPivot = new THREE.Group();
  leftArmPivot.name = 'leftArmPivot';
  leftArmPivot.position.set(-0.32, 1.22, 0);
  const rightArmPivot = new THREE.Group();
  rightArmPivot.name = 'rightArmPivot';
  rightArmPivot.position.set(0.32, 1.22, 0);
  addArm(leftArmPivot, skin, accent);
  addArm(rightArmPivot, skin, accent);

  const leftLegPivot = new THREE.Group();
  leftLegPivot.name = 'leftLegPivot';
  leftLegPivot.position.set(-0.13, 0.62, 0);
  const rightLegPivot = new THREE.Group();
  rightLegPivot.name = 'rightLegPivot';
  rightLegPivot.position.set(0.13, 0.62, 0);
  addLeg(leftLegPivot, trousers, shoes);
  addLeg(rightLegPivot, trousers, shoes);

  const punchTrail = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 0.55, 12),
    new THREE.MeshBasicMaterial({ color: 0x55e6ff, transparent: true, opacity: 0 }),
  );
  punchTrail.name = 'punchTrail';
  punchTrail.rotation.x = -Math.PI / 2;
  punchTrail.position.set(0, -0.4, 0.62);
  const shockwave = new THREE.Mesh(
    new THREE.RingGeometry(0.12, 0.2, 24),
    new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0, side: THREE.DoubleSide }),
  );
  shockwave.name = 'shockwave';
  shockwave.rotation.x = Math.PI / 2;
  shockwave.position.set(0, -0.15, 0.72);
  root.add(torso, head, leftArmPivot, rightArmPivot, leftLegPivot, rightLegPivot, punchTrail, shockwave);
  root.userData.parts = { torso, head, leftArmPivot, rightArmPivot, leftLegPivot, rightLegPivot, punchTrail, shockwave } satisfies FighterParts;
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  return root;
}

function entry(id: string, name: string, archetype: string, accent: string): FighterEntry {
  return { id, name, archetype, accent, createRig: () => createHumanoidRig(id, accent) };
}

export const FIGHTER_REGISTRY: Record<string, FighterEntry> = {
  modi: entry('modi', 'Narendra Modi', 'Aura Vanguard', '#ff9a3c'),
  rahul: entry('rahul', 'Rahul Gandhi', 'Rushdown', '#69bfff'),
  gadkari: entry('gadkari', 'Nitin Gadkari', 'Heavyweight', '#62d9ff'),
  xi: entry('xi', 'Xi Jinping', 'Counter Strategist', '#dd2222'),
  trump: entry('trump', 'Donald Trump', 'Wall Breaker', '#ffd700'),
  tung_tung: entry('tung_tung', 'Tung Tung Sahur', 'String Specialist', '#d49b57'),
  doge: entry('doge', 'Doge', 'Evasive Trickster', '#ffaa00'),
  sigma_cat: entry('sigma_cat', 'Sigma Cat', 'Parry Specialist', '#9933ff'),
};
