import { Engine } from './core/Engine';
import { FightHarness } from './harness/FightHarness';

class ApplicationBootstrap {
  private static instance: ApplicationBootstrap | null = null;
  private engine: Engine | null = null;
  private harness: FightHarness | null = null;

  public static getInstance(): ApplicationBootstrap {
    if (!ApplicationBootstrap.instance) {
      ApplicationBootstrap.instance = new ApplicationBootstrap();
    }
    return ApplicationBootstrap.instance;
  }

  public init(): void {
    const container = document.getElementById('app');
    if (!container) {
      throw new Error('[AURA CLASH FATAL] Root element `#app` not located in the DOM.');
    }

    try {
      this.engine = new Engine(container);
      this.harness = new FightHarness(this.engine);
      window.__FIGHT_HARNESS__ = this.harness;

      this.setupSplashDismissal();
      this.updateStatusBanner('HARNESS: READY (Tekken Edition)');
      
      console.log('%c[AURA CLASH] Tekken 8 Arcade Engine Initialized', 'color: #00ffff; font-weight: bold; background: #080a14; padding: 6px 12px; border-radius: 4px;');
    } catch (error: unknown) {
      console.error('[CRITICAL INIT ERROR]', error);
    }
  }

  private setupSplashDismissal(): void {
    const splash = document.querySelector('.title-overlay') as HTMLElement || document.getElementById('splash') || document.body;
    
    const dismiss = () => {
      this.engine?.start();
      if (splash && splash !== document.body) {
        splash.style.transition = 'opacity 0.5s ease';
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 500);
      }
    };

    window.addEventListener('keydown', dismiss, { once: true });
    window.addEventListener('click', dismiss, { once: true });
  }

  private updateStatusBanner(text: string): void {
    const statusEl = document.getElementById('harness-status');
    if (statusEl) statusEl.textContent = text;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ApplicationBootstrap.getInstance().init());
} else {
  ApplicationBootstrap.getInstance().init();
}