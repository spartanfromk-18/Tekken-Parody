import * as THREE from 'three';
import type { InputState } from './InputManager';

export interface ReplayFighterFrame {
  position: THREE.Vector3;
  input: InputState;
  health: number;
}

export interface ReplayFrame {
  tick: number;
  fighters: readonly [ReplayFighterFrame, ReplayFighterFrame];
}

function cloneReplayFighter(f: ReplayFighterFrame): ReplayFighterFrame {
  return {
    position: f.position.clone(),
    input: { ...f.input },
    health: f.health,
  };
}

function cloneReplayFrame(frame: ReplayFrame): ReplayFrame {
  return {
    tick: frame.tick,
    fighters: [
      cloneReplayFighter(frame.fighters[0]),
      cloneReplayFighter(frame.fighters[1]),
    ],
  };
}

export class ReplaySystem {
  private readonly buffer: Array<ReplayFrame | undefined>;
  private writeIndex = 0;
  private count = 0;

  constructor(private readonly capacity = 180) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError('Replay capacity must be a positive integer.');
    }
    this.buffer = new Array<ReplayFrame | undefined>(capacity);
  }

  record(frame: ReplayFrame): void {
    this.buffer[this.writeIndex] = cloneReplayFrame(frame);
    this.writeIndex = (this.writeIndex + 1) % this.capacity;
    this.count++;
  }

  getFrames(): readonly ReplayFrame[] {
    const valid: ReplayFrame[] = [];
    const len = Math.min(this.count, this.capacity);
    for (let i = 0; i < len; i++) {
      const idx = (this.writeIndex - len + i + this.capacity) % this.capacity;
      const frame = this.buffer[idx];
      if (frame) {
        valid.push(cloneReplayFrame(frame));
      }
    }
    return valid;
  }

  clear(): void {
    this.buffer.fill(undefined);
    this.writeIndex = 0;
    this.count = 0;
  }
}
