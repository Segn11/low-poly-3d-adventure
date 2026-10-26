import * as THREE from 'three';
import { sounds } from './audio.js';

export class Player {
  constructor(scene) {
    this.scene = scene;

    // Movement parameters
    this.speed = 14;
    this.acceleration = 70;
    this.friction = 12;
    this.jumpForce = 15;
    this.doubleJumpForce = 13.5;
    this.gravity = 36;
    this.terminalVelocity = 35;

    // State
    this.velocity = new THREE.Vector3();
    this.isGrounded = false;
    this.canDoubleJump = true;
    this.isGroundPounding = false;
    this.facingAngle = 0;
    this.targetAngle = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;

    // Health & Stats
    this.maxHealth = 3;
    this.health = 3;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.checkpoint = new THREE.Vector3(0, 0.75, 0);

    // Animation & Mesh
    this.mesh = new THREE.Group();
    this.buildCharacterMesh();
    this.scene.add(this.mesh);

    // Dynamic ground shadow disc
    const shadowGeo = new THREE.CircleGeometry(0.7, 16);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x111625,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.scene.add(this.shadowMesh);

    // Dust particles
    this.dustParticles = [];
    this.initDustParticles();

    // Hitbox radius and height
    this.radius = 0.55;
    this.height = 1.4;

    this.resetPosition();
  }

  buildCharacterMesh() {
    // Cute stylized Low-Poly Adventurer Hopper
    this.modelGroup = new THREE.Group();

    // Palette
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xff4757, // Vibrant Poppy Red
      roughness: 0.3,
      metalness: 0.1
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xffdfba, // Warm Peachy skin
      roughness: 0.4
    });

    const blueMat = new THREE.MeshStandardMaterial({
      color: 0x1e90ff, // Deep Sky Blue overalls/pants
      roughness: 0.3
    });

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e272e });
    const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffa502,
      roughness: 0.2,
      metalness: 0.6
    });

    // 1. Torso & Overalls
    const torsoGeo = new THREE.CylinderGeometry(0.42, 0.48, 0.65, 8);
    this.torso = new THREE.Mesh(torsoGeo, blueMat);
    this.torso.position.y = 0.65;
    this.torso.castShadow = true;
    this.modelGroup.add(this.torso);

    // Shirt upper
    const shirtGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.25, 8);
    const shirt = new THREE.Mesh(shirtGeo, bodyMat);
    shirt.position.y = 0.85;
    shirt.castShadow = true;
    this.modelGroup.add(shirt);

    // 2. Head
    const headGeo = new THREE.SphereGeometry(0.42, 10, 8);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 1.25;
    this.head.castShadow = true;
    this.modelGroup.add(this.head);

    // 3. Cap / Hat
    const capGeo = new THREE.ConeGeometry(0.45, 0.35, 8);
    this.cap = new THREE.Mesh(capGeo, bodyMat);
    this.cap.position.set(0, 1.45, -0.05);
    this.cap.rotation.x = -0.15;
    this.cap.castShadow = true;
    this.modelGroup.add(this.cap);

    // Cap Visor
    const visorGeo = new THREE.CylinderGeometry(0.42, 0.44, 0.08, 8, 1, false, 0, Math.PI);
    const visor = new THREE.Mesh(visorGeo, bodyMat);
    visor.position.set(0, 1.35, 0.15);
    visor.rotation.x = 0.2;
    this.modelGroup.add(visor);

    // 4. Eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 6, 6);
    eyeGeo.scale(1, 1.4, 0.6);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.16, 1.28, 0.36);
    this.modelGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.16, 1.28, 0.36);
    this.modelGroup.add(rightEye);

    // Eye highlights
    const pupGeo = new THREE.SphereGeometry(0.03, 4, 4);
    const leftPupil = new THREE.Mesh(pupGeo, eyeHighlightMat);
    leftPupil.position.set(-0.14, 1.32, 0.42);
    this.modelGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupGeo, eyeHighlightMat);
    rightPupil.position.set(0.18, 1.32, 0.42);
    this.modelGroup.add(rightPupil);

    // 5. Backpack
    const backpackGeo = new THREE.BoxGeometry(0.4, 0.45, 0.25);
    const backpack = new THREE.Mesh(backpackGeo, goldMat);
    backpack.position.set(0, 0.8, -0.35);
    backpack.castShadow = true;
    this.modelGroup.add(backpack);

    // 6. Floating Limbs (Hands & Feet)
    const handGeo = new THREE.SphereGeometry(0.14, 6, 6);
    this.leftHand = new THREE.Mesh(handGeo, skinMat);
    this.leftHand.position.set(-0.55, 0.7, 0);
    this.leftHand.castShadow = true;
    this.modelGroup.add(this.leftHand);

    this.rightHand = new THREE.Mesh(handGeo, skinMat);
    this.rightHand.position.set(0.55, 0.7, 0);
    this.rightHand.castShadow = true;
    this.modelGroup.add(this.rightHand);

    const footGeo = new THREE.BoxGeometry(0.24, 0.18, 0.38);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x57606f, roughness: 0.6 });

    this.leftFoot = new THREE.Mesh(footGeo, shoeMat);
    this.leftFoot.position.set(-0.25, 0.1, 0);
    this.leftFoot.castShadow = true;
    this.modelGroup.add(this.leftFoot);

    this.rightFoot = new THREE.Mesh(footGeo, shoeMat);
    this.rightFoot.position.set(0.25, 0.1, 0);
    this.rightFoot.castShadow = true;
    this.modelGroup.add(this.rightFoot);

    this.mesh.add(this.modelGroup);
  }

  initDustParticles() {
    const geo = new THREE.DodecahedronGeometry(0.12, 0);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });

    for (let i = 0; i < 16; i++) {
      const p = new THREE.Mesh(geo, mat.clone());
      p.visible = false;
      this.scene.add(p);
      this.dustParticles.push({
        mesh: p,
        life: 0,
        maxLife: 0.4,
        vel: new THREE.Vector3()
      });
    }
  }

  spawnDust(count = 4, spread = 0.3, speed = 2) {
    let spawned = 0;
    for (const p of this.dustParticles) {
      if (p.life <= 0) {
        p.mesh.position.copy(this.mesh.position);
        p.mesh.position.y += 0.1;
        p.mesh.position.x += (Math.random() - 0.5) * spread;
        p.mesh.position.z += (Math.random() - 0.5) * spread;
        p.mesh.scale.setScalar(0.7 + Math.random() * 0.6);
        p.mesh.visible = true;
        p.life = p.maxLife;

        p.vel.set(
          (Math.random() - 0.5) * speed,
          Math.random() * speed * 0.8 + 0.5,
          (Math.random() - 0.5) * speed
        );

        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  updateDust(delta) {
    for (const p of this.dustParticles) {
      if (p.life > 0) {
        p.life -= delta;
        p.mesh.position.addScaledVector(p.vel, delta);
        const progress = 1 - (p.life / p.maxLife);
        p.mesh.material.opacity = (1 - progress) * 0.6;
        p.mesh.scale.setScalar((1 - progress * 0.5) * 0.8);

        if (p.life <= 0) {
          p.mesh.visible = false;
        }
      }
    }
  }

  resetPosition() {
    this.mesh.position.copy(this.checkpoint);
    this.velocity.set(0, 0, 0);
    this.isGroundPounding = false;
    this.isGrounded = true;
    this.canDoubleJump = true;
    this.modelGroup.scale.set(1, 1, 1);
    this.modelGroup.rotation.set(0, 0, 0);
  }

  setCheckpoint(pos) {
    this.checkpoint.copy(pos);
    this.checkpoint.y += 1.0;
  }

  takeDamage(amount = 1, knockbackDir = null) {
    if (this.isInvulnerable) return false;

    this.health = Math.max(0, this.health - amount);
    this.isInvulnerable = true;
    this.invulnerableTimer = 1.5; // 1.5s invulnerability
    sounds.playHurt();

    if (knockbackDir) {
      this.velocity.x = knockbackDir.x * 12;
      this.velocity.z = knockbackDir.z * 12;
      this.velocity.y = 9;
      this.isGrounded = false;
    }

    if (this.health <= 0) {
      this.respawnAfterDeath();
    }
    return true;
  }

  heal(amount = 1) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  respawnAfterDeath() {
    this.health = this.maxHealth;
    this.resetPosition();
    sounds.playCheckpoint();
  }

  jump() {
    // Coyote time check or grounded
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.canDoubleJump = true;
      sounds.playJump();
      this.spawnDust(6, 0.4, 2.5);

      // Squash and stretch
      this.modelGroup.scale.set(0.7, 1.4, 0.7);
    } else if (this.canDoubleJump) {
      this.velocity.y = this.doubleJumpForce;
      this.canDoubleJump = false;
      sounds.playDoubleJump();
      this.spawnDust(8, 0.6, 3.5);

      // Double jump spin trigger
      this.spinFlipTimer = 0.45;
    }
  }

  groundPound() {
    if (!this.isGrounded && !this.isGroundPounding) {
      this.isGroundPounding = true;
      this.velocity.x *= 0.2;
      this.velocity.z *= 0.2;
      this.velocity.y = -26;
      sounds.playBounce();
    }
  }

  update(delta, input, cameraYaw, colliders, bouncePads = []) {
    // Coyote time and jump buffer
    if (this.isGrounded) {
      this.coyoteTimer = 0.15;
    } else {
      this.coyoteTimer -= delta;
    }

    if (input.jumpPressed) {
      this.jump();
    }

    if (input.poundPressed) {
      this.groundPound();
    }

    // Input Movement Vector relative to Camera
    const moveVector = new THREE.Vector3();
    if (input.forward) moveVector.z -= 1;
    if (input.backward) moveVector.z += 1;
    if (input.left) moveVector.x -= 1;
    if (input.right) moveVector.x += 1;

    const hasInput = moveVector.lengthSq() > 0.001;
    if (hasInput) {
      moveVector.normalize();
      // Rotate by camera yaw
      moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);

      // Target rotation angle
      this.targetAngle = Math.atan2(moveVector.x, moveVector.z);

      // Target velocity
      const targetSpeed = (input.sprint ? this.speed * 1.5 : this.speed);
      const accel = this.isGrounded ? this.acceleration : this.acceleration * 0.6;

      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, moveVector.x * targetSpeed, Math.min(accel * delta, 1));
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, moveVector.z * targetSpeed, Math.min(accel * delta, 1));
    } else {
      // Friction
      const f = this.isGrounded ? this.friction : this.friction * 0.3;
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, 0, Math.min(f * delta, 1));
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, 0, Math.min(f * delta, 1));
    }

    // Gravity
    if (!this.isGrounded) {
      const g = this.isGroundPounding ? this.gravity * 1.8 : this.gravity;
      this.velocity.y -= g * delta;
      if (this.velocity.y < -this.terminalVelocity) {
        this.velocity.y = -this.terminalVelocity;
      }
    }

    // Smooth model rotation
    let angleDiff = this.targetAngle - this.facingAngle;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    this.facingAngle += angleDiff * Math.min(18 * delta, 1);
    this.modelGroup.rotation.y = this.facingAngle;

    // Apply movement & collision
    this.applyCollisions(delta, colliders, bouncePads);

    // Update invulnerability flash
    if (this.isInvulnerable) {
      this.invulnerableTimer -= delta;
      this.mesh.visible = Math.floor(Date.now() / 80) % 2 === 0;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
        this.mesh.visible = true;
      }
    }

    // Animations (Run, Idle, Jump squash/stretch, Spin flip)
    this.animatePlayer(delta, hasInput);

    // Update Dust
    this.updateDust(delta);

    // Update Shadow
    this.updateShadow(colliders);

    // Void fall detection
    if (this.mesh.position.y < -25) {
      this.takeDamage(1);
      this.resetPosition();
    }
  }

  applyCollisions(delta, colliders, bouncePads) {
    const nextPos = this.mesh.position.clone();

    // 1. Horizontal movement
    nextPos.x += this.velocity.x * delta;
    nextPos.z += this.velocity.z * delta;

    // Check horizontal collisions only with walls/obstacles (NOT floors beneath feet)
    const playerBox = new THREE.Box3();
    const halfR = this.radius * 0.75;

    for (const collider of colliders) {
      if (!collider.box) continue;
      const box = collider.box;

      // Only treat as horizontal obstacle if the top of the box is higher than player's step height
      const isWallObstacle = (box.max.y > this.mesh.position.y + 0.5) && (box.min.y < this.mesh.position.y + this.height);
      if (!isWallObstacle) continue;

      // Test horizontal bounding box intersection
      playerBox.min.set(nextPos.x - halfR, this.mesh.position.y + 0.2, nextPos.z - halfR);
      playerBox.max.set(nextPos.x + halfR, this.mesh.position.y + this.height, nextPos.z + halfR);

      if (playerBox.intersectsBox(box)) {
        // Resolve horizontal pushback along the shallower penetration axis
        const overlapX1 = (nextPos.x + halfR) - box.min.x;
        const overlapX2 = box.max.x - (nextPos.x - halfR);
        const overlapZ1 = (nextPos.z + halfR) - box.min.z;
        const overlapZ2 = box.max.z - (nextPos.z - halfR);

        const minOverlapX = Math.min(overlapX1, overlapX2);
        const minOverlapZ = Math.min(overlapZ1, overlapZ2);

        if (minOverlapX < minOverlapZ) {
          nextPos.x = (overlapX1 < overlapX2) ? (box.min.x - halfR) : (box.max.x + halfR);
          this.velocity.x = 0;
        } else {
          nextPos.z = (overlapZ1 < overlapZ2) ? (box.min.z - halfR) : (box.max.z + halfR);
          this.velocity.z = 0;
        }
      }
    }

    // 2. Vertical movement
    nextPos.y += this.velocity.y * delta;
    this.isGrounded = false;

    // Ground raycast check
    for (const collider of colliders) {
      if (!collider.box) continue;
      const b = collider.box;

      // Are we horizontally within platform bounds?
      if (
        nextPos.x + halfR > b.min.x &&
        nextPos.x - halfR < b.max.x &&
        nextPos.z + halfR > b.min.z &&
        nextPos.z - halfR < b.max.z
      ) {
        // Falling onto surface
        if (this.velocity.y <= 0 && this.mesh.position.y >= b.max.y - 0.5 && nextPos.y <= b.max.y) {
          nextPos.y = b.max.y;
          this.velocity.y = 0;
          this.isGrounded = true;

          // Impact effects
          if (this.isGroundPounding) {
            this.isGroundPounding = false;
            sounds.playStomp();
            this.spawnDust(12, 0.8, 4.5);
            this.modelGroup.scale.set(1.5, 0.5, 1.5);
          } else if (Math.abs(this.velocity.y) > 10) {
            sounds.playJump();
            this.spawnDust(4, 0.3, 1.5);
          }

          // Moving platform velocity transfer
          if (collider.platformVelocity) {
            nextPos.addScaledVector(collider.platformVelocity, delta);
          }
          break;
        }
        // Ceiling bump
        else if (this.velocity.y > 0 && nextPos.y + this.height >= b.min.y && this.mesh.position.y + this.height <= b.min.y + 0.6) {
          nextPos.y = b.min.y - this.height;
          this.velocity.y = -1;
        }
      }
    }

    // 3. Bounce pads
    for (const pad of bouncePads) {
      const d = nextPos.distanceTo(pad.position);
      if (d < pad.radius && nextPos.y <= pad.position.y + 0.6 && nextPos.y >= pad.position.y - 0.4) {
        this.velocity.y = pad.bounceForce || 28;
        this.isGrounded = false;
        this.canDoubleJump = true;
        this.isGroundPounding = false;
        sounds.playBounce();
        this.spawnDust(14, 0.8, 5.0);
        this.modelGroup.scale.set(0.6, 1.7, 0.6);

        if (pad.mesh) {
          pad.mesh.scale.set(1.4, 0.4, 1.4);
        }
        break;
      }
    }

    this.mesh.position.copy(nextPos);
  }

  animatePlayer(delta, hasInput) {
    const time = Date.now() * 0.008;

    // Recover squash and stretch scale towards (1, 1, 1)
    this.modelGroup.scale.x = THREE.MathUtils.lerp(this.modelGroup.scale.x, 1, Math.min(10 * delta, 1));
    this.modelGroup.scale.y = THREE.MathUtils.lerp(this.modelGroup.scale.y, 1, Math.min(10 * delta, 1));
    this.modelGroup.scale.z = THREE.MathUtils.lerp(this.modelGroup.scale.z, 1, Math.min(10 * delta, 1));

    // Double Jump front flip animation
    if (this.spinFlipTimer > 0) {
      this.spinFlipTimer -= delta;
      this.modelGroup.rotation.x -= Math.PI * 4 * delta;
    } else {
      this.modelGroup.rotation.x = THREE.MathUtils.lerp(this.modelGroup.rotation.x, 0, Math.min(12 * delta, 1));
    }

    if (this.isGrounded) {
      if (hasInput) {
        // Run animation: bobbing torso, swinging hands and feet
        const runCycle = time * 1.5;
        this.torso.position.y = 0.65 + Math.abs(Math.sin(runCycle)) * 0.12;
        this.head.position.y = 1.25 + Math.abs(Math.sin(runCycle)) * 0.1;

        this.leftFoot.position.z = Math.sin(runCycle) * 0.35;
        this.leftFoot.position.y = 0.1 + Math.max(0, -Math.sin(runCycle)) * 0.2;

        this.rightFoot.position.z = -Math.sin(runCycle) * 0.35;
        this.rightFoot.position.y = 0.1 + Math.max(0, Math.sin(runCycle)) * 0.2;

        this.leftHand.position.z = -Math.sin(runCycle) * 0.3;
        this.rightHand.position.z = Math.sin(runCycle) * 0.3;

        // Occasional running dust
        if (Math.random() < 0.2) {
          this.spawnDust(1, 0.2, 1);
        }
      } else {
        // Idle animation: gentle breathing bob
        const breathe = Math.sin(time * 0.4) * 0.04;
        this.torso.position.y = 0.65 + breathe;
        this.head.position.y = 1.25 + breathe * 1.2;
        this.leftFoot.position.set(-0.25, 0.1, 0);
        this.rightFoot.position.set(0.25, 0.1, 0);
        this.leftHand.position.set(-0.55, 0.7 + breathe * 0.5, 0);
        this.rightHand.position.set(0.55, 0.7 + breathe * 0.5, 0);
      }
    } else {
      // In air: limbs spread out, slight upward/downward tilt
      this.leftHand.position.set(-0.65, 0.9, 0);
      this.rightHand.position.set(0.65, 0.9, 0);
      this.leftFoot.position.set(-0.28, 0.05, -0.15);
      this.rightFoot.position.set(0.28, 0.05, 0.15);
    }
  }

  updateShadow(colliders) {
    let highestFloorY = -100;
    const px = this.mesh.position.x;
    const pz = this.mesh.position.z;

    for (const c of colliders) {
      if (!c.box) continue;
      const b = c.box;
      if (px >= b.min.x && px <= b.max.x && pz >= b.min.z && pz <= b.max.z) {
        if (b.max.y <= this.mesh.position.y + 0.1 && b.max.y > highestFloorY) {
          highestFloorY = b.max.y;
        }
      }
    }

    if (highestFloorY > -90) {
      this.shadowMesh.visible = true;
      this.shadowMesh.position.set(px, highestFloorY + 0.02, pz);
      const heightAbove = Math.max(0, this.mesh.position.y - highestFloorY);
      const scale = Math.max(0.2, 1 - heightAbove * 0.07);
      this.shadowMesh.scale.set(scale, scale, scale);
      this.shadowMesh.material.opacity = Math.max(0.1, 0.4 - heightAbove * 0.03);
    } else {
      this.shadowMesh.visible = false;
    }
  }
}
