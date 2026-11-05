export type MasteryRank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Grandmaster';

export interface MasteryRecord {
  experience: number;
  wins: number;
  matches: number;
  rank: MasteryRank;
}

export class MasterySystem {
  constructor(private readonly storageKey = 'aura-clash:mastery:v1') {}

  getRank(experience: number): MasteryRank {
    if (experience >= 2800) return 'Grandmaster';
    if (experience >= 1600) return 'Diamond';
    if (experience >= 900) return 'Platinum';
    if (experience >= 600) return 'Gold';
    if (experience >= 250) return 'Silver';
    return 'Bronze';
  }

  createRecord(experience = 0, wins = 0, matches = 0): MasteryRecord {
    const safeExperience = Math.max(0, experience);
    return {
      experience: safeExperience,
      wins: Math.max(0, wins),
      matches: Math.max(0, matches),
      rank: this.getRank(safeExperience),
    };
  }

  recordMatch(record: MasteryRecord, won: boolean, experienceGain: number): MasteryRecord {
    const nextExperience = record.experience + Math.max(0, experienceGain);
    const nextRecord = this.createRecord(nextExperience, record.wins + (won ? 1 : 0), record.matches + 1);
    this.save(nextRecord);
    return nextRecord;
  }

  save(record: MasteryRecord, storage: Storage | null = typeof window === 'undefined' ? null : window.localStorage): void {
    try {
      storage?.setItem(this.storageKey, JSON.stringify(record));
    } catch {
      // Persistence is optional; gameplay state remains usable without storage.
    }
  }
}
