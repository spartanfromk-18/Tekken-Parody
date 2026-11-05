import { Engine } from './core/Engine';
import { FightHarness } from './harness/FightHarness';

/**
 * Main Application Bootstrapper for Aura Clash 3D Arena Fighter.
 * Enforces strict initialization contracts and mounts the deterministic 60Hz engine core.
 */
class ApplicationBootstrap {
  private static instance: ApplicationBootstrap | null = null;
  private engine: Engine | null = null;
  private harness: FightHarness | null = null;

  private constructor() {}

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
      // Initialize core deterministic engine
      this.engine = new Engine(container);
      this.setupBootOverlay();

      // Mount automated test harness
      this.harness = new FightHarness(this.engine);
      window.__FIGHT_HARNESS__ = this.harness;

      this.updateStatusBanner('HARNESS: READY (Production Build)');
      this.logSuccess();
      this.setupLifecycleHooks();
    } catch (error: unknown) {
      this.handleFatalError(error);
    }
  }

  private setupBootOverlay(): void {
    const overlay = document.getElementById('boot-overlay');
    if (!overlay || !this.engine) {
      this.engine?.start();
      return;
    }

    let dismissed = false;
    const dismiss = (): void => {
      if (dismissed) return;
      dismissed = true;
      overlay.classList.add('dismissed');
      overlay.removeEventListener('click', dismiss);
      window.removeEventListener('keydown', onKeyDown);
      this.engine?.start();
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Enter' || event.key === ' ') dismiss();
    };

    overlay.addEventListener('click', dismiss);
    window.addEventListener('keydown', onKeyDown);
  }

  private updateStatusBanner(text: string): void {
    const statusEl = document.getElementById('harness-status');
    if (statusEl) {
      statusEl.textContent = text;
    }
  }

  private setupLifecycleHooks(): void {
    window.addEventListener('beforeunload', () => {
      if (this.engine) {
        // Graceful engine teardown
        this.engine.stop();
      }
    });
  }

  private logSuccess(): void {
    console.log(
      '%c[AURA CLASH] Engine Initialized Successfully // 60Hz Deterministic Core Active',
      'color: #55e6ff; font-weight: bold; background: #080a14; padding: 6px 12px; border-radius: 4px; border: 1px solid #1e293b;'
    );
    console.log('%c[DEBUG] Test harness available globally via `window.__FIGHT_HARNESS__`', 'color: #94a3b8; font-style: italic;');
  }

  private handleFatalError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[AURA CLASH CRITICAL] Initialization failed: ${message}`);
    this.updateStatusBanner('HARNESS: ERROR (Init Failed)');
    
    const container = document.getElementById('app');
    if (container) {
      container.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#05070c;color:#ef4444;font-family:monospace;padding:20px;text-align:center;">
          <div>
            <h2 style="font-size:24px;margin-bottom:8px;">CRITICAL ENGINE EXCEPTION</h2>
            <p style="color:#94a3b8;font-size:14px;">${message}</p>
          </div>
        </div>
      `;
    }
  }
}

// Execute bootstrap lifecycle on DOM readiness
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ApplicationBootstrap.getInstance().init());
} else {
  ApplicationBootstrap.getInstance().init();
}