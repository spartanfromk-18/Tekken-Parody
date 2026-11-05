import * as THREE from 'three';
import { buildJantarMantarArena } from './JantarMantarArena';
import { buildSansadArena } from './SansadArena';
import { buildDesiSadakArena } from './DesiSadakArena';

export interface ArenaEntry {
  id: string;
  name: string;
  tagline: string;
  build: (scene: THREE.Scene) => void;
}

export const ARENA_REGISTRY: Record<string, ArenaEntry> = {
  jantar: { id: 'jantar', name: 'Jantar Mantar', tagline: 'Neon democracy after dark', build: buildJantarMantarArena },
  sansad: { id: 'sansad', name: 'Sansad Cyber-Colosseum', tagline: 'The house always wins', build: buildSansadArena },
  sadak: { id: 'sadak', name: 'Desi Sadak', tagline: 'Traffic, but make it competitive', build: buildDesiSadakArena },
};
