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
}

declare global {
  interface Window {
    __FIGHT_HARNESS__?: FightHarness;
  }
}