import * as THREE from 'three';

export function buildSansadArena(scene: THREE.Scene): void {
  const arena = new THREE.Group();
  arena.name = 'Sansad Cyber-Colosseum';
  scene.add(arena);
  scene.background = new THREE.Color(0x040611);
  scene.fog = new THREE.FogExp2(0x070a18, 0.026);

  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(9, 10.4, 0.42, 64),
    new THREE.MeshStandardMaterial({
      color: 0x11172a,
      metalness: 0.72,
      roughness: 0.48,
    }),
  );
  floor.position.y = -0.2;
  floor.scale.z = 0.62;
  floor.receiveShadow = true;
  arena.add(floor);

  const grid = new THREE.GridHelper(28, 36, 0x4de7ff, 0x183050);
  grid.position.y = 0.015;
  grid.scale.z = 0.58;
  const gridMaterials = Array.isArray(grid.material)
    ? grid.material
    : [grid.material];
  gridMaterials.forEach((material) => {
    material.transparent = true;
    material.opacity = 0.5;
  });
  arena.add(grid);

  for (const radius of [3.7, 5.7, 7.7]) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius, radius + 0.035, 96),
      new THREE.MeshBasicMaterial({
        color: radius === 5.7 ? 0xff4fc8 : 0x42e8ff,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.018;
    ring.scale.y = 0.55;
    arena.add(ring);
  }

  for (const side of [-1, 1]) {
    for (let row = 0; row < 3; row += 1) {
      const x = side * (5.8 + row * 0.8);
      const z = -2.6 + row * 1.8;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.42, 4.4, 8),
        new THREE.MeshStandardMaterial({
          color: 0x17213b,
          emissive: side < 0 ? 0x063c58 : 0x4b123f,
          emissiveIntensity: 1.4,
          metalness: 0.75,
          roughness: 0.3,
        }),
      );
      pillar.position.set(x, 2.2, z);
      arena.add(pillar);

      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 4.4, 0.07),
        new THREE.MeshBasicMaterial({
          color: side < 0 ? 0x44eaff : 0xff4fc8,
        }),
      );
      strip.position.set(x, 2.4, z + 0.31);
      arena.add(strip);
    }
  }

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(9, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0x405cbb,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    }),
  );
  dome.scale.z = 0.6;
  dome.position.y = -0.1;
  arena.add(dome);

  scene.add(new THREE.HemisphereLight(0x7898ff, 0x080512, 1.25));
  const key = new THREE.DirectionalLight(0xc4e5ff, 2.6);
  key.position.set(-4, 7, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const rim = new THREE.PointLight(0xb56cff, 32, 20, 2);
  rim.position.set(0, 4, -3);
  arena.add(rim);

  const warmRim = new THREE.DirectionalLight(0xff6fcf, 2.4);
  warmRim.position.set(5, 3, -5);
  scene.add(warmRim);
}
