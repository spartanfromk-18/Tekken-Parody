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
};

export class InputManager {
  private readonly held = new Set<string>();
  private synthetic: InputState | null = null;

  constructor(private readonly target: Window = window) {
    target.addEventListener("keydown", this.onKeyDown, { passive: false });
    target.addEventListener("keyup", this.onKeyUp);
    target.addEventListener("blur", this.clear);
  }

  sample(): InputState {
    if (this.synthetic) return { ...this.synthetic };
    const state = neutralInput();
    for (const [code, action] of Object.entries(KEY_BINDINGS) as Array<[string, keyof InputState]>) {
      state[action] = this.held.has(code);
    }
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
    if (KEY_BINDINGS[event.code]) {
      event.preventDefault();
      this.held.add(event.code);
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    if (KEY_BINDINGS[event.code]) {
      event.preventDefault();
      this.held.delete(event.code);
    }
  };
}
