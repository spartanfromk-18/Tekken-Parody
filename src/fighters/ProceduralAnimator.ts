import * as THREE from 'three';

export class ProceduralAnimator {
  constructor(private readonly rig: THREE.Group) {}

  update(time: number, state: string = 'IDLE', frame = 0): void {
    const phase = frame * 0.22;
    const pulse = Math.sin(time * 0.006);
    const armL = this.rig.getObjectByName('leftArm');
    const armR = this.rig.getObjectByName('rightArm');
    const legL = this.rig.getObjectByName('leftLeg');
    const legR = this.rig.getObjectByName('rightLeg');
    const torso = this.rig.getObjectByName('torso');
    const head = this.rig.getObjectByName('head');
    const walk = state === 'WALK' ? Math.sin(phase) * 0.35 : 0;
    if (armL && armR) {
      armL.rotation.z = -0.2 - walk;
      armR.rotation.z = 0.2 + walk;
    }
    if (legL && legR) {
      legL.rotation.x = walk;
      legR.rotation.x = -walk;
    }
    if (state === 'ATTACK' && armR) armR.rotation.z = -1.15;
    if (state === 'BLOCK' && armL && armR) {
      armL.rotation.z = -0.85;
      armR.rotation.z = 0.85;
    }
    if (state === 'HITSTUN' || state === 'KO') this.rig.rotation.z = Math.sin(phase) * 0.18 + (state === 'KO' ? Math.PI / 2 : 0);
    else this.rig.rotation.z = 0;
    if (torso) torso.rotation.z = pulse * 0.015;
    if (head) head.rotation.y = pulse * 0.04;
    this.rig.position.y = state === 'CROUCH' ? -0.25 : (state === 'JUMP' ? 0.25 : pulse * 0.03);
  }
}
