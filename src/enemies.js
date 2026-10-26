import * as THREE from 'three';
import { sounds } from './audio.js';

export class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    this.deathParticles = [];
    this.initDeathParticles();
    this.spawnEnemies();
  }

  initDeathParticles() {
    const geo = new THREE.DodecahedronGeometry(0.18, 0);
    for (let i = 0; i < 40; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xff6b81,
        roughness: 0.3,
        emissive: 0xff4757,
        emissiveIntensity: 0.4
      });
      const p = new THREE.Mesh(geo, mat);
      p.visible = false;
      this.scene.add(p);
      this.deathParticles.push({
        mesh: p,
        life: 0,
        maxLife: 0.6,
        vel: new THREE.Vector3()
      });
    }
  }

  triggerDeathParticles(pos) {
    let spawned = 0;
    for (const p of this.deathParticles) {
      if (p.life <= 0) {
        p.mesh.position.copy(pos);
        p.mesh.visible = true;
        p.life = p.maxLife;
        p.mesh.scale.setScalar(0.7 + Math.random() * 0.5);

        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 5;
        p.vel.set(
          Math.cos(angle) * speed,
          3 + Math.random() * 5,
          Math.sin(angle) * speed
        );

        spawned++;
        if (spawned >= 12) break;
      }
    }
  }

  spawnEnemies() {
    // 1. Patrol on Spawn Island (Meadow) - placed away from initial spawn
    this.createEnemy({
      start: new THREE.Vector3(5, 0.5, 6),
      end: new THREE.Vector3(9, 0.5, 6),
      speed: 1.8
    });

    this.createEnemy({
      start: new THREE.Vector3(-8, 0.5, 3),
      end: new THREE.Vector3(-8, 0.5, -5),
      speed: 2.0
    });

    // 2. Patrol on Island 2 (Bouncing Meadow)
    this.createEnemy({
      start: new THREE.Vector3(-4, 5.5, 34),
      end: new THREE.Vector3(4, 5.5, 34),
      speed: 2.2
    });

    // 3. Patrol on Island 3 (Ancient Wind Ruins)
    this.createEnemy({
      start: new THREE.Vector3(-5, 10.5, 80),
      end: new THREE.Vector3(5, 10.5, 80),
      speed: 2.5
    });

    this.createEnemy({
      start: new THREE.Vector3(0, 10.5, 72),
      end: new THREE.Vector3(0, 10.5, 82),
      speed: 2.2
    });

    // 4. Patrol on Summit
    this.createEnemy({
      start: new THREE.Vector3(-6, 36.5, 124),
      end: new THREE.Vector3(6, 36.5, 124),
      speed: 2.8
    });
  }

  createEnemy({ start, end, speed }) {
    const group = new THREE.Group();
    group.position.copy(start);

    // Cute Goomba/Slime Blob Model
    const blobMat = new THREE.MeshStandardMaterial({
      color: 0x9b59b6, // Amethyst purple
      roughness: 0.3,
      metalness: 0.1,
      flatShading: true
    });

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2c3e50 });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Blob body
    const bodyGeo = new THREE.SphereGeometry(0.55, 8, 8);
    bodyGeo.scale(1, 0.85, 1);
    const body = new THREE.Mesh(bodyGeo, blobMat);
    body.position.y = 0.55;
    body.castShadow = true;
    group.add(body);

    // Cute horn/spike on top
    const spikeGeo = new THREE.ConeGeometry(0.18, 0.35, 6);
    const spike = new THREE.Mesh(spikeGeo, new THREE.MeshStandardMaterial({ color: 0xf1c40f }));
    spike.position.y = 1.05;
    group.add(spike);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.14, 6, 6);
    const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    leftEye.position.set(-0.2, 0.65, 0.42);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    rightEye.position.set(0.2, 0.65, 0.42);
    group.add(rightEye);

    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.06, 4, 4);
    const leftPupil = new THREE.Mesh(pupilGeo, eyeMat);
    leftPupil.position.set(-0.2, 0.65, 0.52);
    group.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, eyeMat);
    rightPupil.position.set(0.2, 0.65, 0.52);
    group.add(rightPupil);

    this.scene.add(group);

    this.enemies.push({
      group,
      body,
      start,
      end,
      speed,
      progress: Math.random(),
      direction: 1,
      alive: true,
      squashProgress: 0,
      radius: 0.65,
      height: 1.1
    });
  }

  update(delta, player, collectibles) {
    const time = Date.now() * 0.005;

    // Update Death particles
    for (const p of this.deathParticles) {
      if (p.life > 0) {
        p.life -= delta;
        p.vel.y -= 18 * delta; // gravity
        p.mesh.position.addScaledVector(p.vel, delta);
        p.mesh.scale.multiplyScalar(0.96);
        if (p.life <= 0) p.mesh.visible = false;
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) {
        // Squash animation before disappearing
        if (enemy.squashProgress < 1) {
          enemy.squashProgress += delta * 4;
          enemy.group.scale.set(1.4, Math.max(0.05, 1 - enemy.squashProgress), 1.4);
          if (enemy.squashProgress >= 1) {
            enemy.group.visible = false;
          }
        }
        continue;
      }

      // Patrol movement
      enemy.progress += enemy.speed * 0.1 * delta * enemy.direction;
      if (enemy.progress >= 1) {
        enemy.progress = 1;
        enemy.direction = -1;
      } else if (enemy.progress <= 0) {
        enemy.progress = 0;
        enemy.direction = 1;
      }

      enemy.group.position.lerpVectors(enemy.start, enemy.end, enemy.progress);

      // Cute bouncy wobble walk
      const hop = Math.abs(Math.sin(time * 3 + enemy.progress * 10)) * 0.2;
      enemy.body.position.y = 0.55 + hop;
      enemy.group.scale.set(1 + hop * 0.3, 1 - hop * 0.2, 1 + hop * 0.3);

      // Face patrol movement direction
      const moveDir = enemy.direction > 0
        ? enemy.end.clone().sub(enemy.start).normalize()
        : enemy.start.clone().sub(enemy.end).normalize();
      const faceAngle = Math.atan2(moveDir.x, moveDir.z);
      enemy.group.rotation.y = faceAngle;

      // Collision detection with player
      const ePos = enemy.group.position;
      const pPos = player.mesh.position;

      const horizDist = Math.hypot(pPos.x - ePos.x, pPos.z - ePos.z);
      const vertDist = pPos.y - ePos.y;

      if (horizDist < enemy.radius + player.radius) {
        // 1. Stomp condition: player is falling from above or ground pounding
        if ((player.velocity.y < -0.5 || player.isGroundPounding) && vertDist > 0.4 && vertDist < 2.0) {
          // Stomp successful!
          enemy.alive = false;
          sounds.playStomp();
          this.triggerDeathParticles(ePos);

          // Player rebound bounce
          player.velocity.y = player.isGroundPounding ? 20 : 15;
          player.isGrounded = false;
          player.canDoubleJump = true;
          player.isGroundPounding = false;
          player.spawnDust(8, 0.5, 3);

          // Spawn bonus coin
          if (collectibles) {
            collectibles.spawnCoin(ePos.x, ePos.y + 0.8, ePos.z);
          }

          // Trigger UI popup
          window.dispatchEvent(new CustomEvent('scorePopup', { detail: { text: '+100 Stomp!', x: ePos.x, y: ePos.y, z: ePos.z } }));
        }
        // 2. Hit by enemy
        else if (Math.abs(vertDist) < 1.0) {
          const knockDir = pPos.clone().sub(ePos).normalize();
          player.takeDamage(1, knockDir);
        }
      }
    }
  }

  resetAll() {
    for (const enemy of this.enemies) {
      enemy.alive = true;
      enemy.squashProgress = 0;
      enemy.group.visible = true;
      enemy.group.scale.set(1, 1, 1);
      enemy.progress = 0;
      enemy.direction = 1;
      enemy.group.position.copy(enemy.start);
    }
  }
}
