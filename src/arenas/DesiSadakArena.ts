import * as THREE from 'three';

export function buildDesiSadakArena(scene: THREE.Scene): void {
  scene.background = new THREE.Color(0x160b12);
  scene.fog = new THREE.FogExp2(0x160b12, 0.035);
  const arena = new THREE.Group();
  arena.name = 'Desi Sadak';
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 12),
    new THREE.MeshStandardMaterial({ color: 0x20232b, roughness: 0.75, metalness: 0.25 }),
  );
  road.rotation.x = -Math.PI / 2;
  road.receiveShadow = true;
  arena.add(road);
  const lines = new THREE.Group();
  for (let x = -12; x <= 12; x += 2) {
    const dash = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.015, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xffd166 }),
    );
    dash.position.set(x, 0.02, 0);
    lines.add(dash);
  }
  arena.add(lines);
  for (const side of [-1, 1]) {
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 3),
      new THREE.MeshStandardMaterial({ color: side < 0 ? 0x4b1f3a : 0x1d3d4d, roughness: 0.9 }),
    );
    building.position.set(side * 7, 2.5, -2.5);
    arena.add(building);
  }
  scene.add(arena);
  scene.add(new THREE.HemisphereLight(0xffb36b, 0x160b12, 1.8));
  const lamp = new THREE.DirectionalLight(0xffd3a3, 3);
  lamp.position.set(-5, 9, 6);
  lamp.castShadow = true;
  scene.add(lamp);
}
