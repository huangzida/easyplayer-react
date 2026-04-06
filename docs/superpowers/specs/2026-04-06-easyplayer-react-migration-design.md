# EasyPlayer React 迁移设计文档

> 创建时间：2026-04-06
> 状态：已批准

## 概述

将 `easyplayer-vue3` 库迁移到 `easyplayer-react`，创建一个功能等价的 React 版本播放器组件库。

## 设计决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| React 版本 | React 17 (`^17.0.0`) | 最大兼容性，支持 React 17+ 的第三方项目 |
| 打包工具 | tsdown | 基于 Rolldown，高性能，配置简单 |
| ref API | forwardRef + useImperativeHandle | React 官方推荐，类型安全 |
| 错误处理 | renderError prop | 类型安全，API 清晰，不与 children 冲突 |
| Playground | 独立 Vite 应用 | 与 Vue3 保持一致 |
| 测试方案 | Vitest + React Testing Library | 复用 Vitest 配置 |

## 技术栈

### 依赖版本

```json
{
  "peerDependencies": {
    "react": "^17.0.0",
    "react-dom": "^17.0.0"
  },
  "devDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.9.3",
    "tsdown": "^0.12.0",
    "vite": "^6.4.1",
    "@vitejs/plugin-react": "^4.4.0",
    "@testing-library/react": "^16.0.0",
    "vitest": "^3.2.4"
  }
}
```

### 关键配置

- **JSX Runtime**: `automatic` (React 17+ 自动 JSX transform)
- **构建格式**: ESM + CJS
- **TypeScript Target**: ES2020

## 项目结构

```
easyplayer-react/
├── src/
│   ├── components/
│   │   └── EasyPlayer/
│   │       ├── index.tsx          # React 组件
│   │       └── index.scss         # 样式
│   ├── runtime/
│   │   └── asset-loader.ts        # 运行时加载器
│   ├── types.ts                   # 类型定义
│   ├── index.ts                   # 入口文件
│   └── style.css                  # 基础样式
├── playground/                     # 独立 Vite 应用
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── PlayerConfig.tsx
│   │   │   ├── EventLog.tsx
│   │   │   └── StatusBadge.tsx
│   │   └── demos/
│   │       └── FeatureShowcase.tsx
│   ├── vite.config.ts
│   ├── index.html
│   └── public/
│       └── assets/
│           └── easyplayer/
├── public/
│   └── assets/
│       └── easyplayer/
├── scripts/
│   └── sync-easyplayer-assets.mjs
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── .release-it.json
├── package.json
├── tsdown.config.ts
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.mjs
├── vitest.config.ts
└── README.md
```

## API 设计

### EasyPlayerProps

```typescript
interface EasyPlayerProps {
  // 基本属性
  url?: string;
  mode?: 'vod' | 'live' | 'custom';
  poster?: string;
  noSignalText?: string;

  // 播放参数
  isLive?: boolean;
  isMute?: boolean;
  hasAudio?: boolean;
  bufferTime?: number;

  // 解码参数
  mse?: boolean;
  wcs?: boolean;
  wasm?: boolean;
  wasmSimd?: boolean;
  gpuDecoder?: boolean;

  // 渲染参数
  webGpu?: boolean;
  canvasRender?: boolean;
  stretch?: boolean;
  controls?: boolean;

  // 高级参数
  debug?: boolean;
  loadTimeOut?: number;
  loadTimeReplay?: number;
  quality?: string[];
  defaultQuality?: string;
  watermark?: WatermarkConfig;
  fullWatermark?: FullWatermarkConfig;
  fallbackUrl?: string;
  retry?: RetryConfig;

  // 样式
  className?: string;
  style?: React.CSSProperties;
  assetBaseUrl?: string;

  // 事件回调
  onPlayerReady?: (player: EasyPlayerPro) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: any) => void;
  onTimeout?: () => void;
  onLiveEnd?: () => void;
  onVideoInfo?: (info: any) => void;
  onAudioInfo?: (info: any) => void;
  onKBps?: (speed: number) => void;
  onTimestamps?: (time: number) => void;

  // 自定义渲染
  renderError?: (props: { error: string; retry: () => void }) => React.ReactNode;
}
```

### EasyPlayerRef

```typescript
interface EasyPlayerRef {
  getPlayer: () => EasyPlayerPro | null;
  play: (url: string) => void;
  playback: (url: string) => void;
  pause: () => void;
  screenshot: (
    filename?: string,
    format?: 'jpeg' | 'png' | 'webp',
    quality?: number,
    type?: 'base64' | 'blob' | 'download',
  ) => Blob | string | undefined;
  setFullscreen: () => void;
  exitFullscreen: () => void;
  setMute: (mute: boolean) => void;
  setQuality: (quality: string) => void;
  seekTime: (time: number) => void;
  retry: () => void;
  getEventHistory: () => EventHistory[];
  clearEventHistory: () => void;
  destroy: () => void;
}
```

## Vue → React 转换规则

| Vue3 特性 | React 实现 |
|-----------|-----------|
| `ref()` | `useState()` + `useRef()` |
| `computed()` | `useMemo()` |
| `watch()` | `useEffect()` + deps |
| `defineProps()` | `EasyPlayerProps` interface |
| `defineEmits()` | `on*` props callbacks |
| `defineExpose()` | `forwardRef` + `useImperativeHandle` |
| `onMounted()` | `useEffect(() => {...}, [])` |
| `onUnmounted()` | `useEffect(() => { return () => {...} }, [])` |
| `defineOptions({ name })` | 函数名 + `displayName` |
| `$slots.error` | `renderError` prop |

## 组件实现要点

### 状态管理

```typescript
// 使用 useState 管理响应式状态
const [player, setPlayer] = useState<EasyPlayerPro | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);
const [errorMessage, setErrorMessage] = useState('');

// 使用 useRef 管理不需要触发重渲染的值
const retryCountRef = useRef(0);
const retryTimerRef = useRef<number | null>(null);
const currentUrlRef = useRef('');
const eventHistoryRef = useRef<EventHistory[]>([]);
```

### 生命周期

```typescript
useEffect(() => {
  // 初始化逻辑
  if (props.url) {
    currentUrlRef.current = props.url;
    createPlayer();
  }

  // 清理逻辑
  return () => {
    destroyPlayer();
  };
}, []); // 空依赖数组 = componentDidMount

// 监听 props 变化
useEffect(() => {
  if (props.url) {
    playUrl(props.url);
  }
}, [props.url]);
```

### forwardRef 实现

```typescript
const EasyPlayer = forwardRef<EasyPlayerRef, EasyPlayerProps>((props, ref) => {
  // ... 组件逻辑

  useImperativeHandle(ref, () => ({
    getPlayer: () => player,
    play: (url: string) => playUrl(url),
    pause: () => player?.pause(),
    // ...
  }));

  return <div ref={containerRef} className="easy-player" />;
});

EasyPlayer.displayName = 'EasyPlayer';
```

## 打包配置

### tsdown.config.ts

```typescript
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  deps: {
    neverBundle: ['react', 'react-dom'],
  },
  jsx: {
    runtime: 'automatic',
  },
  shims: true,
});
```

### package.json exports

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./style.css": "./dist/easyplayer-react.css",
    "./package.json": "./package.json"
  }
}
```

## 发布流程

### CI 工作流

- 触发：PR 和 main 分支 push
- 步骤：install → build → lint → typecheck → test

### Release 工作流

- 触发：打 tag `v*.*.*`
- 步骤：verify → publish to npm → create GitHub Release

## 验收标准

1. ✅ 组件可在 React 17+ 项目中使用
2. ✅ 所有播放器功能正常工作
3. ✅ TypeScript 类型完整无误
4. ✅ Playground 可正常运行
5. ✅ CI/CD 工作流正常
6. ✅ 发布流程可执行
7. ✅ 打包产物符合 npm 标准
