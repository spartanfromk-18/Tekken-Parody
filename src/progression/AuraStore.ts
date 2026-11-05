export interface AuraSaveData {
  version: 1;
  aura: number;
  unlocks: string[];
}

const STORAGE_KEY = 'aura-clash:progression:v1';
const DEFAULT_UNLOCKS = ['palette:default', 'stage:sansad', 'stage:jantar'];

export class AuraStore {
  private data: AuraSaveData = { version: 1, aura: 500, unlocks: [...DEFAULT_UNLOCKS] };

  constructor(private readonly storage: Storage | null = typeof window === 'undefined' ? null : window.localStorage) {
    this.load();
  }

  get aura(): number {
    return this.data.aura;
  }

  isUnlocked(id: string): boolean {
    return this.data.unlocks.includes(id) || DEFAULT_UNLOCKS.includes(id);
  }

  earn(amount: number): number {
    this.data.aura = Math.min(Number.MAX_SAFE_INTEGER, this.data.aura + Math.max(0, amount));
    this.save();
    return this.data.aura;
  }

  spend(amount: number): boolean {
    if (!Number.isFinite(amount) || amount < 0 || this.data.aura < amount) return false;
    this.data.aura -= amount;
    this.save();
    return true;
  }

  unlock(id: string, cost: number): boolean {
    if (this.isUnlocked(id) || !this.spend(cost)) return this.isUnlocked(id);
    this.data.unlocks.push(id);
    this.save();
    return true;
  }

  private save(): void {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error: unknown) {
      console.warn('[AuraStore] Progress could not be saved', error);
    }
  }

  private load(): void {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!isAuraSaveData(parsed)) return;
      this.data = { version: 1, aura: parsed.aura, unlocks: [...new Set(parsed.unlocks)] };
    } catch (error: unknown) {
      console.warn('[AuraStore] Progress could not be loaded', error);
    }
  }
}

function isAuraSaveData(value: unknown): value is AuraSaveData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<AuraSaveData>;
  return data.version === 1 && typeof data.aura === 'number' && Number.isFinite(data.aura)
    && Array.isArray(data.unlocks) && data.unlocks.every((item) => typeof item === 'string');
}
