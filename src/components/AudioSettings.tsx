import React, { useEffect, useState } from "react";
import { Scene } from "../types";
import { Volume2, Mic, Play, Settings, RefreshCw, Layers, Edit3, AudioLines } from "lucide-react";

interface AudioSettingsProps {
  voices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  setSelectedVoiceName: (val: string) => void;
  speechRate: number;
  setSpeechRate: (val: number) => void;
  activeScene: Scene | null;
  onUpdateSceneScript: (sceneId: string, text: string) => void;
  onUpdateSceneSpeed: (sceneId: string, speed: number) => void;
  onUpdateSceneTitle: (sceneId: string, title: string) => void;
  onRegenerateScript: (sceneId: string) => void;
  isRegenerating: boolean;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({
  voices,
  selectedVoiceName,
  setSelectedVoiceName,
  speechRate,
  setSpeechRate,
  activeScene,
  onUpdateSceneScript,
  onUpdateSceneSpeed,
  onUpdateSceneTitle,
  onRegenerateScript,
  isRegenerating,
}) => {
  const [testActive, setTestActive] = useState(false);
  const [localScript, setLocalScript] = useState("");
  const [localTitle, setLocalTitle] = useState("");

  const selectedVoice = voices.find((v) => v.name === selectedVoiceName);

  useEffect(() => {
    if (activeScene) {
      setLocalScript(activeScene.script);
      setLocalTitle(activeScene.title);
    }
  }, [activeScene]);

  const speakTestText = () => {
    if (!activeScene) return;
    window.speechSynthesis.cancel();
    setTestActive(true);
    
    const utterance = new SpeechSynthesisUtterance(localScript);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = speechRate;
    utterance.onend = () => setTestActive(false);
    utterance.onerror = () => setTestActive(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleApplyScript = () => {
    if (!activeScene) return;
    onUpdateSceneScript(activeScene.id, localScript);
  };

  const handleApplyTitle = () => {
    if (!activeScene) return;
    onUpdateSceneTitle(activeScene.id, localTitle);
  };

  const handleSpeedSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeScene) return;
    onUpdateSceneSpeed(activeScene.id, Number(e.target.value));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5 text-left h-full flex flex-col justify-between">
      <div className="space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">Walkthrough Editor & TTS</h2>
          </div>
          <span className="text-[10px] monospace bg-[#111827] px-2.5 py-1 rounded-md text-slate-400 border border-slate-800">
            TTS Engine: Ready
          </span>
        </div>

        {/* Selected Scene editing box */}
        {activeScene ? (
          <div className="space-y-4">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-indigo-400 font-mono font-bold">
                <span className="flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  Editing Selected Section
                </span>
                <span className="text-slate-500 uppercase">
                  {activeScene.actionType}
                </span>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section Heading</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    className="flex-1 bg-slate-900/60 border border-slate-850 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-100 outline-none"
                  />
                  <button
                    onClick={handleApplyTitle}
                    className="px-2.5 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 font-bold rounded-lg text-indigo-400"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Spoken script text */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Narration script</label>
                  <button
                    onClick={() => onRegenerateScript(activeScene.id)}
                    disabled={isRegenerating}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isRegenerating ? "animate-spin" : ""}`} />
                    <span>Regenerate with AI</span>
                  </button>
                </div>
                <textarea
                  value={localScript}
                  onChange={(e) => setLocalScript(e.target.value)}
                  onBlur={handleApplyScript}
                  rows={3}
                  className="w-full bg-slate-900/60 border border-slate-850 px-2.5 py-2 rounded-lg text-xs leading-relaxed text-slate-200 outline-none resize-none focus:border-indigo-500/50"
                />
                <button
                  onClick={handleApplyScript}
                  className="w-full py-1 text-[10px] text-center bg-slate-800 hover:bg-slate-700 font-bold block rounded-lg text-slate-300"
                >
                  Confirm Script Draft Change
                </button>
              </div>

              {/* Timeline Speeds */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Playback Speed (Speedup load!)</span>
                  <span className={`font-mono font-bold ${activeScene.playbackSpeed > 1 ? "text-rose-400" : "text-emerald-400"}`}>
                    {activeScene.playbackSpeed.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={6.0}
                  step={0.5}
                  value={activeScene.playbackSpeed}
                  onChange={handleSpeedSliderChange}
                  className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[8px] text-slate-600 font-mono">
                  <span>1.0x (Regular explaining)</span>
                  <span>6.0x (Hyperloading speed)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-950/40 border border-slate-800 border-dashed rounded-xl">
            <Volume2 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-400">No scene selected</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Select or click any segment block below the player to inspect script and custom playback velocities.
            </p>
          </div>
        )}

        {/* Global Voice selection & audio rate */}
        <div className="space-y-3.5 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <Settings className="w-3.5 h-3.5 text-indigo-400" />
            <span>Voice & Synthesis Engine</span>
          </div>

          {/* Select system voice */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Narration Voice</label>
            <select
              value={selectedVoiceName}
              onChange={(e) => setSelectedVoiceName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none transition-all cursor-pointer"
            >
              <option value="">-- Use Default System Voice --</option>
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} (en)
                </option>
              ))}
            </select>
          </div>

          {/* Reading rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span>Voice Speech Pace</span>
              <span className="text-indigo-400 font-bold">{speechRate}x</span>
            </div>
            <input
              type="range"
              min={0.6}
              max={1.6}
              step={0.1}
              value={speechRate}
              onChange={(e) => setSpeechRate(Number(e.target.value))}
              className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-850">
        {/* Test voice action */}
        <button
          onClick={speakTestText}
          disabled={!activeScene || testActive}
          className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-705 border border-slate-700 text-xs text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 shadow-inner disabled:opacity-50"
        >
          <AudioLines className={`w-4 h-4 text-emerald-400 ${testActive ? "animate-[bounce_0.6s_infinite]" : ""}`} />
          <span>{testActive ? "Streaming Synthesized Voice..." : "Preview Selected Script Audio"}</span>
        </button>
      </div>
    </div>
  );
};
