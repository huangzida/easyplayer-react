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

const vodPreset = { isLive: false, bufferTime: 1, controls: true };
const livePreset = { isLive: true, bufferTime: 0.2, controls: false };

const EasyPlayer = forwardRef<EasyPlayerRef, EasyPlayerProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<EasyPlayerPro | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const playerTimerRef = useRef<number | null>(null);
  const eventHistoryRef = useRef<EventHistory[]>([]);
  const isInitializedRef = useRef(false);
  const currentUrlRef = useRef('');
  const retryCountRef = useRef(0);

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const transformToNativeConfig = useCallback((config: Record<string, unknown>) => {
    const nativeConfig: Record<string, unknown> = { ...config };
    if ('mse' in nativeConfig && !isUndefined(nativeConfig.mse)) { nativeConfig.MSE = nativeConfig.mse; delete nativeConfig.mse; }
    if ('wcs' in nativeConfig && !isUndefined(nativeConfig.wcs)) { nativeConfig.WCS = nativeConfig.wcs; delete nativeConfig.wcs; }
    if ('wasm' in nativeConfig && !isUndefined(nativeConfig.wasm)) { nativeConfig.WASM = nativeConfig.wasm; delete nativeConfig.wasm; }
    if ('wasmSimd' in nativeConfig && !isUndefined(nativeConfig.wasmSimd)) { nativeConfig.WASMSIMD = nativeConfig.wasmSimd; delete nativeConfig.wasmSimd; }
    if ('webGpu' in nativeConfig && !isUndefined(nativeConfig.webGpu)) { nativeConfig.webGPU = nativeConfig.webGpu; delete nativeConfig.webGpu; }
    return nativeConfig;
  }, []);

  const getEffectiveConfig = useCallback(() => {
    const modePreset = props.mode === 'live' ? livePreset : props.mode === 'custom' ? {} : vodPreset;
    const userOverrides = omitBy({ isLive: props.isLive, bufferTime: props.bufferTime }, isUndefined);
    return { ...modePreset, ...userOverrides };
  }, [props.mode, props.isLive, props.bufferTime]);

  const getPlayerConfig = useCallback(() => {
    const config = omitBy({
      ...getEffectiveConfig(),
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
    }, isUndefined);
    return transformToNativeConfig(config);
  }, [props.hasAudio, props.isMute, props.stretch, props.poster, props.loadTimeOut, props.loadTimeReplay, props.debug, props.mse, props.wcs, props.wasm, props.wasmSimd, props.gpuDecoder, props.webGpu, props.canvasRender, props.watermark, props.fullWatermark, props.quality, getEffectiveConfig, transformToNativeConfig]);

  const getRetryConfig = useCallback((): RetryConfig => {
    return props.retry || { maxRetries: 3, retryDelay: 1000, exponentialBackoff: true };
  }, [props.retry]);

  const recordEvent = useCallback((event: string, data?: unknown) => {
    eventHistoryRef.current = [{ timestamp: Date.now(), event, data }, ...eventHistoryRef.current].slice(0, 100);
  }, []);

  const clearTimers = useCallback(() => {
    if (playerTimerRef.current) { clearInterval(playerTimerRef.current); playerTimerRef.current = null; }
    if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
  }, []);

  const destroyPlayer = useCallback(async () => {
    clearTimers();
    if (playerRef.current) {
      try { await playerRef.current.destroy(); } catch {}
      playerRef.current = null;
    }
  }, [clearTimers]);

  const handleEvents = useCallback((player: EasyPlayerPro) => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('webglcontextlost', (e) => { e.preventDefault(); recordEvent('webglcontextlost'); });
      container.addEventListener('webglcontextrestored', () => { recordEvent('webglcontextrestored'); });
    }

    player.on('play', () => {
      recordEvent('play');
      props.onPlay?.();
      retryCountRef.current = 0;
      setHasError(false);
    });

    player.on('pause', () => { recordEvent('pause'); props.onPause?.(); });

    player.on('error', (error: unknown) => {
      recordEvent('error', error);
      const errorObj = error as Error;
      const isNotAllowedError = errorObj?.message?.includes('NotAllowedError') || errorObj?.name === 'NotAllowedError';
      const isOOMError = errorObj?.message?.includes('OOM') || String(error).includes('Aborted(OOM)');

      if (isNotAllowedError) {
        setErrorMessage('需要用户交互才能播放音频/视频，请点击播放按钮');
      } else if (isOOMError) {
        setErrorMessage('播放器内存不足，请尝试关闭其他标签页或刷新页面');
      } else {
        setErrorMessage(String(error));
      }

      setHasError(true);
      props.onError?.(error);

      if (!isNotAllowedError) {
        const config = getRetryConfig();
        if (config.maxRetries && config.maxRetries > 0) {
          const delay = config.exponentialBackoff
            ? (config.retryDelay ?? 1000) * Math.pow(2, retryCountRef.current)
            : config.retryDelay ?? 1000;
          retryCountRef.current++;
          retryTimerRef.current = window.setTimeout(() => {
            player.play(props.fallbackUrl && retryCountRef.current > 1 ? props.fallbackUrl : currentUrlRef.current);
          }, delay);
        }
      }
    });

    player.on('timeout', () => { recordEvent('timeout'); props.onTimeout?.(); });
    player.on('liveEnd', () => { recordEvent('liveEnd'); props.onLiveEnd?.(); });
    player.on('videoInfo', (info: unknown) => { recordEvent('videoInfo', info); props.onVideoInfo?.(info); });
    player.on('audioInfo', (info: unknown) => { recordEvent('audioInfo', info); props.onAudioInfo?.(info); });
    player.on('kBps', (speed: unknown) => { recordEvent('kBps', speed); props.onKBps?.(speed as number); });

    playerTimerRef.current = window.setInterval(() => {
      if (playerRef.current) {
        try {
          const videoInfo = playerRef.current.getVideoInfo?.();
          if (videoInfo && 'timestamp' in videoInfo && videoInfo.timestamp !== undefined) {
            recordEvent('timestamps', videoInfo.timestamp);
            props.onTimestamps?.(videoInfo.timestamp);
          }
        } catch {}
      }
    }, 1000);
  }, [recordEvent, props, getRetryConfig]);

  const initPlayer = useCallback(async () => {
    const container = containerRef.current;
    if (!container || !currentUrlRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;

    try {
      if (!(window as unknown as Record<string, unknown>).EasyPlayerPro) {
        setIsLoading(true);
        await ensureEasyPlayerRuntime(props.assetBaseUrl || '');
        setIsLoading(false);
      }

      const player = new ((window as unknown as Record<string, new (element: HTMLDivElement, config: unknown) => EasyPlayerPro>).EasyPlayerPro)(container, {
        ...getPlayerConfig(),
        isMute: !getPlayerConfig().isMute,
        stretch: !getPlayerConfig().stretch,
      });

      playerRef.current = player;
      handleEvents(player);
      props.onPlayerReady?.(player);
      recordEvent('playerReady');

      if (props.mode !== 'vod') {
        await player.play(currentUrlRef.current);
      }
    } catch (error: unknown) {
      const errorObj = error as Error;
      const isNotAllowedError = errorObj?.message?.includes('NotAllowedError') || errorObj?.name === 'NotAllowedError';
      if (!isNotAllowedError) {
        setErrorMessage(String(error));
        setHasError(true);
        props.onError?.(error);
      }
    }
  }, [props.assetBaseUrl, props.mode, props.onError, props.onPlayerReady, getPlayerConfig, handleEvents, recordEvent]);

  useEffect(() => {
    if (!props.url) return;
    currentUrlRef.current = props.url;
    isInitializedRef.current = false;
    retryCountRef.current = 0;
    setHasError(false);
    setErrorMessage('');
    const timer = window.setTimeout(initPlayer, 0);
    return () => {
      clearTimeout(timer);
      clearTimers();
      destroyPlayer();
      isInitializedRef.current = false;
    };
  }, [props.url]);

  useEffect(() => {
    if (playerRef.current && props.isMute !== undefined) {
      playerRef.current.setMute(props.isMute);
    }
  }, [props.isMute]);

  useImperativeHandle(ref, () => ({
    getPlayer: () => playerRef.current,
    play: (url: string) => {
      currentUrlRef.current = url;
      retryCountRef.current = 0;
      if (playerRef.current) playerRef.current.play(url).catch(() => {});
    },
    playback: (url: string) => { playerRef.current?.playback?.(url); },
    pause: () => { playerRef.current?.pause?.(); },
    screenshot: (filename?: string, format?: 'jpeg' | 'png' | 'webp', quality?: number, type?: 'base64' | 'blob' | 'download') => {
      return playerRef.current?.screenshot?.(filename, format, quality, type);
    },
    setFullscreen: () => { playerRef.current?.setFullscreen?.(); },
    exitFullscreen: () => { playerRef.current?.exitFullscreen?.(); },
    setMute: (mute: boolean) => { playerRef.current?.setMute?.(mute); },
    setQuality: (quality: string) => { playerRef.current?.setQuality?.(quality); },
    seekTime: (time: number) => { playerRef.current?.seekTime?.(time); },
    retry: () => {
      if (playerRef.current && currentUrlRef.current) {
        retryCountRef.current = 0;
        playerRef.current.play(currentUrlRef.current).catch(() => {});
      }
    },
    getEventHistory: () => eventHistoryRef.current,
    clearEventHistory: () => { eventHistoryRef.current = []; },
    destroy: () => destroyPlayer(),
  }), [destroyPlayer]);

  return (
    <div
      ref={containerRef}
      className={`easy-player ${props.className || ''} ${!props.controls ? 'hide-controls' : ''}`}
      style={props.style}
      data-url={props.url}
    >
      {!props.url && <div className="easy-player__placeholder"><span>{props.noSignalText || 'No signal'}</span></div>}
      {isLoading && <div className="easy-player__loading"><span>Loading player...</span></div>}
      {hasError && props.renderError && (
        <div className="easy-player__error">
          {props.renderError({
            error: errorMessage,
            retry: () => {
              retryCountRef.current = 0;
              setHasError(false);
              if (playerRef.current && currentUrlRef.current) {
                playerRef.current.play(currentUrlRef.current).catch(() => {});
              }
            },
          })}
        </div>
      )}
    </div>
  );
});

EasyPlayer.displayName = 'EasyPlayer';

export default EasyPlayer;
export type { EasyPlayerProps, EasyPlayerRef, EasyPlayerPro };
