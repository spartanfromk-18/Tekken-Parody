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
    this.element.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);'
      + 'padding:10px 18px;background:#0f1322dd;border:1px solid #283252;'
      + 'color:#fff;font:600 14px monospace;z-index:5;';
  }

  update(state: HudState): void {
    this.element.textContent = `Round: ${state.round} | Time: ${state.timer} | P1 HP: ${state.p1.health} | P2 HP: ${state.p2.health}`;
  }

  destroy(): void {
    this.element.remove();
  }
}
