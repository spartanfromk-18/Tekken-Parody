import { Engine } from './core/Engine';
import { FightHarness } from './harness/FightHarness';

class ApplicationBootstrap {
  private static instance: ApplicationBootstrap | null = null;
  private engine: Engine | null = null;

  static getInstance(): ApplicationBootstrap {
    return this.instance ??= new ApplicationBootstrap();
  }

  init(): void {
    const container = document.getElementById('app');
    if (!container) throw new Error('[AURA CLASH] Root element #app not found.');
    try {
      this.engine = new Engine(container);
      window.__FIGHT_HARNESS__ = new FightHarness(this.engine);
      const dismiss = (event: Event): void => {
        const target = event.target as HTMLElement;
        const keyboardStart = event instanceof KeyboardEvent && (event.key === 'Enter' || event.key === ' ');
        if (!keyboardStart && !target.closest('#boot-overlay')) return;
        event.preventDefault();
        document.getElementById('boot-overlay')?.classList.add('dismissed');
        this.engine?.dismissTitle();
        window.removeEventListener('keydown', dismiss);
        window.removeEventListener('click', dismiss);
      };
      window.addEventListener('keydown', dismiss);
      window.addEventListener('click', dismiss);
      this.engine.start();
      const status = document.getElementById('harness-status');
      if (status) status.textContent = 'HARNESS: READY';
    } catch (error: unknown) {
      console.error('[CRITICAL BOOTSTRAP ERROR]', error);
    }
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => ApplicationBootstrap.getInstance().init());
else ApplicationBootstrap.getInstance().init();