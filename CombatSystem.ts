import { QUICK, POWER_MOVE, LAUNCHER_MOVE, MoveDefinition } from './MoveTypes';

export interface CombatState {
  health: number;
  aura: number;
  stun: number;
  hitstop: number;
}

export class CombatSystem {
  readonly p1State: CombatState = { health: 100, aura: 0, stun: 0, hitstop: 0 };
  readonly p2State: CombatState = { health: 100, aura: 0, stun: 0, hitstop: 0 };

  executeMove(attacker: CombatState, defender: CombatState, move: MoveDefinition): void {
    defender.health = Math.max(0, defender.health - move.damage);
    defender.hitstop = move.hitStopFrames;
    attacker.aura = Math.min(100, attacker.aura + move.auraGain);
  }
}
