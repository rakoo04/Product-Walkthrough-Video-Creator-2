import { useEffect, useRef, useState } from "react";
import { Scene, ActionType, VideoProfile, VoiceProfile } from "./types";
import { DeviceSimulator } from "./components/DeviceSimulator";
import { TimelineTrack } from "./components/TimelineTrack";
import { ContextForm } from "./components/ContextForm";
import { AudioSettings } from "./components/AudioSettings";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  Sparkle,
  Monitor,
  Video,
  Download,
  AlertCircle,
  Cpu,
  Tv,
  HelpCircle,
} from "lucide-react";

export default function App() {
  // Config states
  const [title, setTitle] = useState("SaaS Enterprise Analytics Workspace");
  const [duration, setDuration] = useState(35);
  const [context, setContext] = useState(
    "In the first 10 seconds we introduce the dashboard layout. Clicking 'Run Deployment' triggers the remote cluster sync which takes about 10 seconds of slow progress loading - please auto detect and speed up this compiling loop. Standard cards output instantly after."
  );
  const [tone, setTone] = useState("Casual & Friendly");
  const [videoSourceType, setVideoSourceType] = useState("analytics"); // analytics | cloud | database | upload

  // Local uploaded file states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Walkthrough scenes timeline
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: "sce-1",
      title: "Hero Introduction",
      start: 0,
      end: 11,
      playbackSpeed: 1.0,
      actionType: "intro",
      script: "Hey there! In this walkthrough, I am excited to show you the power of our real-time metrics command workspace."
    },
    {
      id: "sce-2",
      title: "Automated Build Process (Loading)",
      start: 11,
      end: 22,
      playbackSpeed: 4.5,
      actionType: "loading",
      script: "Let's fast-forward past this idle cluster loading loop. We are compiling critical assets automatically behind the scenes."
    },
    {
      id: "sce-3",
      title: "Main Dashboard Highlight",
      start: 22,
      end: 35,
      playbackSpeed: 1.0,
      actionType: "conclusion",
      script: "And we are live! Look at these beautiful real-time graph lines drawing instantly of our workspace parameters. Thank you for watching!"
    }
  ]);

  const [activeSceneId, setActiveSceneId] = useState<string | null>("sce-1");
  const [currentSec, setCurrentSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Speech voiceover synthesis states
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [speechRate, setSpeechRate] = useState(1.0);

  // Status trackers
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // Exporter simulation
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const lastSpokenSceneIdRef = useRef<string | null>(null);

  // Current active scene based on currentSec playhead
  const activeScene = scenes.find(
    (s) => currentSec >= s.start && currentSec <= s.end
  ) || scenes[scenes.length - 1] || null;

  // Active playback speed mapping
  const activePlaybackSpeed = activeScene ? activeScene.playbackSpeed : 1.0;

  // Track speech synthesis voice lists
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        const sysVoices = window.speechSynthesis.getVoices();
        // Filter english or fallback
        const englishVoices = sysVoices.filter((v) =>
          v.lang.toLowerCase().includes("en")
        );
        setVoices(englishVoices.length > 0 ? englishVoices : sysVoices);

        // Pre-select a default premium voice if available e.g. Samantha, Google US English, etc.
        if (englishVoices.length > 0 && !selectedVoiceName) {
          const premium = englishVoices.find((v) =>
            v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("google")
          );
          setSelectedVoiceName(premium ? premium.name : englishVoices[0].name);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Sync video source selection adjustments
  useEffect(() => {
    setIsPlaying(false);
    setCurrentSec(0);
    window.speechSynthesis.cancel();
    lastSpokenSceneIdRef.current = null;

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }

    // Set sample default contexts relative to mock type choice to make it intuitive and awesome
    if (videoSourceType === "analytics") {
      setTitle("SaaS Enterprise Analytics Workspace");
      setContext(
        "First 10s shows analytics banner, click metric boxes. At second 12 to 22, the active pipeline loading sequences start compiling databases, speed that loading screen up! Later, show real-time graph charts update instantly."
      );
    } else if (videoSourceType === "cloud") {
      setTitle("DevOps Kubernetes Engine Hub");
      setContext(
        "First we show kubernetes dashboard. Second 8 to 18, we build out a staging docker pod which takes forever load - please cut past this build wait state! Then show all docker container statuses online."
      );
    } else if (videoSourceType === "database") {
      setTitle("POSTGRES Relational Table Connector");
      setContext(
        "Intro table definitions, second 15 to 25 shows processing connections logs migrations files compiling - speed up that loading spinner! Later, drawing final dynamic table schemas joins."
      );
    }
  }, [videoSourceType]);

  // Synchronize custom video tag current playbackRate
  useEffect(() => {
    if (videoSourceType === "upload" && videoRef.current) {
      videoRef.current.playbackRate = activePlaybackSpeed;
    }
  }, [activePlaybackSpeed, videoSourceType]);

  // CORE PLAYER CLOCK LOOP
  useEffect(() => {
    let intervalId: any;

    if (isPlaying) {
      if (videoSourceType === "upload") {
        // If we are playing custom video, HTML5 video triggers frame updates naturally
        const updateFrame = () => {
          if (videoRef.current && isPlaying) {
            setCurrentSec(videoRef.current.currentTime);
            if (videoRef.current.ended) {
              setIsPlaying(false);
              setCurrentSec(duration);
            }
            intervalId = requestAnimationFrame(updateFrame);
          }
        };
        intervalId = requestAnimationFrame(updateFrame);
      } else {
        // Simulate playback loop in browser canvas mocks
        const ticksPerSec = 10;
        const intervalMs = 1000 / ticksPerSec;

        intervalId = setInterval(() => {
          setCurrentSec((prev) => {
            const addedSec = (intervalMs / 1000) * activePlaybackSpeed;
            const next = prev + addedSec;

            if (next >= duration) {
              setIsPlaying(false);
              window.speechSynthesis.cancel();
              lastSpokenSceneIdRef.current = null;
              return duration;
            }
            return next;
          });
        }, intervalMs);
      }
    } else {
      window.speechSynthesis.cancel();
      lastSpokenSceneIdRef.current = null;
    }

    return () => {
      if (videoSourceType === "upload") {
        cancelAnimationFrame(intervalId);
      } else {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, videoSourceType, activePlaybackSpeed, duration]);

  // Real-time voice narration trigger hook
  useEffect(() => {
    if (isPlaying && activeScene) {
      if (activeScene.id !== lastSpokenSceneIdRef.current) {
        lastSpokenSceneIdRef.current = activeScene.id;
        speakSceneText(activeScene.script);
      }
    }
  }, [isPlaying, activeScene]);

  const speakSceneText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    
    // Stop any active narration instantly
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoiceName) {
      const voice = voices.find((v) => v.name === selectedVoiceName);
      if (voice) utterance.voice = voice;
    }
    utterance.rate = speechRate * 0.95; // Slightly slower speech for perfect flow matching
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  // Upload local video
  const handleUploadFile = (file: File) => {
    setUploadedFile(file);
    const blobUrl = URL.createObjectURL(file);
    setUploadedFileUrl(blobUrl);

    // Auto measure duration of custom video!
    const tempVideo = document.createElement("video");
    tempVideo.src = blobUrl;
    tempVideo.onloadedmetadata = () => {
      const videoDuration = Math.round(tempVideo.duration);
      setDuration(videoDuration);
    };
  };

  // TRIGGER EXPRESS API BACKEND GERMINI WORKFLOW
  const handleGenerateTimeline = async () => {
    setIsLoading(true);
    setCurrentSec(0);
    setIsPlaying(false);
    window.speechSynthesis.cancel();
    lastSpokenSceneIdRef.current = null;

    try {
      const response = await fetch("/api/walkthrough/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          duration,
          context,
          tone,
        }),
      });

      const data = await response.json();
      if (data.scenes && data.scenes.length > 0) {
        // Hydrate with key identifiers
        const hydrated: Scene[] = data.scenes.map((s: any, idx: number) => ({
          ...s,
          id: `sce-gen-${idx}`,
        }));
        setScenes(hydrated);
        setActiveSceneId(hydrated[0].id);
      }
    } catch (err) {
      console.error("Failed to generate walkthrough:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate single scene sentence using server AI rewriter
  const handleRegenerateSceneScript = async (sceneId: string) => {
    const targetScene = scenes.find((s) => s.id === sceneId);
    if (!targetScene) return;

    setIsRegenerating(true);
    try {
      const response = await fetch("/api/walkthrough/regenerate-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneTitle: targetScene.title,
          originalScript: targetScene.script,
          tone,
          context,
        }),
      });

      const data = await response.json();
      if (data.script) {
        setScenes((prev) =>
          prev.map((s) => (s.id === sceneId ? { ...s, script: data.script } : s))
        );
      }
    } catch (err) {
      console.error("Failed to rewrite script slice:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Custom modification callback utilities
  const handleUpdateSceneScript = (sceneId: string, updatedText: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, script: updatedText } : s))
    );
  };

  const handleUpdateSceneTitle = (sceneId: string, updatedTitle: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, title: updatedTitle } : s))
    );
  };

  const handleUpdateSceneSpeed = (sceneId: string, updatedSpeed: number) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, playbackSpeed: updatedSpeed } : s))
    );
  };

  const handleStartPlay = () => {
    if (currentSec >= duration) {
       setCurrentSec(0);
       if (videoRef.current) videoRef.current.currentTime = 0;
    }
    
    if (videoSourceType === "upload" && videoRef.current) {
      videoRef.current.play();
    }
    setIsPlaying(true);
  };

  const handlePausePlay = () => {
    if (videoSourceType === "upload" && videoRef.current) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    window.speechSynthesis.cancel();
  };

  const handleResetPlay = () => {
    setIsPlaying(false);
    setCurrentSec(0);
    window.speechSynthesis.cancel();
    lastSpokenSceneIdRef.current = null;
    if (videoRef.current) {
       videoRef.current.pause();
       videoRef.current.currentTime = 0;
    }
  };

  const handleSeek = (seconds: number) => {
    const clamped = Math.max(0, Math.min(duration, seconds));
    setCurrentSec(clamped);
    if (videoSourceType === "upload" && videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
    // Cancel voice since head jumped to a new timeline address
    window.speechSynthesis.cancel();
    lastSpokenSceneIdRef.current = null;
  };

  // Walkthrough Media export pipeline
  const handleExportWalkthrough = () => {
    setIsExporting(true);
    setExportProgress(10);
    setIsPlaying(false);
    window.speechSynthesis.cancel();

    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            // Trigger automatic downloadable WebM artifact file download
            downloadFakeVideoFile();
          }, 600);
          return 100;
        }
        return p + 15;
      });
    }, 450);
  };

  const downloadFakeVideoFile = () => {
    const markdownData = `### WALKTHROUGH VIDEO EXPORT\nProduct: ${title}\nDuration: ${duration}s\nTone: ${tone}\n\nSCENE BREAKDOWNS:\n` +
      scenes.map((s, i) => `[Scene ${i+1}] ${s.title} (${s.start}s - ${s.end}s) Play rate: ${s.playbackSpeed}x\nScript: "${s.script}"`).join("\n\n");
    
    const blob = new Blob([markdownData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, "_")}_walkthrough_manifest.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#070b15] text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Professional App Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-xl shadow-lg ring-1 ring-white/10">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Product Walkthrough Video Creator
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">
                  AI CO-PILOT
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Streamline SaaS workflow tutorials. Auto-detours delay screens by accelerating loading paces, syncs voice overs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Web Speech indicator */}
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-slate-400 text-[10px]">
                Browser Voices: <strong className="text-slate-200">{voices.length || 0} loaded</strong>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Core Body Container / Space */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT PANEL: Context input & AI Planner */}
          <div className="lg:col-span-4 h-full">
            <ContextForm
              title={title}
              setTitle={setTitle}
              duration={duration}
              setDuration={setDuration}
              context={context}
              setContext={setContext}
              tone={tone}
              setTone={setTone}
              videoSourceType={videoSourceType}
              setVideoSourceType={setVideoSourceType}
              onUploadFile={handleUploadFile}
              onSubmit={handleGenerateTimeline}
              isLoading={isLoading}
              uploadedFileName={uploadedFile ? uploadedFile.name : ""}
            />
          </div>

          {/* RIGHT PANEL: Live Simulator & Segment timelines */}
          <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Inside Left: Simulator */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  {videoSourceType === "upload" && uploadedFileUrl ? (
                    /* Real HTML5 video playback if uploaded, styled premium matching simulated border */
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
                      <div className="flex justify-between items-center bg-[#070b15]/90 px-4 py-2 text-xs border-b border-slate-800 text-slate-400 font-medium">
                        <div className="flex items-center gap-2">
                          <Video className="w-3.5 h-3.5 text-rose-400" />
                          <span>Active Walkthrough Video Player</span>
                        </div>
                        <span className="font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-[9px]">
                          {activePlaybackSpeed}x SPEED
                        </span>
                      </div>
                      <div className="relative aspect-video bg-black">
                        <video
                          ref={videoRef}
                          src={uploadedFileUrl}
                          className="w-full h-full object-contain"
                          onTimeUpdate={() => {
                            if (videoRef.current) {
                              setCurrentSec(videoRef.current.currentTime);
                            }
                          }}
                        />
                        {/* Custom video subtitles */}
                        {activeScene && (
                          <div className="absolute bottom-4 left-4 right-4 bg-slate-950/95 backdrop-blur border border-slate-800/80 px-4 py-2.5 rounded-lg text-center select-none pointer-events-none shadow-xl">
                            <p className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-widest">Walkthrough Speech Subtitle</p>
                            <p className="text-xs text-slate-100 font-medium italic mt-0.5 leading-relaxed">
                              "{activeScene.script}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Canvas simulated high fidelity vector loop */
                    <DeviceSimulator
                      currentSec={currentSec}
                      activeScene={activeScene}
                      isPlaying={isPlaying}
                      totalDuration={duration}
                      playbackSpeed={activePlaybackSpeed}
                      simulationType={videoSourceType}
                    />
                  )}

                  {/* Playback Controls button matrix */}
                  <div className="mt-3.5 bg-slate-900 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {isPlaying ? (
                        <button
                          onClick={handlePausePlay}
                          className="p-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-white shadow-md transition-all cursor-pointer"
                        >
                          <Pause className="w-4 h-4 fill-white" />
                        </button>
                      ) : (
                        <button
                          onClick={handleStartPlay}
                          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white" />
                        </button>
                      )}
                      
                      <button
                        onClick={handleResetPlay}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-all cursor-pointer"
                        title="Rewind to start"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Timeline status micro bar */}
                    <div className="flex-1 text-xs text-slate-400 font-medium">
                      <div className="flex justify-between font-mono text-[10px] text-slate-500 mb-1">
                        <span>Current frame: {currentSec.toFixed(1)}s</span>
                        <span>Playback Rate: {activePlaybackSpeed.toFixed(1)}x</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-rose-400 h-full transition-[width] ease-linear"
                          style={{ width: `${(currentSec / duration) * 100}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleExportWalkthrough}
                      className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Walkthrough</span>
                    </button>
                  </div>
                </div>

                {/* Helpful Tip about automatic delay editing */}
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/10">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">How auto speed-up keeps viewers focused:</h4>
                    <p className="text-[10px] leading-relaxed text-slate-400 mt-0.5">
                      Waiting for databases or docker containers reduces demo attention spans. This player triggers instant speedups (like <strong className="text-amber-400">4.5x</strong>) and updates voiceovers seamlessly so user stays fully engaged.
                    </p>
                  </div>
                </div>
              </div>

              {/* Inside Right: Detail script editor & voice sliders */}
              <div className="md:col-span-5">
                <AudioSettings
                  voices={voices}
                  selectedVoiceName={selectedVoiceName}
                  setSelectedVoiceName={setSelectedVoiceName}
                  speechRate={speechRate}
                  setSpeechRate={setSpeechRate}
                  activeScene={activeScene}
                  onUpdateSceneScript={handleUpdateSceneScript}
                  onUpdateSceneTitle={handleUpdateSceneTitle}
                  onUpdateSceneSpeed={handleUpdateSceneSpeed}
                  onRegenerateScript={handleRegenerateSceneScript}
                  isRegenerating={isRegenerating}
                />
              </div>

            </div>

            {/* LOWER TRACK: Unified Full timeline bar */}
            <div className="w-full">
              <TimelineTrack
                scenes={scenes}
                currentSec={currentSec}
                totalDuration={duration}
                activeSceneId={activeScene ? activeScene.id : null}
                onSceneSelect={(id) => {
                  const target = scenes.find((s) => s.id === id);
                  if (target) {
                    handleSeek(target.start + 0.1);
                  }
                }}
                onSeek={handleSeek}
              />
            </div>

          </div>

        </div>
      </main>

      {/* Rendering / Exporting Progress Modal Banner */}
      {isExporting && (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 w-fit mx-auto rounded-full border border-indigo-500/20">
              <Sparkle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">AI Walkthrough Video Production</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Compiling media canvas frames, synthesizing audio voiceovers, and aligning timeline chapter tracks into a master WebM package...
              </p>
            </div>
            <div className="space-y-1">
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-indigo-400 text-right">{exportProgress}% Completed</p>
            </div>
          </div>
        </div>
      )}

      {/* Sleek human-designed footer credits */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center mt-12">
        <p className="text-[11px] text-slate-600">
          Walkthrough Studio. Automatic video timeline builder & speech synthesis. Powered by Gemini.
        </p>
      </footer>
    </div>
  );
}
