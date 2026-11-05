import type { InputState } from '../core/InputManager';
import { neutralInput } from '../core/InputManager';

export class AISystem {
  decide(distance: number, canAct: boolean, difficulty: 'easy' | 'normal' | 'hard' = 'normal', frame = 0, p1X = 0, p2X = 2): InputState {
    const input = neutralInput();
    if (!canAct) return input;
    const attackWindow = difficulty === 'easy' ? 45 : difficulty === 'normal' ? 30 : 20;
    const towardP1 = Math.sign(p1X - p2X);
    if (distance > 2.0) {
      if (towardP1 < 0) input.right = true;
      else if (towardP1 > 0) input.left = true;
    } else if (distance < 1.4) {
      if (towardP1 < 0) input.left = true;
      else if (towardP1 > 0) input.right = true;
    }
    else if (frame % attackWindow === 0) {
      if (difficulty === 'hard' && frame % 100 === 0) input.special = true;
      else if (frame % 3 === 0) input.power = true;
      else input.quick = true;
    } else if (difficulty !== 'easy' && frame % 17 === 0) input.down = true;
    return input;
  }

  update(distance: number, canAct: boolean, difficulty: 'easy' | 'normal' | 'hard' = 'normal', frame = 0, p1X = 0, p2X = 2): InputState {
    return this.decide(distance, canAct, difficulty, frame, p1X, p2X);
  }
}
