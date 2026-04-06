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

  const formatData = (data: unknown) => {
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
    <div className="event-log glass rounded-3xl overflow-hidden flex flex-col" style={{ maxHeight: '500px' }}>
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
