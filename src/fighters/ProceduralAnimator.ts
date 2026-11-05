import * as THREE from 'three';

export class ProceduralAnimator {
  constructor(private readonly rig: THREE.Group) {}

  update(time: number): void {
    const breath = Math.sin(time * 0.006) * 0.03;
    this.rig.position.y = breath;
  }
}
