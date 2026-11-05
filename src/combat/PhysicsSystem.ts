import type { Vec3 } from './CollisionSystem';

export interface PhysicsBody {
  position: Vec3;
  velocity: Vec3;
  grounded: boolean;
  hitstun: number;
}

export const GRAVITY = -0.012;

export function stepPhysics(body: PhysicsBody): void {
  if (!body.grounded) {
    body.velocity.y += GRAVITY;
  }
  body.position.x += body.velocity.x;
  body.position.y += body.velocity.y;
  body.position.z += body.velocity.z;

  if (body.position.y <= 0) {
    body.position.y = 0;
    body.velocity.y = 0;
    body.grounded = true;
  }

  body.velocity.x *= 0.96;
  body.velocity.z *= 0.96;
}
