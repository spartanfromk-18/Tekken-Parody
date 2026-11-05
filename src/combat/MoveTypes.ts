export type AttackType = 'quick' | 'power' | 'launcher' | 'ultimate';

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
