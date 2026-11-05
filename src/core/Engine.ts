import * as THREE from 'three';
import { InputManager } from './InputManager';
import { CombatSystem } from '../combat/CombatSystem';
import { PhysicsSystem } from '../combat/PhysicsSystem';
import { AISystem } from '../combat/AISystem';
import { GameStateMachine } from './GameStateMachine';
import { ReplaySystem } from './ReplaySystem';
import { HudOverlay } from '../ui/HudOverlay';
import { FIGHTER_REGISTRY } from '../fighters/FighterRegistry';
import { buildJantarMantarArena } from '../arenas/JantarMantarArena';

export interface FighterSimState {
  x: number;
  z: number;
  health: number;
  aura: number;
  state: 'IDLE' | 'WALK' | 'ATTACK' | 'HITSTUN';
}

export interface EngineSnapshot {
  frame: number;
  fps: number;
  phase: string;
  p1: FighterSimState;
  p2: FighterSimState;
  errors: string[];
}

export class Engine {
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly inputManager = new InputManager();
  private readonly combatSystem = new CombatSystem();
  private readonly physicsSystem = new PhysicsSystem();
  private readonly aiSystem = new AISystem();
  private readonly stateMachine = new GameStateMachine();
  private readonly replaySystem = new ReplaySystem();
  private readonly hud: HudOverlay;

  private p1Mesh: THREE.Group;
  private p2Mesh: THREE.Group;
  
  public p1State: FighterSimState = { x: -2, z: 0, health: 100, aura: 0, state: 'IDLE' };
  public p2State: FighterSimState = { x: 2, z: 0, health: 100, aura: 0, state: 'IDLE' };

  private frame = 0;
  private fps = 60;
  private isRunning = false;
  private hitStopFrames = 0;
  private cameraShakeIntensity = 0;
  private readonly errors: string[] = [];
  private lastTime = performance.now();
  private accumulator = 0;
  private readonly fixedDelta = 1000 / 60;

  constructor(container: HTMLElement) {
    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 3.5, 9);
    this.camera.lookAt(0, 1, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    buildJantarMantarArena(this.scene);

    // Instantiate Roster Meshes
    this.p1Mesh = FIGHTER_REGISTRY['modi']?.createRig() || new THREE.Group();
    this.p2Mesh = FIGHTER_REGISTRY['rahul']?.createRig() || new THREE.Group();
    this.scene.add(this.p1Mesh);
    this.scene.add(this.p2Mesh);

    this.hud = new HudOverlay(container);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  public stop(): void {
    this.isRunning = false;
  }

  private readonly loop = (time: number): void => {
    if (!this.isRunning) return;

    const delta = time - this.lastTime;
    this.lastTime = time;
    this.accumulator += Math.min(delta, 100);
    this.fps = Math.round(1000 / Math.max(delta, 1));

    while (this.accumulator >= this.fixedDelta) {
      if (this.hitStopFrames > 0) {
        this.hitStopFrames--;
      } else {
        this.fixedTick();
      }
      this.accumulator -= this.fixedDelta;
    }

    this.renderFrame();
    requestAnimationFrame(this.loop);
  };

  private fixedTick(): void {
    this.frame++;

    // 1. Poll Input & Apply Direct Arcade Velocity
    const p1Input = this.inputManager.getState();
    const speed = 0.14;

    if (p1Input.left) this.p1State.x -= speed;
    if (p1Input.right) this.p1State.x += speed;
    if (p1Input.up) this.p1State.z -= speed * 0.6;
    if (p1Input.down) this.p1State.z += speed * 0.6;

    // Attack Trigger & Hit Juice Trigger (Test Punch)
    if (p1Input.quick && Math.abs(this.p1State.x - this.p2State.x) < 2.5) {
      this.p2State.health = Math.max(0, this.p2State.health - 5);
      this.hitStopFrames = 8; // Freeze frame impact juice
      this.cameraShakeIntensity = 0.4; // Screen shake
    }

    // Arena boundary clamp
    this.p1State.x = Math.max(-6.5, Math.min(6.5, this.p1State.x));
    this.p1State.z = Math.max(-2.5, Math.min(2.5, this.p1State.z));

    // Sync 3D Meshes
    if (this.p1Mesh) {
      this.p1Mesh.position.set(this.p1State.x, 0, this.p1State.z);
      this.p1Mesh.lookAt(this.p2State.x, 0, this.p2State.z);
    }
    if (this.p2Mesh) {
      this.p2Mesh.position.set(this.p2State.x, 0, this.p2State.z);
      this.p2Mesh.lookAt(this.p1State.x, 0, this.p1State.z);
    }

    this.replaySystem.record({
      tick: this.frame,
      fighters: [{ x: this.p1State.x, health: this.p1State.health }, { x: this.p2State.x, health: this.p2State.health }]
    });

    this.hud.update({
      round: 1,
      time: Math.max(0, 99 - Math.floor(this.frame / 60)),
      p1Hp: this.p1State.health,
      p2Hp: this.p2State.health
    });
  }

  private renderFrame(): void {
    // Dynamic Camera Shake Decay
    if (this.cameraShakeIntensity > 0) {
      this.camera.position.x = (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.y = 3.5 + (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.cameraShakeIntensity *= 0.85;
    } else {
      this.camera.position.set(0, 3.5, 9);
    }

    this.renderer.render(this.scene, this.camera);
  }

  public getSnapshot(): EngineSnapshot {
    return {
      frame: this.frame,
      fps: this.fps,
      phase: this.stateMachine.phase,
      p1: { ...this.p1State },
      p2: { ...this.p2State },
      errors: [...this.errors]
    };
  }

  public stepFrames(frames: number, p1Input?: any, p2Input?: any): void {
    for (let i = 0; i < frames; i++) {
      this.fixedTick();
    }
  }

  public getReplayFrames(): any[] {
    return this.replaySystem.getFrames();
  }
}