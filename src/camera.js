import * as THREE from 'three';

export class ThirdPersonCamera {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Spherical coordinates
    this.distance = 9.5;
    this.targetDistance = 9.5;
    this.minDistance = 4.0;
    this.maxDistance = 18.0;

    this.yaw = Math.PI;          // Face forward towards +Z adventure progression
    this.pitch = 0.38;          // Elevated angle looking down nicely at player
    this.targetYaw = Math.PI;
    this.targetPitch = 0.38;

    this.lookOffset = new THREE.Vector3(0, 1.4, 0);
    this.currentPosition = new THREE.Vector3(0, 5, -9.5);
    this.currentLookAt = new THREE.Vector3(0, 1.5, 0);
    this.initialized = false;

    // Mouse drag state
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.sensitivity = 0.004;

    this.setupListeners();
  }

  setupListeners() {
    this.domElement.addEventListener('mousedown', (e) => {
      // Right click or left click drag
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.targetYaw -= deltaX * this.sensitivity;
      this.targetPitch += deltaY * this.sensitivity;

      // Clamp vertical pitch to avoid flipping or digging below ground
      this.targetPitch = Math.max(0.08, Math.min(Math.PI / 2.3, this.targetPitch));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Mouse wheel zoom
    this.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.targetDistance += e.deltaY * 0.008;
      this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetDistance));
    }, { passive: false });

    // Touch controls for mobile camera orbiting
    let touchStartX = 0;
    let touchStartY = 0;
    this.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1 && !e.target.closest('.touch-btn')) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.domElement.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && !e.target.closest('.touch-btn')) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;

        this.targetYaw -= deltaX * this.sensitivity * 1.5;
        this.targetPitch += deltaY * this.sensitivity * 1.5;
        this.targetPitch = Math.max(0.08, Math.min(Math.PI / 2.3, this.targetPitch));

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });
  }

  rotateBy(yawDelta) {
    this.targetYaw += yawDelta;
  }

  update(delta, player, colliders = []) {
    // Smooth angle interpolation
    this.yaw = THREE.MathUtils.lerp(this.yaw, this.targetYaw, Math.min(14 * delta, 1));
    this.pitch = THREE.MathUtils.lerp(this.pitch, this.targetPitch, Math.min(14 * delta, 1));
    this.distance = THREE.MathUtils.lerp(this.distance, this.targetDistance, Math.min(10 * delta, 1));

    // Player target focus point
    const targetLook = player.mesh.position.clone().add(this.lookOffset);

    // Calculate desired camera position on spherical orbit
    const cx = targetLook.x + this.distance * Math.sin(this.yaw) * Math.cos(this.pitch);
    const cy = targetLook.y + this.distance * Math.sin(this.pitch);
    const cz = targetLook.z + this.distance * Math.cos(this.yaw) * Math.cos(this.pitch);
    const desiredPos = new THREE.Vector3(cx, cy, cz);

    // Simple collision clipping prevention: don't let camera go below ground
    for (const c of colliders) {
      if (!c.box) continue;
      if (
        desiredPos.x >= c.box.min.x - 0.5 && desiredPos.x <= c.box.max.x + 0.5 &&
        desiredPos.z >= c.box.min.z - 0.5 && desiredPos.z <= c.box.max.z + 0.5
      ) {
        // Only clamp if camera is near the top of the ground platform, not an island high in the sky
        if (desiredPos.y >= c.box.min.y - 1.0 && desiredPos.y < c.box.max.y + 0.8 && c.box.max.y <= targetLook.y + 1.0) {
          desiredPos.y = c.box.max.y + 0.8;
        }
      }
    }

    // Smooth camera motion (snap on first frame)
    if (!this.initialized) {
      this.currentPosition.copy(desiredPos);
      this.currentLookAt.copy(targetLook);
      this.initialized = true;
    } else {
      this.currentPosition.lerp(desiredPos, Math.min(12 * delta, 1));
      this.currentLookAt.lerp(targetLook, Math.min(15 * delta, 1));
    }

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }
}
