import React, { useRef, useState } from "react";
import { Sparkles, Video, Volume2, UploadCloud, FileVideo, Info, RefreshCw } from "lucide-react";

interface ContextFormProps {
  title: string;
  setTitle: (val: string) => void;
  duration: number;
  setDuration: (val: number) => void;
  context: string;
  setContext: (val: string) => void;
  tone: string;
  setTone: (val: string) => void;
  videoSourceType: string; // "analytics" | "cloud" | "database" | "upload"
  setVideoSourceType: (val: string) => void;
  onUploadFile: (file: File) => void;
  onSubmit: () => void;
  isLoading: boolean;
  uploadedFileName: string;
}

export const ContextForm: React.FC<ContextFormProps> = ({
  title,
  setTitle,
  duration,
  setDuration,
  context,
  setContext,
  tone,
  setTone,
  videoSourceType,
  setVideoSourceType,
  onUploadFile,
  onSubmit,
  isLoading,
  uploadedFileName,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        onUploadFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5 text-left h-full flex flex-col justify-between">
      <div className="space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-slate-100">AI Walkthrough Architect</h2>
        </div>

        {/* Product Title */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Product/Feature Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., SaaS Metrics Dashboard, DevOps Hub"
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
          />
        </div>

        {/* Video Duration */}
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Video Target Duration</span>
            <span className="text-indigo-400 normal-case font-bold">{duration} seconds</span>
          </div>
          <input
            type="range"
            min={15}
            max={90}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-950 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-slate-600 font-mono">
            <span>15s (Short Promo)</span>
            <span>90s (Full Demo)</span>
          </div>
        </div>

        {/* Voiceover Tone */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Voiceover Narrative Accent & Tone
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none transition-all cursor-pointer"
          >
            <option value="Casual & Friendly">Casual & Friendly (SaaS Founder vibe)</option>
            <option value="Confident & Professional">Confident & Professional (Enterprise Pitch)</option>
            <option value="Energetic Startup">Energetic Startup (Launch promotional)</option>
            <option value="Deep Tech Engineer">Deep Tech Engineer (Detailed & analytical)</option>
            <option value="Humorous & Quirky">Humorous & Quirky (Memorable & lighthearted)</option>
          </select>
        </div>

        {/* Video Mode Selection */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Product Walkthrough Video Input
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "analytics", label: "Analytics App Mock" },
              { id: "cloud", label: "Cloud Engine Mock" },
              { id: "database", label: "DB Schema Mock" },
              { id: "upload", label: "My Video File" },
            ].map((source) => (
              <button
                type="button"
                key={source.id}
                onClick={() => setVideoSourceType(source.id)}
                className={`py-2 px-3 rounded-xl border text-xs text-center font-medium transition-all ${
                  videoSourceType === source.id
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-300 shadow-md"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"
                }`}
              >
                {source.label}
              </button>
            ))}
          </div>
        </div>

        {/* Video Upload Form if upload is standard */}
        {videoSourceType === "upload" && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isDragOver
                ? "border-indigo-400 bg-indigo-500/5"
                : uploadedFileName
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-slate-800 hover:border-slate-700 bg-slate-950"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
            {uploadedFileName ? (
              <div className="space-y-2">
                <FileVideo className="w-8 h-8 mx-auto text-emerald-400 animate-bounce" />
                <p className="text-xs font-bold text-emerald-300">Video Loaded successfully!</p>
                <p className="text-[10px] text-slate-500 font-mono truncate max-w-xs mx-auto">
                  {uploadedFileName}
                </p>
                <p className="text-[10px] text-slate-400">Click or drag to select different video clip</p>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-8 h-8 mx-auto text-indigo-400" />
                <p className="text-xs font-semibold text-slate-300">Drag & Drop Product Video</p>
                <p className="text-[10px] text-slate-500">Supports .mp4, .webm, or any video file</p>
              </div>
            )}
          </div>
        )}

        {/* Context Input */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tell AI about the Product Flow
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={4}
            placeholder="Help AI understand loading parts! e.g., First we show the dashboard layout, then clicking generate starts compiling code which is slow for 8 seconds - please speed up that load animation. Then high-fidelity tables load instantly."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all leading-relaxed resize-none"
          />
        </div>

        {/* Helpful hint info */}
        <div className="flex gap-2.5 items-start bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl text-[11px] leading-relaxed text-slate-400">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p>
            AI automatically scan timings, locates complex code compilation loops, and optimizes scenes. It speeds up the player up to 5x during loading cycles, keeping your audience fully engaged.
          </p>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={isLoading || (videoSourceType === "upload" && !uploadedFileName)}
        className="w-full relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 group"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Video Sequences...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
              <span>Generate Video Walkthrough Script</span>
            </>
          )}
        </span>
      </button>
    </div>
  );
};
