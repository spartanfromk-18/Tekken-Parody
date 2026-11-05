export type AttackType = 'quick' | 'power' | 'launcher' | 'special' | 'ultimate';

export interface FrameData {
  startup: number;
  active: number;
  recovery: number;
}

export interface MoveDefinition {
  id: string;
  type: AttackType;
  startupFrames: number;
  activeFrames: number;
  recoveryFrames: number;
  damage: number;
  range: number;
  hitStopFrames: number;
  auraGain: number;
  auraCost: number;
  knockback: number;
  launchVelocity?: number;
}

export const QUICK: MoveDefinition = {
  id: 'quick',
  type: 'quick',
  startupFrames: 5,
  activeFrames: 3,
  recoveryFrames: 12,
  damage: 5,
  range: 1.05,
  hitStopFrames: 3,
  auraGain: 8,
  auraCost: 5,
  knockback: 0.035,
};

export const POWER_MOVE: MoveDefinition = {
  id: 'power',
  type: 'power',
  startupFrames: 12,
  activeFrames: 4,
  recoveryFrames: 22,
  damage: 14,
  range: 1.25,
  knockback: 0.16,
  hitStopFrames: 7,
  auraGain: 12,
  auraCost: 10,
};

export const LAUNCHER_MOVE: MoveDefinition = {
  ...POWER_MOVE,
  id: 'launcher',
  type: 'launcher',
  startupFrames: 14,
  activeFrames: 3,
  recoveryFrames: 24,
  damage: 9,
  launchVelocity: 0.19,
};

export const SPECIAL_MOVE: MoveDefinition = {
  id: 'special',
  type: 'special',
  startupFrames: 8,
  activeFrames: 6,
  recoveryFrames: 20,
  damage: 18,
  range: 3.2,
  hitStopFrames: 7,
  auraGain: 15,
  auraCost: 25,
  knockback: 0.12,
};

export const ULTIMATE_MOVE: MoveDefinition = {
  id: 'ultimate',
  type: 'ultimate',
  startupFrames: 4,
  activeFrames: 8,
  recoveryFrames: 30,
  damage: 35,
  range: 4.5,
  hitStopFrames: 8,
  auraGain: 0,
  auraCost: 100,
  knockback: 0.25,
};
