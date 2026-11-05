import * as THREE from 'three';
import type { FighterParts } from './FighterRegistry';

export type FighterAnimationState = 'IDLE' | 'WALK' | 'PUNCH' | 'KICK' | 'SUPER' | 'HITSTUN' | 'KO' | 'JUMP';

export class ProceduralAnimator {
  private readonly parts: FighterParts;

  constructor(private readonly rig: THREE.Group) {
    this.parts = rig.userData.parts as FighterParts;
  }

  update(time: number, state: string = 'IDLE', frame = 0): void {
    const phase = frame * 0.22;
    const pulse = Math.sin(time * 0.006);
    const walk = Math.sin(phase) * 0.6;
    const { torso, head, leftArmPivot, rightArmPivot, leftLegPivot, rightLegPivot, punchTrail, shockwave } = this.parts;
    const punchMaterial = punchTrail.material as THREE.MeshBasicMaterial;
    const shockwaveMaterial = shockwave.material as THREE.MeshBasicMaterial;

    leftArmPivot.rotation.set(-0.7, 0, 0);
    rightArmPivot.rotation.set(-0.9, 0, 0);
    leftLegPivot.rotation.set(0, 0, 0);
    rightLegPivot.rotation.set(0, 0, 0);
    torso.rotation.set(0, 0, 0);
    punchMaterial.opacity = 0;
    shockwaveMaterial.opacity = 0;
    this.rig.position.y = state === 'JUMP' ? 0.25 : 0;

    if (state === 'WALK') {
      leftLegPivot.rotation.x = walk;
      rightLegPivot.rotation.x = -walk;
      leftArmPivot.rotation.x = -0.7 - walk * 0.45;
      rightArmPivot.rotation.x = -0.9 + walk * 0.45;
    } else if (state === 'PUNCH') {
      rightArmPivot.rotation.x = -1.55;
      rightArmPivot.position.z = 0.35;
      punchMaterial.opacity = 0.8;
    } else if (state === 'KICK') {
      rightLegPivot.rotation.x = -1.45;
      torso.rotation.z = 0.16;
    } else if (state === 'SUPER') {
      leftArmPivot.rotation.x = -1.55;
      rightArmPivot.rotation.x = -1.55;
      shockwaveMaterial.opacity = 0.85;
      shockwave.scale.setScalar(1 + (frame % 18) * 0.08);
    } else if (state === 'HITSTUN') {
      torso.rotation.x = 0.35;
      head.rotation.x = 0.35;
      this.flash(true);
    } else if (state === 'KO') {
      this.rig.rotation.z = Math.PI / 2;
    }

    if (state !== 'KO') this.rig.rotation.z = 0;
    torso.position.y = 0.95 + pulse * 0.012;
    head.position.y = 1.52 + pulse * 0.018;
    if (state !== 'PUNCH') rightArmPivot.position.z = 0;
    if (state !== 'HITSTUN') this.flash(false);
  }

  private flash(active: boolean): void {
    this.rig.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || !(object.material instanceof THREE.MeshStandardMaterial)) return;
      object.material.emissive.set(active ? 0xff3344 : 0x000000);
      object.material.emissiveIntensity = active ? 1.4 : 0;
    });
  }
}
