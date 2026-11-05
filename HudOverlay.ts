export interface HudFighterState {
  name: string;
  health: number;
  aura: number;
  roundsWon: number;
  combo: number;
}

export interface HudState {
  p1: HudFighterState;
  p2: HudFighterState;
  round: number;
  timer: number;
}

export class HudOverlay {
  readonly element: HTMLDivElement;

  constructor(private readonly root: HTMLElement) {
    this.element = document.createElement('div');
    this.element.className = 'hud-overlay';
    this.root.appendChild(this.element);
  }

  update(state: HudState): void {
    this.element.textContent = `Round: ${state.round} | Time: ${state.timer} | P1 HP: ${state.p1.health} | P2 HP: ${state.p2.health}`;
  }

  destroy(): void {
    this.element.remove();
  }
}
