import { ARENA_REGISTRY } from '../arenas/ArenaRegistry';
import { FIGHTER_REGISTRY } from '../fighters/FighterRegistry';

export interface HudFighterState {
  name: string;
  health: number;
  aura: number;
  roundsWon: number;
  combo: number;
}
export interface HudState { p1: HudFighterState; p2: HudFighterState; round: number; timer: number; phase: string; ticker: string; }
export interface LobbySelection { p1: string; p2: string; arena: string; difficulty: 'easy' | 'normal' | 'hard' | 'local'; }
type StartListener = (selection: LobbySelection) => void;

export class HudOverlay {
  readonly element: HTMLDivElement;
  private readonly lobby: HTMLDivElement;
  private readonly match: HTMLDivElement;
  private readonly matchContent: HTMLDivElement;
  private readonly hitLayer: HTMLDivElement;
  private selection: LobbySelection = { p1: 'modi', p2: 'rahul', arena: 'jantar', difficulty: 'normal' };
  private readonly onStart: StartListener;

  constructor(private readonly root: HTMLElement, onStart: StartListener = () => undefined) {
    this.onStart = onStart;
    this.element = document.createElement('div');
    this.element.className = 'hud-overlay';
    this.lobby = document.createElement('div');
    this.match = document.createElement('div');
    this.lobby.className = 'lobby-overlay';
    this.match.className = 'match-hud';
    this.matchContent = document.createElement('div');
    this.hitLayer = document.createElement('div');
    this.hitLayer.className = 'hit-layer';
    this.match.append(this.matchContent, this.hitLayer);
    this.element.append(this.lobby, this.match);
    this.root.append(this.element);
    this.addStyles();
    this.renderLobby();
    this.showTitle();
  }

  showTitle(): void { this.lobby.style.display = 'none'; this.match.style.display = 'none'; }
  showLobby(): void { this.lobby.style.display = 'grid'; this.match.style.display = 'none'; this.renderLobby(); }
  showMatch(): void { this.lobby.style.display = 'none'; this.match.style.display = 'block'; }
  showHit(damage: number, superMove = false): void {
    const popup = document.createElement('div');
    popup.className = 'damage-popup';
    popup.textContent = superMove ? `SUPER! -${damage}` : `-${damage}`;
    this.hitLayer.append(popup);
    window.setTimeout(() => popup.remove(), 850);
  }
  showPostMatch(winner: string, onRematch: () => void, onSelect: () => void): void {
    const panel = document.createElement('div');
    panel.className = 'post-match';
    panel.innerHTML = `<strong>K.O.</strong><span>${winner} WINS!</span><div><button data-action="rematch">REMATCH</button><button data-action="select">CHARACTER SELECT</button></div>`;
    panel.querySelector('[data-action="rematch"]')?.addEventListener('click', onRematch);
    panel.querySelector('[data-action="select"]')?.addEventListener('click', onSelect);
    this.match.appendChild(panel);
  }
  update(state: HudState): void {
    this.matchContent.innerHTML = `<div class="ticker">BREAKING NEWS // ${state.ticker}</div>
      <div class="top-hud"><div class="fighter-name p1">${state.p1.name}<b>${state.p1.roundsWon}</b></div>
      <div class="timer">${state.timer.toString().padStart(2, '0')}<small>ROUND ${state.round}</small></div>
      <div class="fighter-name p2">${state.p2.name}<b>${state.p2.roundsWon}</b></div></div>
      <div class="bars"><div><label>${state.p1.name}</label><i style="width:${state.p1.health}%"></i><em style="width:${state.p1.aura}%"></em><small>SHAKTI ${state.p1.aura}</small></div><div><label>${state.p2.name}</label><i style="width:${state.p2.health}%"></i><em style="width:${state.p2.aura}%"></em><small>SHAKTI ${state.p2.aura}</small></div></div>
      <div class="controls">MOVE A/D or ←/→ &nbsp; J PUNCH &nbsp; K KICK &nbsp; I GRAB &nbsp; L/SPACE SUPER</div>`;
  }
  destroy(): void { this.element.remove(); this.lobby.remove(); this.match.remove(); }

  private renderLobby(): void {
    const fighters = Object.values(FIGHTER_REGISTRY);
    const arenas = Object.values(ARENA_REGISTRY);
    this.lobby.innerHTML = `<div class="lobby-card"><div class="eyebrow">AURA // CLASH</div><h1>SELECT YOUR FIGHT</h1>
      <section><h2>PLAYER 1</h2><div class="choices">${fighters.map((f) => `<button class="${f.id === this.selection.p1 ? 'selected' : ''}" data-kind="p1" data-id="${f.id}"><strong>${f.name}</strong><small>${f.archetype}</small></button>`).join('')}</div></section>
      <section><h2>PLAYER 2 / CPU</h2><div class="choices">${fighters.map((f) => `<button class="${f.id === this.selection.p2 ? 'selected' : ''}" data-kind="p2" data-id="${f.id}"><strong>${f.name}</strong><small>${f.archetype}</small></button>`).join('')}</div></section>
      <section><h2>STAGE</h2><div class="choices">${arenas.map((a) => `<button class="${a.id === this.selection.arena ? 'selected' : ''}" data-kind="arena" data-id="${a.id}"><strong>${a.name}</strong><small>${a.tagline}</small></button>`).join('')}</div></section>
      <section class="modes"><h2>MODE</h2>${(['easy', 'normal', 'hard', 'local'] as const).map((d) => `<button class="${d === this.selection.difficulty ? 'selected' : ''}" data-kind="difficulty" data-id="${d}">CPU ${d.toUpperCase()}</button>`).join('')}</section>
      <button class="fight-button" data-action="fight">FIGHT!</button></div>`;
    this.lobby.querySelectorAll<HTMLButtonElement>('button[data-kind]').forEach((button) => button.addEventListener('click', () => {
      const kind = button.dataset.kind;
      const id = button.dataset.id;
      if (kind === 'p1' || kind === 'p2') this.selection[kind] = id ?? this.selection[kind];
      else if (kind === 'arena') this.selection.arena = id ?? this.selection.arena;
      else if (kind === 'difficulty' && (id === 'easy' || id === 'normal' || id === 'hard' || id === 'local')) this.selection.difficulty = id;
      this.renderLobby();
    }));
    this.lobby.querySelector('[data-action="fight"]')?.addEventListener('click', () => this.onStart({ ...this.selection }));
  }

  private addStyles(): void {
    const style = document.createElement('style');
    style.textContent = `.hud-overlay{position:fixed;inset:0;pointer-events:none;z-index:50;font-family:system-ui,sans-serif}.lobby-overlay{position:fixed;inset:0;z-index:60;display:none;place-items:center;background:linear-gradient(135deg,#080a14ee,#151027f5);pointer-events:auto;overflow:auto}.lobby-card{width:min(1100px,94vw);padding:30px;color:#f5f7ff}.eyebrow{color:#55e6ff;letter-spacing:.3em}h1{font-size:clamp(30px,5vw,68px);font-style:italic;margin:5px 0 24px}h2{font-size:11px;letter-spacing:.2em;color:#9da8c7;margin:18px 0 8px}.choices{display:flex;gap:8px;flex-wrap:wrap}.choices button,.modes button{min-width:130px;padding:12px;background:#11182b;border:1px solid #29375c;color:#fff;text-align:left;cursor:pointer;pointer-events:auto}.choices button.selected,.modes button.selected{border-color:#55e6ff;background:#172b46}.choices small{display:block;color:#9da8c7;margin-top:4px}.fight-button{margin-top:24px;padding:16px 54px;border:0;background:#ff4fc8;color:#fff;font-size:20px;font-weight:800;cursor:pointer;pointer-events:auto;transform:skew(-10deg)}.match-hud{pointer-events:none;color:#fff}.ticker{background:#ff4fc8;color:#160b22;text-align:center;padding:5px;font-weight:800;letter-spacing:.08em}.top-hud{display:flex;justify-content:space-between;align-items:center;padding:18px 5vw 4px;font-weight:800}.fighter-name{width:38%;font-size:clamp(12px,2vw,22px)}.fighter-name.p2{text-align:right}.fighter-name b{display:block;color:#ffd166}.timer{text-align:center;font-size:42px}.timer small{display:block;font-size:9px;color:#9da8c7}.bars{display:flex;gap:4vw;padding:0 5vw}.bars>div{height:42px;flex:1;background:#272b42;border:1px solid #61709c;position:relative}.bars label{display:block;font-size:10px;font-weight:800;letter-spacing:.08em}.bars i{display:block;height:18px;background:linear-gradient(90deg,#39d353,#f5c542,#ef4444);transition:width 180ms ease}.bars>div:nth-child(2) i{margin-left:auto}.bars em{display:block;position:absolute;bottom:8px;height:4px;background:linear-gradient(90deg,#55e6ff,#ffd166);transition:width 180ms ease}.bars small{position:absolute;right:4px;bottom:0;font:9px monospace;color:#ffd166}.controls{position:fixed;bottom:0;left:0;right:0;padding:8px;text-align:center;background:#080a14cc;color:#b7c0d8;font:11px monospace}.hit-layer{position:fixed;inset:100px 0 0;pointer-events:none}.damage-popup{position:absolute;left:50%;top:30%;color:#ffd166;font-size:28px;font-weight:900;text-shadow:0 2px 8px #000;animation:damage-rise .85s ease-out forwards}@keyframes damage-rise{to{transform:translateY(-70px) scale(1.2);opacity:0}}.post-match{pointer-events:auto;position:fixed;inset:20%;display:grid;place-content:center;gap:12px;text-align:center;background:#080a14ee;border:1px solid #ff4fc8}.post-match strong{font-size:60px;color:#ff4fc8}.post-match span{font-size:28px}.post-match button{margin:8px;padding:12px 20px;cursor:pointer}`;
    document.head.appendChild(style);
  }
}
