export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  sidestepUp: boolean;
  sidestepDown: boolean;
  quick: boolean;
  power: boolean;
  launcher: boolean;
  special: boolean;
  ultimate: boolean;
  pause: boolean;
}

export type InputPatch = Partial<InputState>;

export function neutralInput(): InputState {
  return {
    left: false,
    right: false,
    up: false,
    down: false,
    sidestepUp: false,
    sidestepDown: false,
    quick: false,
    power: false,
    launcher: false,
    special: false,
    ultimate: false,
    pause: false,
  };
}

const KEY_BINDINGS: Readonly<Record<string, keyof InputState>> = {
  KeyA: "left",
  KeyD: "right",
  KeyW: "up",
  KeyS: "down",
  KeyQ: "sidestepUp",
  KeyE: "sidestepDown",
  KeyJ: "quick",
  KeyK: "power",
  KeyI: "launcher",
  KeyU: "special",
  KeyL: "ultimate",
  Space: "ultimate",
  Escape: "pause",
  a: "left",
  d: "right",
  w: "up",
  s: "down",
  arrowleft: "left",
  arrowright: "right",
  arrowup: "up",
  arrowdown: "down",
  q: "sidestepUp",
  e: "sidestepDown",
  j: "quick",
  k: "power",
  i: "launcher",
  u: "special",
  l: "ultimate",
  " ": "ultimate",
  spacebar: "ultimate",
  enter: "pause",
  escape: "pause",
};

export class InputManager {
  private readonly held = new Set<keyof InputState>();
  private synthetic: InputState | null = null;

  constructor(private readonly target: Window = window) {
    target.addEventListener("keydown", this.onKeyDown, { passive: false });
    target.addEventListener("keyup", this.onKeyUp);
    target.addEventListener("blur", this.clear);
  }

  sample(): InputState {
    if (this.synthetic) return { ...this.synthetic };
    const state = neutralInput();
    for (const action of this.held) state[action] = true;
    return state;
  }

  inject(state: InputState | null): void {
    this.synthetic = state ? { ...state } : null;
  }

  clear = (): void => {
    this.held.clear();
    this.synthetic = null;
  };

  dispose(): void {
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
    this.target.removeEventListener("blur", this.clear);
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const action = this.actionFor(event);
    if (action) {
      event.preventDefault();
      this.held.add(action);
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    const action = this.actionFor(event);
    if (action) {
      event.preventDefault();
      this.held.delete(action);
    }
  };

  private actionFor(event: KeyboardEvent): keyof InputState | undefined {
    return KEY_BINDINGS[event.code] ?? KEY_BINDINGS[event.key.toLowerCase()];
  }
}
