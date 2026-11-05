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
  body.position.y = Math.max(0, body.position.y);
  if (body.position.y <= 0 && body.velocity.y < 0) body.velocity.y = 0;

  body.velocity.x *= 0.96;
  body.velocity.z *= 0.96;
  body.hitstun = Math.max(0, body.hitstun - 1);
}

export function applyKnockback(body: PhysicsBody, x: number, z = 0): void {
  body.velocity.x += x;
  body.velocity.z += z;
  body.grounded = false;
}

export function resolvePushbox(first: PhysicsBody, second: PhysicsBody, minimumDistance = 0.85): void {
  if (Math.abs(first.position.y - second.position.y) >= 1) return;
  const delta = second.position.x - first.position.x;
  const direction = delta === 0 ? 1 : Math.sign(delta);
  const overlap = minimumDistance - Math.abs(delta);
  if (overlap <= 0) return;
  const separation = overlap * 0.5;
  first.position.x -= direction * separation;
  second.position.x += direction * separation;
  if (direction > 0) {
    if (first.velocity.x > 0) first.velocity.x = 0;
    if (second.velocity.x < 0) second.velocity.x = 0;
  } else {
    if (first.velocity.x < 0) first.velocity.x = 0;
    if (second.velocity.x > 0) second.velocity.x = 0;
  }
}
