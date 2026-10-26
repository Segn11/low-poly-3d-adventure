import * as THREE from 'three';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.colliders = []; // objects with .box: THREE.Box3, and optional .platformVelocity
    this.movingPlatforms = [];
    this.bouncePads = [];
    this.checkpoints = [];
    this.clouds = [];
    this.sparkles = [];
    this.hazardObstacles = [];

    this.initLighting();
    this.initSky();
    this.buildLevel();
    this.initDriftingClouds();
    this.initAmbientSparkles();
  }

  initLighting() {
    // Hemisphere light for vibrant, natural outdoor sky & ground bounce
    const hemiLight = new THREE.HemisphereLight(0xb1e1ff, 0x3b5828, 0.75);
    this.scene.add(hemiLight);

    // Main Sun light
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    this.sunLight.position.set(45, 65, 35);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 5;
    this.sunLight.shadow.camera.far = 160;

    const d = 50;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Warm rim light
    const rimLight = new THREE.DirectionalLight(0xffc078, 0.45);
    rimLight.position.set(-40, 20, -35);
    this.scene.add(rimLight);
  }

  initSky() {
    // Beautiful clean sky background & subtle distant fog
    this.scene.background = new THREE.Color(0x70c5ff);
    this.scene.fog = new THREE.Fog(0x70c5ff, 90, 260);
  }

  buildLevel() {
    // Materials
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x48bb78, // Vibrant emerald meadow
      roughness: 0.6,
      flatShading: true
    });

    const dirtMat = new THREE.MeshStandardMaterial({
      color: 0x795548, // Earthy brown rock underbelly
      roughness: 0.8,
      flatShading: true
    });

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Slate stone
      roughness: 0.7,
      flatShading: true
    });

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0xa0522d,
      roughness: 0.8
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf1c40f,
      metalness: 0.8,
      roughness: 0.2
    });

    // ----------------------------------------------------
    // ISLAND 1: Emerald Meadow (Spawn Island)
    // ----------------------------------------------------
    this.createFloatingIsland({
      x: 0, y: 0, z: 0,
      width: 26, depth: 26, height: 6,
      topMat: grassMat, bottomMat: dirtMat
    });

    // Trees on Island 1
    this.createLowPolyTree(6, 0.5, 6, 1.2);
    this.createLowPolyTree(-7, 0.5, 5, 1.0);
    this.createLowPolyTree(-6, 0.5, -6, 1.3);
    this.createLowPolyTree(7, 0.5, -5, 0.9);

    // Mushrooms
    this.createMushroom(3, 0.5, 4, 0xff4757, 0.8);
    this.createMushroom(-4, 0.5, 3, 0x3742fa, 0.6);
    this.createMushroom(4, 0.5, -3, 0xffa502, 0.7);

    // Welcome Signpost
    this.createSignpost(0, 0.5, 4.5, "Welcome to Starfall Isle!\nWASD to Move, SPACE to Jump!");

    // Checkpoint 1 (Spawn)
    this.createCheckpointTotem(0, 0.5, 0, "Meadow Camp");

    // Stepping stones towards Island 2
    this.createStaticBlock(0, 1.5, 17, 3.5, 1.5, 3.5, stoneMat);
    this.createStaticBlock(0, 3.5, 23, 3.2, 1.5, 3.2, stoneMat);

    // ----------------------------------------------------
    // ISLAND 2: Bouncing Meadow & First Moving Platform
    // ----------------------------------------------------
    this.createFloatingIsland({
      x: 0, y: 5, z: 34,
      width: 16, depth: 16, height: 5,
      topMat: grassMat, bottomMat: dirtMat
    });

    this.createLowPolyTree(4, 5.5, 35, 1.1);
    this.createLowPolyTree(-4, 5.5, 32, 0.9);

    // Super Bounce Mushroom
    this.createBouncePad(0, 5.5, 38, 28, 0xff3838);

    // Moving Platform (Horizontal oscillation between Island 2 and Island 3)
    this.createMovingPlatform({
      start: new THREE.Vector3(0, 7.5, 48),
      end: new THREE.Vector3(0, 7.5, 62),
      size: new THREE.Vector3(5, 1.2, 5),
      speed: 0.6,
      mat: stoneMat
    });

    // ----------------------------------------------------
    // ISLAND 3: The Ancient Wind Ruins
    // ----------------------------------------------------
    this.createFloatingIsland({
      x: 0, y: 10, z: 76,
      width: 22, depth: 22, height: 7,
      topMat: stoneMat, bottomMat: dirtMat
    });

    // Stone Pillars & Ancient Arch
    this.createStonePillar(-6, 10.5, 76, 5, stoneMat);
    this.createStonePillar(6, 10.5, 76, 5, stoneMat);
    this.createStaticBlock(0, 15.5, 76, 14, 1.2, 2.5, stoneMat);

    // Checkpoint 2
    this.createCheckpointTotem(0, 10.5, 76, "Ancient Ruins");

    // Rotating Hazard Beam on Island 3
    this.createRotatingHazardBeam(0, 11.2, 70, 7, 1.2);

    // ----------------------------------------------------
    // ISLAND 4: Crystal Chasm (Ascending Platforms)
    // ----------------------------------------------------
    // Vertically moving elevator platform
    this.createMovingPlatform({
      start: new THREE.Vector3(14, 12, 76),
      end: new THREE.Vector3(14, 22, 76),
      size: new THREE.Vector3(4.5, 1.2, 4.5),
      speed: 0.5,
      mat: stoneMat
    });

    // Mid-air crystal stepping stone
    this.createStaticBlock(14, 23.5, 62, 4, 1.5, 4, stoneMat);

    // Another Super Bounce Pad on the high ledge!
    this.createBouncePad(14, 24.5, 62, 32, 0x00d2d3);

    // Floating Cloud Stepping Stones leading to Summit
    this.createCloudIsland(14, 26, 88, 5, 2, 5);
    this.createCloudIsland(8, 29, 98, 5, 2, 5);
    this.createCloudIsland(0, 32, 110, 5, 2, 5);

    // ----------------------------------------------------
    // ISLAND 5: Summit Shrine ("Temple of the Stars")
    // ----------------------------------------------------
    this.createFloatingIsland({
      x: 0, y: 36, z: 128,
      width: 24, depth: 24, height: 8,
      topMat: stoneMat, bottomMat: dirtMat
    });

    // Golden Temple Pillars
    const shrinePillars = [
      [-7, -7], [7, -7], [-7, 7], [7, 7]
    ];
    shrinePillars.forEach(([px, pz]) => {
      this.createStonePillar(px, 36.5, 128 + pz, 6, stoneMat, goldTrimMat);
    });

    // Star Altar in center of Summit
    this.createStaticBlock(0, 37.5, 128, 7, 1.8, 7, goldTrimMat);
    this.createStaticBlock(0, 38.8, 128, 4.5, 1.2, 4.5, stoneMat);

    // Checkpoint 3
    this.createCheckpointTotem(0, 36.5, 121, "Star Summit");
  }

  createFloatingIsland({ x, y, z, width, depth, height, topMat, bottomMat }) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Top lush layer
    const topGeo = new THREE.BoxGeometry(width, 1.5, depth);
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 0;
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    group.add(topMesh);

    // Low-poly tapered rock underbelly
    const coneGeo = new THREE.ConeGeometry(Math.max(width, depth) * 0.65, height, 7);
    coneGeo.rotateX(Math.PI);
    const underMesh = new THREE.Mesh(coneGeo, bottomMat);
    underMesh.position.y = -height / 2;
    underMesh.castShadow = true;
    underMesh.receiveShadow = true;
    group.add(underMesh);

    this.scene.add(group);

    // Register primary walkable collider
    const box = new THREE.Box3();
    box.setFromCenterAndSize(
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(width, 1.5, depth)
    );
    this.colliders.push({ box, mesh: topMesh });
  }

  createCloudIsland(x, y, z, w, h, d) {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      flatShading: true
    });

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cloudMat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Bubbly cloud spheres decorating the edges
    const puffGeo = new THREE.DodecahedronGeometry(h * 0.9, 1);
    const offsets = [
      [w/2, 0, 0], [-w/2, 0, 0], [0, 0, d/2], [0, 0, -d/2]
    ];
    offsets.forEach(([ox, oy, oz]) => {
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(x + ox, y + oy, z + oz);
      this.scene.add(puff);
    });

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, y, z), new THREE.Vector3(w + 1, h, d + 1));
    this.colliders.push({ box, mesh });
  }

  createStaticBlock(x, y, z, w, h, d, mat) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, y, z), new THREE.Vector3(w, h, d));
    this.colliders.push({ box, mesh });
  }

  createStonePillar(x, y, z, height, mat, trimMat = null) {
    const geo = new THREE.CylinderGeometry(0.9, 1.1, height, 7);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    if (trimMat) {
      const capGeo = new THREE.BoxGeometry(2.2, 0.6, 2.2);
      const capMesh = new THREE.Mesh(capGeo, trimMat);
      capMesh.position.set(x, y + height + 0.3, z);
      this.scene.add(capMesh);
    }

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, y + height / 2, z), new THREE.Vector3(2, height, 2));
    this.colliders.push({ box, mesh });
  }

  createLowPolyTree(x, y, z, scale = 1.0) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.scale.setScalar(scale);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x2ed573,
      roughness: 0.5,
      flatShading: true
    });

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 2.2, 6);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    group.add(trunk);

    // Tiered foliage cones
    const f1 = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.2, 7), foliageMat);
    f1.position.y = 2.4;
    f1.castShadow = true;
    group.add(f1);

    const f2 = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.9, 7), foliageMat);
    f2.position.y = 3.6;
    f2.castShadow = true;
    group.add(f2);

    const f3 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.5, 7), foliageMat);
    f3.position.y = 4.7;
    f3.castShadow = true;
    group.add(f3);

    this.scene.add(group);
  }

  createMushroom(x, y, z, capColor, scale = 1.0) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.scale.setScalar(scale);

    const stemMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.5 });
    const capMat = new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.3, metalness: 0.1 });
    const spotMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.9, 8), stemMat);
    stem.position.y = 0.45;
    group.add(stem);

    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), capMat);
    cap.position.y = 0.9;
    group.add(cap);

    // Decorative spots
    for (let i = 0; i < 4; i++) {
      const spot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 6), spotMat);
      const angle = (i / 4) * Math.PI * 2;
      spot.position.set(Math.cos(angle) * 0.48, 1.15, Math.sin(angle) * 0.48);
      spot.rotation.x = -0.4;
      group.add(spot);
    }

    this.scene.add(group);
  }

  createSignpost(x, y, z, text) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 6), woodMat);
    post.position.y = 0.7;
    group.add(post);

    const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.15), woodMat);
    board.position.y = 1.2;
    group.add(board);

    this.scene.add(group);
  }

  createBouncePad(x, y, z, bounceForce = 28, color = 0xff3838) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Pad rim
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x2f3542, roughness: 0.4 });
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, 0.4, 12), rimMat);
    rim.position.y = 0.2;
    group.add(rim);

    // Spring center surface
    const springMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.2,
      emissive: color,
      emissiveIntensity: 0.35
    });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.45, 12), springMat);
    cap.position.y = 0.25;
    group.add(cap);

    this.scene.add(group);

    this.bouncePads.push({
      position: new THREE.Vector3(x, y + 0.3, z),
      radius: 1.4,
      bounceForce,
      mesh: group
    });
  }

  createCheckpointTotem(x, y, z, name) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x57606f });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.6, 8), stoneMat);
    base.position.y = 0.3;
    group.add(base);

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 2.0, 8), stoneMat);
    pillar.position.y = 1.3;
    group.add(pillar);

    // Glowing Crystal
    const crystalGeo = new THREE.OctahedronGeometry(0.45, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x00d2d3,
      emissive: 0x00d2d3,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.y = 2.8;
    group.add(crystal);

    this.scene.add(group);

    this.checkpoints.push({
      position: new THREE.Vector3(x, y, z),
      name,
      crystal,
      crystalMat,
      activated: false
    });
  }

  createMovingPlatform({ start, end, size, speed, mat }) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), mat);
    mesh.position.copy(start);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const colliderObj = {
      box: new THREE.Box3(),
      mesh,
      platformVelocity: new THREE.Vector3()
    };
    colliderObj.box.setFromCenterAndSize(mesh.position, size);
    this.colliders.push(colliderObj);

    this.movingPlatforms.push({
      start,
      end,
      size,
      speed,
      colliderObj,
      progress: 0,
      direction: 1
    });
  }

  createRotatingHazardBeam(x, y, z, length = 7, speed = 1.2) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const centerPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x2d3436 })
    );
    group.add(centerPillar);

    const hazardMat = new THREE.MeshStandardMaterial({
      color: 0xff3838,
      emissive: 0xff4757,
      emissiveIntensity: 0.5
    });

    const beamMesh = new THREE.Mesh(new THREE.BoxGeometry(length, 0.6, 0.6), hazardMat);
    beamMesh.position.y = 0.3;
    group.add(beamMesh);

    this.scene.add(group);

    this.hazardObstacles.push({
      group,
      beamMesh,
      length,
      speed,
      rotation: 0
    });
  }

  initDriftingClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      flatShading: true
    });

    for (let i = 0; i < 20; i++) {
      const cloudGroup = new THREE.Group();
      const puffCount = 3 + Math.floor(Math.random() * 4);

      for (let j = 0; j < puffCount; j++) {
        const r = 2.5 + Math.random() * 2.5;
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), cloudMat);
        puff.position.set(
          (j - puffCount / 2) * 2.2,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.5
        );
        cloudGroup.add(puff);
      }

      cloudGroup.position.set(
        (Math.random() - 0.5) * 180,
        15 + Math.random() * 40,
        (Math.random() - 0.5) * 180
      );

      this.scene.add(cloudGroup);
      this.clouds.push({
        group: cloudGroup,
        speed: 1.2 + Math.random() * 1.8
      });
    }
  }

  initAmbientSparkles() {
    // Floating magic dust motes
    const sparkleGeo = new THREE.BufferGeometry();
    const count = 120;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 90;
      positions[i + 1] = 2 + Math.random() * 45;
      positions[i + 2] = (Math.random() - 0.5) * 110;
    }

    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const sparkleMat = new THREE.PointsMaterial({
      color: 0xfffa65,
      size: 0.45,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.sparkleSystem = new THREE.Points(sparkleGeo, sparkleMat);
    this.scene.add(this.sparkleSystem);
  }

  update(delta, player) {
    const time = Date.now() * 0.001;

    // 1. Moving Platforms
    for (const plat of this.movingPlatforms) {
      const prevPos = plat.colliderObj.mesh.position.clone();
      plat.progress += plat.speed * delta * plat.direction;

      if (plat.progress >= 1) {
        plat.progress = 1;
        plat.direction = -1;
      } else if (plat.progress <= 0) {
        plat.progress = 0;
        plat.direction = 1;
      }

      // Smooth sine easing for pleasant platform motion
      const ease = (1 - Math.cos(plat.progress * Math.PI)) / 2;
      plat.colliderObj.mesh.position.lerpVectors(plat.start, plat.end, ease);

      // Calculate instantaneous velocity for transferring to player standing on top
      plat.colliderObj.platformVelocity.copy(plat.colliderObj.mesh.position).sub(prevPos).divideScalar(delta);

      // Update bounding box
      plat.colliderObj.box.setFromCenterAndSize(plat.colliderObj.mesh.position, plat.size);
    }

    // 2. Rotating Hazard Beams
    for (const h of this.hazardObstacles) {
      h.rotation += h.speed * delta;
      h.group.rotation.y = h.rotation;

      // Check collision with player
      const beamWorldPos = new THREE.Vector3();
      h.group.getWorldPosition(beamWorldPos);

      const d = player.mesh.position.distanceTo(beamWorldPos);
      if (d < h.length / 2 + player.radius) {
        const dy = Math.abs(player.mesh.position.y - beamWorldPos.y);
        if (dy < 1.0) {
          // Calculate angle relative to beam rotation
          const angleToPlayer = Math.atan2(
            player.mesh.position.x - beamWorldPos.x,
            player.mesh.position.z - beamWorldPos.z
          );
          const relativeAngle = Math.abs(angleToPlayer - h.rotation) % Math.PI;
          if (relativeAngle < 0.3 || relativeAngle > Math.PI - 0.3) {
            const knockDir = player.mesh.position.clone().sub(beamWorldPos).normalize();
            player.takeDamage(1, knockDir);
          }
        }
      }
    }

    // 3. Checkpoint Totems
    for (const cp of this.checkpoints) {
      cp.crystal.rotation.y += delta * 2;
      cp.crystal.position.y = 2.8 + Math.sin(time * 3) * 0.15;

      const dist = player.mesh.position.distanceTo(cp.position);
      if (dist < 3.5 && !cp.activated) {
        cp.activated = true;
        cp.crystalMat.color.setHex(0x2ed573);
        cp.crystalMat.emissive.setHex(0x2ed573);
        player.setCheckpoint(cp.position);
        // Dispatch UI notification
        window.dispatchEvent(new CustomEvent('checkpointReached', { detail: { name: cp.name } }));
      }
    }

    // 4. Drifting Clouds
    for (const cloud of this.clouds) {
      cloud.group.position.x += cloud.speed * delta;
      if (cloud.group.position.x > 100) {
        cloud.group.position.x = -100;
      }
    }

    // 5. Ambient Sparkles
    if (this.sparkleSystem) {
      const positions = this.sparkleSystem.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + positions[i]) * 0.02;
      }
      this.sparkleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // 6. Bounce pad animations
    for (const pad of this.bouncePads) {
      if (pad.mesh.scale.x > 1.0) {
        pad.mesh.scale.lerp(new THREE.Vector3(1, 1, 1), Math.min(10 * delta, 1));
      }
    }
  }
}
