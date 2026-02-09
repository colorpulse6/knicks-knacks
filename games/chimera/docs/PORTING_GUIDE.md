# Chimera Porting Guide

This guide covers porting Chimera from a web game to desktop platforms (Steam) and mobile.

---

## Table of Contents

1. [Steam Release via Tauri](#steam-release-via-tauri)
2. [Steamworks Integration](#steamworks-integration)
3. [Mobile via Capacitor](#mobile-via-capacitor)
4. [PWA Setup](#pwa-setup)
5. [Platform-Specific Considerations](#platform-specific-considerations)

---

## Steam Release via Tauri

Tauri wraps your web app in a lightweight native shell using the system's webview (not bundled Chromium like Electron).

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Verify installation
rustc --version
cargo --version

# Install Tauri CLI
cargo install tauri-cli
```

### Project Setup

1. **Initialize Tauri in your project:**

```bash
cd games/chimera/web
cargo tauri init
```

2. **Configure `tauri.conf.json`:**

```json
{
  "build": {
    "beforeBuildCommand": "yarn build",
    "beforeDevCommand": "yarn dev",
    "devPath": "http://localhost:3000",
    "distDir": "../out"
  },
  "package": {
    "productName": "Chimera",
    "version": "0.1.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "scope": ["$APP/*"],
        "readFile": true,
        "writeFile": true,
        "createDir": true,
        "removeFile": true
      },
      "path": {
        "all": true
      },
      "dialog": {
        "all": true
      }
    },
    "bundle": {
      "active": true,
      "category": "Game",
      "copyright": "2024 Your Name",
      "identifier": "com.yourname.chimera",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "longDescription": "A FF6-style JRPG about a world controlled by AI",
      "shortDescription": "Classic JRPG Adventure",
      "targets": ["msi", "dmg", "deb", "appimage"]
    },
    "windows": [
      {
        "title": "Chimera",
        "width": 1280,
        "height": 720,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "center": true
      }
    ]
  }
}
```

3. **Update Next.js config for static export:**

```js
// next.config.js
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  // Important: Tauri serves from file://
  assetPrefix: './',
};

module.exports = nextConfig;
```

4. **Create app icons:**

```bash
# Create icons directory
mkdir -p src-tauri/icons

# Generate icons from a 1024x1024 source
# You'll need: 32x32, 128x128, 256x256, icon.ico, icon.icns
```

### Development

```bash
# Run in development mode
cargo tauri dev

# Build for production
cargo tauri build
```

### Build Outputs

After `cargo tauri build`, you'll find:

| Platform | Location | Format |
|----------|----------|--------|
| Windows | `src-tauri/target/release/bundle/msi/` | `.msi` installer |
| macOS | `src-tauri/target/release/bundle/dmg/` | `.dmg` image |
| Linux | `src-tauri/target/release/bundle/deb/` | `.deb` package |
| Linux | `src-tauri/target/release/bundle/appimage/` | `.AppImage` |

---

## Steamworks Integration

### Option A: steamworks.js (Recommended)

Native Node.js bindings for Steamworks SDK.

1. **Install the package:**

```bash
yarn add steamworks.js
```

2. **Create Steam integration module:**

```typescript
// lib/steam.ts
import steamworks from 'steamworks.js';

let client: ReturnType<typeof steamworks.init> | null = null;

export function initSteam(appId: number): boolean {
  try {
    client = steamworks.init(appId);
    console.log('Steam initialized successfully');
    return true;
  } catch (error) {
    console.warn('Steam not available:', error);
    return false;
  }
}

export function getSteamClient() {
  return client;
}

// Achievements
export function unlockAchievement(achievementId: string): boolean {
  if (!client) return false;
  try {
    client.achievement.activate(achievementId);
    return true;
  } catch (error) {
    console.error('Failed to unlock achievement:', error);
    return false;
  }
}

// Cloud Saves
export async function saveToCloud(filename: string, data: string): Promise<boolean> {
  if (!client) return false;
  try {
    client.cloud.writeFile(filename, Buffer.from(data));
    return true;
  } catch (error) {
    console.error('Cloud save failed:', error);
    return false;
  }
}

export async function loadFromCloud(filename: string): Promise<string | null> {
  if (!client) return null;
  try {
    const buffer = client.cloud.readFile(filename);
    return buffer.toString();
  } catch (error) {
    console.error('Cloud load failed:', error);
    return null;
  }
}

// Player info
export function getPlayerName(): string {
  if (!client) return 'Player';
  return client.localplayer.getName();
}

export function getSteamId(): string | null {
  if (!client) return null;
  return client.localplayer.getSteamId().steamId64;
}
```

3. **Initialize in your app:**

```typescript
// In your main App component or _app.tsx
import { useEffect } from 'react';
import { initSteam } from '../lib/steam';

// Your Steam App ID (get from Steamworks partner portal)
const STEAM_APP_ID = 480; // Use 480 for testing (Spacewar)

function App() {
  useEffect(() => {
    // Only initialize in Tauri/desktop environment
    if (typeof window !== 'undefined' && window.__TAURI__) {
      initSteam(STEAM_APP_ID);
    }
  }, []);

  return <Game />;
}
```

4. **Define achievements in Steamworks:**

```typescript
// data/achievements.ts
export const STEAM_ACHIEVEMENTS = {
  // Story progress
  FIRST_STEPS: 'ACH_FIRST_STEPS',        // Complete the intro
  LYRA_RECRUITED: 'ACH_LYRA_RECRUITED',  // Recruit Lady Lyra
  GUARDIAN_SLAIN: 'ACH_GUARDIAN_SLAIN',  // Defeat Corrupted Guardian
  TRUTH_REVEALED: 'ACH_TRUTH_REVEALED',  // Discover the simulation

  // Combat
  FIRST_VICTORY: 'ACH_FIRST_VICTORY',    // Win first battle
  COMBO_MASTER: 'ACH_COMBO_MASTER',      // Execute 10 combo attacks
  BOSS_HUNTER: 'ACH_BOSS_HUNTER',        // Defeat all bosses

  // Exploration
  TREASURE_HUNTER: 'ACH_TREASURE',       // Open 50 chests
  COMPLETIONIST: 'ACH_COMPLETIONIST',    // 100% map exploration

  // Collection
  BESTIARY_COMPLETE: 'ACH_BESTIARY',     // Encounter all enemies
  ITEM_COLLECTOR: 'ACH_COLLECTOR',       // Collect all items
};
```

5. **Integrate with game events:**

```typescript
// In gameStore.ts or a dedicated achievements module
import { unlockAchievement } from '../lib/steam';
import { STEAM_ACHIEVEMENTS } from '../data/achievements';

// Example: Unlock achievement when Lyra is recruited
function recruitLyra() {
  setStoryFlag('lyra_recruited', true);
  unlockAchievement(STEAM_ACHIEVEMENTS.LYRA_RECRUITED);
}
```

### Option B: Greenworks (Alternative)

Older but battle-tested Steamworks binding.

```bash
yarn add greenworks
```

### Steam App ID File

Create `steam_appid.txt` in your build output:

```
480
```

(Replace 480 with your actual App ID when you have one)

---

## Steam Store Setup

### 1. Apply for Steamworks

1. Go to [partner.steamgames.com](https://partner.steamgames.com)
2. Pay the $100 app fee
3. Wait for approval (usually 1-3 days)

### 2. Configure Store Page

Required assets:

| Asset | Size | Purpose |
|-------|------|---------|
| Header Capsule | 460x215 | Store page header |
| Small Capsule | 231x87 | Library grid |
| Main Capsule | 616x353 | Featured sections |
| Hero Graphic | 3840x1240 | Store page hero |
| Screenshots | 1920x1080 | At least 5 |
| Trailer | 1080p | Recommended |

### 3. Build Depot Configuration

```vdf
// depot_build.vdf
"DepotBuildConfig"
{
  "DepotID" "YOUR_DEPOT_ID"
  "contentroot" "./build"
  "FileMapping"
  {
    "LocalPath" "*"
    "DepotPath" "."
    "recursive" "1"
  }
  "FileExclusion" "*.pdb"
}
```

### 4. Upload Build

```bash
# Using SteamCMD
steamcmd +login your_username +run_app_build depot_build.vdf +quit
```

---

## Mobile via Capacitor

Capacitor wraps your web app for iOS and Android.

### Setup

```bash
# Install Capacitor
yarn add @capacitor/core @capacitor/cli

# Initialize
npx cap init Chimera com.yourname.chimera

# Add platforms
npx cap add ios
npx cap add android
```

### Configuration

```json
// capacitor.config.json
{
  "appId": "com.yourname.chimera",
  "appName": "Chimera",
  "webDir": "out",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#1a1a2e"
    },
    "Keyboard": {
      "resize": "none"
    }
  }
}
```

### Touch Controls

Add virtual gamepad for mobile:

```typescript
// components/TouchControls.tsx
export function TouchControls({ onMove, onAction }) {
  return (
    <div className="touch-controls">
      {/* D-Pad */}
      <div className="dpad">
        <button onTouchStart={() => onMove('up')}>↑</button>
        <button onTouchStart={() => onMove('left')}>←</button>
        <button onTouchStart={() => onMove('right')}>→</button>
        <button onTouchStart={() => onMove('down')}>↓</button>
      </div>

      {/* Action buttons */}
      <div className="action-buttons">
        <button onTouchStart={() => onAction('confirm')}>A</button>
        <button onTouchStart={() => onAction('cancel')}>B</button>
        <button onTouchStart={() => onAction('menu')}>Menu</button>
      </div>
    </div>
  );
}
```

### Build Commands

```bash
# Sync web assets
npx cap sync

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio
npx cap open android
```

---

## PWA Setup

Make the web version installable as a Progressive Web App.

### 1. Create manifest

```json
// public/manifest.json
{
  "name": "Chimera",
  "short_name": "Chimera",
  "description": "A FF6-style JRPG adventure",
  "start_url": "/",
  "display": "fullscreen",
  "orientation": "landscape",
  "background_color": "#1a1a2e",
  "theme_color": "#4a90a4",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Add to HTML head

```html
<link rel="manifest" href="/manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

### 3. Service Worker (optional offline support)

```typescript
// public/sw.js
const CACHE_NAME = 'chimera-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/',
  // Add other critical assets
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

## Platform-Specific Considerations

### Save Data

| Platform | Storage | Notes |
|----------|---------|-------|
| Web | localStorage | Limited to ~5MB |
| Steam | Steam Cloud | Sync across devices |
| Mobile | Capacitor Storage | Device-specific |
| Desktop | File system | Via Tauri fs API |

### Input Handling

```typescript
// Unified input handler
function handleInput() {
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const isSteam = typeof window !== 'undefined' && window.__TAURI__;

  if (isMobile) {
    return 'touch';
  } else if (isSteam) {
    // Could add gamepad support
    return 'keyboard+gamepad';
  } else {
    return 'keyboard';
  }
}
```

### Resolution Scaling

```typescript
// Scale canvas for different screen sizes
function getOptimalScale() {
  const baseWidth = 800;
  const baseHeight = 600;

  const scaleX = window.innerWidth / baseWidth;
  const scaleY = window.innerHeight / baseHeight;

  return Math.min(scaleX, scaleY, 3); // Cap at 3x
}
```

---

## Checklist: Steam Release

- [ ] Apply for Steamworks partner account ($100)
- [ ] Set up Tauri wrapper
- [ ] Integrate steamworks.js
- [ ] Define achievements (10-20 recommended)
- [ ] Implement cloud saves
- [ ] Create store page assets
- [ ] Write store description
- [ ] Record/create trailer
- [ ] Take 5+ screenshots
- [ ] Set up depots and builds
- [ ] Configure pricing
- [ ] Submit for review
- [ ] Plan launch marketing

---

## Estimated Timeline

| Phase | Duration |
|-------|----------|
| Tauri setup | 2-3 days |
| Steam SDK integration | 3-5 days |
| Achievement system | 2-3 days |
| Cloud saves | 1-2 days |
| Testing & polish | 1 week |
| Store page setup | 2-3 days |
| Review process | 1-2 weeks |
| **Total** | **~4-6 weeks** |

---

## Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [steamworks.js GitHub](https://github.com/nickmac-dev/steamworks.js)
- [Steamworks Documentation](https://partner.steamgames.com/doc/home)
- [Capacitor Documentation](https://capacitorjs.com/docs)

---

*Document created: 2026-02-08*
*Last updated: 2026-02-08*
