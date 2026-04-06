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
  watermark?: unknown;
  fallbackUrl?: string;
  controls: boolean;
  onUrlChange: (url: string) => void;
  onModeChange: (mode: PlayerMode) => void;
  onPosterChange: (poster: string) => void;
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
  onWatermarkChange: (watermark?: unknown) => void;
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
                  onChange={(e) => props.onPosterChange(e.target.value)}
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
