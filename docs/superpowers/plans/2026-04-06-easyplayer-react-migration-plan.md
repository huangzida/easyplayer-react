# EasyPlayer React 迁移实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 easyplayer-vue3 库迁移到 easyplayer-react，创建一个功能等价的 React 版本播放器组件库，支持 React 17+。

**Architecture:** 基于 Vue3 组件逻辑转换为 React，使用 forwardRef + useImperativeHandle 暴露实例方法，事件通过 props callbacks 处理，tsdown 作为打包工具。

**Tech Stack:** React 17, tsdown, Vite, TypeScript, Vitest, React Testing Library

---

## 文件结构

```
easyplayer-react/
├── src/
│   ├── components/EasyPlayer/
│   │   ├── index.tsx          # React 组件
│   │   └── index.scss         # 样式
│   ├── runtime/
│   │   └── asset-loader.ts    # 运行时加载器
│   ├── types.ts               # 类型定义
│   ├── index.ts               # 入口文件
│   └── style.css              # 基础样式
├── playground/                 # 独立 Vite 应用
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
│   └── index.html
├── public/assets/easyplayer/   # 播放器资源
├── scripts/
│   └── sync-easyplayer-assets.mjs
├── .github/workflows/
│   ├── ci.yml
│   └── release.yml
├── .release-it.json
├── package.json
├── tsdown.config.ts
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.mjs
├── vitest.config.ts
├── README.md
└── README.zh-CN.md
```

---

## 任务清单

### Task 1: 初始化项目结构

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsdown.config.ts`
- Create: `vite.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `.release-it.json`
- Create: `.gitignore`
- Create: `tsconfig.node.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "easyplayer-react",
  "version": "0.1.0",
  "description": "React wrapper for EasyPlayerPro with typed API, docs, and playground.",
  "type": "module",
  "license": "MIT",
  "homepage": "https://github.com/huangzida/easyplayer-react/",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/huangzida/easyplayer-react.git"
  },
  "bugs": {
    "url": "https://github.com/huangzida/easyplayer-react/issues"
  },
  "keywords": [
    "react",
    "easyplayer",
    "video-player",
    "hls",
    "flv",
    "m3u8",
    "streaming"
  ],
  "packageManager": "pnpm@10.12.4",
  "engines": {
    "node": ">=20.10.0",
    "pnpm": ">=9.12.0"
  },
  "files": [
    "dist",
    "dist/assets",
    "README.md",
    "CHANGELOG.md",
    "LICENSE"
  ],
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./style.css": "./dist/easyplayer-react.css",
    "./package.json": "./package.json"
  },
  "sideEffects": [
    "*.css"
  ],
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "dev": "vite --config playground/vite.config.ts",
    "build": "tsdown && vite build --config playground/vite.config.ts",
    "build:lib": "tsdown",
    "build:playground": "vite build --config playground/vite.config.ts",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "release": "release-it",
    "pack:check": "pnpm build && pnpm pack --pack-destination .artifacts",
    "publint": "publint",
    "verify": "pnpm lint && pnpm typecheck && pnpm build && pnpm publint"
  },
  "peerDependencies": {
    "react": "^17.0.0",
    "react-dom": "^17.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.30.1",
    "@release-it/conventional-changelog": "^10.0.6",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^24.9.1",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@typescript-eslint/eslint-plugin": "^8.35.1",
    "@typescript-eslint/parser": "^8.35.1",
    "@vitejs/plugin-react": "^4.4.0",
    "autoprefixer": "^10.4.21",
    "es-toolkit": "^1.7.3",
    "eslint": "^9.30.1",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^5.2.0",
    "happy-dom": "^17.6.3",
    "postcss": "^8.5.6",
    "publint": "^0.3.12",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "release-it": "^19.2.4",
    "sass": "^1.89.2",
    "tailwindcss": "^3.4.18",
    "terser": "^5.46.1",
    "tsdown": "^0.12.0",
    "typescript": "^5.9.3",
    "vite": "^6.4.1",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src", "playground/src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: 创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "tsdown.config.ts"]
}
```

- [ ] **Step 4: 创建 tsdown.config.ts**

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

- [ ] **Step 5: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src/index.ts'] }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'EasyPlayerReact',
      fileName: 'index.js',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', /^node:.*/],
      output: {
        assetFileNames: 'easyplayer-react.css',
      },
    },
    cssCodeSplit: false,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
});
```

- [ ] **Step 6: 创建 tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./playground/index.html', './playground/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 7: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 8: 创建 eslint.config.mjs**

```javascript
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
```

- [ ] **Step 9: 创建 vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
  },
});
```

- [ ] **Step 10: 创建 .release-it.json**

```json
{
  "$schema": "https://release-it.org/schema.json",
  "git": {
    "commitMessage": "release: v${version}",
    "tagName": "v${version}",
    "tagAnnotation": "Release v${version}",
    "push": true,
    "pushArgs": {
      "--force": false
    }
  },
  "npm": {
    "publish": false
  },
  "github": {
    "release": true,
    "releaseName": "v${version}",
    "generateReleaseNotes": true
  },
  "plugins": {
    "@release-it/conventional-changelog": {
      "preset": {
        "name": "conventionalcommits",
        "types": [
          { "type": "feat", "section": "Features", "hidden": false },
          { "type": "fix", "section": "Bug Fixes", "hidden": false },
          { "type": "perf", "section": "Performance Improvements", "hidden": false },
          { "type": "refactor", "section": "Code Refactoring", "hidden": true },
          { "type": "docs", "section": "Documentation", "hidden": true },
          { "type": "test", "section": "Tests", "hidden": true },
          { "type": "build", "section": "Build System", "hidden": true },
          { "type": "ci", "section": "Continuous Integration", "hidden": true },
          { "type": "chore", "section": "Maintenance", "hidden": true }
        ]
      },
      "infile": "CHANGELOG.md",
      "header": "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Conventional Commits](https://www.conventionalcommits.org/).\n",
      "ignoreCommitPatterns": ["^WIP:", "^dump:"]
    }
  },
  "hooks": {
    "before:init": ["pnpm verify"],
    "after:bump": ["pnpm build"],
    "after:release": ["echo Published ${version} successfully!"]
  },
  "version": "0.0.0"
}
```

- [ ] **Step 11: 创建 .gitignore**

```
node_modules
dist
*.local
.DS_Store
coverage
.artifacts
.vitepress/cache
.playground/dist
```

- [ ] **Step 12: Commit**

```bash
git add package.json tsconfig.json tsdown.config.ts vite.config.ts tailwind.config.ts postcss.config.js eslint.config.mjs vitest.config.ts .release-it.json .gitignore
git commit -m "chore: initialize project structure"
```

---

### Task 2: 创建类型定义

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: 创建 src/types.ts**

```typescript
import type { CSSProperties } from 'react';

export type PlayerMode = 'vod' | 'live' | 'custom';

export interface WatermarkTextConfig {
  content: string;
  color?: string;
  opacity?: number;
  fontSize?: string;
}

export interface WatermarkConfig {
  text: WatermarkTextConfig;
  right?: number;
  top?: number;
}

export interface FullWatermarkConfig {
  text: string;
  angle?: number;
  color?: string;
  fontSize?: string;
  opacity?: number;
}

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
}

export interface EasyPlayerConfig {
  mse?: boolean;
  wcs?: boolean;
  wasm?: boolean;
  wasmSimd?: boolean;
  gpuDecoder?: boolean;
  webGpu?: boolean;
  canvasRender?: boolean;
  isLive?: boolean;
  hasAudio?: boolean;
  isMute?: boolean;
  stretch?: boolean;
  poster?: string;
  bufferTime?: number;
  loadTimeOut?: number;
  loadTimeReplay?: number;
  debug?: boolean;
  quality?: string[];
  defaultQuality?: string;
  watermark?: WatermarkConfig;
  fullWatermark?: FullWatermarkConfig;
  retry?: RetryConfig;
  controls?: boolean;
}

export interface EasyPlayerProps extends EasyPlayerConfig {
  url?: string;
  mode?: PlayerMode;
  noSignalText?: string;
  fallbackUrl?: string;
  className?: string;
  style?: CSSProperties;
  assetBaseUrl?: string;
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
  renderError?: (props: { error: string; retry: () => void }) => React.ReactNode;
}

export interface EventHistory {
  timestamp: number;
  event: string;
  data?: any;
}

export interface EasyPlayerAssetUrls {
  lib: string;
  pro: string;
  wasm: string;
}

export interface EasyPlayerProConfig {
  isLive?: boolean;
  hasAudio?: boolean;
  isMute?: boolean;
  stretch?: boolean;
  poster?: string;
  bufferTime?: number;
  loadTimeOut?: number;
  loadTimeReplay?: number;
  MSE?: boolean;
  WCS?: boolean;
  WASM?: boolean;
  WASMSIMD?: boolean;
  gpuDecoder?: boolean;
  webGPU?: boolean;
  canvasRender?: boolean;
  debug?: boolean;
  [key: string]: any;
}

declare global {
  interface Window {
    EasyPlayerPro: new (
      element: HTMLDivElement,
      config: EasyPlayerProConfig,
    ) => EasyPlayerPro;
  }
}

export interface EasyPlayerPro {
  play: (url: string) => Promise<void>;
  playback: (url: string) => Promise<void>;
  pause: () => void;
  isPause: () => boolean;
  setMute: (mute: boolean) => void;
  isMute: () => boolean;
  screenshot: (
    filename?: string,
    format?: 'jpeg' | 'png' | 'webp',
    quality?: number,
    type?: 'base64' | 'blob' | 'download',
  ) => Blob | string | undefined;
  setFullscreen: () => void;
  exitFullscreen: () => void;
  setQuality: (quality: string) => void;
  setRate: (rate: number) => void;
  seekTime: (time: number) => void;
  getVideoInfo: () => any;
  getAudioInfo: () => any;
  setMic: (enable: boolean) => void;
  destroy: () => Promise<void>;
  on: (event: string, callback: (e?: any) => void) => void;
  off?: (event: string, callback?: (e?: any) => void) => void;
}

export interface EasyPlayerRef {
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

- [ ] **Step 2: Commit**

```bash
git add src/types.ts
git commit -m "feat: add type definitions"
```

---

### Task 3: 创建运行时加载器

**Files:**
- Create: `src/runtime/asset-loader.ts`

- [ ] **Step 1: 创建 src/runtime/asset-loader.ts**

```typescript
export interface EasyPlayerAssetUrls {
  lib: string;
  pro: string;
  wasm: string;
}

let loaded = false;
let loadingPromise: Promise<void> | null = null;

export const defaultAssetUrls: EasyPlayerAssetUrls = {
  lib: 'EasyPlayer-lib.js',
  pro: 'EasyPlayer-pro.js',
  wasm: 'EasyPlayer-pro.wasm',
};

const getBasePath = (): string => {
  if (typeof window === 'undefined') {
    return '/assets/easyplayer/';
  }

  const base = document.querySelector('base');
  if (base) {
    const href = base.getAttribute('href');
    if (href) {
      return `${href.replace(/\/$/, '')}/assets/easyplayer/`;
    }
  }

  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const pathParts = pathname.split('/').filter(Boolean);

  const isGitHubPages = origin.includes('.github.io');

  if (pathParts.length > 0) {
    const repoName = pathParts[0];

    if (isGitHubPages) {
      return `${origin}/${repoName}/assets/easyplayer/`;
    }

    return '/assets/easyplayer/';
  }

  return '/assets/easyplayer/';
};

export const ensureEasyPlayerRuntime = async (
  assetBaseUrl?: string,
): Promise<EasyPlayerAssetUrls> => {
  if (loaded && typeof window !== 'undefined' && (window as any).EasyPlayerPro) {
    return defaultAssetUrls;
  }

  if (loadingPromise) {
    await loadingPromise;
    if ((window as any).EasyPlayerPro) {
      return defaultAssetUrls;
    }
  }

  const baseUrl = assetBaseUrl
    ? `${assetBaseUrl.replace(/\/$/, '')}/`
    : getBasePath();

  const assetUrls: EasyPlayerAssetUrls = {
    lib: `${baseUrl}${defaultAssetUrls.lib}`,
    pro: `${baseUrl}${defaultAssetUrls.pro}`,
    wasm: `${baseUrl}${defaultAssetUrls.wasm}`,
  };

  console.log(`[EasyPlayer React] Loading from: ${assetUrls.lib}`);

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (e) => {
        console.error(`[EasyPlayer React] Failed to load script: ${src}`);
        reject(e);
      };
      document.head.appendChild(script);
    });
  };

  loadingPromise = (async () => {
    try {
      await loadScript(assetUrls.pro);
      loaded = true;
    } catch (error) {
      console.error('[EasyPlayer React] Failed to load runtime:', error);
      throw error;
    } finally {
      loadingPromise = null;
    }
  })();

  await loadingPromise;

  return assetUrls;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/runtime/asset-loader.ts
git commit -m "feat: add asset loader runtime"
```

---

### Task 4: 创建样式文件

**Files:**
- Create: `src/style.css`
- Create: `src/components/EasyPlayer/index.scss`

- [ ] **Step 1: 创建 src/style.css**

```css
.easy-player {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #fff;
  background-color: #000;
  position: relative;
  overflow: hidden;
}

.easy-player video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.easy-player .easyplayer-loading .easyplayer-loading-img,
.easy-player .easyplayer-contextmenu-btn {
  display: none !important;
}

.easy-player.hide-controls .easyplayer-controls,
.easy-player.hide-controls .easyplayer-loading .easyplayer-loading-img {
  display: none !important;
}
```

- [ ] **Step 2: 创建 src/components/EasyPlayer/index.scss**

```scss
// EasyPlayer component styles - same as Vue3 version
```

- [ ] **Step 3: Commit**

```bash
git add src/style.css src/components/EasyPlayer/index.scss
git commit -m "feat: add styles"
```

---

### Task 5: 创建核心 React 组件

**Files:**
- Create: `src/components/EasyPlayer/index.tsx`

- [ ] **Step 1: 创建 src/components/EasyPlayer/index.tsx**

```tsx
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isUndefined, omitBy } from 'es-toolkit';

import type {
  EasyPlayerPro,
  EasyPlayerProps,
  EasyPlayerRef,
  EventHistory,
  RetryConfig,
} from '../../types';

import { ensureEasyPlayerRuntime } from '../../runtime/asset-loader';
import './index.scss';

const vodPreset = {
  isLive: false,
  bufferTime: 1,
  controls: true,
};

const livePreset = {
  isLive: true,
  bufferTime: 0.2,
  controls: false,
};

const EasyPlayer = forwardRef<EasyPlayerRef, EasyPlayerProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<EasyPlayerPro | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const playerTimerRef = useRef<number | null>(null);
  const eventHistoryRef = useRef<EventHistory[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const retryCountRef = useRef(0);
  const currentUrlRef = useRef('');

  const effectiveConfig = useMemo(() => {
    const modePreset =
      props.mode === 'live'
        ? livePreset
        : props.mode === 'custom'
          ? {}
          : vodPreset;

    const userOverrides = omitBy(
      {
        isLive: props.isLive,
        bufferTime: props.bufferTime,
      },
      isUndefined,
    );

    return {
      ...modePreset,
      ...userOverrides,
    };
  }, [props.mode, props.isLive, props.bufferTime]);

  const transformToNativeConfig = useCallback((config: any) => {
    const nativeConfig: any = { ...config };

    if (config.mse !== undefined) {
      nativeConfig.MSE = config.mse;
      delete nativeConfig.mse;
    }
    if (config.wcs !== undefined) {
      nativeConfig.WCS = config.wcs;
      delete nativeConfig.wcs;
    }
    if (config.wasm !== undefined) {
      nativeConfig.WASM = config.wasm;
      delete nativeConfig.wasm;
    }
    if (config.wasmSimd !== undefined) {
      nativeConfig.WASMSIMD = config.wasmSimd;
      delete nativeConfig.wasmSimd;
    }
    if (config.webGpu !== undefined) {
      nativeConfig.webGPU = config.webGpu;
      delete nativeConfig.webGpu;
    }

    return nativeConfig;
  }, []);

  const playerConfig = useMemo(() => {
    const config = omitBy(
      {
        ...effectiveConfig.value,
        hasAudio: props.hasAudio,
        isMute: props.isMute,
        stretch: props.stretch,
        poster: props.poster,
        loadTimeOut: props.loadTimeOut,
        loadTimeReplay: props.loadTimeReplay,
        debug: props.debug,
        mse: props.mse,
        wcs: props.wcs,
        wasm: props.wasm,
        wasmSimd: props.wasmSimd,
        gpuDecoder: props.gpuDecoder,
        webGpu: props.webGpu,
        canvasRender: props.canvasRender,
        watermark: props.watermark,
        fullWatermark: props.fullWatermark,
        quality: props.quality,
      },
      isUndefined,
    );

    return transformToNativeConfig(config);
  }, [effectiveConfig, props.hasAudio, props.isMute, props.stretch, props.poster, props.loadTimeOut, props.loadTimeReplay, props.debug, props.mse, props.wcs, props.wasm, props.wasmSimd, props.gpuDecoder, props.webGpu, props.canvasRender, props.watermark, props.fullWatermark, props.quality, transformToNativeConfig]);

  const getRetryConfig = useCallback((): RetryConfig => {
    return (
      props.retry || {
        maxRetries: 3,
        retryDelay: 1000,
        exponentialBackoff: true,
      }
    );
  }, [props.retry]);

  const recordEvent = useCallback((event: string, data?: any) => {
    eventHistoryRef.current = [
      {
        timestamp: Date.now(),
        event,
        data,
      },
      ...eventHistoryRef.current,
    ].slice(0, 100);
  }, []);

  const retry = useCallback((skipInitialRetry = false) => {
    if (skipInitialRetry && retryCountRef.current === 0) {
      console.warn('Skipping initial retry as requested');
      return;
    }

    const retryConfig = getRetryConfig();
    const maxRetries = retryConfig.maxRetries ?? 3;

    if (retryCountRef.current >= maxRetries) {
      console.warn('Max retries reached');
      setHasError(true);
      props.onError?.(new Error('Max retries reached'));
      return;
    }

    retryCountRef.current++;
    const delay = retryConfig.exponentialBackoff
      ? (retryConfig.retryDelay ?? 1000) * Math.pow(2, retryCountRef.current - 1)
      : retryConfig.retryDelay ?? 1000;

    console.log(
      `Retrying in ${delay}ms (attempt ${retryCountRef.current}/${maxRetries})`,
    );

    retryTimerRef.current = window.setTimeout(async () => {
      if (props.fallbackUrl && retryCountRef.current > 1) {
        await playUrl(props.fallbackUrl);
      } else {
        await playUrl(currentUrlRef.current);
      }
    }, delay);
  }, [getRetryConfig, props.fallbackUrl, props.onError]);

  const destroyPlayer = useCallback(async () => {
    if (playerTimerRef.current) {
      clearInterval(playerTimerRef.current);
      playerTimerRef.current = null;
    }

    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    if (playerRef.current) {
      try {
        await playerRef.current.destroy();
        playerRef.current = null;
        console.log('EasyPlayer destroyed');
      } catch (error) {
        console.error('EasyPlayer destroy error:', error);
      }
    }
  }, []);

  const handleEvents = useCallback((player: EasyPlayerPro) => {
    player.on('play', () => {
      recordEvent('play');
      props.onPlay?.();
      retryCountRef.current = 0;
      setHasError(false);
    });

    player.on('pause', () => {
      recordEvent('pause');
      props.onPause?.();
    });

    player.on('error', (error: any) => {
      console.error('EasyPlayer error:', error);
      recordEvent('error', error);

      const isNotAllowedError = error?.message?.includes('NotAllowedError') || error?.name === 'NotAllowedError';
      const isOOMError = error?.message?.includes('OOM') || String(error).includes('Aborted(OOM)');

      if (isNotAllowedError) {
        setErrorMessage('需要用户交互才能播放音频/视频，请点击页面或播放按钮');
        console.warn('Autoplay blocked - user interaction required');
      } else if (isOOMError) {
        setErrorMessage('播放器内存不足，请尝试关闭其他标签页或刷新页面');
        console.warn('WASM out of memory error');
      } else {
        setErrorMessage(String(error));
      }

      setHasError(true);
      props.onError?.(error);

      if (isNotAllowedError) {
        return;
      }

      const retryConfig = getRetryConfig();
      if (retryConfig.maxRetries && retryConfig.maxRetries > 0) {
        retry(false);
      }
    });

    player.on('timeout', () => {
      console.warn('EasyPlayer timeout');
      recordEvent('timeout');
      props.onTimeout?.();

      const retryConfig = getRetryConfig();
      if (retryConfig.maxRetries && retryConfig.maxRetries > 0) {
        retry();
      }
    });

    player.on('liveEnd', () => {
      console.log('EasyPlayer live ended');
      recordEvent('liveEnd');
      props.onLiveEnd?.();
    });

    player.on('videoInfo', (info) => {
      recordEvent('videoInfo', info);
      props.onVideoInfo?.(info);
    });

    player.on('audioInfo', (info) => {
      recordEvent('audioInfo', info);
      props.onAudioInfo?.(info);
    });

    player.on('kBps', (speed) => {
      recordEvent('kBps', speed);
      props.onKBps?.(speed);
    });

    playerTimerRef.current = window.setInterval(() => {
      if (playerRef.current) {
        try {
          const videoInfo = playerRef.current.getVideoInfo?.();
          if (videoInfo && videoInfo.timestamp !== undefined) {
            recordEvent('timestamps', videoInfo.timestamp);
            props.onTimestamps?.(videoInfo.timestamp);
          }
        } catch {
          // Ignore errors in timer
        }
      }
    }, 1000);
  }, [recordEvent, props.onPlay, props.onPause, props.onError, props.onTimeout, props.onLiveEnd, props.onVideoInfo, props.onAudioInfo, props.onKBps, props.onTimestamps, getRetryConfig, retry]);

  const createPlayer = useCallback(async () => {
    if (!containerRef.current || !currentUrlRef.current) return;

    if (!(window as any).EasyPlayerPro) {
      setIsLoading(true);
      try {
        await ensureEasyPlayerRuntime(props.assetBaseUrl || '');
      } catch (error) {
        console.error('EasyPlayer runtime load error:', error);
        setErrorMessage(String(error));
        setHasError(true);
        props.onError?.(error);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }

    await destroyPlayer();

    try {
      console.log('EasyPlayer playerConfig:', playerConfig.value);
      const player = new window.EasyPlayerPro(containerRef.current, {
        ...playerConfig.value,
        isMute: !playerConfig.value.isMute,
        stretch: !playerConfig.value.stretch,
      });
      playerRef.current = player;
      if (props.mode !== 'vod') {
        await player.play(currentUrlRef.current);
      }

      handleEvents(player);
      props.onPlayerReady?.(player);
      recordEvent('playerReady');
      console.log('EasyPlayer created and playing:', currentUrlRef.current);
    } catch (error: any) {
      console.error('EasyPlayer create error:', error);

      if (error?.message?.includes('NotAllowedError') || error?.name === 'NotAllowedError') {
        setErrorMessage('需要用户交互才能播放音频/视频，请点击播放按钮');
        console.warn('Autoplay blocked - user interaction required');
      } else if (error?.message?.includes('OOM') || String(error).includes('Aborted(OOM)')) {
        setErrorMessage('播放器内存不足，请尝试关闭其他标签页或刷新页面');
        console.warn('WASM out of memory - try closing other tabs');
      } else {
        setErrorMessage(String(error));
      }

      setHasError(true);
      props.onError?.(error);
    }
  }, [props.assetBaseUrl, props.mode, props.onError, props.onPlayerReady, destroyPlayer, playerConfig, handleEvents, recordEvent]);

  const playUrl = useCallback(async (targetUrl: string) => {
    if (!targetUrl) {
      await destroyPlayer();
      return;
    }

    currentUrlRef.current = targetUrl;
    retryCountRef.current = 0;
    setHasError(false);
    setErrorMessage('');

    if (playerRef.current) {
      try {
        await playerRef.current.play(targetUrl);
        console.log('EasyPlayer playing:', targetUrl);
        setHasError(false);
      } catch (error: any) {
        console.error('EasyPlayer play error:', error);

        if (error?.message?.includes('NotAllowedError') || error?.name === 'NotAllowedError') {
          setErrorMessage('需要用户交互才能播放');
        } else if (error?.message?.includes('Abort') || error?.message?.includes('OOM')) {
          setErrorMessage('播放器初始化失败，尝试重新创建...');
          await createPlayer();
        } else {
          await createPlayer();
        }
      }
    } else {
      await createPlayer();
    }
  }, [destroyPlayer, createPlayer]);

  useEffect(() => {
    if (props.url) {
      currentUrlRef.current = props.url;
      createPlayer();
    }

    return () => {
      destroyPlayer();
    };
  }, []);

  useEffect(() => {
    if (props.url) {
      playUrl(props.url);
    }
  }, [props.url, playUrl]);

  useEffect(() => {
    if (playerRef.current && props.isMute !== undefined) {
      playerRef.current.setMute(props.isMute);
    }
  }, [props.isMute]);

  useImperativeHandle(ref, () => ({
    getPlayer: () => playerRef.current,
    play: (url: string) => playUrl(url),
    playback: (url: string) => {
      const player = playerRef.current;
      if (player && player.playback) {
        player.playback(url);
      }
    },
    pause: () => {
      const player = playerRef.current;
      if (player && player.pause) {
        player.pause();
      }
    },
    screenshot: (
      filename?: string,
      format?: 'jpeg' | 'png' | 'webp',
      quality?: number,
      type?: 'base64' | 'blob' | 'download',
    ) => {
      const player = playerRef.current;
      if (player && player.screenshot) {
        return player.screenshot(filename, format, quality, type);
      }
      return undefined;
    },
    setFullscreen: () => {
      const player = playerRef.current;
      if (player && player.setFullscreen) {
        player.setFullscreen();
      }
    },
    exitFullscreen: () => {
      const player = playerRef.current;
      if (player && player.exitFullscreen) {
        player.exitFullscreen();
      }
    },
    setMute: (mute: boolean) => {
      const player = playerRef.current;
      if (player && player.setMute) {
        player.setMute(mute);
      }
    },
    setQuality: (quality: string) => {
      const player = playerRef.current;
      if (player && player.setQuality) {
        player.setQuality(quality);
      }
    },
    seekTime: (time: number) => {
      const player = playerRef.current;
      if (player && player.seekTime) {
        player.seekTime(time);
      }
    },
    retry: () => retry(false),
    getEventHistory: () => eventHistoryRef.current,
    clearEventHistory: () => {
      eventHistoryRef.current = [];
    },
    destroy: () => destroyPlayer(),
  }), [playUrl, retry, destroyPlayer]);

  const showPlaceholder = !props.url;
  const showLoading = isLoading;

  return (
    <div
      ref={containerRef}
      className={`easy-player ${props.className || ''} ${!props.controls ? 'hide-controls' : ''}`}
      style={props.style}
      data-url={props.url}
    >
      {showPlaceholder && (
        <div className="easy-player__placeholder">
          <span>{props.noSignalText || 'No signal'}</span>
        </div>
      )}
      {showLoading && (
        <div className="easy-player__loading">
          <span>Loading player...</span>
        </div>
      )}
      {hasError && props.renderError && (
        <div className="easy-player__error">
          {props.renderError({ error: errorMessage, retry: () => retry(false) })}
        </div>
      )}
    </div>
  );
});

EasyPlayer.displayName = 'EasyPlayer';

export default EasyPlayer;
export type { EasyPlayerProps, EasyPlayerRef, EasyPlayerPro };
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EasyPlayer/index.tsx
git commit -m "feat: create EasyPlayer React component"
```

---

### Task 6: 创建入口文件

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: 创建 src/index.ts**

```typescript
import EasyPlayer from './components/EasyPlayer/index';

export * from './types';
export { default as EasyPlayer, type EasyPlayerProps, type EasyPlayerRef, type EasyPlayerPro } from './components/EasyPlayer/index';

import { ensureEasyPlayerRuntime } from './runtime/asset-loader';

import './style.css';

export { ensureEasyPlayerRuntime };
```

- [ ] **Step 2: Commit**

```bash
git add src/index.ts
git commit -m "feat: create entry point"
```

---

### Task 7: 创建 Playground

**Files:**
- Create: `playground/index.html`
- Create: `playground/vite.config.ts`
- Create: `playground/src/main.tsx`
- Create: `playground/src/App.tsx`
- Create: `playground/src/index.css`
- Create: `playground/src/types.ts`
- Create: `playground/src/index.ts`
- Create: `playground/src/components/PlayerConfig.tsx`
- Create: `playground/src/components/EventLog.tsx`
- Create: `playground/src/components/StatusBadge.tsx`
- Create: `playground/src/demos/FeatureShowcase.tsx`

- [ ] **Step 1: 创建 playground/index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>easyplayer-react playground</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: 创建 playground/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const playgroundRoot = fileURLToPath(new URL('./', import.meta.url));
const isGithubPages = process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY;
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'easyplayer-react';

export default defineConfig({
  root: playgroundRoot,
  base: isGithubPages ? `/${repoName}/` : '/',
  plugins: [react()],
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url)),
      '@playground': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 4174,
    fs: {
      allow: ['..'],
    },
  },
  optimizeDeps: {
    exclude: ['easyplayer-react'],
  },
  assetsInclude: ['**/*.wasm'],
});
```

- [ ] **Step 3: 创建 playground/src/main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 4: 创建 playground/src/App.tsx**

```tsx
import FeatureShowcase from './demos/FeatureShowcase';

function App() {
  return (
    <main className="min-h-screen px-6 py-10 text-slate-100 md:px-10 lg:px-16">
      <section className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-amber-400/30 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-amber-200">
              easyplayer-react playground
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
              React video streaming demo space with EasyPlayer and GitHub Pages-ready docs.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              This playground demonstrates the EasyPlayer React component with support for HLS, FLV, and various streaming protocols.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="grid gap-3 text-sm text-slate-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Package target</span>
                <span className="font-medium text-amber-200">npm + GitHub Pages</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Core wrapper</span>
                <span className="font-medium text-sky-200">EasyPlayerPro</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Mode</span>
                <span className="font-medium text-emerald-200">React 17+</span>
              </div>
            </div>
          </div>
        </div>

        <FeatureShowcase />
      </section>
    </main>
  );
}

export default App;
```

- [ ] **Step 5: 创建 playground/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
  font-family: 'Trebuchet MS', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #060816;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 10% 20%, rgba(245, 158, 11, 0.15), transparent 40%),
    radial-gradient(ellipse at 90% 10%, rgba(56, 189, 248, 0.12), transparent 35%),
    radial-gradient(ellipse at 50% 80%, rgba(168, 85, 247, 0.08), transparent 40%),
    linear-gradient(180deg, #020617 0%, #0f172a 45%, #111827 100%);
  background-attachment: fixed;
  color: #e5edf8;
}

* {
  box-sizing: border-box;
}

*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

*::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

::selection {
  background: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

@layer base {
  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold tracking-tight;
  }

  input, textarea, select {
    @apply font-sans;
  }
}

@layer utilities {
  .glass {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .glass-hover:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
  }
}
```

- [ ] **Step 6: 创建 playground/src/types.ts**

```typescript
import type { PlayerMode, EventHistory } from '@/types';

export type { PlayerMode, EventHistory };
```

- [ ] **Step 7: 创建 playground/src/index.ts**

```typescript
export { EasyPlayer } from '../../src/index';
export type { EasyPlayerProps, EasyPlayerRef, EasyPlayerPro } from '../../src/index';
export type { PlayerMode, EventHistory } from '../../src/types';
```

- [ ] **Step 8: 创建 playground/src/components/StatusBadge.tsx**

```tsx
import React from 'react';

interface StatusBadgeProps {
  label: string;
  tone?: 'sky' | 'emerald' | 'rose' | 'amber';
}

const toneClasses = {
  sky: 'bg-sky-500/20 text-sky-200 border-sky-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  rose: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
  amber: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, tone = 'sky' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
```

- [ ] **Step 9: 创建 playground/src/components/PlayerConfig.tsx**

```tsx
import React, { useState } from 'react';
import type { PlayerMode } from '@/types';

interface PlayerConfigProps {
  url: string;
  mode: PlayerMode;
  poster?: string;
  mse: boolean;
  wcs: boolean;
  wasm: boolean;
  wasmSimd: boolean;
  gpuDecoder: boolean;
  webGpu: boolean;
  canvasRender: boolean;
  stretch: boolean;
  isLive: boolean;
  isMute: boolean;
  hasAudio: boolean;
  bufferTime: number;
  loadTimeOut: number;
  loadTimeReplay: number;
  debug: boolean;
  quality?: string[];
  defaultQuality?: string;
  watermark?: any;
  fallbackUrl?: string;
  controls: boolean;
  onUrlChange: (url: string) => void;
  onModeChange: (mode: PlayerMode) => void;
  onPosterChange: (poster?: string) => void;
  onMSEChange: (mse: boolean) => void;
  onWCSChange: (wcs: boolean) => void;
  onWASMChange: (wasm: boolean) => void;
  onWASMSIMDChange: (wasmSimd: boolean) => void;
  onGPUDecoderChange: (gpuDecoder: boolean) => void;
  onWebGPUChange: (webGpu: boolean) => void;
  onCanvasRenderChange: (canvasRender: boolean) => void;
  onStretchChange: (stretch: boolean) => void;
  onIsLiveChange: (isLive: boolean) => void;
  onIsMuteChange: (isMute: boolean) => void;
  onHasAudioChange: (hasAudio: boolean) => void;
  onBufferTimeChange: (bufferTime: number) => void;
  onLoadTimeOutChange: (loadTimeOut: number) => void;
  onLoadTimeReplayChange: (loadTimeReplay: number) => void;
  onDebugChange: (debug: boolean) => void;
  onQualityChange: (quality?: string[]) => void;
  onDefaultQualityChange: (defaultQuality?: string) => void;
  onWatermarkChange: (watermark?: any) => void;
  onFallbackUrlChange: (fallbackUrl?: string) => void;
  onControlsChange: (controls: boolean) => void;
}

type TabType = 'basic' | 'decode' | 'render' | 'playback' | 'advanced' | 'feature';

export const PlayerConfig: React.FC<PlayerConfigProps> = (props) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  const tabs: TabType[] = ['basic', 'decode', 'render', 'playback', 'advanced', 'feature'];

  const presets = [
    { label: 'Vod', mode: 'vod' as PlayerMode },
    { label: 'Live', mode: 'live' as PlayerMode },
    { label: 'Custom', mode: 'custom' as PlayerMode },
  ];

  const usePreset = (mode: PlayerMode) => {
    props.onModeChange(mode);
    if (mode === 'vod') {
      props.onControlsChange(true);
    } else if (mode === 'live') {
      props.onControlsChange(false);
    }
  };

  const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({
    checked,
    onChange,
    label,
  }) => (
    <div className="flex items-center justify-between">
      <label className="text-sm text-slate-200">{label}</label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="toggle toggle-amber"
      />
    </div>
  );

  return (
    <div className="player-config glass rounded-3xl overflow-hidden">
      <div className="config-header border-b border-white/10 p-4">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl border text-sm capitalize transition-all ${
                activeTab === tab
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                  : 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="config-content p-5">
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Basic Parameters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">URL</label>
                <input
                  type="text"
                  value={props.url}
                  onChange={(e) => props.onUrlChange(e.target.value)}
                  placeholder="Enter video URL"
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-slate-200 text-sm outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Mode</label>
                <div className="flex gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => usePreset(preset.mode)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        props.mode === preset.mode
                          ? 'bg-sky-500/20 border-sky-500/50 text-sky-200'
                          : 'border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Poster</label>
                <input
                  type="text"
                  value={props.poster || ''}
                  onChange={(e) => props.onPosterChange(e.target.value || undefined)}
                  placeholder="Cover image URL"
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-slate-200 text-sm outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'decode' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Decode Parameters</h3>
            <div className="space-y-3">
              <Toggle checked={props.mse} onChange={props.onMSEChange} label="MSE Decode" />
              <Toggle checked={props.wcs} onChange={props.onWCSChange} label="WCS Decode" />
              <Toggle checked={props.wasm} onChange={props.onWASMChange} label="WASM Decode" />
              <Toggle checked={props.wasmSimd} onChange={props.onWASMSIMDChange} label="WASM SIMD" />
              <Toggle checked={props.gpuDecoder} onChange={props.onGPUDecoderChange} label="GPU Decoder" />
            </div>
          </div>
        )}

        {activeTab === 'render' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Render Parameters</h3>
            <div className="space-y-3">
              <Toggle checked={props.webGpu} onChange={props.onWebGPUChange} label="WebGPU Render" />
              <Toggle checked={props.canvasRender} onChange={props.onCanvasRenderChange} label="Canvas Render" />
              <Toggle checked={props.stretch} onChange={props.onStretchChange} label="Stretch" />
              <Toggle checked={props.controls} onChange={props.onControlsChange} label="Controls" />
            </div>
          </div>
        )}

        {activeTab === 'playback' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Playback Parameters</h3>
            <div className="space-y-3">
              <Toggle checked={props.isLive} onChange={props.onIsLiveChange} label="Is Live" />
              <Toggle checked={props.isMute} onChange={props.onIsMuteChange} label="Is Mute" />
              <Toggle checked={props.hasAudio} onChange={props.onHasAudioChange} label="Has Audio" />
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Buffer Time</label>
                <input
                  type="number"
                  value={props.bufferTime}
                  onChange={(e) => props.onBufferTimeChange(parseFloat(e.target.value))}
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-slate-200 text-sm outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Advanced Parameters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Load Timeout (s)</label>
                <input
                  type="number"
                  value={props.loadTimeOut}
                  onChange={(e) => props.onLoadTimeOutChange(parseInt(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-slate-200 text-sm outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Retry Count</label>
                <input
                  type="number"
                  value={props.loadTimeReplay}
                  onChange={(e) => props.onLoadTimeReplayChange(parseInt(e.target.value))}
                  min="-1"
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-slate-200 text-sm outline-none focus:border-amber-500/50"
                />
              </div>
              <Toggle checked={props.debug} onChange={props.onDebugChange} label="Debug Mode" />
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Fallback URL</label>
                <input
                  type="text"
                  value={props.fallbackUrl || ''}
                  onChange={(e) => props.onFallbackUrlChange(e.target.value || undefined)}
                  placeholder="Backup video URL"
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-slate-200 text-sm outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feature' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Feature Parameters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Quality Levels</label>
                <input
                  type="text"
                  value={props.quality?.join(', ') || ''}
                  onChange={(e) => props.onQualityChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                  placeholder="SD, HD, FHD"
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-slate-200 text-sm outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Default Quality</label>
                <input
                  type="text"
                  value={props.defaultQuality || ''}
                  onChange={(e) => props.onDefaultQualityChange(e.target.value || undefined)}
                  placeholder="HD"
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-slate-200 text-sm outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Watermark Config</label>
                <textarea
                  value={props.watermark ? JSON.stringify(props.watermark) : ''}
                  onChange={(e) => props.onWatermarkChange(e.target.value ? JSON.parse(e.target.value) : undefined)}
                  placeholder='{"text":{"content":"Watermark"},"right":10,"top":10}'
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-slate-200 text-sm outline-none focus:border-amber-500/50 font-mono text-xs resize-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerConfig;
```

- [ ] **Step 10: 创建 playground/src/components/EventLog.tsx**

```tsx
import React, { useMemo } from 'react';
import type { EventHistory } from '@/types';

interface EventLogProps {
  events: EventHistory[];
  maxLogs?: number;
  onClear: () => void;
}

export const EventLog: React.FC<EventLogProps> = ({ events, maxLogs = 50, onClear }) => {
  const displayEvents = useMemo(() => events.slice(0, maxLogs), [events, maxLogs]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  };

  const formatData = (data: any) => {
    if (data === undefined) return '';
    if (data === null) return 'null';
    if (typeof data === 'object') {
      try {
        return JSON.stringify(data, null, 2);
      } catch {
        return String(data);
      }
    }
    return String(data);
  };

  const getEventClass = (event: string) => {
    if (event.includes('error') || event.includes('Error')) return 'border-l-red-500';
    if (event.includes('timeout')) return 'border-l-amber-500';
    if (event.includes('play') || event.includes('pause')) return 'border-l-emerald-500';
    if (event.includes('kBps')) return 'border-l-sky-500';
    return 'border-l-purple-500';
  };

  const exportHistory = () => {
    const data = JSON.stringify(events, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `easyplayer-events-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="event-log glass rounded-3xl overflow-hidden h-full flex flex-col">
      <div className="log-header border-b border-white/10 p-4 flex items-center justify-between flex-shrink-0">
        <h3 className="text-base font-semibold text-white m-0">Event Log</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 px-2.5 py-1 bg-white/5 rounded-lg">{events.length} events</span>
          <button
            onClick={exportHistory}
            className="p-1.5 border border-white/10 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all"
            title="Export history"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </button>
          <button
            onClick={onClear}
            className="p-1.5 border border-white/10 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all"
            title="Clear logs"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="log-content flex-1 overflow-y-auto p-4">
        {displayEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">No events yet</div>
        ) : (
          <div className="space-y-2">
            {displayEvents.map((event, index) => (
              <div
                key={`${event.timestamp}-${index}`}
                className={`p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg text-xs border-l-[3px] ${getEventClass(event.event)}`}
              >
                <div className="flex gap-3">
                  <span className="text-slate-500 font-mono">{formatTime(event.timestamp)}</span>
                  <span className="text-slate-200 font-medium">{event.event}</span>
                </div>
                {event.data !== undefined && (
                  <pre className="mt-1 text-slate-400 font-mono text-[10px] whitespace-pre-wrap break-all max-h-12 overflow-y-auto">
                    {formatData(event.data)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventLog;
```

- [ ] **Step 11: 创建 playground/src/demos/FeatureShowcase.tsx**

```tsx
import React, { useRef, useState } from 'react';
import { EasyPlayer } from '@/index';
import type { PlayerMode, EventHistory, EasyPlayerRef } from '@/index';
import PlayerConfig from '../components/PlayerConfig';
import EventLog from '../components/EventLog';
import StatusBadge from '../components/StatusBadge';

const liveSource = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
const vodSource = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const flvHint = 'ws://localhost:8080/live.flv';
const posterUrl = 'https://media.w3.org/2010/05/sintel/poster.png';

const FeatureShowcase: React.FC = () => {
  const playerRef = useRef<EasyPlayerRef>(null);

  const [url, setUrl] = useState(vodSource);
  const [mode, setMode] = useState<PlayerMode>('vod');
  const [poster, setPoster] = useState(posterUrl);
  const [mse, setMse] = useState(false);
  const [wcs, setWcs] = useState(false);
  const [wasm, setWasm] = useState(false);
  const [wasmSimd, setWasmSimd] = useState(true);
  const [gpuDecoder, setG