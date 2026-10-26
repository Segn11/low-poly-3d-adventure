// Web Audio API Procedural Sound & Music Engine
// No external audio files needed - runs immediately and reliably!

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicEnabled = true;
    this.bgmOscs = [];
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.consecutiveCoins = 0;
    this.lastCoinTime = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBGM();
    } else if (this.musicEnabled) {
      this.startBGM();
    }
    return this.muted;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.stopBGM();
    } else if (!this.muted) {
      this.startBGM();
    }
    return this.musicEnabled;
  }

  // --- Sound Effects ---

  playJump() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.14);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  playDoubleJump() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.18);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  playCoin() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = Date.now();
    if (now - this.lastCoinTime < 800) {
      this.consecutiveCoins = Math.min(this.consecutiveCoins + 1, 8);
    } else {
      this.consecutiveCoins = 0;
    }
    this.lastCoinTime = now;

    // Pentatonic scale arpeggio as you collect consecutive coins
    const baseFreqs = [987.77, 1174.66, 1318.51, 1567.98, 1760.00, 1975.53, 2093.00, 2349.32, 2637.02];
    const pitch = baseFreqs[this.consecutiveCoins];

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(pitch, t);
    osc1.frequency.setValueAtTime(pitch * 1.5, t + 0.08);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(pitch * 2, t);
    osc2.frequency.setValueAtTime(pitch * 3, t + 0.08);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.28);
    osc2.stop(t + 0.28);
  }

  playBounce() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.25);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  playStomp() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  playHurt() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.2);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  playCheckpoint() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  playStarCollect() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  playVictory() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    // Victory fanfare melody
    const fanfare = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 523.25, d: 0.12 }, // C5
      { f: 523.25, d: 0.12 }, // C5
      { f: 523.25, d: 0.35 }, // C5
      { f: 415.30, d: 0.35 }, // G#4
      { f: 466.16, d: 0.35 }, // A#4
      { f: 523.25, d: 0.2  }, // C5
      { f: 466.16, d: 0.15 }, // A#4
      { f: 523.25, d: 0.7  }  // C5
    ];

    let offset = 0;
    fanfare.forEach(note => {
      const t = this.ctx.currentTime + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + note.d);
      offset += note.d * 1.05;
    });
  }

  // --- Background Music Loop ---
  startBGM() {
    if (this.muted || !this.musicEnabled || this.bgmTimer) return;
    this.ensureContext();
    if (!this.ctx) return;

    // Cheerful, uplifting pentatonic melody loop
    const melody = [
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 392.00, 440.00,
      392.00, 329.63, 261.63, 293.66, 329.63, 392.00, 329.63, 293.66,
      261.63, 329.63, 392.00, 523.25, 587.33, 523.25, 440.00, 392.00,
      440.00, 392.00, 329.63, 261.63, 293.66, 329.63, 261.63, 0
    ];

    const bass = [
      130.81, 0, 130.81, 0, 164.81, 0, 164.81, 0,
      174.61, 0, 174.61, 0, 196.00, 0, 196.00, 0,
      130.81, 0, 130.81, 0, 164.81, 0, 164.81, 0,
      174.61, 0, 174.61, 0, 196.00, 0, 130.81, 0
    ];

    const stepDuration = 220; // ms per 16th note (~136 BPM)

    this.bgmTimer = setInterval(() => {
      if (this.muted || !this.musicEnabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const note = melody[this.bgmStep];
      const bassNote = bass[this.bgmStep];

      if (note > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, t);
        gain.gain.setValueAtTime(0.035, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      }

      if (bassNote > 0) {
        const oscB = this.ctx.createOscillator();
        const gainB = this.ctx.createGain();
        oscB.type = 'triangle';
        oscB.frequency.setValueAtTime(bassNote, t);
        gainB.gain.setValueAtTime(0.045, t);
        gainB.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        oscB.connect(gainB);
        gainB.connect(this.ctx.destination);
        oscB.start(t);
        oscB.stop(t + 0.22);
      }

      this.bgmStep = (this.bgmStep + 1) % melody.length;
    }, stepDuration);
  }

  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const sounds = new SoundEngine();
