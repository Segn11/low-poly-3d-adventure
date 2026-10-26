# 🎮 Super Star Hopper: 3D Desktop Adventure Game

<p align="center">
  <img src="public/screenshots/gameplay.png" alt="Super Star Hopper Desktop Gameplay" width="850" style="border-radius: 14px; box-shadow: 0 12px 35px rgba(0,0,0,0.35);"/>
</p>

<p align="center">
  <strong>An offline-ready, native Desktop 3D Low-Poly Platformer Game powered by Electron, Three.js, and Vite.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Platform" />
  <img src="https://img.shields.io/badge/Desktop-Electron_45-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/3D_Engine-Three.js_r186-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Offline-100%25_No_Internet-2ed573?style=for-the-badge" alt="Offline Ready" />
  <img src="https://img.shields.io/badge/License-MIT-ff4757?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <a href="https://segn11.github.io/low-poly-3d-adventure/">
    <img src="https://img.shields.io/badge/▶_PLAY_LIVE_ONLINE-Browser_Version-2ed573?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Play Live" />
  </a>
  <a href="https://github.com/Segn11/low-poly-3d-adventure/releases">
    <img src="https://img.shields.io/badge/📥_DOWNLOAD_DESKTOP_APP-.exe_Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Download .exe" />
  </a>
</p>

---

## 🌍 Play Online & Download Desktop Game

| Platform | Access Method | Link |
| :--- | :--- | :--- |
| **🌐 Web Browser** | Instant play on PC, Mac, iPhone, Android (No download required) | [**▶️ Play Live on GitHub Pages**](https://segn11.github.io/low-poly-3d-adventure/) |
| **🪟 Windows Setup Installer** | Installs on Windows PC with desktop and start menu shortcuts | [**📥 Download Setup Installer (.exe)**](https://github.com/Segn11/low-poly-3d-adventure/releases) |
| **💼 Windows Portable** | Single standalone `.exe` file (run from USB drive or desktop) | [**📥 Download Portable .exe**](https://github.com/Segn11/low-poly-3d-adventure/releases) |

---

## 🕹️ About The Game

**Super Star Hopper** is a fast-paced 3D low-poly platformer adventure available both as a **standalone desktop application** and an **instant browser-playable web game**. Inspired by classics like *Super Mario 64* and *A Hat in Time*, you control a nimble explorer venturing across floating sky islands. Leap across oscillating stone bridges, bounce on high-altitude spring mushrooms, squash purple slime monsters, collect gleaming gold coins, and retrieve the **3 Grand Power Stars** to unlock the Summit Altar.

> [!TIP]
> **Zero Installation Friction**: No external 3D models (.gltf) or audio files (.mp3) to download from external CDNs. The entire game runs 100% offline from your local disk with instant boot times.

---

## ✨ Desktop Features & Highlights

### 🖥️ Native Desktop Experience
- **Dedicated Application Window**: Launches in an arcade-focused 1280×720 native window with clean custom title branding and hidden menu bars.
- **One-Key Fullscreen**: Seamlessly toggle between windowed and borderless fullscreen mode with <kbd>F11</kbd>.
- **Unthrottled Audio & Physics**: Desktop background throttling is disabled, ensuring smooth 60 FPS physics and audio loops even if you switch windows or open an overlay.
- **Standalone `.exe` Distribution**: Built-in support to package a single-file portable `.exe` or full Windows setup installer via `electron-builder`.

### 🏃 Smooth Platforming & Character Physics
- **Fluid Locomotion**: Responsive acceleration, deceleration, and camera-relative directional steering.
- **Acrobatic Moveset**:
  - Variable jump height with **coyote time** and input buffering.
  - **Double Jump** with an acrobatic somersault front-flip.
  - **Ground Pound Slam** with downward particle shockwaves.
- **Squash & Stretch Deformation**: Dynamic mesh scaling on jumps and landings, complete with ground dust clouds.
- **Dynamic Drop-Shadow**: Soft circular shadow projection that scales with jump altitude.

### 🏝️ 5 Handcrafted Sky Islands
- **1. Emerald Meadow (Spawn)**: Lush starting plateau with pine trees, mushrooms, and crystal checkpoint totem.
- **2. Bouncing Meadow**: Moving stone bridges and a super bounce trampoline mushroom for high-altitude air paths.
- **3. Ancient Wind Ruins**: Towering stone pillars, high sky arches, and rotating hazard beams.
- **4. Crystal Chasm & Cloud Steps**: Ascending cloud elevator and fluffy cloud stepping stones.
- **5. Summit Shrine (Starlight Temple)**: Golden temple columns housing the Grand Summit Power Star!

### 👾 Enemy AI & Stomp Combat
- Patrolling purple slime creatures ("Blobbies") with animated bouncy hop walk cycles.
- **Stomp Mechanic**: Jump on top of slimes to squash them flat, trigger a burst of star particles, gain a rebound bounce boost, and spawn bonus coins!
- Side collisions deliver damage with knockback and an invulnerability blinking window.

### 🪙 Collectibles & Shrines
- **30+ Spinning Gold Coins**: Equipped with magnetic attraction that draws coins towards the player with ascending musical chimes.
- **3 Grand Power Stars**: Hidden across secret paths and the summit shrine with animated orbiting aura rings.
- **Heart Containers**: Collectible floating hearts to restore health.

### 🎵 Procedural Web Audio Engine
- Built-in real-time audio synthesizer generating retro sound effects (jumps, double jumps, coin arpeggios, stomps, checkpoint jingles, and victory fanfare).
- Real-time cheerful 8-bar melodic soundtrack synthesizer without requiring external audio files.

---

## 🎮 Desktop Controls

| Action | Keyboard / Mouse | Desktop Shortcut |
| :--- | :--- | :--- |
| **Move Explorer** | <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or <kbd>Arrow Keys</kbd> | Move in camera direction |
| **Jump** | <kbd>Space</kbd> | Tap once |
| **Double Jump Flip** | <kbd>Space</kbd> (in mid-air) | Tap again while airborne |
| **Ground Pound Slam** | <kbd>C</kbd> or <kbd>Ctrl</kbd> (in mid-air) | Fast downward impact |
| **Sprint** | Hold <kbd>Shift</kbd> | Boosted movement speed |
| **Orbit Camera** | Left/Right Click + Drag Mouse | 360° Spherical look |
| **Rotate Camera** | <kbd>Q</kbd> / <kbd>E</kbd> | Smooth angle snap |
| **Zoom Camera** | Mouse Scroll Wheel | Zoom In / Out |
| **Fullscreen Toggle** | <kbd>F11</kbd> | Windowed ↔ Fullscreen |
| **Pause Menu** | <kbd>ESC</kbd> | Pause, Resume, or Restart |

---

## 🚀 Quick Start: Running & Building

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### 1. Installation

Clone the repository and install all dependencies:
```bash
git clone https://github.com/Segn11/low-poly-3d-adventure.git
cd low-poly-3d-adventure
npm install
```

---

### 2. Launch the Desktop App (Development)

Run the desktop application with live reload enabled:
```bash
npm run app:dev
```
*This starts the Vite build system and immediately spawns the Electron desktop window.*

---

### 3. Run the Production Desktop App Locally

Test the compiled game in the standalone desktop window without a web server:
```bash
npm run app:start
```

---

### 4. Build Standalone Windows Executable (`.exe`)

Package the game into the `release/` folder as a Windows setup installer and portable executable:
```bash
# Build both setup installer and portable .exe
npm run app:build

# Or build single-file portable .exe only (no installer needed):
npm run app:build:portable
```

> [!NOTE]
> Packaged binaries will be saved in the `release/` directory (e.g. `release/Super Star Hopper 1.0.0.exe`). You can share this `.exe` file with anyone!

---

### 🌐 Optional: Running in the Web Browser

If you also wish to run the game in standard web browsers:
```bash
# Start local dev server in browser
npm run dev

# Build static web bundle into dist/
npm run build
```

---

## 🏗️ Project Architecture

```
low-poly-3d-adventure/
├── electron/
│   └── main.cjs                  # Native desktop window controller & lifecycle
├── public/
│   └── screenshots/
│       └── gameplay.png          # High-resolution desktop preview image
├── src/
│   ├── audio.js                  # Web Audio API sound synthesizer & BGM engine
│   ├── camera.js                 # 3rd-person orbital camera with clipping prevention
│   ├── collectibles.js           # Magnetic coins, Grand Power Stars, health hearts
│   ├── enemies.js                # Slime AI, stomp mechanics, and death particles
│   ├── main.js                   # Three.js WebGL renderer, ACES tone mapping & game loop
│   ├── player.js                 # Character model, physics, state machine & animations
│   ├── style.css                 # Glassmorphic HUD, typography, and responsive styles
│   ├── ui.js                     # DOM overlays, input handlers, virtual joystick & modals
│   └── world.js                  # Procedural floating islands, platforms & lighting
├── index.html                    # Application entrypoint & SEO meta tags
├── vite.config.js                # Vite build config with relative base for Electron
├── package.json                  # Dependencies, desktop scripts & electron-builder config
└── README.md                     # Desktop documentation & user guide
```

---

## ⚡ Performance & Optimization

- **Hardware Accelerated**: Leverages WebGL with `ACESFilmicToneMapping` and PCF shadow filtering on your dedicated GPU.
- **Optimized Low-Poly Geometry**: Geometry batching and flat-shaded materials ensure consistent 60+ FPS on all desktop hardware.
- **Delta Capped Physics**: Movement updates are clamped at 50ms intervals to eliminate physics clipping or tunneling during system frame drops.
- **Self-Contained Executable**: Zero external API dependencies, third-party CDNs, or runtime asset downloads.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and build your own custom stages!
