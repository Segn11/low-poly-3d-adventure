import * as THREE from 'three';
import { sounds } from './audio.js';

export class CollectiblesManager {
  constructor(scene) {
    this.scene = scene;
    this.coins = [];
    this.stars = [];
    this.hearts = [];
    this.collectParticles = [];

    this.coinsCollected = 0;
    this.totalCoins = 0;
    this.starsCollected = 0;
    this.totalStars = 3;

    this.initSparklePool();
    this.spawnWorldCollectibles();
  }

  initSparklePool() {
    const geo = new THREE.DodecahedronGeometry(0.12, 0);
    for (let i = 0; i < 50; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffd32a,
        transparent: true,
        opacity: 0.9
      });
      const p = new THREE.Mesh(geo, mat);
      p.visible = false;
      this.scene.add(p);
      this.collectParticles.push({
        mesh: p,
        life: 0,
        maxLife: 0.45,
        vel: new THREE.Vector3()
      });
    }
  }

  triggerSparkles(pos, color = 0xffd32a, count = 10) {
    let spawned = 0;
    for (const p of this.collectParticles) {
      if (p.life <= 0) {
        p.mesh.position.copy(pos);
        p.mesh.material.color.setHex(color);
        p.mesh.visible = true;
        p.life = p.maxLife;
        p.mesh.scale.setScalar(0.7 + Math.random() * 0.6);

        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 3.5;
        p.vel.set(
          Math.cos(angle) * speed,
          2.0 + Math.random() * 3.0,
          Math.sin(angle) * speed
        );

        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  spawnWorldCollectibles() {
    // ----------------------------------------------------
    // COINS ON ISLAND 1 (Meadow)
    // ----------------------------------------------------
    const meadowCoins = [
      [-3, 1.2, 2], [0, 1.2, 2], [3, 1.2, 2],
      [-2, 1.2, -2], [2, 1.2, -2],
      [-6, 1.2, 0], [6, 1.2, 0],
      [0, 2.7, 17], [0, 4.7, 23] // On stepping stones
    ];
    meadowCoins.forEach(([x, y, z]) => this.spawnCoin(x, y, z));

    // ----------------------------------------------------
    // COINS ON ISLAND 2 (Bouncing Meadow & Path)
    // ----------------------------------------------------
    const island2Coins = [
      [-4, 6.2, 34], [4, 6.2, 34],
      [0, 11.5, 38], // Mid-air coin above bounce pad!
      [0, 14.5, 38], // Even higher mid-air coin!
      [0, 8.7, 55]   // On moving platform trajectory
    ];
    island2Coins.forEach(([x, y, z]) => this.spawnCoin(x, y, z));

    // ----------------------------------------------------
    // COINS ON ISLAND 3 & 4 (Wind Ruins & Chasm)
    // ----------------------------------------------------
    const ruinsCoins = [
      [-4, 11.2, 76], [4, 11.2, 76],
      [0, 16.8, 76], // On top of the ancient stone arch!
      [14, 13.5, 76],
      [14, 25.0, 62],
      [14, 27.5, 88],
      [8, 30.5, 98],
      [0, 33.5, 110]
    ];
    ruinsCoins.forEach(([x, y, z]) => this.spawnCoin(x, y, z));

    // ----------------------------------------------------
    // COINS ON SUMMIT SHRINE
    // ----------------------------------------------------
    const summitCoins = [
      [-5, 37.5, 123], [5, 37.5, 123],
      [-5, 37.5, 133], [5, 37.5, 133],
      [0, 37.5, 133], [0, 37.5, 123]
    ];
    summitCoins.forEach(([x, y, z]) => this.spawnCoin(x, y, z));

    // ----------------------------------------------------
    // HEALTH HEARTS
    // ----------------------------------------------------
    this.spawnHeart(-8, 1.2, -7);
    this.spawnHeart(0, 11.2, 82);

    // ----------------------------------------------------
    // 3 GRAND POWER STARS
    // ----------------------------------------------------
    // Star 1: Island 1 Hidden Grove Star
    this.spawnStar(-8, 1.8, 7, "Grove Star");

    // Star 2: Island 2 Sky Apex (Requires bouncing on super mushroom)
    this.spawnStar(0, 18.0, 38, "Sky Hopper Star");

    // Star 3: Summit of the Sky Temple
    this.spawnStar(0, 41.5, 128, "Grand Summit Star");
  }

  spawnCoin(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // 3D Coin geometry with ridge
    const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.09, 14);
    coinGeo.rotateX(Math.PI / 2);

    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0xff9900,
      emissiveIntensity: 0.25
    });

    const mesh = new THREE.Mesh(coinGeo, coinMat);
    mesh.castShadow = true;
    group.add(mesh);

    // Coin Star center imprint
    const starGeo = new THREE.OctahedronGeometry(0.18, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xfff275 });
    const star = new THREE.Mesh(starGeo, starMat);
    group.add(star);

    this.scene.add(group);

    this.coins.push({
      group,
      baseY: y,
      collected: false,
      isAttracted: false
    });
    this.totalCoins++;
  }

  spawnStar(x, y, z, name) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Stylized 3D Power Star
    const starGroup = new THREE.Group();

    // 5-point star made from extruded shape or layered tetrahedrons
    const starShape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.9;
    const innerRadius = 0.42;

    for (let i = 0; i < points * 2; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) starShape.moveTo(px, py);
      else starShape.lineTo(px, py);
    }
    starShape.closePath();

    const extrudeSettings = { depth: 0.35, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.08, bevelThickness: 0.08 };
    const starGeo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    starGeo.center();

    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffe024,
      metalness: 0.4,
      roughness: 0.15,
      emissive: 0xffb703,
      emissiveIntensity: 0.6
    });

    const starMesh = new THREE.Mesh(starGeo, starMat);
    starGroup.add(starMesh);

    // Cute Star Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e272e });
    const eyeGeo = new THREE.CapsuleGeometry(0.04, 0.14, 4, 8);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.16, 0.05, 0.28);
    starGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.16, 0.05, 0.28);
    starGroup.add(rightEye);

    // Rotating Glowing Aura Ring
    const ringGeo = new THREE.TorusGeometry(1.2, 0.04, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.75
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    group.add(ring);

    group.add(starGroup);
    this.scene.add(group);

    this.stars.push({
      group,
      starGroup,
      ring,
      baseY: y,
      name,
      collected: false
    });
  }

  spawnHeart(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Heart shape
    const heartShape = new THREE.Shape();
    const x0 = 0, y0 = 0;
    heartShape.moveTo(x0 + 0.25, y0 + 0.25);
    heartShape.bezierCurveTo(x0 + 0.25, y0 + 0.25, x0 + 0.2, y0, x0, y0);
    heartShape.bezierCurveTo(x0 - 0.3, y0, x0 - 0.3, y0 + 0.35, x0 - 0.3, y0 + 0.35);
    heartShape.bezierCurveTo(x0 - 0.3, y0 + 0.55, x0 - 0.1, y0 + 0.77, x0 + 0.25, y0 + 1.0);
    heartShape.bezierCurveTo(x0 + 0.6, y0 + 0.77, x0 + 0.8, y0 + 0.55, x0 + 0.8, y0 + 0.35);
    heartShape.bezierCurveTo(x0 + 0.8, y0 + 0.35, x0 + 0.8, y0, x0 + 0.5, y0);
    heartShape.bezierCurveTo(x0 + 0.35, y0, x0 + 0.25, y0 + 0.25, x0 + 0.25, y0 + 0.25);

    const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeo.center();
    heartGeo.rotateZ(Math.PI);

    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xff3838,
      emissive: 0xff4757,
      emissiveIntensity: 0.4,
      roughness: 0.3
    });

    const mesh = new THREE.Mesh(heartGeo, heartMat);
    mesh.scale.set(0.6, 0.6, 0.6);
    group.add(mesh);
    this.scene.add(group);

    this.hearts.push({
      group,
      mesh,
      baseY: y,
      collected: false
    });
  }

  update(delta, player) {
    const time = Date.now() * 0.003;
    const playerPos = player.mesh.position;

    // Update Sparkles
    for (const p of this.collectParticles) {
      if (p.life > 0) {
        p.life -= delta;
        p.vel.y -= 8 * delta;
        p.mesh.position.addScaledVector(p.vel, delta);
        const progress = 1 - (p.life / p.maxLife);
        p.mesh.scale.setScalar((1 - progress) * 0.8);
        if (p.life <= 0) p.mesh.visible = false;
      }
    }

    // 1. Update Coins
    for (const coin of this.coins) {
      if (coin.collected) continue;

      // Bobbing & Rotation
      coin.group.rotation.y += delta * 3.2;
      coin.group.position.y = coin.baseY + Math.sin(time * 3 + coin.group.position.x) * 0.18;

      // Magnetic Attraction to Player
      const dist = coin.group.position.distanceTo(playerPos);
      if (dist < 4.2) {
        coin.group.position.lerp(playerPos.clone().add(new THREE.Vector3(0, 0.7, 0)), delta * 8);
      }

      // Collect Check
      if (dist < 1.3) {
        coin.collected = true;
        coin.group.visible = false;
        this.coinsCollected++;
        sounds.playCoin();
        this.triggerSparkles(coin.group.position, 0xffd32a, 8);

        window.dispatchEvent(new CustomEvent('coinCollected', {
          detail: { current: this.coinsCollected, total: this.totalCoins }
        }));
      }
    }

    // 2. Update Stars
    for (const star of this.stars) {
      if (star.collected) continue;

      // Star slow majestic rotation & floating
      star.starGroup.rotation.y += delta * 1.8;
      star.starGroup.rotation.z = Math.sin(time * 2) * 0.1;
      star.ring.rotation.z += delta * 2.5;
      star.ring.rotation.x = Math.PI / 3 + Math.cos(time * 1.5) * 0.2;
      star.group.position.y = star.baseY + Math.sin(time * 2) * 0.3;

      const dist = star.group.position.distanceTo(playerPos);
      if (dist < 1.8) {
        star.collected = true;
        star.group.visible = false;
        this.starsCollected++;
        sounds.playStarCollect();
        this.triggerSparkles(star.group.position, 0xfffa65, 25);

        window.dispatchEvent(new CustomEvent('starCollected', {
          detail: {
            current: this.starsCollected,
            total: this.totalStars,
            name: star.name
          }
        }));

        if (this.starsCollected >= this.totalStars) {
          sounds.playVictory();
          window.dispatchEvent(new CustomEvent('gameWon'));
        }
      }
    }

    // 3. Update Hearts
    for (const heart of this.hearts) {
      if (heart.collected) continue;

      heart.group.rotation.y += delta * 2.2;
      const pulse = 1 + Math.sin(time * 6) * 0.12;
      heart.mesh.scale.set(0.6 * pulse, 0.6 * pulse, 0.6 * pulse);
      heart.group.position.y = heart.baseY + Math.sin(time * 2.5) * 0.15;

      const dist = heart.group.position.distanceTo(playerPos);
      if (dist < 1.4) {
        if (player.health < player.maxHealth) {
          player.heal(1);
          heart.collected = true;
          heart.group.visible = false;
          sounds.playCheckpoint();
          this.triggerSparkles(heart.group.position, 0xff4757, 12);
          window.dispatchEvent(new CustomEvent('healthChanged', { detail: { health: player.health } }));
        }
      }
    }
  }

  resetAll() {
    this.coinsCollected = 0;
    this.starsCollected = 0;
    for (const c of this.coins) {
      c.collected = false;
      c.group.visible = true;
      c.group.position.y = c.baseY;
    }
    for (const s of this.stars) {
      s.collected = false;
      s.group.visible = true;
    }
    for (const h of this.hearts) {
      h.collected = false;
      h.group.visible = true;
    }
  }
}
