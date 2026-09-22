import React from 'react';
import { Mic, MicOff, Activity, Square, Camera, CameraOff } from 'lucide-react';

interface LiveControlsProps {
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  volume: number; // 0-1
  isMicMuted: boolean;
  onToggleMic: () => void;
  isCameraEnabled: boolean;
  onToggleCamera: () => void;
  sessionTokens?: { prompt: number; candidates: number; total: number };
}

const LiveControls: React.FC<LiveControlsProps> = ({ 
  isConnected, 
  isConnecting, 
  onConnect, 
  onDisconnect,
  volume,
  isMicMuted,
  onToggleMic,
  isCameraEnabled,
  onToggleCamera,
  sessionTokens
}) => {
  const roughCostCents = sessionTokens ? (sessionTokens.total / 1_000_000 * 30).toFixed(2) : "0.00";

  if (isConnected) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-700 rounded-full shadow-xl animate-in fade-in zoom-in duration-300">
          {/* Audio Visualizer */}
          <div className="flex items-center gap-0.5 h-5 w-20 px-1">
            {Array.from({ length: 10 }).map((_, i) => {
              const activeHeight = Math.max(20, Math.min(100, volume * 100 * (1.5 + Math.sin(i * 0.5))));
              return (
                <div 
                  key={i} 
                  className="w-1 rounded-full bg-emerald-400 transition-all duration-75 ease-out"
                  style={{ height: `${activeHeight}%`, opacity: 0.9 }}
                />
              );
            })}
          </div>
          
          <div className="w-px h-4 bg-slate-700"></div>

          {/* Toggle Mic Button */}
          <button
            onClick={onToggleMic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isMicMuted 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30' 
                : 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700'
            }`}
            title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMicMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
            <span className="hidden sm:inline">{isMicMuted ? "Muted" : "Mic On"}</span>
          </button>
            
          {/* Toggle Camera Button */}
          <button
            onClick={onToggleCamera}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              !isCameraEnabled 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30' 
                : 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700'
            }`}
            title={isCameraEnabled ? "Disable Camera" : "Enable Camera"}
          >
            {isCameraEnabled ? <Camera className="w-4 h-4 text-blue-400" /> : <CameraOff className="w-4 h-4 text-rose-400" />}
            <span className="hidden sm:inline">{isCameraEnabled ? "Cam On" : "Cam Off"}</span>
          </button>

          <div className="w-px h-4 bg-slate-700" />

          {/* Disconnect / End Interview Button */}
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
            title="End Interview Session"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>End Session</span>
          </button>
        </div>

        {sessionTokens && sessionTokens.total > 0 && (
          <div className="text-[10px] font-semibold text-slate-300 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-700 shadow-sm flex gap-3 mr-2">
            <span><span className="font-bold text-emerald-400">{sessionTokens.total.toLocaleString()}</span> tokens</span>
            <span>~<span className="font-bold text-blue-400">¢{roughCostCents}</span></span>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      className={`
        group relative flex items-center gap-2 px-5 py-2 rounded-full 
        font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md
        ${isConnecting 
            ? 'bg-slate-800 border border-slate-700 text-slate-300 cursor-wait' 
            : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white hover:scale-105 shadow-indigo-600/30'
        }
      `}
      title="Connect Live AI Technical Companion"
    >
      {isConnecting ? (
        <>
          <Activity className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Connecting Live...</span>
        </>
      ) : (
        <>
          <Mic className="w-4 h-4 text-white" />
          <span>Connect Voice</span>
        </>
      )}
    </button>
  );
};

export default LiveControls;