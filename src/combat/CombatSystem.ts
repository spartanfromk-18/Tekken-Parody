import { MoveDefinition } from './MoveTypes';

export interface CombatState {
  health: number;
  aura: number;
  stun: number;
  hitstop: number;
  blocking: boolean;
}

export interface CombatResult {
  hit: boolean;
  damage: number;
  blocked: boolean;
}

export class CombatSystem {
  readonly p1State: CombatState = { health: 100, aura: 0, stun: 0, hitstop: 0, blocking: false };
  readonly p2State: CombatState = { health: 100, aura: 0, stun: 0, hitstop: 0, blocking: false };

  executeMove(attacker: CombatState, defender: CombatState, move: MoveDefinition): CombatResult {
    if (attacker.stun > 0 || attacker.aura < move.auraCost || defender.health <= 0) {
      return { hit: false, damage: 0, blocked: false };
    }
    attacker.aura -= move.auraCost;
    const blocked = defender.blocking;
    const damage = blocked ? Math.ceil(move.damage * 0.2) : move.damage;
    defender.health = Math.max(0, defender.health - damage);
    defender.hitstop = move.hitStopFrames;
    defender.stun = blocked ? 5 : Math.ceil(move.recoveryFrames * 0.55);
    attacker.aura = Math.min(100, attacker.aura + move.auraGain);
    if (!blocked) defender.aura = Math.min(100, defender.aura + Math.ceil(damage * 0.6));
    return { hit: true, damage, blocked };
  }

  reset(): void {
    Object.assign(this.p1State, { health: 100, aura: 25, stun: 0, hitstop: 0, blocking: false });
    Object.assign(this.p2State, { health: 100, aura: 25, stun: 0, hitstop: 0, blocking: false });
  }

  tick(): void {
    for (const fighter of [this.p1State, this.p2State]) {
      fighter.stun = Math.max(0, fighter.stun - 1);
      fighter.hitstop = Math.max(0, fighter.hitstop - 1);
    }
  }
}
