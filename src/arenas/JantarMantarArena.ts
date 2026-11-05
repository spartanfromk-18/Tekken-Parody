import * as THREE from 'three';

export function buildJantarMantarArena(scene: THREE.Scene): void {
  const arena = new THREE.Group();
  arena.name = 'TekkenArenaCinematic';
  scene.add(arena);

  // Dark moody atmospheric background
  scene.background = new THREE.Color(0x05050b);
  scene.fog = new THREE.FogExp2(0x05050b, 0.025);

  // High-gloss reflective combat floor
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(12, 13, 0.5, 64),
    new THREE.MeshStandardMaterial({ 
      color: 0x0f111a, 
      roughness: 0.2, 
      metalness: 0.8 
    })
  );
  floor.position.y = -0.25;
  floor.receiveShadow = true;
  arena.add(floor);

  // Neon grid ring for arcade depth
  const grid = new THREE.GridHelper(32, 32, 0xff0055, 0x1a1a3a);
  grid.position.y = 0.01;
  arena.add(grid);

  // Cinematic Lighting Rig
  const ambient = new THREE.AmbientLight(0x222244, 1.5);
  scene.add(ambient);

  // Key light (Blue cyan rim)
  const keyLight = new THREE.DirectionalLight(0x00ffff, 3.5);
  keyLight.position.set(8, 10, 6);
  keyLight.castShadow = true;
  scene.add(keyLight);

  // Fill light (Hot magenta rim)
  const fillLight = new THREE.DirectionalLight(0xff0055, 3.0);
  fillLight.position.set(-8, 8, -6);
  scene.add(fillLight);
}