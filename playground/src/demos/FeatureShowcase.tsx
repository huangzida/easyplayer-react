import React, { useRef, useState } from 'react';
import { EasyPlayer } from '@/index';
import type { PlayerMode, EventHistory, EasyPlayerRef } from '@/index';
import PlayerConfig from '../components/PlayerConfig';
import EventLog from '../components/EventLog';
import StatusBadge from '../components/StatusBadge';

const liveSource = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
const vodSource = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
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
  const [gpuDecoder, setGpuDecoder] = useState(false);
  const [webGpu, setWebGpu] = useState(false);
  const [canvasRender, setCanvasRender] = useState(false);
  const [stretch, setStretch] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isMute, setIsMute] = useState(false);
  const [hasAudio, setHasAudio] = useState(true);
  const [bufferTime, setBufferTime] = useState(1);
  const [loadTimeOut, setLoadTimeOut] = useState(20);
  const [loadTimeReplay, setLoadTimeReplay] = useState(3);
  const [debug, setDebug] = useState(false);
  const [controls, setControls] = useState(true);

  const [events, setEvents] = useState<EventHistory[]>([]);

  const handlePlay = () => {
    playerRef.current?.play(url);
  };

  const handlePause = () => {
    playerRef.current?.pause();
  };

  const handleScreenshot = () => {
    const result = playerRef.current?.screenshot('screenshot', 'png', 0.92, 'download');
    if (result === undefined) {
      console.warn('Screenshot not available');
    }
  };

  const handleRetry = () => {
    playerRef.current?.retry();
  };

  const handleDestroy = () => {
    playerRef.current?.destroy();
  };

  const handleClearEvents = () => {
    setEvents([]);
    playerRef.current?.clearEventHistory();
  };

  const handlePlayerReady = (player: unknown) => {
    const history = (player as { getEventHistory: () => EventHistory[] })?.getEventHistory?.();
    if (history) {
      setEvents(history);
    }
  };

  const handleEvent = (eventName: string, data?: unknown) => {
    setEvents((prev) => {
      const newEvent: EventHistory = {
        timestamp: Date.now(),
        event: eventName,
        data,
      };
      return [newEvent, ...prev].slice(0, 100);
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <StatusBadge
              label={mode === 'live' ? 'LIVE' : mode === 'vod' ? 'VOD' : 'CUSTOM'}
              tone={mode === 'live' ? 'rose' : 'emerald'}
            />
            {wasm && <StatusBadge label="WASM" tone="sky" />}
            {wasmSimd && <StatusBadge label="SIMD" tone="amber" />}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePlay}
              className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-200 text-sm font-medium hover:bg-emerald-500/30 transition-all"
            >
              Play
            </button>
            <button
              onClick={handlePause}
              className="px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-200 text-sm font-medium hover:bg-amber-500/30 transition-all"
            >
              Pause
            </button>
            <button
              onClick={handleScreenshot}
              className="px-4 py-2 bg-sky-500/20 border border-sky-500/50 rounded-lg text-sky-200 text-sm font-medium hover:bg-sky-500/30 transition-all"
            >
              Screenshot
            </button>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-200 text-sm font-medium hover:bg-purple-500/30 transition-all"
            >
              Retry
            </button>
            <button
              onClick={handleDestroy}
              className="px-4 py-2 bg-rose-500/20 border border-rose-500/50 rounded-lg text-rose-200 text-sm font-medium hover:bg-rose-500/30 transition-all"
            >
              Destroy
            </button>
          </div>
        </div>

        <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black" style={{ aspectRatio: '16/9' }}>
          <EasyPlayer
            ref={playerRef}
            url={url}
            mode={mode}
            poster={poster}
            mse={mse}
            wcs={wcs}
            wasm={wasm}
            wasmSimd={wasmSimd}
            gpuDecoder={gpuDecoder}
            webGpu={webGpu}
            canvasRender={canvasRender}
            stretch={stretch}
            isLive={isLive}
            isMute={isMute}
            hasAudio={hasAudio}
            bufferTime={bufferTime}
            loadTimeOut={loadTimeOut}
            loadTimeReplay={loadTimeReplay}
            debug={debug}
            controls={controls}
            className="w-full h-full"
            onPlayerReady={handlePlayerReady}
            onPlay={() => handleEvent('play')}
            onPause={() => handleEvent('pause')}
            onError={(e) => handleEvent('error', String(e))}
            onTimeout={() => handleEvent('timeout')}
            onLiveEnd={() => handleEvent('liveEnd')}
            onVideoInfo={(info) => handleEvent('videoInfo', info)}
            onAudioInfo={(info) => handleEvent('audioInfo', info)}
            onKBps={(speed) => handleEvent('kBps', speed)}
            onTimestamps={(time) => handleEvent('timestamps', time)}
            renderError={({ error, retry }) => (
              <div className="text-center p-4">
                <p className="text-rose-400 mb-4">{error}</p>
                <button
                  onClick={retry}
                  className="px-6 py-2 bg-rose-500/20 border border-rose-500/50 rounded-lg text-rose-200 font-medium hover:bg-rose-500/30 transition-all"
                >
                  重试
                </button>
              </div>
            )}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setUrl(vodSource);
              setMode('vod');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              url === vodSource
                ? 'bg-sky-500/20 border border-sky-500/50 text-sky-200'
                : 'border border-white/10 text-slate-400 hover:bg-white/5'
            }`}
          >
            VOD Source
          </button>
          <button
            onClick={() => {
              setUrl(liveSource);
              setMode('live');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              url === liveSource
                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-200'
                : 'border border-white/10 text-slate-400 hover:bg-white/5'
            }`}
          >
            Live Source
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="overflow-y-auto max-h-[500px]">
          <PlayerConfig
            url={url}
            mode={mode}
            poster={poster}
            mse={mse}
            wcs={wcs}
            wasm={wasm}
            wasmSimd={wasmSimd}
            gpuDecoder={gpuDecoder}
            webGpu={webGpu}
            canvasRender={canvasRender}
            stretch={stretch}
            isLive={isLive}
            isMute={isMute}
            hasAudio={hasAudio}
            bufferTime={bufferTime}
            loadTimeOut={loadTimeOut}
            loadTimeReplay={loadTimeReplay}
            debug={debug}
            controls={controls}
            onUrlChange={setUrl}
            onModeChange={setMode}
            onPosterChange={(p) => setPoster(p || '')}
            onMSEChange={setMse}
            onWCSChange={setWcs}
            onWASMChange={setWasm}
            onWASMSIMDChange={setWasmSimd}
            onGPUDecoderChange={setGpuDecoder}
            onWebGPUChange={setWebGpu}
            onCanvasRenderChange={setCanvasRender}
            onStretchChange={setStretch}
            onIsLiveChange={setIsLive}
            onIsMuteChange={setIsMute}
            onHasAudioChange={setHasAudio}
            onBufferTimeChange={setBufferTime}
            onLoadTimeOutChange={setLoadTimeOut}
            onLoadTimeReplayChange={setLoadTimeReplay}
            onDebugChange={setDebug}
            onQualityChange={() => {}}
            onDefaultQualityChange={() => {}}
            onWatermarkChange={() => {}}
            onFallbackUrlChange={() => {}}
            onControlsChange={setControls}
          />
        </div>
        <div className="overflow-hidden">
          <EventLog events={events} onClear={handleClearEvents} />
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
