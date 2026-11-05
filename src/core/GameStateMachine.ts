export type MatchPhase =
  | 'TITLE'
  | 'CHAR_SELECT'
  | 'VS_INTRO'
  | 'MATCH'
  | 'ROUND_OVER'
  | 'MATCH_OVER'
  | 'REPLAY'
  | 'VICTORY'
  | 'TRAINING';

export type StateListener = (next: MatchPhase, previous: MatchPhase) => void;

export interface MatchStateSnapshot {
  phase: MatchPhase;
  previous: MatchPhase | null;
  enteredAtRevision: number;
}

const ALLOWED_TRANSITIONS: Readonly<Record<MatchPhase, readonly MatchPhase[]>> = {
  TITLE: ['CHAR_SELECT', 'TRAINING'],
  CHAR_SELECT: ['TITLE', 'VS_INTRO', 'TRAINING'],
  VS_INTRO: ['MATCH', 'TITLE'],
  MATCH: ['ROUND_OVER', 'MATCH_OVER', 'REPLAY', 'VICTORY', 'TITLE', 'TRAINING'],
  ROUND_OVER: ['MATCH', 'MATCH_OVER', 'CHAR_SELECT', 'TITLE'],
  MATCH_OVER: ['CHAR_SELECT', 'TITLE'],
  REPLAY: ['MATCH', 'VICTORY', 'TITLE'],
  VICTORY: ['CHAR_SELECT', 'TITLE', 'TRAINING'],
  TRAINING: ['TITLE', 'CHAR_SELECT', 'MATCH'],
};

export class GameStateMachine {
  private currentPhase: MatchPhase = 'TITLE';
  private previousPhase: MatchPhase | null = null;
  private revision = 0;
  private enteredAtRevision = 0;
  private readonly listeners = new Set<StateListener>();

  get phase(): MatchPhase {
    return this.currentPhase;
  }

  get snapshot(): Readonly<MatchStateSnapshot> {
    return {
      phase: this.currentPhase,
      previous: this.previousPhase,
      enteredAtRevision: this.enteredAtRevision,
    };
  }

  transition(next: MatchPhase): void {
    if (next === this.currentPhase) return;
    if (!ALLOWED_TRANSITIONS[this.currentPhase].includes(next)) {
      throw new Error(`Invalid match transition: ${this.currentPhase} -> ${next}`);
    }

    const previous = this.currentPhase;
    this.previousPhase = previous;
    this.currentPhase = next;
    this.enteredAtRevision = this.revision;
    this.revision += 1;
    this.listeners.forEach((listener) => listener(next, previous));
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.currentPhase = 'TITLE';
    this.previousPhase = null;
    this.revision = 0;
    this.enteredAtRevision = 0;
  }

  is(phase: MatchPhase): boolean {
    return this.currentPhase === phase;
  }
}
