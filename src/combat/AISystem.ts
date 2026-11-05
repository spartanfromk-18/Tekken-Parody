import type { InputState } from '../core/InputManager';
import { neutralInput } from '../core/InputManager';

export class AISystem {
  decide(_distance: number, _canAct: boolean): InputState {
    const input = neutralInput();
    if (_distance > 1.15) input.right = true;
    else input.quick = true;
    return input;
  }

  update(distance: number, _canAct: boolean): InputState {
    const input = neutralInput();
    if (distance > 1.2) input.right = true;
    return input;
  }
}
