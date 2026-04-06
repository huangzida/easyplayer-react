# easyplayer-react

[English](./README.md) | 中文

基于 EasyPlayerPro 的 React 组件封装，提供类型化的 props、事件和实例方法。

## 特性

- 多格式支持：HLS、FLV、MP4、WebM
- 丰富控制：播放、暂停、截图、全屏、静音
- 模式预设：内置 `vod` 和 `live` 模式预设
- 完整 TypeScript 类型支持
- 支持 React >= 17
- 通过 forwardRef 和 imperative handle 扩展

## 安装

```bash
npm install easyplayer-react
```

或使用 pnpm：

```bash
pnpm add easyplayer-react
```

## 快速开始

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

## 使用 ref

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
      <button onClick={handlePlay}>播放</button>
      <button onClick={handlePause}>暂停</button>
      <button onClick={handleScreenshot}>截图</button>
    </>
  );
}
```

## API 参考

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `string` | - | 视频流地址 |
| `mode` | `'vod' \| 'live' \| 'custom'` | `'vod'` | 播放模式 |
| `poster` | `string` | - | 封面图片地址 |
| `isLive` | `boolean` | - | 是否直播 |
| `isMute` | `boolean` | - | 是否静音 |
| `hasAudio` | `boolean` | `true` | 是否有音频轨道 |
| `bufferTime` | `number` | `1` | 缓冲时间（秒） |
| `controls` | `boolean` | `true` | 显示控制栏 |
| `mse` | `boolean` | - | 使用 MSE 解码器 |
| `wcs` | `boolean` | - | 使用 WCS 解码器 |
| `wasm` | `boolean` | - | 使用 WASM 解码器 |
| `wasmSimd` | `boolean` | `true` | 使用 WASM SIMD |
| `gpuDecoder` | `boolean` | - | 使用 GPU 解码器 |
| `webGpu` | `boolean` | - | 使用 WebGPU 渲染 |
| `canvasRender` | `boolean` | - | 使用 Canvas 渲染 |
| `debug` | `boolean` | - | 启用调试模式 |

### 事件

| 事件 | 说明 |
|-------|------|
| `onPlayerReady` | 播放器就绪 |
| `onPlay` | 开始播放 |
| `onPause` | 暂停播放 |
| `onError` | 发生错误 |
| `onTimeout` | 连接超时 |
| `onLiveEnd` | 直播结束 |
| `onVideoInfo` | 视频信息更新 |
| `onAudioInfo` | 音频信息更新 |
| `onKBps` | 码率更新 |
| `onTimestamps` | 时间戳更新 |

### 实例方法（通过 ref）

| 方法 | 说明 |
|--------|------|
| `play(url)` | 播放指定地址 |
| `pause()` | 暂停播放 |
| `screenshot()` | 截取画面 |
| `setMute(mute)` | 设置静音状态 |
| `setQuality(quality)` | 设置画质等级 |
| `seekTime(time)` | 跳转到指定时间 |
| `retry()` | 重试连接 |
| `destroy()` | 销毁播放器 |

## 模式预设

### VOD 模式

```tsx
<EasyPlayer url="..." mode="vod" />
```

### 直播模式

```tsx
<EasyPlayer url="..." mode="live" />
```

### 自定义模式

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
