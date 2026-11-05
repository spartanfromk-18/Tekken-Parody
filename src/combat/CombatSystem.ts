import { MoveDefinition } from './MoveTypes';

export interface CombatState {
  health: number;
  aura: number;
  stun: number;
  hitstop: number;
}

export class CombatSystem {
  readonly p1State: CombatState = { health: 100, aura: 100, stun: 0, hitstop: 0 };
  readonly p2State: CombatState = { health: 100, aura: 100, stun: 0, hitstop: 0 };

  executeMove(attacker: CombatState, defender: CombatState, move: MoveDefinition): boolean {
    if (attacker.stun > 0 || attacker.aura < move.auraCost) return false;
    attacker.aura -= move.auraCost;
    defender.health = Math.max(0, defender.health - move.damage);
    defender.hitstop = move.hitStopFrames;
    attacker.aura = Math.min(100, attacker.aura + move.auraGain);
    return true;
  }
}
