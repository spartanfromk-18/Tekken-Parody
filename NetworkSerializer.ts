import type { EngineSnapshot } from '../core/Engine';

export interface NetFighterState {
  x: number;
  y: number;
  z: number;
  health: number;
  aura: number;
}

export interface NetworkSnapshot {
  tick: number;
  round: number;
  timer: number;
  fighters: [NetFighterState, NetFighterState];
}

export class NetworkCodec {
  static serialize(snapshot: NetworkSnapshot): Uint8Array {
    return new TextEncoder().encode(JSON.stringify(snapshot));
  }

  static deserialize(payload: Uint8Array): NetworkSnapshot {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(payload));
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid network snapshot payload');
    }
    return parsed as NetworkSnapshot;
  }
}
