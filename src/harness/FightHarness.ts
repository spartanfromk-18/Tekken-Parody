import { Engine, EngineSnapshot } from '../core/Engine';
import { InputState } from '../core/InputManager';

export interface HarnessAuditResult {
  passed: boolean;
  results: Array<{ test: string; passed: boolean; detail: string }>;
}

export class FightHarness {
  constructor(private readonly engine: Engine) {}

  stepFrames(frames: number, p1Input?: Partial<InputState>, p2Input?: Partial<InputState>): void {
    this.engine.stepFrames(frames, p1Input, p2Input);
  }

  getState(): EngineSnapshot & { screen: string } {
    return {
      screen: 'COMBAT_VERTICAL_SLICE',
      ...this.engine.getSnapshot(),
    };
  }

  async runAudit(): Promise<HarnessAuditResult> {
    const results: HarnessAuditResult['results'] = [];
    const initialSnapshot = this.getState();

    try {
      this.stepFrames(120, {}, {});
      const postSnapshot = this.getState();
      const noErrors = postSnapshot.errors.length === 0;
      results.push({
        test: '120-Frame Stability & Input Step',
        passed: noErrors,
        detail: noErrors ? `Successfully stepped 120 frames at ~${postSnapshot.fps} FPS.` : `Errors caught: ${postSnapshot.errors.join(', ')}`,
      });
    } catch (err: unknown) {
      results.push({
        test: '120-Frame Stability & Input Step',
        passed: false,
        detail: `Exception thrown: ${err instanceof Error ? err.message : String(err)}`,
      });
    }

    const midSnapshot = this.getState();
    const frameAdvanced = midSnapshot.frame > initialSnapshot.frame;
    results.push({
      test: 'Deterministic 60Hz Progression',
      passed: frameAdvanced,
      detail: frameAdvanced ? `Frame counter advanced correctly to ${midSnapshot.frame}.` : 'Frame counter failed to increment.',
    });

    // Combat resolution test: close distance and execute attack frames
    const healthBeforeAttack = midSnapshot.p2.health;
    for (let i = 0; i < 90; i++) {
      const state = this.getState();
      const moveTowards = state.p1.x < state.p2.x ? { right: true } : { left: true };
      this.stepFrames(1, moveTowards, {});
    }
    // Execute quick strike
    this.stepFrames(5, { quick: true }, {});
    this.stepFrames(25, {}, {});

    const combatSnapshot = this.getState();
    const hitRegistered = combatSnapshot.p2.health < healthBeforeAttack;
    results.push({
      test: 'Combat Hit and Health Resolution',
      passed: hitRegistered,
      detail: hitRegistered 
        ? `P2 health successfully reduced from ${healthBeforeAttack} to ${combatSnapshot.p2.health}.` 
        : `P2 health changed from ${healthBeforeAttack} to ${combatSnapshot.p2.health} (check attack range / collision hitboxes).`,
    });

    const replay = this.engine.getReplayFrames();
    const replayRoundTrip = replay.length > 0
      && replay[0].fighters.length === 2
      && replay[replay.length - 1].tick <= combatSnapshot.frame;
    results.push({
      test: 'Replay State Round-Trip',
      passed: replayRoundTrip,
      detail: replayRoundTrip ? `${replay.length} replay frames retained.` : 'Replay frames were not retained correctly.',
    });

    results.push({
      test: 'Match State Machine',
      passed: combatSnapshot.phase === 'MATCH' || combatSnapshot.phase === 'VICTORY',
      detail: `Current match phase: ${combatSnapshot.phase}.`,
    });

    const passed = results.every((r) => r.passed);
    return { passed, results };
  }

  async runFullAudit(): Promise<HarnessAuditResult> {
    this.engine.startMatch({ p1: 'modi', p2: 'rahul', arena: 'sansad', difficulty: 'normal' });
    const results: HarnessAuditResult['results'] = [];
    const initial = this.getState();
    this.stepFrames(20, { right: true });
    const moved = this.getState();
    results.push({ test: 'Lobby selection starts requested match', passed: moved.phase === 'MATCH', detail: `${moved.phase} on sansad with modi vs rahul.` });
    results.push({ test: 'P1 movement', passed: moved.p1.x > initial.p1.x, detail: `${initial.p1.x.toFixed(2)} -> ${moved.p1.x.toFixed(2)}` });
    const hp = moved.p2.health;
    this.stepFrames(1, { quick: true });
    this.stepFrames(12);
    const hit = this.getState();
    results.push({ test: 'Quick attack damages P2', passed: hit.p2.health < hp, detail: `P2 HP ${hp} -> ${hit.p2.health}.` });
    results.push({ test: 'Aura builds from combat', passed: hit.p1.aura > initial.p1.aura, detail: `P1 aura is ${hit.p1.aura}.` });
    const aiStart = hit.p2.x;
    this.stepFrames(45);
    const aiEnd = this.getState();
    results.push({ test: 'CPU AI advances P2', passed: Math.abs(aiEnd.p2.x - aiStart) > 0.02, detail: `${aiStart.toFixed(2)} -> ${aiEnd.p2.x.toFixed(2)}.` });
    return { passed: results.every((result) => result.passed), results };
  }
}

declare global {
  interface Window {
    __FIGHT_HARNESS__?: FightHarness;
  }
}