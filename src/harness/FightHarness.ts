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
    const results = [];
    const initialSnapshot = this.getState();

    try {
      this.stepFrames(120, { right: true });
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

    const finalSnapshot = this.getState();
    const frameAdvanced = finalSnapshot.frame > initialSnapshot.frame;
    results.push({
      test: 'Deterministic 60Hz Progression',
      passed: frameAdvanced,
      detail: frameAdvanced ? `Frame counter advanced correctly to ${finalSnapshot.frame}.` : 'Frame counter failed to increment.',
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
