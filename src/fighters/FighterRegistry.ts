import * as THREE from 'three';
import { createDogeRig } from './roster/Doge';
import { createGadkariRig } from './roster/Gadkari';
import { createModiRig } from './roster/Modi';
import { createRahulRig } from './roster/Rahul';
import { createSigmaCatRig } from './roster/SigmaCat';
import { createTrumpRig } from './roster/Trump';
import { createTungTungRig } from './roster/TungTungSahur';
import { createXiRig } from './roster/Xi';

export interface FighterEntry {
  id: string;
  name: string;
  archetype: string;
  accent: string;
  createRig: () => THREE.Group;
}

function articulateRig(rig: THREE.Group): THREE.Group {
  const limbs: Record<string, THREE.Group> = {};
  for (const name of ['torso', 'head', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg']) {
    const limb = new THREE.Group();
    limb.name = name;
    limbs[name] = limb;
    rig.add(limb);
  }
  const meshes = rig.children.filter((child) => child instanceof THREE.Mesh);
  for (const mesh of meshes) {
    const x = mesh.position.x;
    const y = mesh.position.y;
    const name = y > 1.65 ? 'head' : y < 0.7 ? (x < 0 ? 'leftLeg' : 'rightLeg') : Math.abs(x) > 0.38 ? (x < 0 ? 'leftArm' : 'rightArm') : 'torso';
    limbs[name].attach(mesh);
  }
  rig.userData.articulated = true;
  return rig;
}

function entry(id: string, name: string, archetype: string, accent: string, createRig: () => THREE.Group): FighterEntry {
  return { id, name, archetype, accent, createRig: () => articulateRig(createRig()) };
}

export const FIGHTER_REGISTRY: Record<string, FighterEntry> = {
  modi: entry('modi', 'Narendra Modi', 'Aura Vanguard', '#ff9a3c', createModiRig),
  rahul: entry('rahul', 'Rahul Gandhi', 'Rushdown', '#69bfff', createRahulRig),
  gadkari: entry('gadkari', 'Nitin Gadkari', 'Heavyweight', '#62d9ff', createGadkariRig),
  xi: entry('xi', 'Xi Jinping', 'Counter Strategist', '#dd2222', createXiRig),
  trump: entry('trump', 'Donald Trump', 'Wall Breaker', '#ffd700', createTrumpRig),
  tung_tung: entry('tung_tung', 'Tung Tung Sahur', 'String Specialist', '#d49b57', createTungTungRig),
  doge: entry('doge', 'Doge', 'Evasive Trickster', '#ffaa00', createDogeRig),
  sigma_cat: entry('sigma_cat', 'Sigma Cat', 'Parry Specialist', '#9933ff', createSigmaCatRig),
};
