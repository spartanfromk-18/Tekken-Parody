import * as THREE from 'three';
import { InputManager, InputState } from './InputManager';
import { buildSansadArena } from '../arenas/SansadArena';
import { CameraController } from './CameraController';
import { createFighterRig } from '../fighters/FighterRig';
import { ProceduralAnimator } from '../fighters/ProceduralAnimator';

export interface EngineSnapshot {
  frame: number;
  fps: number;
  isPaused: boolean;
  errors: string[];
  p1: { x: number; y: number; z: number; health: number };
  p2: { x: number; y: number; z: number; health: number };
}

export class Engine {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly cameraController: CameraController;
  private readonly inputManager: InputManager;
  
  private frameCount = 0;
  private isRunning = false;
  private lastTime = performance.now();
  private fps = 60;
  private readonly errors: string[] = [];

  private p1Rig: THREE.Group;
  private p2Rig: THREE.Group;
  private p1Anim: ProceduralAnimator;
  private p2Anim: ProceduralAnimator;

  private p1Pos = new THREE.Vector3(-2, 0, 0);
  private p2Pos = new THREE.Vector3(2, 0, 0);
  private p1Health = 100;
  private p2Health = 100;
  
  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    this.cameraController = new CameraController(camera);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.inputManager = new InputManager(window);

    buildSansadArena(this.scene);

    this.p1Rig = createFighterRig({ primary: 0x32d9ff, secondary: 0xff4fd8 });
    this.p2Rig = createFighterRig({ primary: 0xff4f4f, secondary: 0xffd166 });
    this.p1Rig.position.copy(this.p1Pos);
    this.p2Rig.position.copy(this.p2Pos);
    this.scene.add(this.p1Rig);
    this.scene.add(this.p2Rig);

    this.p1Anim = new ProceduralAnimator(this.p1Rig);
    this.p2Anim = new ProceduralAnimator(this.p2Rig);

    window.addEventListener('resize', this.onWindowResize);
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop(): void {
    this.isRunning = false;
  }

  stepFrames(count: number, p1Input?: Partial<InputState>, p2Input?: Partial<InputState>): void {
    void p2Input;
    for (let i = 0; i < count; i++) {
      try {
        const input = p1Input ? { ...this.inputManager.sample(), ...p1Input } : this.inputManager.sample();
        this.update(1000 / 60, input);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.errors.push(msg);
      }
    }
  }

  getSnapshot(): EngineSnapshot {
    return {
      frame: this.frameCount,
      fps: Math.round(this.fps),
      isPaused: !this.isRunning,
      errors: [...this.errors],
      p1: { x: this.p1Pos.x, y: this.p1Pos.y, z: this.p1Pos.z, health: this.p1Health },
      p2: { x: this.p2Pos.x, y: this.p2Pos.y, z: this.p2Pos.z, health: this.p2Health },
    };
  }

  private readonly loop = (): void => {
    if (!this.isRunning) return;
    const now = performance.now();
    const delta = now - this.lastTime;
    if (delta > 0) this.fps = 1000 / delta;
    this.lastTime = now;

    try {
      const input = this.inputManager.sample();
      this.update(delta, input);
      this.render();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.errors.push(msg);
      console.error('[Engine Error]', err);
    }

    requestAnimationFrame(this.loop);
  };

  private update(dt: number, input: InputState): void {
    this.frameCount++;
    const speed = 0.06;
    if (input.left) this.p1Pos.x -= speed;
    if (input.right) this.p1Pos.x += speed;
    if (input.sidestepUp) this.p1Pos.z -= speed * 0.6;
    if (input.sidestepDown) this.p1Pos.z += speed * 0.6;

    this.p1Rig.position.copy(this.p1Pos);
    this.p2Rig.position.copy(this.p2Pos);

    this.p1Anim.update(this.frameCount * 16.6);
    this.p2Anim.update(this.frameCount * 16.6);

    this.cameraController.update(this.p1Pos, this.p2Pos, dt * 0.001);
  }

  private render(): void {
    this.renderer.render(this.scene, this.cameraController.camera);
  }

  private readonly onWindowResize = (): void => {
    this.cameraController.resize(window.innerWidth, window.innerHeight);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.onWindowResize);
    this.inputManager.dispose();
    this.renderer.dispose();
  }
}
