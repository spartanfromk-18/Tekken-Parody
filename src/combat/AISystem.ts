import type { InputState } from '../core/InputManager';
import { neutralInput } from '../core/InputManager';

export class AISystem {
  decide(distance: number, canAct: boolean): InputState {
    const input = neutralInput();
    if (!canAct) return input;
    if (distance > 1.15) input.left = true;
    else input.quick = true;
    return input;
  }

  update(distance: number, canAct: boolean): InputState {
    return this.decide(distance, canAct);
  }
}
