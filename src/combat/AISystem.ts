import type { InputState } from '../core/InputManager';
import { neutralInput } from '../core/InputManager';

export class AISystem {
  decide(distance: number, canAct: boolean, difficulty: 'easy' | 'normal' | 'hard' = 'normal', frame = 0): InputState {
    const input = neutralInput();
    if (!canAct) return input;
    const attackWindow = difficulty === 'easy' ? 45 : difficulty === 'normal' ? 30 : 20;
    if (distance > 1.35) input.left = true;
    else if (distance < 0.7) input.right = true;
    else if (frame % attackWindow === 0) {
      if (difficulty === 'hard' && frame % 100 === 0) input.special = true;
      else if (frame % 3 === 0) input.power = true;
      else input.quick = true;
    } else if (difficulty !== 'easy' && frame % 17 === 0) input.down = true;
    return input;
  }

  update(distance: number, canAct: boolean, difficulty: 'easy' | 'normal' | 'hard' = 'normal', frame = 0): InputState {
    return this.decide(distance, canAct, difficulty, frame);
  }
}
