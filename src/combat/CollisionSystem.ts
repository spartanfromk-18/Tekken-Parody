export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Aabb {
  min: Vec3;
  max: Vec3;
}

export function aabbOverlaps(a: Aabb, b: Aabb): boolean {
  return (
    a.min.x <= b.max.x && a.max.x >= b.min.x &&
    a.min.y <= b.max.y && a.max.y >= b.min.y &&
    a.min.z <= b.max.z && a.max.z >= b.min.z
  );
}

export function sphereAabbOverlap(
  center: Vec3,
  radius: number,
  box: Aabb,
): boolean {
  const closest = {
    x: Math.max(box.min.x, Math.min(center.x, box.max.x)),
    y: Math.max(box.min.y, Math.min(center.y, box.max.y)),
    z: Math.max(box.min.z, Math.min(center.z, box.max.z)),
  };
  const dx = center.x - closest.x;
  const dy = center.y - closest.y;
  const dz = center.z - closest.z;
  return dx * dx + dy * dy + dz * dz <= radius * radius;
}
