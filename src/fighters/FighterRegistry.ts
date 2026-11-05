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
  createRig: () => THREE.Group;
}

export const FIGHTER_REGISTRY: Record<string, FighterEntry> = {
  modi: { id: 'modi', name: 'Narendra Modi', createRig: createModiRig },
  rahul: { id: 'rahul', name: 'Rahul Gandhi', createRig: createRahulRig },
  gadkari: { id: 'gadkari', name: 'Nitin Gadkari', createRig: createGadkariRig },
  xi: { id: 'xi', name: 'Xi Jinping', createRig: createXiRig },
  trump: { id: 'trump', name: 'Donald Trump', createRig: createTrumpRig },
  tung_tung: { id: 'tung_tung', name: 'Tung Tung Sahur', createRig: createTungTungRig },
  doge: { id: 'doge', name: 'Doge', createRig: createDogeRig },
  sigma_cat: { id: 'sigma_cat', name: 'Sigma Cat', createRig: createSigmaCatRig },
};
