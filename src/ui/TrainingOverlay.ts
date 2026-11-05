export interface TrainingFrameData {
  advantage: number;
  inputHistory: string[];
  hitboxesVisible: boolean;
}

export class TrainingOverlay {
  private readonly root: HTMLDivElement;

  constructor() {
    this.root = document.createElement('div');
    this.root.className = 'training-overlay';
  }

  render(data: TrainingFrameData): void {
    this.root.textContent = `Advantage: ${data.advantage}F | Hitboxes: ${data.hitboxesVisible ? 'ON' : 'OFF'}`;
  }

  getElement(): HTMLDivElement {
    return this.root;
  }
}
