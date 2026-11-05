export interface MatchRewardInput {
  won: boolean;
  bestCombo: number;
  flawlessRounds: number;
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface RewardBreakdown {
  total: number;
  base: number;
  comboBonus: number;
  flawlessBonus: number;
}

const DIFFICULTY_MULTIPLIERS: Record<MatchRewardInput['difficulty'], number> = {
  easy: 0.8,
  normal: 1,
  hard: 1.3,
};

export function calculateReward(input: MatchRewardInput): RewardBreakdown {
  const base = input.won ? 100 : 30;
  const comboBonus = Math.min(100, Math.max(0, input.bestCombo) * 5);
  const flawlessBonus = Math.max(0, input.flawlessRounds) * 40;
  const total = Math.round((base + comboBonus + flawlessBonus) * DIFFICULTY_MULTIPLIERS[input.difficulty]);
  return { total, base, comboBonus, flawlessBonus };
}
