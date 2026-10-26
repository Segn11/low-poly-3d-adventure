import { sounds } from './audio.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.app = document.getElementById('app');

    this.timerSeconds = 0;
    this.timerInterval = null;
    this.isPaused = false;

    this.inputState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      jumpPressed: false,
      pound: false,
      poundPressed: false,
      sprint: false
    };

    this.buildHTML();
    this.cacheElements();
    this.bindKeyboard();
    this.bindTouchControls();
    this.bindEvents();
    this.startTimer();
  }

  buildHTML() {
    this.app.insertAdjacentHTML('beforeend', `
      <!-- HUD OVERLAY -->
      <div id="hud-overlay">
        <div class="hud-top">
          <div class="hud-stats-group">
            <!-- Health Hearts -->
            <div class="glass-panel heart-container" id="hearts-container">
              <svg class="heart-icon" viewBox="0 0 24 24" fill="#ff4757">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <svg class="heart-icon" viewBox="0 0 24 24" fill="#ff4757">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <svg class="heart-icon" viewBox="0 0 24 24" fill="#ff4757">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>

            <!-- Coin Counter -->
            <div class="glass-panel stat-badge coins" id="coins-badge">
              <span class="icon">🪙</span>
              <span id="coins-count">0</span>
            </div>

            <!-- Stars Counter -->
            <div class="glass-panel stat-badge stars" id="stars-badge">
              <span class="icon">⭐</span>
              <span id="stars-count">0 / 3</span>
            </div>
          </div>

          <div class="hud-actions-group">
            <div class="glass-panel timer-badge" id="timer-display">00:00</div>
            <button class="hud-btn" id="btn-sound" title="Toggle Sound">🔊</button>
            <button class="hud-btn" id="btn-music" title="Toggle Music">🎵</button>
            <button class="hud-btn" id="btn-pause" title="Pause Game">⏸</button>
          </div>
        </div>

        <div id="notification-banner" class="glass-panel">
          Checkpoint Reached!
        </div>

        <div class="hud-bottom">
          <div class="glass-panel controls-hint" id="controls-hint">
            <div class="hint-title">
              <span>🎮 CONTROLS</span>
              <span style="font-size: 0.8rem; opacity: 0.7;">Click + Drag to Orbit Camera</span>
            </div>
            <div>
              <span class="kbd-key">W</span><span class="kbd-key">A</span><span class="kbd-key">S</span><span class="kbd-key">D</span> Move &nbsp;|&nbsp;
              <span class="kbd-key">SPACE</span> Jump & Double Jump &nbsp;|&nbsp;
              <span class="kbd-key">SHIFT</span> Sprint &nbsp;|&nbsp;
              <span class="kbd-key">C</span> Ground Pound
            </div>
          </div>
        </div>
      </div>

      <!-- ON-SCREEN MOBILE TOUCH CONTROLS -->
      <div id="touch-controls">
        <div class="touch-stick-zone" id="touch-stick">
          <div class="touch-stick-knob" id="touch-knob"></div>
        </div>
        <div class="touch-action-buttons">
          <button class="touch-btn pound-btn" id="touch-pound">⬇</button>
          <button class="touch-btn jump-btn" id="touch-jump">▲</button>
        </div>
      </div>

      <!-- PAUSE MODAL -->
      <div class="modal-overlay" id="pause-modal">
        <div class="glass-panel modal-card">
          <h2 class="modal-title">GAME PAUSED</h2>
          <p class="modal-subtitle">Take a breather, hopper!</p>
          <button class="btn-primary" id="btn-resume">RESUME PLAY</button>
          <button class="btn-secondary" id="btn-restart">RESTART RUN</button>
        </div>
      </div>

      <!-- VICTORY CELEBRATION MODAL -->
      <div class="modal-overlay" id="victory-modal">
        <div class="glass-panel modal-card">
          <h2 class="modal-title">⭐ YOU WIN! ⭐</h2>
          <p class="modal-subtitle">You reached the Summit of the Stars!</p>

          <div class="modal-stats-grid">
            <div class="stat-box">
              <div class="stat-box-label">TIME</div>
              <div class="stat-box-value" id="victory-time">00:00</div>
            </div>
            <div class="stat-box">
              <div class="stat-box-label">COINS</div>
              <div class="stat-box-value" id="victory-coins">0</div>
            </div>
            <div class="stat-box">
              <div class="stat-box-label">RANK</div>
              <div class="stat-box-value" style="color: #ff9ff3;">S</div>
            </div>
          </div>

          <button class="btn-primary" id="btn-play-again">PLAY AGAIN</button>
        </div>
      </div>
    `);
  }

  cacheElements() {
    this.canvas = document.getElementById('game-canvas');
    this.heartsContainer = document.getElementById('hearts-container');
    this.heartIcons = Array.from(this.heartsContainer.querySelectorAll('.heart-icon'));
    this.coinsCount = document.getElementById('coins-count');
    this.coinsBadge = document.getElementById('coins-badge');
    this.starsCount = document.getElementById('stars-count');
    this.starsBadge = document.getElementById('stars-badge');
    this.timerDisplay = document.getElementById('timer-display');
    this.notificationBanner = document.getElementById('notification-banner');

    this.pauseModal = document.getElementById('pause-modal');
    this.victoryModal = document.getElementById('victory-modal');
    this.btnResume = document.getElementById('btn-resume');
    this.btnRestart = document.getElementById('btn-restart');
    this.btnPlayAgain = document.getElementById('btn-play-again');

    this.btnSound = document.getElementById('btn-sound');
    this.btnMusic = document.getElementById('btn-music');
    this.btnPause = document.getElementById('btn-pause');
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Audio start context on user gesture
      sounds.ensureContext();
      if (!sounds.bgmTimer && sounds.musicEnabled && !sounds.muted) {
        sounds.startBGM();
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.inputState.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.inputState.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.inputState.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.inputState.right = true;
          break;
        case 'Space':
          if (!this.inputState.jump) {
            this.inputState.jumpPressed = true;
          }
          this.inputState.jump = true;
          e.preventDefault();
          break;
        case 'KeyC':
        case 'ControlLeft':
        case 'ControlRight':
          if (!this.inputState.pound) {
            this.inputState.poundPressed = true;
          }
          this.inputState.pound = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.inputState.sprint = true;
          break;
        case 'KeyQ':
          this.game.cameraController.rotateBy(-0.4);
          break;
        case 'KeyE':
          this.game.cameraController.rotateBy(0.4);
          break;
        case 'Escape':
          this.togglePause();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.inputState.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.inputState.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.inputState.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.inputState.right = false;
          break;
        case 'Space':
          this.inputState.jump = false;
          break;
        case 'KeyC':
        case 'ControlLeft':
        case 'ControlRight':
          this.inputState.pound = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.inputState.sprint = false;
          break;
      }
    });
  }

  bindTouchControls() {
    const stickZone = document.getElementById('touch-stick');
    const knob = document.getElementById('touch-knob');
    const jumpBtn = document.getElementById('touch-jump');
    const poundBtn = document.getElementById('touch-pound');

    let activeTouchId = null;
    const center = { x: 65, y: 65 };
    const maxRadius = 45;

    stickZone.addEventListener('touchstart', (e) => {
      sounds.ensureContext();
      if (!sounds.bgmTimer && sounds.musicEnabled) sounds.startBGM();
      const touch = e.changedTouches[0];
      activeTouchId = touch.identifier;
    }, { passive: true });

    stickZone.addEventListener('touchmove', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchId) {
          const rect = stickZone.getBoundingClientRect();
          const tx = touch.clientX - rect.left - center.x;
          const ty = touch.clientY - rect.top - center.y;
          const dist = Math.hypot(tx, ty);

          const clampedDist = Math.min(dist, maxRadius);
          const angle = Math.atan2(ty, tx);

          const kx = Math.cos(angle) * clampedDist;
          const ky = Math.sin(angle) * clampedDist;
          knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;

          // Normalized values
          const normX = kx / maxRadius;
          const normY = ky / maxRadius;

          this.inputState.forward = normY < -0.3;
          this.inputState.backward = normY > 0.3;
          this.inputState.left = normX < -0.3;
          this.inputState.right = normX > 0.3;
        }
      }
    }, { passive: true });

    const resetStick = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          activeTouchId = null;
          knob.style.transform = `translate(-50%, -50%)`;
          this.inputState.forward = false;
          this.inputState.backward = false;
          this.inputState.left = false;
          this.inputState.right = false;
        }
      }
    };

    stickZone.addEventListener('touchend', resetStick, { passive: true });
    stickZone.addEventListener('touchcancel', resetStick, { passive: true });

    // Buttons
    jumpBtn.addEventListener('touchstart', (e) => {
      sounds.ensureContext();
      this.inputState.jumpPressed = true;
      this.inputState.jump = true;
      e.preventDefault();
    });
    jumpBtn.addEventListener('touchend', () => { this.inputState.jump = false; });

    poundBtn.addEventListener('touchstart', (e) => {
      sounds.ensureContext();
      this.inputState.poundPressed = true;
      this.inputState.pound = true;
      e.preventDefault();
    });
    poundBtn.addEventListener('touchend', () => { this.inputState.pound = false; });
  }

  bindEvents() {
    this.btnSound.addEventListener('click', () => {
      const isMuted = sounds.toggleMute();
      this.btnSound.textContent = isMuted ? '🔇' : '🔊';
    });

    this.btnMusic.addEventListener('click', () => {
      const isEnabled = sounds.toggleMusic();
      this.btnMusic.textContent = isEnabled ? '🎵' : '✖';
    });

    this.btnPause.addEventListener('click', () => this.togglePause());
    this.btnResume.addEventListener('click', () => this.togglePause());

    this.btnRestart.addEventListener('click', () => {
      this.togglePause();
      this.game.restart();
    });

    this.btnPlayAgain.addEventListener('click', () => {
      this.victoryModal.classList.remove('active');
      this.game.restart();
    });

    // Custom game events
    window.addEventListener('coinCollected', (e) => {
      this.coinsCount.textContent = e.detail.current;
      this.coinsCount.classList.remove('bounce-text');
      void this.coinsCount.offsetWidth; // trigger reflow
      this.coinsCount.classList.add('bounce-text');
    });

    window.addEventListener('starCollected', (e) => {
      this.starsCount.textContent = `${e.detail.current} / ${e.detail.total}`;
      this.showNotification(`⭐ Found Star: ${e.detail.name}!`);
      this.starsBadge.classList.remove('bounce-text');
      void this.starsBadge.offsetWidth;
      this.starsBadge.classList.add('bounce-text');
    });

    window.addEventListener('checkpointReached', (e) => {
      this.showNotification(`🚩 Checkpoint: ${e.detail.name}`);
      sounds.playCheckpoint();
    });

    window.addEventListener('gameWon', () => {
      this.showVictory();
    });
  }

  showNotification(text) {
    this.notificationBanner.textContent = text;
    this.notificationBanner.classList.add('active');
    setTimeout(() => {
      this.notificationBanner.classList.remove('active');
    }, 2800);
  }

  updateHealth(health) {
    this.heartIcons.forEach((icon, idx) => {
      if (idx < health) {
        icon.classList.remove('lost');
        icon.classList.add('pulse');
      } else {
        icon.classList.add('lost');
        icon.classList.remove('pulse');
      }
    });
  }

  startTimer() {
    this.timerSeconds = 0;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isPaused) {
        this.timerSeconds++;
        const mins = String(Math.floor(this.timerSeconds / 60)).padStart(2, '0');
        const secs = String(this.timerSeconds % 60).padStart(2, '0');
        this.timerDisplay.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.pauseModal.classList.add('active');
    } else {
      this.pauseModal.classList.remove('active');
    }
  }

  showVictory() {
    const mins = String(Math.floor(this.timerSeconds / 60)).padStart(2, '0');
    const secs = String(this.timerSeconds % 60).padStart(2, '0');
    document.getElementById('victory-time').textContent = `${mins}:${secs}`;
    document.getElementById('victory-coins').textContent = this.coinsCount.textContent;
    this.victoryModal.classList.add('active');
  }

  consumeInput() {
    // Copy input and clear single-frame action triggers
    const input = { ...this.inputState };
    this.inputState.jumpPressed = false;
    this.inputState.poundPressed = false;
    return input;
  }
}
