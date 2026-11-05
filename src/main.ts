import { Engine } from './core/Engine';
import { FightHarness } from './harness/FightHarness';

const container = document.getElementById('app');
if (!container) {
  throw new Error('Fatal: #app root element not found in DOM.');
}

const engine = new Engine(container);
engine.start();

const harness = new FightHarness(engine);
window.__FIGHT_HARNESS__ = harness;

const statusEl = document.getElementById('harness-status');
if (statusEl) {
  statusEl.textContent = 'HARNESS: READY (Increment 1.3)';
}

console.log('%c[AURA CLASH] Increment 1.3 Initialized Successfully', 'color: #55e6ff; font-weight: bold; background: #080a14; padding: 4px 8px; border-radius: 4px;');
console.log('Test harness available globally at window.__FIGHT_HARNESS__');
