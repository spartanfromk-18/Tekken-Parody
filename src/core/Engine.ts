import * as THREE from 'three';
import { InputManager, InputState, neutralInput } from './InputManager';
import { CombatSystem } from '../combat/CombatSystem';
import { AISystem } from '../combat/AISystem';
import { PhysicsBody, resolvePushbox, stepPhysics } from '../combat/PhysicsSystem';
import { GameStateMachine } from './GameStateMachine';
import { ReplaySystem } from './ReplaySystem';
import { CameraController } from './CameraController';
import { HudOverlay, LobbySelection } from '../ui/HudOverlay';
import { ARENA_REGISTRY } from '../arenas/ArenaRegistry';
import { FIGHTER_REGISTRY } from '../fighters/FighterRegistry';
import { ProceduralAnimator } from '../fighters/ProceduralAnimator';
import { QUICK, POWER_MOVE, SPECIAL_MOVE, ULTIMATE_MOVE, MoveDefinition } from '../combat/MoveTypes';

export interface FighterSimState {
  x: number; z: number; health: number; aura: number;
  state: 'IDLE' | 'WALK' | 'ATTACK' | 'BLOCK' | 'HITSTUN' | 'JUMP' | 'CROUCH' | 'KO';
}
export interface EngineSnapshot {
  frame: number; fps: number; phase: string; p1: FighterSimState; p2: FighterSimState; errors: string[];
}

const TICK_MS = 1000 / 60;
const TICKERS = ['Parliamentary power level: surprisingly combustible', 'Exclusive: both sides deny button mashing', 'Breaking: local aura economy reaches new high', 'Analysts predict a rematch before the ad break'];

export class Engine {
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly inputManager = new InputManager();
  private readonly combatSystem = new CombatSystem();
  private readonly aiSystem = new AISystem();
  private readonly stateMachine = new GameStateMachine();
  private readonly replaySystem = new ReplaySystem();
  private readonly cameraController: CameraController;
  private readonly hud: HudOverlay;
  private p1Mesh: THREE.Group = new THREE.Group();
  private p2Mesh: THREE.Group = new THREE.Group();
  private p1Animator = new ProceduralAnimator(this.p1Mesh);
  private p2Animator = new ProceduralAnimator(this.p2Mesh);
  private p1Body!: PhysicsBody;
  private p2Body!: PhysicsBody;
  private selection: LobbySelection = { p1: 'modi', p2: 'rahul', arena: 'jantar', difficulty: 'normal' };
  private frame = 0;
  private fps = 60;
  private isRunning = false;
  private lastTime = performance.now();
  private accumulator = 0;
  private hitStopFrames = 0;
  private cameraShake = 0;
  private round = 1;
  private timer = 60;
  private p1Rounds = 0;
  private p2Rounds = 0;
  private readonly errors: string[] = [];

  constructor(container: HTMLElement) {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.cameraController = new CameraController(this.camera);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);
    this.p1Body = this.body(-2.2);
    this.p2Body = this.body(2.2);
    this.hud = new HudOverlay(container, (selection) => this.startMatch(selection));
    window.addEventListener('resize', this.resize);
    this.stateMachine.subscribe((phase) => {
      if (phase === 'CHAR_SELECT') this.hud.showLobby();
      if (phase === 'MATCH') this.hud.showMatch();
    });
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }
  stop(): void { this.isRunning = false; }
  dismissTitle(): void {
    if (this.stateMachine.is('TITLE') || this.stateMachine.is('MATCH_OVER')) this.stateMachine.transition('CHAR_SELECT');
  }
  startMatch(selection: LobbySelection = this.selection): void {
    this.selection = selection;
    if (this.stateMachine.is('TITLE')) this.stateMachine.transition('CHAR_SELECT');
    if (this.stateMachine.is('MATCH_OVER')) this.stateMachine.transition('CHAR_SELECT');
    if (this.stateMachine.is('CHAR_SELECT')) this.stateMachine.transition('VS_INTRO');
    if (this.stateMachine.is('VS_INTRO') || this.stateMachine.is('ROUND_OVER')) this.stateMachine.transition('MATCH');
    this.clearScene();
    ARENA_REGISTRY[this.selection.arena].build(this.scene);
    this.p1Mesh = FIGHTER_REGISTRY[this.selection.p1].createRig();
    this.p2Mesh = FIGHTER_REGISTRY[this.selection.p2].createRig();
    this.p1Animator = new ProceduralAnimator(this.p1Mesh);
    this.p2Animator = new ProceduralAnimator(this.p2Mesh);
    this.scene.add(this.p1Mesh, this.p2Mesh);
    this.p1Body = this.body(-2.2);
    this.p2Body = this.body(2.2);
    this.combatSystem.reset();
    this.round = 1; this.timer = 60; this.p1Rounds = 0; this.p2Rounds = 0; this.frame = 0;
    this.hud.showMatch();
  }
  private readonly body = (x: number): PhysicsBody => ({ position: { x, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, grounded: true, hitstun: 0 });

  private readonly loop = (time: number): void => {
    if (!this.isRunning) return;
    const delta = Math.min(time - this.lastTime, 100);
    this.lastTime = time; this.accumulator += delta; this.fps = Math.round(1000 / Math.max(delta, 1));
    while (this.accumulator >= TICK_MS) { this.fixedTick(); this.accumulator -= TICK_MS; }
    this.renderFrame(); requestAnimationFrame(this.loop);
  };

  private fixedTick(): void {
    this.frame++;
    if (!this.stateMachine.is('MATCH')) return;
    if (this.hitStopFrames > 0) { this.hitStopFrames--; return; }
    const p1Input = this.inputManager.sample();
    const p2Input = this.selection.difficulty === 'local'
      ? neutralInput()
      : this.aiSystem.update(
        Math.abs(this.p1Body.position.x - this.p2Body.position.x),
        this.combatSystem.p2State.stun === 0,
        this.selection.difficulty,
        this.frame,
        this.p1Body.position.x,
        this.p2Body.position.x,
      );
    this.combatSystem.p1State.blocking = p1Input.left && this.p1Body.position.x > this.p2Body.position.x;
    this.combatSystem.p2State.blocking = p2Input.right && this.p2Body.position.x < this.p1Body.position.x;
    this.move(this.p1Body, p1Input);
    this.move(this.p2Body, p2Input);
    stepPhysics(this.p1Body); stepPhysics(this.p2Body);
    this.clampBody(this.p1Body); this.clampBody(this.p2Body);
    resolvePushbox(this.p1Body, this.p2Body);
    this.resolveAttack(this.p1Body, this.p2Body, p1Input, this.combatSystem.p1State, this.combatSystem.p2State);
    this.resolveAttack(this.p2Body, this.p1Body, p2Input, this.combatSystem.p2State, this.combatSystem.p1State);
    resolvePushbox(this.p1Body, this.p2Body);
    this.combatSystem.tick();
    this.syncMeshes(p1Input, p2Input);
    this.timer = Math.max(0, 60 - Math.floor(this.frame / 60));
    if (this.timer === 0 || this.combatSystem.p1State.health <= 0 || this.combatSystem.p2State.health <= 0) this.endRound();
    this.replaySystem.record({ tick: this.frame, fighters: [
      { position: new THREE.Vector3(this.p1Body.position.x, this.p1Body.position.y, this.p1Body.position.z), input: p1Input, health: this.combatSystem.p1State.health },
      { position: new THREE.Vector3(this.p2Body.position.x, this.p2Body.position.y, this.p2Body.position.z), input: p2Input, health: this.combatSystem.p2State.health },
    ]});
    this.hud.update({ round: this.round, timer: this.timer, ticker: TICKERS[Math.floor(this.frame / 240) % TICKERS.length], phase: 'MATCH',
      p1: { name: FIGHTER_REGISTRY[this.selection.p1].name, health: this.combatSystem.p1State.health, aura: this.combatSystem.p1State.aura, roundsWon: this.p1Rounds, combo: 0 },
      p2: { name: FIGHTER_REGISTRY[this.selection.p2].name, health: this.combatSystem.p2State.health, aura: this.combatSystem.p2State.aura, roundsWon: this.p2Rounds, combo: 0 } });
  }

  private move(body: PhysicsBody, input: InputState): void {
    const speed = 0.075;
    body.velocity.x += (input.right ? speed : 0) - (input.left ? speed : 0);
    body.velocity.z += (input.down ? speed : 0) - (input.up ? speed : 0);
    if (input.up && body.grounded) { body.velocity.y = 0.18; body.grounded = false; }
    if (!input.left && !input.right) body.velocity.x = Math.abs(body.velocity.x) < 0.005 ? 0 : body.velocity.x * 0.75;
    if (!input.up && !input.down) body.velocity.z = Math.abs(body.velocity.z) < 0.005 ? 0 : body.velocity.z * 0.75;
    body.position.x = Math.max(-5.2, Math.min(5.2, body.position.x));
    body.position.z = Math.max(-0.8, Math.min(0.8, body.position.z));
  }
  private clampBody(body: PhysicsBody): void {
    body.position.y = Math.max(0, body.position.y);
    if (body.position.y <= 0 && body.velocity.y < 0) body.velocity.y = 0;
    body.position.x = Math.max(-5.2, Math.min(5.2, body.position.x));
    body.position.z = Math.max(-0.8, Math.min(0.8, body.position.z));
    body.velocity.z += (0 - body.position.z) * 0.02;
  }
  private resolveAttack(attackerBody: PhysicsBody, defenderBody: PhysicsBody, input: InputState, attacker: typeof this.combatSystem.p1State, defender: typeof this.combatSystem.p2State): void {
    const move = this.getMove(input);
    if (!move || Math.abs(attackerBody.position.x - defenderBody.position.x) > move.range) return;
    const result = this.combatSystem.executeMove(attacker, defender, move);
    if (result.hit) {
      this.hitStopFrames = move.hitStopFrames;
      this.cameraShake = result.damage * 0.02;
      defenderBody.velocity.x += attackerBody.position.x < defenderBody.position.x ? move.knockback : -move.knockback;
      this.hud.showHit(result.damage, move.type === 'ultimate' || move.type === 'special');
      this.spawnHitSpark(defenderBody);
    }
  }
  private getMove(input: InputState): MoveDefinition | null {
    if (input.ultimate) return ULTIMATE_MOVE;
    if (input.special) return SPECIAL_MOVE;
    if (input.power) return POWER_MOVE;
    if (input.quick) return QUICK;
    return null;
  }
  private endRound(): void {
    const p1Won = this.combatSystem.p2State.health <= this.combatSystem.p1State.health;
    if (p1Won) this.p1Rounds++; else this.p2Rounds++;
    if (this.p1Rounds >= 2 || this.p2Rounds >= 2) {
      this.stateMachine.transition('MATCH_OVER');
      this.hud.showPostMatch(this.p1Rounds > this.p2Rounds ? 'PLAYER 1' : 'CPU', () => this.startMatch(this.selection), () => this.dismissTitle());
    } else {
      this.stateMachine.transition('ROUND_OVER');
      this.round++; this.timer = 60; this.combatSystem.reset(); this.p1Body = this.body(-2.2); this.p2Body = this.body(2.2);
      this.stateMachine.transition('MATCH');
    }
  }
  private syncMeshes(p1Input: InputState = neutralInput(), p2Input: InputState = neutralInput()): void {
    this.p1Mesh.position.set(this.p1Body.position.x, this.p1Body.position.y, this.p1Body.position.z);
    this.p2Mesh.position.set(this.p2Body.position.x, this.p2Body.position.y, this.p2Body.position.z);
    const p1Yaw = this.p1Body.position.x < this.p2Body.position.x ? Math.PI / 2 : -Math.PI / 2;
    const p2Yaw = this.p2Body.position.x < this.p1Body.position.x ? Math.PI / 2 : -Math.PI / 2;
    this.p1Animator.update(this.frame, this.animationState(this.combatSystem.p1State, this.p1Body, p1Input), this.frame);
    this.p2Animator.update(this.frame, this.animationState(this.combatSystem.p2State, this.p2Body, p2Input), this.frame);
    if (this.combatSystem.p1State.health > 0) this.p1Mesh.rotation.set(0, p1Yaw, 0);
    else this.p1Mesh.rotation.y = p1Yaw;
    if (this.combatSystem.p2State.health > 0) this.p2Mesh.rotation.set(0, p2Yaw, 0);
    else this.p2Mesh.rotation.y = p2Yaw;
    this.cameraController.update(this.p1Mesh.position, this.p2Mesh.position);
  }
  private animationState(combat: typeof this.combatSystem.p1State, body: PhysicsBody, input: InputState): string {
    if (combat.health <= 0) return 'KO';
    if (combat.stun > 0) return 'HITSTUN';
    if (input.ultimate || input.special) return 'SUPER';
    if (input.power || input.launcher) return 'KICK';
    if (input.quick) return 'PUNCH';
    if (Math.abs(body.velocity.x) > 0.01) return 'WALK';
    if (!body.grounded) return 'JUMP';
    return 'IDLE';
  }
  private stateFor(combat: typeof this.combatSystem.p1State, body: PhysicsBody): FighterSimState['state'] {
    if (combat.health <= 0) return 'KO'; if (combat.stun > 0) return 'HITSTUN'; if (!body.grounded) return 'JUMP'; return 'IDLE';
  }
  private clearScene(): void { while (this.scene.children.length) this.scene.remove(this.scene.children[0]); }
  private readonly resize = (): void => { const canvas = this.renderer.domElement; this.renderer.setSize(canvas.parentElement?.clientWidth ?? window.innerWidth, canvas.parentElement?.clientHeight ?? window.innerHeight); this.cameraController.resize(canvas.clientWidth, canvas.clientHeight); };
  private renderFrame(): void { if (this.cameraShake > 0) { this.camera.position.x += (Math.random() - 0.5) * this.cameraShake; this.cameraShake *= 0.84; } this.renderer.render(this.scene, this.camera); }
  private spawnHitSpark(body: PhysicsBody): void {
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 12, 8),
      new THREE.MeshBasicMaterial({ color: 0xfff1a8 }),
    );
    spark.position.set(body.position.x, 1.1, body.position.z + 0.4);
    this.scene.add(spark);
    window.setTimeout(() => this.scene.remove(spark), 260);
  }
  getSnapshot(): EngineSnapshot { return { frame: this.frame, fps: this.fps, phase: this.stateMachine.phase, p1: { x: this.p1Body.position.x, z: this.p1Body.position.z, health: this.combatSystem.p1State.health, aura: this.combatSystem.p1State.aura, state: this.stateFor(this.combatSystem.p1State, this.p1Body) }, p2: { x: this.p2Body.position.x, z: this.p2Body.position.z, health: this.combatSystem.p2State.health, aura: this.combatSystem.p2State.aura, state: this.stateFor(this.combatSystem.p2State, this.p2Body) }, errors: [...this.errors] }; }
  stepFrames(frames: number, p1Input: Partial<InputState> = {}, p2Input: Partial<InputState> = {}): void {
    const p1 = { ...neutralInput(), ...p1Input }; const originalDifficulty = this.selection.difficulty;
    this.inputManager.inject(p1); if (Object.keys(p2Input).length) this.selection.difficulty = 'local';
    for (let i = 0; i < frames; i++) this.fixedTick();
    this.inputManager.inject(null); this.selection.difficulty = originalDifficulty;
  }
  getReplayFrames() { return this.replaySystem.getFrames(); }
}
