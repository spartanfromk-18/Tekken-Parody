export class SoundSynth {
  private context: AudioContext | null = null;

  async resume(): Promise<void> {
    if (this.context?.state === 'suspended') await this.context.resume();
  }

  playHit(_power = 1): void {}

  playUltimate(): void {}
}
