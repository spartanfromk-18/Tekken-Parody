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
    let parsed: unknown;
    try {
      parsed = JSON.parse(new TextDecoder().decode(payload));
    } catch (error: unknown) {
      throw new Error('Invalid network snapshot JSON', { cause: error });
    }
    if (!isNetworkSnapshot(parsed)) throw new Error('Invalid network snapshot payload');
    return parsed;
  }
}

function isNetworkSnapshot(value: unknown): value is NetworkSnapshot {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<NetworkSnapshot>;
  return Number.isInteger(data.tick) && Number.isInteger(data.round)
    && typeof data.timer === 'number' && Number.isFinite(data.timer)
    && Array.isArray(data.fighters) && data.fighters.length === 2
    && data.fighters.every(isFighterState);
}

function isFighterState(value: unknown): value is NetFighterState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<NetFighterState>;
  return ['x', 'y', 'z', 'health', 'aura'].every((key) => {
    const item = state[key as keyof NetFighterState];
    return typeof item === 'number' && Number.isFinite(item);
  });
}
