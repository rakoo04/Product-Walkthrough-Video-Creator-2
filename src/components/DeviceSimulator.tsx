import React, { useEffect, useRef, useState } from "react";
import { ActionType, Scene } from "../types";
import { Play, RotateCcw, ShieldCheck, Zap, Layers, RefreshCw } from "lucide-react";

interface DeviceSimulatorProps {
  currentSec: number;
  activeScene: Scene | null;
  isPlaying: boolean;
  totalDuration: number;
  playbackSpeed: number;
  simulationType: string; // e.g., "analytics" | "cloud" | "database"
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  currentSec,
  activeScene,
  isPlaying,
  totalDuration,
  playbackSpeed,
  simulationType,
}) => {
  const [pulse, setPulse] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 120, y: 140 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core ticker for simulator visual updates
  useEffect(() => {
    let animationFrameId: number;
    let localTime = 0;

    const tick = () => {
      setPulse((prev) => (prev + 1) % 360);
      
      // Simulating a moving cursor depending on current timeline point
      const angle = (currentSec * 0.4) % (Math.PI * 2);
      const radiusX = 140;
      const radiusY = 80;
      const centerX = 250;
      const centerY = 180;
      
      let cursorX = centerX + Math.cos(angle) * radiusX;
      let cursorY = centerY + Math.sin(angle * 1.5) * radiusY;

      // Adjust cursor depending on the action type
      if (activeScene?.actionType === "loading") {
        // Keeps cursor resting at the center of the loading wheel
        cursorX = 250;
        cursorY = 200;
      } else if (activeScene?.actionType === "conclusion") {
        // Keeps cursor hover highlighting a checkout or button
        cursorX = 400;
        cursorY = 320;
      }

      setCursorPos({ x: cursorX, y: cursorY });
      drawInteractiveLayout();
      animationFrameId = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(tick);
    } else {
      drawInteractiveLayout();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentSec, activeScene, isPlaying, simulationType]);

  const drawInteractiveLayout = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background - modern premium dark canvas
    ctx.fillStyle = "#0a0f1d";
    ctx.fillRect(0, 0, width, height);

    // Subtle gradient grid lines
    ctx.strokeStyle = "rgba(49, 46, 129, 0.15)";
    ctx.lineWidth = 1;
    const gridSize = 32;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Mock Web App Top Browser bar
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, 40);

    // Three colored browser buttons
    ctx.fillStyle = "#f87171"; // Red
    ctx.beginPath();
    ctx.arc(20, 20, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fbbf24"; // Yellow
    ctx.beginPath();
    ctx.arc(36, 20, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#34d399"; // Green
    ctx.beginPath();
    ctx.arc(52, 20, 5, 0, Math.PI * 2);
    ctx.fill();

    // Browser address bar input box
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(80, 8, width - 120, 24);
    
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px monospace";
    ctx.fillText(
      simulationType === "analytics"
        ? "https://analytics.io/dashboard/realtime"
        : simulationType === "cloud"
          ? "https://cloud-engine.net/deploy"
          : "https://schema-builder.dev/relations",
      92,
      24
    );

    // Active connection badge
    ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
    ctx.fillRect(width - 92, 10, 80, 20);
    ctx.fillStyle = "#10b981";
    ctx.font = "10px sans-serif";
    ctx.fillText(`● ACTIVE (${playbackSpeed}x)`, width - 82, 24);

    // SIDEBAR NAVIGATION drawing in browser canvas
    ctx.fillStyle = "#0d1527";
    ctx.fillRect(0, 40, 75, height - 40);

    const sideIcons = ["⌗", "[☷]", "[⚡]", "[⚙]"];
    sideIcons.forEach((icon, idx) => {
      ctx.fillStyle = activeScene?.actionType === "features" && idx === 1 ? "#6366f1" : "rgba(148, 163, 184, 0.5)";
      ctx.fillRect(15, 60 + idx * 50, 45, 32);
      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.fillText(icon, 28, 81 + idx * 50);
    });

    // RENDER CONTENT DEPENDING ON ACTION TYPE
    if (activeScene?.actionType === "loading") {
      drawLoadingState(ctx, width, height);
    } else if (simulationType === "analytics") {
      drawAnalyticsWorkspace(ctx, width, height);
    } else if (simulationType === "cloud") {
      drawCloudWorkspace(ctx, width, height);
    } else {
      drawDatabaseWorkspace(ctx, width, height);
    }

    // RENDER SIMULATED CURSOR
    ctx.fillStyle = "rgba(99, 102, 241, 0.25)";
    ctx.beginPath();
    ctx.arc(cursorPos.x, cursorPos.y, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cursorPos.x, cursorPos.y);
    ctx.lineTo(cursorPos.x + 12, cursorPos.y + 12);
    ctx.lineTo(cursorPos.x + 4, cursorPos.y + 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const drawLoadingState = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Backdrop for loading
    ctx.fillStyle = "rgba(10, 15, 30, 0.85)";
    ctx.fillRect(75, 40, width - 75, height - 40);

    const centerX = 75 + (width - 75) / 2;
    const centerY = height / 2;

    // Spinning outer loader rings
    const spinFactor = (pulse * 6) * (playbackSpeed / 2) * (Math.PI / 180);
    
    ctx.strokeStyle = "#312e81";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, spinFactor, spinFactor + Math.PI * 0.7);
    ctx.stroke();

    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 62, -spinFactor * 1.5, -spinFactor * 1.5 + Math.PI * 0.4);
    ctx.stroke();

    // Center pulsating orb
    const pulseRadius = 14 + Math.sin(pulse * 0.1) * 3;
    const grad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, pulseRadius);
    grad.addColorStop(0, "#818cf8");
    grad.addColorStop(1, "rgba(99, 102, 241, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Speed display
    ctx.fillStyle = "#f43f5e";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`${playbackSpeed}x SPEEDUP`, centerX - 38, centerY + 94);

    // Status updates
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "14px sans-serif";
    const percent = Math.min(100, Math.floor((currentSec / totalDuration) * 100));
    ctx.fillText(`Automating Build: ${percent}%`, centerX - 62, centerY + 120);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px monospace";
    ctx.fillText("Auto-detected loading sequence & compressed", centerX - 120, centerY + 144);
  };

  const drawAnalyticsWorkspace = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Banner header
    ctx.fillStyle = "#1e1b4b";
    ctx.fillRect(90, 56, width - 110, 48);

    ctx.fillStyle = "#a5b4fc";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("Enterprise Analytics Dashboard", 110, 78);

    ctx.fillStyle = "#6366f1";
    ctx.font = "11px monospace";
    ctx.fillText("ACTIVE PIPELINE STATUS: MATCHED", 110, 94);

    // Metric mini-cards
    const cardWidth = (width - 130) / 3;
    for (let idx = 0; idx < 3; idx++) {
      const cardX = 90 + idx * (cardWidth + 10);
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = idx === 1 ? "#6366f1" : "#1e293b";
      ctx.lineWidth = 1.5;
      
      // Card box
      ctx.fillRect(cardX, 116, cardWidth, 68);
      ctx.strokeRect(cardX, 116, cardWidth, 68);

      // Card Title
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px sans-serif";
      const cards = ["Monthly Active Runs", "Task Execution Time", "Network Bandwidth"];
      ctx.fillText(cards[idx], cardX + 12, 134);

      // Metric Value
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px monospace";
      const values = ["152,430 ms", "0.24 sec", "8.1 Gbps"];
      ctx.fillText(values[idx], cardX + 12, 154);

      // Mini sparks
      ctx.fillStyle = idx === 0 ? "#10b981" : idx === 1 ? "#ef4444" : "#f59e0b";
      ctx.fillRect(cardX + 12, 162, 28, 4);
    }

    // MAIN CHART GRAPHICS using canvas operations
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(90, 196, width - 110, height - 210);
    ctx.strokeStyle = "#1e293b";
    ctx.strokeRect(90, 196, width - 110, height - 210);

    // Chart Lines
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(110, 310);
    ctx.bezierCurveTo(200, 240, 250, 320, 350, 220);
    ctx.bezierCurveTo(420, 150, 480, 290, width - 40, 240);
    ctx.stroke();

    // Glowing drop shadow under line
    ctx.fillStyle = "rgba(79, 70, 229, 0.08)";
    ctx.lineTo(width - 40, 340);
    ctx.lineTo(110, 340);
    ctx.closePath();
    ctx.fill();

    // Chart helper dots
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(350, 220, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "9px monospace";
    ctx.fillText("Anomalies: 0", 364, 218);
  };

  const drawCloudWorkspace = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Cloud title
    ctx.fillStyle = "#064e3b";
    ctx.fillRect(90, 56, width - 110, 45);

    ctx.fillStyle = "#a7f3d0";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("Kubernetes Provisioning Engine", 110, 76);

    ctx.fillStyle = "#10b981";
    ctx.font = "10px monospace";
    ctx.fillText("CLUSTER: ONLINE-PROD-EAST", 110, 90);

    // Row layout for containers
    const rowY = 115;
    const rowHeight = 35;
    const containers = [
      { id: "pod-core-alpha", cpu: "12%", status: "RUNNING", col: "#10b981" },
      { id: "pod-web-ingress", cpu: "4%", status: "RUNNING", col: "#10b981" },
      { id: "pod-redis-cache", cpu: "88%", status: "STRESSED", col: "#fbbf24" },
      { id: "pod-spanner-replica", cpu: "31%", status: "RUNNING", col: "#10b981" },
    ];

    containers.forEach((pod, cIdx) => {
      const boxY = rowY + cIdx * (rowHeight + 8);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(90, boxY, width - 110, rowHeight);
      ctx.strokeStyle = "#1e293b";
      ctx.strokeRect(90, boxY, width - 110, rowHeight);

      // Indicator circle
      ctx.fillStyle = pod.col;
      ctx.beginPath();
      ctx.arc(112, boxY + rowHeight / 2, 5, 0, Math.PI * 2);
      ctx.fill();

      // Label text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.fillText(pod.id, 128, boxY + rowHeight / 2 + 4);

      // CPU text
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px sans-serif";
      ctx.fillText(`Resources: ${pod.cpu}`, 280, boxY + rowHeight / 2 + 4);

      // Live pulse status
      ctx.fillStyle = pod.col;
      ctx.fillText(pod.status, width - 110, boxY + rowHeight / 2 + 4);
    });
  };

  const drawDatabaseWorkspace = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Database title
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(90, 56, width - 110, 45);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("Dynamic Table Schema Relations", 110, 76);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.fillText("POSTGRESPOOL-V12 || CONNECTION SECURE", 110, 90);

    // Table Boxes
    const tables = [
      { name: "Users Node", fields: ["id::uuid", "name::string", "email::string", "created::date"] },
      { name: "Transactions Logs", fields: ["id::uuid", "user_id::uuid", "amount::decimal", "status::string"] }
    ];

    tables.forEach((table, tIdx) => {
      const tabX = 110 + tIdx * 190;
      const tabY = 120;
      const tabW = 160;
      const tabH = 120;

      // Table body
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(tabX, tabY, tabW, tabH);
      ctx.strokeStyle = "#384252";
      ctx.strokeRect(tabX, tabY, tabW, tabH);

      // Table Header
      ctx.fillStyle = "#312e81";
      ctx.fillRect(tabX, tabY, tabW, 26);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(table.name, tabX + 12, tabY + 17);

      // Fields
      table.fields.forEach((field, fIdx) => {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px monospace";
        ctx.fillText(field.split("::")[0], tabX + 12, tabY + 44 + fIdx * 20);

        ctx.fillStyle = "#4f46e5";
        ctx.fillText(field.split("::")[1], tabX + 110, tabY + 44 + fIdx * 20);
      });
    });

    // Drawing join relations line
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(110 + 160, 120 + 44); // users.id
    ctx.bezierCurveTo(280, 164, 290, 140, 110 + 190, 120 + 64); // transactions.user_id
    ctx.stroke();
    ctx.setLineDash([]); // clear dash
  };

  return (
    <div id="device-mockup" className="relative group rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-[#030712] max-w-full">
      {/* Absolute Header with Device Details */}
      <div className="flex justify-between items-center bg-[#070b15]/90 px-4 py-2 text-xs border-b border-slate-800 text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Walkthrough Preview Player</span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className={`w-3 h-3 text-emerald-400 ${isPlaying ? "animate-spin" : ""}`} />
          <span className="text-[10px] monospace bg-[#111827] px-2 py-0.5 rounded text-emerald-300">
            {activeScene?.actionType === "loading" ? "FAST-FORWARDING" : "PLAYING"}
          </span>
        </div>
      </div>

      <div className="relative aspect-video flex justify-center items-center bg-[#000000]">
        <canvas
          ref={canvasRef}
          width={540}
          height={320}
          className="w-full h-auto bg-[#0a0f1d] block object-contain"
        />
        
        {/* Overlay info box to highlight when speech is active */}
        <div className="absolute top-12 left-4 bg-slate-900/90 backdrop-blur border border-indigo-500/30 px-3 py-1.5 rounded-lg max-w-[240px] shadow-lg pointer-events-none transition-all duration-300">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest">Active Scene</span>
          </div>
          <p className="text-xs font-semibold text-white truncate">{activeScene?.title || "Searching for context"}</p>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
            <span>Play Speed:</span>
            <span className={`font-bold ${playbackSpeed > 1 ? "text-rose-400" : "text-emerald-400"}`}>
              {playbackSpeed}x
            </span>
          </div>
        </div>

        {/* Dynamic Interactive subtitles */}
        {activeScene && (
          <div className="absolute bottom-4 left-4 right-4 bg-[#020617]/90 backdrop-blur border border-slate-800 px-6 py-3 rounded-xl select-none text-center transform transition-transform shadow-2xl animate-fade-in pointer-events-none">
            <p className="text-xs font-mono uppercase text-indigo-400 tracking-widest font-bold mb-1">Voiceover Narrative</p>
            <p className="text-sm font-sans text-slate-100 font-medium leading-relaxed italic">
              "{activeScene.script}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
