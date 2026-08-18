import React, { useRef } from "react";
import { Scene } from "../types";
import { Clock, ZoomIn, Eye, Play, Sparkles } from "lucide-react";

interface TimelineTrackProps {
  scenes: Scene[];
  currentSec: number;
  totalDuration: number;
  activeSceneId: string | null;
  onSceneSelect: (id: string) => void;
  onSeek: (seconds: number) => void;
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
  scenes,
  currentSec,
  totalDuration,
  activeSceneId,
  onSceneSelect,
  onSeek,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seconds = Math.max(0, Math.min(totalDuration, percentage * totalDuration));
    onSeek(seconds);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl w-full">
      {/* Header with quick metadata */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">Interactive Video Timeline</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-500 block" />
            <span>Regular (1.0x)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500 block animate-pulse" />
            <span>Fast-forward State (Speedup!)</span>
          </div>
          <span className="bg-slate-800 px-2.5 py-1 rounded-md text-emerald-300">
            {currentSec.toFixed(1)}s / {totalDuration.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Main Track container */}
      <div className="relative mt-2">
        {/* Dynamic visual slider playhead cursor */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-rose-500 z-30 pointer-events-none transition-[left] ease-linear"
          style={{ left: `${(currentSec / totalDuration) * 100}%` }}
        >
          {/* Glowing head tag */}
          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.8)] border-2 border-slate-100 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>

        {/* Proportional timeline bar */}
        <div
          ref={containerRef}
          onClick={handleTimelineClick}
          className="relative h-14 bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800/80 flex cursor-pointer z-10 hover:border-slate-700/80 transition-all mb-4"
        >
          {scenes.map((scene) => {
            const widthPct = ((scene.end - scene.start) / totalDuration) * 100;
            const isSelected = scene.id === activeSceneId;
            const isTimelinePast = currentSec >= scene.start && currentSec <= scene.end;

            // Highlight color classes based on scene type
            let bgClass = "bg-indigo-950/40 border-indigo-700/40 hover:bg-indigo-900/40";
            let stripeClass = "border-indigo-500/50";
            let typeColor = "text-indigo-300";

            if (scene.actionType === "loading") {
              bgClass = "bg-amber-950/45 border-amber-600/50 hover:bg-amber-900/40";
              stripeClass = "border-amber-400/60";
              typeColor = "text-amber-300 font-bold";
            } else if (scene.actionType === "conclusion") {
              bgClass = "bg-rose-950/30 border-rose-700/40 hover:bg-rose-900/30";
              stripeClass = "border-rose-400/40";
              typeColor = "text-rose-300";
            } else if (scene.actionType === "intro") {
              bgClass = "bg-emerald-950/30 border-emerald-700/40 hover:bg-emerald-900/30";
              stripeClass = "border-emerald-400/40";
              typeColor = "text-emerald-300";
            }

            return (
              <div
                key={scene.id}
                onClick={(e) => {
                  e.stopPropagation(); // Stop seeking, focus scene select instead
                  onSceneSelect(scene.id);
                }}
                className={`relative h-full border-r last:border-r-0 flex flex-col justify-between p-2.5 transition-all select-none group ${bgClass} ${
                  isSelected ? "ring-2 ring-indigo-400 z-20 shadow-lg" : ""
                } ${isTimelinePast ? "bg-opacity-80" : "bg-opacity-30"}`}
                style={{ width: `${widthPct}%` }}
              >
                {/* Visual strip indicator inside segment */}
                <div className={`absolute top-0 left-0 right-0 border-t-2 ${stripeClass}`} />

                <div className="flex justify-between items-start truncate gap-1 pointer-events-none">
                  <span className="text-[11px] font-bold text-slate-100 truncate">{scene.title}</span>
                </div>

                <div className="flex justify-between items-end pointer-events-none text-[9px] font-mono text-slate-400 truncate mt-1">
                  <span>
                    {scene.start.toFixed(1)}s - {scene.end.toFixed(1)}s
                  </span>
                  <span className={`${typeColor}`}>
                    {scene.playbackSpeed > 1 ? `⚡ ${scene.playbackSpeed}x` : `1.0x`}
                  </span>
                </div>
                
                {isSelected && (
                  <div className="absolute inset-0 bg-white/5 pointer-events-none border border-white/20 rounded z-10" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sequential Scene Cards and quick info summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-2">
        {scenes.map((scene, index) => {
          const isSelected = scene.id === activeSceneId;
          const duration = scene.end - scene.start;
          const adjustedDuration = duration / scene.playbackSpeed;

          return (
            <div
              key={scene.id}
              onClick={() => onSceneSelect(scene.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-left ${
                isSelected
                  ? "bg-slate-800/80 border-indigo-500 shadow-lg shadow-indigo-500/10"
                  : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-slate-500 font-mono text-[10px]">SCENE {index + 1}</span>
                  <div className="flex items-center gap-1.5">
                    {scene.actionType === "loading" && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider animate-pulse">
                        Fast-Forward
                      </span>
                    )}
                    <span className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono">
                      {scene.actionType}
                    </span>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-200 truncate">{scene.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 italic leading-relaxed">
                  "{scene.script}"
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono border-t border-slate-800/60 pt-2 mt-2.5">
                <span>Original: {duration.toFixed(1)}s</span>
                <span className="text-indigo-400">Played: {adjustedDuration.toFixed(1)}s ({scene.playbackSpeed}x)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
