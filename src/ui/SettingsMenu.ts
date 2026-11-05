export class SettingsMenu {
  readonly element: HTMLDivElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'settings-menu';
    this.element.style.cssText = 'position:fixed; inset:20px; background:#0b0e1bfa; color:#fff; padding:20px; z-index:100; display:none; border:1px solid #283252;';
    this.element.innerHTML = '<h2>Game Settings</h2><p>Graphics: High</p><p>Audio: 100%</p><p>Screen Shake: Enabled</p>';
    document.body.appendChild(this.element);
  }

  toggle(): void {
    this.element.style.display = this.element.style.display === 'none' ? 'block' : 'none';
  }
}
