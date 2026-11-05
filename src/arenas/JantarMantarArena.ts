import * as THREE from 'three';

export function buildJantarMantarArena(scene: THREE.Scene): void {
  const arena = new THREE.Group();
  arena.name = 'JantarMantarArena';
  scene.add(arena);
  scene.background = new THREE.Color(0x11081f);
  scene.fog = new THREE.FogExp2(0x180c2e, 0.03);

  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(9.5, 10.5, 0.4, 64),
    new THREE.MeshStandardMaterial({ color: 0x2a1b3d, roughness: 0.6 }),
  );
  floor.position.y = -0.2;
  floor.receiveShadow = true;
  arena.add(floor);

  const grid = new THREE.GridHelper(30, 30, 0xff77ff, 0x442266);
  grid.position.y = 0.01;
  arena.add(grid);
  scene.add(new THREE.HemisphereLight(0xffbbee, 0x11081f, 1.2));
  const light = new THREE.DirectionalLight(0xffd6ff, 2.2);
  light.position.set(5, 8, 5);
  scene.add(light);
}
