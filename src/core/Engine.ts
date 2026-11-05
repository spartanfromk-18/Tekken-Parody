import * as THREE from 'three';
import { AISystem } from '../combat/AISystem';
import { aabbOverlaps, sphereAabbOverlap, type Aabb } from '../combat/CollisionSystem';
import { CombatSystem, type CombatState } from '../combat/CombatSystem';
import { LAUNCHER_MOVE, POWER_MOVE, QUICK, type MoveDefinition } from '../combat/MoveTypes';
import { applyKnockback, stepPhysics, type PhysicsBody } from '../combat/PhysicsSystem';
import { buildSansadArena } from '../arenas/SansadArena';
import { createFighterRig } from '../fighters/FighterRig';
import { ProceduralAnimator } from '../fighters/ProceduralAnimator';
import { GameStateMachine } from './GameStateMachine';
import { InputManager, neutralInput, type InputState } from './InputManager';
import { ReplaySystem } from './ReplaySystem';
import { CameraController } from './CameraController';
import { HudOverlay } from '../ui/HudOverlay';
import { AuraStore } from '../progression/AuraStore';
import { MasterySystem } from '../progression/MasterySystem';
import { calculateReward } from '../progression/RewardCalculator';
interface Attack { move: MoveDefinition; remaining: number; hit: boolean; }
export interface EngineSnapshot {
  frame: number; fps: number; isPaused: boolean; errors: string[]; phase: string; timer: number;
  p1: { x: number; y: number; z: number; health: number; aura: number }; p2: { x: number; y: number; z: number; health: number; aura: number };
}
export class Engine {
  private readonly renderer: THREE.WebGLRenderer; private readonly scene = new THREE.Scene();
  private readonly cameraController: CameraController;
  private readonly inputManager: InputManager;
  private readonly combat = new CombatSystem();
  private readonly physics = { p1: this.body(-2), p2: this.body(2) };
  private readonly ai = new AISystem(); private readonly state = new GameStateMachine();
  private readonly replay = new ReplaySystem(600);
  private readonly hud: HudOverlay;
  private readonly auraStore = new AuraStore();
  private readonly mastery = new MasterySystem();
  private readonly p1Rig: THREE.Group;
  private readonly p2Rig: THREE.Group;
  private readonly p1Anim: ProceduralAnimator; private readonly p2Anim: ProceduralAnimator;
  private p1Attack: Attack | null = null; private p2Attack: Attack | null = null;
  private frameCount = 0; private accumulator = 0; private lastTime = performance.now();
  private fps = 60; private timer = 99; private isRunning = false; private rewarded = false;
  private readonly errors: string[] = [];   private readonly fixedStep = 1000 / 60;
  constructor(container: HTMLElement) {
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    this.cameraController = new CameraController(camera);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);
    this.inputManager = new InputManager(window);
    this.hud = new HudOverlay(document.body);
    buildSansadArena(this.scene);
    this.p1Rig = createFighterRig({ primary: 0x32d9ff, secondary: 0xff4fd8 });
    this.p2Rig = createFighterRig({ primary: 0xff4f4f, secondary: 0xffd166 });
    this.scene.add(this.p1Rig, this.p2Rig);
    this.p1Anim = new ProceduralAnimator(this.p1Rig); this.p2Anim = new ProceduralAnimator(this.p2Rig);
    this.state.transition('CHAR_SELECT'); this.state.transition('VS_INTRO'); this.state.transition('MATCH');
    window.addEventListener('resize', this.onWindowResize);
  }
  private body(x: number): PhysicsBody {
    return { position: { x, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, grounded: true, hitstun: 0 };
  }
  start(): void { if (this.isRunning) return; this.isRunning = true; this.lastTime = performance.now(); this.loop(); }
  stop(): void { this.isRunning = false; } getReplayFrames() { return this.replay.getFrames(); }
  stepFrames(count: number, p1Patch?: Partial<InputState>, p2Patch?: Partial<InputState>): void {
    const p1 = { ...this.inputManager.sample(), ...p1Patch };
    const p2 = p2Patch ? { ...neutralInput(), ...p2Patch } : this.ai.update(Math.abs(this.physics.p1.position.x - this.physics.p2.position.x), true);
    for (let i = 0; i < Math.max(0, Math.floor(count)); i++) this.simulate(p1, p2);
  }
  getSnapshot(): EngineSnapshot {
    const p1 = this.physics.p1.position, p2 = this.physics.p2.position;
    return { frame: this.frameCount, fps: Math.round(this.fps), isPaused: !this.isRunning,
      errors: [...this.errors], phase: this.state.phase, timer: Math.ceil(this.timer),
      p1: { ...p1, health: this.combat.p1State.health, aura: this.combat.p1State.aura },
      p2: { ...p2, health: this.combat.p2State.health, aura: this.combat.p2State.aura } };
  }
  private readonly loop = (): void => {
    if (!this.isRunning) return;
    const now = performance.now(); const elapsed = Math.min(now - this.lastTime, 250);
    this.lastTime = now; this.fps = elapsed > 0 ? 1000 / elapsed : 60; this.accumulator += elapsed;
    try {
      while (this.accumulator >= this.fixedStep) {
        const p1 = this.inputManager.sample();
        const p2 = this.ai.update(Math.abs(this.physics.p1.position.x - this.physics.p2.position.x),
          this.canAct(this.combat.p2State));
        this.simulate(p1, p2); this.accumulator -= this.fixedStep;
      }
      this.render();
    } catch (error: unknown) { this.recordError(error); }
    requestAnimationFrame(this.loop);
  };
  private simulate(p1: InputState, p2: InputState): void {
    if (!this.state.is('MATCH')) return;
    const c1 = this.combat.p1State, c2 = this.combat.p2State;
    if (c1.hitstop > 0 || c2.hitstop > 0) { c1.hitstop = Math.max(0, c1.hitstop - 1); c2.hitstop = Math.max(0, c2.hitstop - 1); return; }
    this.frameCount++; this.timer = Math.max(0, this.timer - 1 / 60);
    this.startAttack(1, p1, c1); this.startAttack(2, p2, c2);
    this.advanceAttack(1, c1, c2); this.advanceAttack(2, c2, c1);
    stepPhysics(this.physics.p1); stepPhysics(this.physics.p2);
    this.physics.p1.position.x = THREE.MathUtils.clamp(this.physics.p1.position.x, -7, 7);
    this.physics.p2.position.x = THREE.MathUtils.clamp(this.physics.p2.position.x, -7, 7);
    this.physics.p1.position.z = THREE.MathUtils.clamp(this.physics.p1.position.z, -3, 3);
    this.physics.p2.position.z = THREE.MathUtils.clamp(this.physics.p2.position.z, -3, 3);
    this.recordReplay(p1, p2); this.updatePresentation(); this.checkMatchEnd();
  }
  private startAttack(player: 1 | 2, input: InputState, combat: CombatState): void {
    const current = player === 1 ? this.p1Attack : this.p2Attack;
    if (current || !this.canAct(combat)) return;
    const move = input.launcher ? LAUNCHER_MOVE : input.power ? POWER_MOVE : input.quick ? QUICK : null;
    if (!move) return;
    const attack = { move, remaining: move.startupFrames + move.activeFrames + move.recoveryFrames, hit: false };
    if (player === 1) this.p1Attack = attack; else this.p2Attack = attack;
  }
  private advanceAttack(player: 1 | 2, attacker: CombatState, defender: CombatState): void {
    const attack = player === 1 ? this.p1Attack : this.p2Attack;
    if (!attack) return;
    attack.remaining--;
    const active = attack.remaining <= attack.move.recoveryFrames && attack.remaining > attack.move.recoveryFrames - attack.move.activeFrames;
    if (active && !attack.hit && this.inRange(player, attack.move.range)) {
      const applied = this.combat.executeMove(attacker, defender, attack.move);
      if (applied) { attack.hit = true; applyKnockback(player === 1 ? this.physics.p2 : this.physics.p1, player === 1 ? attack.move.knockback : -attack.move.knockback); }
    }
    if (attack.remaining <= 0) { if (player === 1) this.p1Attack = null; else this.p2Attack = null; }
  }
  private inRange(player: 1 | 2, range: number): boolean {
    const a = player === 1 ? this.physics.p1.position : this.physics.p2.position;
    const d = player === 1 ? this.physics.p2.position : this.physics.p1.position;
    const hitbox = (p: typeof a): Aabb => ({ min: { x: p.x - 0.35, y: 0, z: p.z - 0.3 }, max: { x: p.x + 0.35, y: 2, z: p.z + 0.3 } });
    const target = hitbox(d);
    const own = hitbox(a);
    const attackBox = {
      ...own,
      min: { ...own.min, x: a.x + (player === 1 ? 0 : -range) },
      max: { ...own.max, x: a.x + (player === 1 ? range : 0) },
    };
    return Math.abs(a.x - d.x) <= range && aabbOverlaps(attackBox, target) && sphereAabbOverlap({ x: a.x, y: 1, z: a.z }, range, target);
  }
  private canAct(combat: CombatState): boolean { return combat.health > 0 && combat.stun <= 0 && combat.hitstop <= 0; }
  private recordReplay(p1: InputState, p2: InputState): void {
    this.replay.record({ tick: this.frameCount, fighters: [
      { position: new THREE.Vector3(this.physics.p1.position.x, 0, this.physics.p1.position.z), input: p1, health: this.combat.p1State.health },
      { position: new THREE.Vector3(this.physics.p2.position.x, 0, this.physics.p2.position.z), input: p2, health: this.combat.p2State.health },
    ] });
  }
  private checkMatchEnd(): void {
    if (this.timer > 0 && this.combat.p1State.health > 0 && this.combat.p2State.health > 0) return;
    if (!this.rewarded) {
      const won = this.combat.p1State.health > this.combat.p2State.health;
      const reward = calculateReward({ won, bestCombo: 0, flawlessRounds: 0, difficulty: 'normal' });
      this.auraStore.earn(reward.total);
      this.mastery.recordMatch(this.mastery.createRecord(), won, reward.total);
      this.rewarded = true;
    }
    if (this.state.is('MATCH')) this.state.transition('VICTORY');
  }
  private updatePresentation(): void {
    this.p1Rig.position.set(this.physics.p1.position.x, this.physics.p1.position.y, this.physics.p1.position.z);
    this.p2Rig.position.set(this.physics.p2.position.x, this.physics.p2.position.y, this.physics.p2.position.z);
    this.p1Anim.update(this.frameCount * 16.666); this.p2Anim.update(this.frameCount * 16.666);
    const first = new THREE.Vector3(this.physics.p1.position.x, 0, this.physics.p1.position.z);
    const second = new THREE.Vector3(this.physics.p2.position.x, 0, this.physics.p2.position.z);
    this.cameraController.update(first, second, 1 / 60);
    this.hud.update({
      round: 1, timer: Math.ceil(this.timer),
      p1: { name: 'P1', health: this.combat.p1State.health, aura: this.combat.p1State.aura, roundsWon: 0, combo: 0 },
      p2: { name: 'CPU', health: this.combat.p2State.health, aura: this.combat.p2State.aura, roundsWon: 0, combo: 0 },
    });
  }
  private render(): void { this.renderer.render(this.scene, this.cameraController.camera); }
  private readonly onWindowResize = (): void => {
    this.cameraController.resize(window.innerWidth, window.innerHeight);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
  private recordError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    if (this.errors.length >= 50) this.errors.shift();
    this.errors.push(message);
    console.error('[Engine Error]', error);
  }
  dispose(): void { this.stop(); window.removeEventListener('resize', this.onWindowResize); this.inputManager.dispose(); this.hud.destroy(); this.renderer.dispose(); }
}
