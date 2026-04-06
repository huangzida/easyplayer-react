# easyplayer-react

English | [中文](./README.zh-CN.md)

React component wrapper for EasyPlayerPro with typed props, events, and instance methods.

## Features

- Multi-format support: HLS, FLV, MP4, WebM
- Rich controls: Play, pause, screenshot, fullscreen, mute
- Mode presets: Built-in `vod` and `live` mode presets
- Full TypeScript support with complete type definitions
- React >= 17 compatible
- Extensible via forwardRef and imperative handle

## Installation

```bash
npm install easyplayer-react
```

Or using pnpm:

```bash
pnpm add easyplayer-react
```

## Required Setup: EasyPlayer Assets

This package is a React wrapper for EasyPlayerPro. You need to copy the EasyPlayer runtime assets to your project's public directory.

### Required Files

After installation, copy the `assets/easyplayer/` directory from this package to your project's `public/` folder:

```
public/
└── assets/
    └── easyplayer/
        ├── EasyPlayer-lib.js
        ├── EasyPlayer-pro.js
        ├── EasyPlayer-pro.wasm
        └── EasyPlayer-decode.js
```

### Option 1: Copy from node_modules

After installing the package, copy the assets:

```bash
# Copy from node_modules to your public folder
cp -r node_modules/easyplayer-react/dist/assets/easyplayer your-public-folder/assets/
```

### Option 2: Using a Post-install Script

Add to your `package.json`:

```json
{
  "scripts": {
    "postinstall": "cp -r node_modules/easyplayer-react/dist/assets/easyplayer public/assets/ || true"
  }
}
```

### CDN Alternative

You can also use a CDN by specifying `assetBaseUrl`:

```tsx
import { EasyPlayer } from 'easyplayer-react';
import 'easyplayer-react/style.css';

function App() {
  return (
    <EasyPlayer
      url="https://example.com/stream.m3u8"
      assetBaseUrl="https://cdn.example.com/easyplayer"
    />
  );
}
```

## Quick Start

```tsx
import { EasyPlayer } from 'easyplayer-react';
import 'easyplayer-react/style.css';

function App() {
  return (
    <EasyPlayer
      url="https://example.com/stream.m3u8"
      mode="live"
    />
  );
}
```

## Usage with ref

```tsx
import { useRef } from 'react';
import { EasyPlayer } from 'easyplayer-react';
import type { EasyPlayerRef } from 'easyplayer-react';

function App() {
  const playerRef = useRef<EasyPlayerRef>(null);

  const handlePlay = () => {
    playerRef.current?.play('https://example.com/video.mp4');
  };

  const handlePause = () => {
    playerRef.current?.pause();
  };

  const handleScreenshot = () => {
    playerRef.current?.screenshot('screenshot', 'png', 0.92, 'download');
  };

  return (
    <>
      <EasyPlayer
        ref={playerRef}
        url="https://example.com/stream.m3u8"
      />
      <button onClick={handlePlay}>Play</button>
      <button onClick={handlePause}>Pause</button>
      <button onClick={handleScreenshot}>Screenshot</button>
    </>
  );
}
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | - | Video stream URL |
| `mode` | `'vod' \| 'live' \| 'custom'` | `'vod'` | Play mode |
| `poster` | `string` | - | Poster image URL |
| `isLive` | `boolean` | - | Is live stream |
| `isMute` | `boolean` | - | Is muted |
| `hasAudio` | `boolean` | `true` | Has audio track |
| `bufferTime` | `number` | `1` | Buffer time in seconds |
| `controls` | `boolean` | `true` | Show controls |
| `mse` | `boolean` | - | Use MSE decoder |
| `wcs` | `boolean` | - | Use WCS decoder |
| `wasm` | `boolean` | - | Use WASM decoder |
| `wasmSimd` | `boolean` | `true` | Use WASM SIMD |
| `gpuDecoder` | `boolean` | - | Use GPU decoder |
| `webGpu` | `boolean` | - | Use WebGPU render |
| `canvasRender` | `boolean` | - | Use canvas render |
| `debug` | `boolean` | - | Enable debug mode |

### Events

| Event | Description |
|-------|-------------|
| `onPlayerReady` | Player is ready |
| `onPlay` | Play started |
| `onPause` | Play paused |
| `onError` | Error occurred |
| `onTimeout` | Connection timeout |
| `onLiveEnd` | Live stream ended |
| `onVideoInfo` | Video info updated |
| `onAudioInfo` | Audio info updated |
| `onKBps` | Bitrate updated |
| `onTimestamps` | Timestamp updated |

### Instance Methods (via ref)

| Method | Description |
|--------|-------------|
| `play(url)` | Play a URL |
| `pause()` | Pause playback |
| `screenshot()` | Take a screenshot |
| `setMute(mute)` | Set mute state |
| `setQuality(quality)` | Set quality level |
| `seekTime(time)` | Seek to time |
| `retry()` | Retry connection |
| `destroy()` | Destroy player |

## Mode Presets

### VOD Mode

```tsx
<EasyPlayer url="..." mode="vod" />
```

### Live Mode

```tsx
<EasyPlayer url="..." mode="live" />
```

### Custom Mode

```tsx
<EasyPlayer
  url="..."
  mode="custom"
  isLive={true}
  bufferTime={0.5}
  controls={false}
/>
```

## License

MIT
