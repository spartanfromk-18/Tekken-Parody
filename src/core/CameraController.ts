import * as THREE from 'three';

export class CameraController {
  private readonly focus = new THREE.Vector3(0, 1.2, 0);

  constructor(readonly camera: THREE.PerspectiveCamera) {
    camera.position.set(0, 3.1, 9);
    camera.lookAt(0, 1.1, 0);
  }

  update(first: THREE.Vector3, second: THREE.Vector3, deltaTime = 1 / 60): void {
    const midpointX = THREE.MathUtils.clamp((first.x + second.x) * 0.5, -2.5, 2.5);
    const distance = Math.abs(first.x - second.x);
    const targetZ = Math.max(7.5, Math.min(11.5, 6.5 + distance * 0.6));

    this.camera.position.x = THREE.MathUtils.damp(
      this.camera.position.x,
      midpointX,
      6,
      deltaTime,
    );
    this.camera.position.y = 3.2;
    this.camera.position.z = THREE.MathUtils.lerp(
      this.camera.position.z,
      targetZ,
      1 - Math.exp(-4 * deltaTime),
    );
    this.focus.set(midpointX, 1.2, 0);
    this.camera.lookAt(this.focus);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
  }
}
