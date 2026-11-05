import * as THREE from 'three';

export class CameraController {
  private readonly focus = new THREE.Vector3(0, 1.2, 0);

  constructor(readonly camera: THREE.PerspectiveCamera) {
    camera.position.set(0, 3.1, 9);
    camera.lookAt(0, 1.1, 0);
  }

  update(first: THREE.Vector3, second: THREE.Vector3, deltaTime = 1 / 60): void {
    const midpoint = this.focus.copy(first).add(second).multiplyScalar(0.5);
    const distance = Math.min(Math.abs(first.x - second.x), 14);

    this.camera.position.x = THREE.MathUtils.damp(
      this.camera.position.x,
      midpoint.x,
      6,
      deltaTime,
    );
    this.camera.position.z = THREE.MathUtils.lerp(
      this.camera.position.z,
      7.2 + distance * 0.45,
      1 - Math.exp(-4 * deltaTime),
    );
    this.camera.lookAt(midpoint);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
  }
}
