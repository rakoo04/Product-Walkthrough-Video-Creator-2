import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up server-side Gemini API client if GEMINI_API_KEY is available
  let ai: GoogleGenAI | null = null;
  const key = process.env.GEMINI_API_KEY;

  if (key) {
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not defined in the environment. Falling back to structured schema generator templates.");
  }

  app.use(express.json({ limit: "25mb" }));

  // API endpoints FIRST

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasAiKey: !!ai,
    });
  });

  // Timeline Generator endpoint
  app.post("/api/walkthrough/analyze", async (req, res) => {
    try {
      const { title, duration, context, tone } = req.body;
      
      const formattedDuration = Number(duration) || 30;
      const finalTitle = title || "Product Walkthrough";
      const finalContext = context || "A standard walkthrough of our product showing dashboard features and processing data.";
      const finalTone = tone || "Confident & Friendly";

      const prompt = `You are an expert product video automation assistant and scriptwriter. 
Analyze the metadata of this product walkthrough and generate a rich, highly engaging tutorial script, chopped up into sequential timeslots with specific playback speeds.

Walkthrough Details:
- Product Title: "${finalTitle}"
- Video Duration: ${formattedDuration} seconds
- Scenario & Context: "${finalContext}"
- Tone Accent: "${finalTone}"

IMPORTANT OUTPUT SPECIFICATIONS:
1. Divide the total duration of ${formattedDuration} seconds into exactly 3 to 5 logical sequential scenes.
2. The timestamps of your scenes MUST sum up precisely to ${formattedDuration} seconds.
3. The very first scene MUST start at 0.
4. The ending time of scene N MUST be exactly the start time of scene N+1.
5. The very last scene ending time MUST be exactly ${formattedDuration}.
6. Identify if there are any "loading", "compiling", "importing", "provisioning", "processing", or "rendering" sequences mentioned in the context. If so:
   - Identify that scene start and end times.
   - Set the actionType of that scene to "loading"
   - Speed up playback for that scene: Set "playbackSpeed" to a high number (4.0 or 5.0) which symbolizes the speed up.
   - Write a dynamic script voiceover like: "We'll fast-forward while our cloud server configures..." or "Skipping past this brief loading sequence for you...".
7. For standard sections:
   - Set "actionType" to "intro", "features", or "conclusion"
   - Playback rate MUST be exactly 1.0.
   - Write helpful, crisp, exciting voiceover narrations in the requested Tone Accent. Ensure the narration fits comfortably within that scene's duration at 1x speed (typically around 2 sentences per 10 seconds).
8. The output response MUST follow this JSON schema specified.`;

      if (!ai) {
        // Fallback mock creator
        const scenes = generateMockTimeline(finalTitle, formattedDuration, finalTone);
        return res.json({ scenes, isMock: true });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Name of the scene" },
                    start: { type: Type.NUMBER, description: "Start time in seconds" },
                    end: { type: Type.NUMBER, description: "End time in seconds" },
                    playbackSpeed: { type: Type.NUMBER, description: "Target playback speed e.g. 1.0 or 4.5" },
                    actionType: { type: Type.STRING, description: "Action state: intro, features, loading, conclusion" },
                    script: { type: Type.STRING, description: "Highly engaging voiceover narration block" }
                  },
                  required: ["title", "start", "end", "playbackSpeed", "actionType", "script"]
                }
              }
            },
            required: ["scenes"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      let generatedScenes = parsed.scenes || [];
      
      // Perform strict local sanitization
      generatedScenes = sanitizeTimeline(generatedScenes, formattedDuration, finalTitle, finalTone);

      res.json({ scenes: generatedScenes, isMock: false });
    } catch (err: any) {
      console.error("Express walkthrough analyzer error:", err);
      // Failover safely so the frontend never crashes
      const { title, duration, tone } = req.body;
      const formattedDuration = Number(duration) || 30;
      const finalTitle = title || "Product Walkthrough";
      const finalTone = tone || "Confident & Friendly";
      const fallback = generateMockTimeline(finalTitle, formattedDuration, finalTone);
      res.json({ scenes: fallback, isMock: true, error: err.message });
    }
  });

  // Quick single sentence script regenerator
  app.post("/api/walkthrough/regenerate-sentence", async (req, res) => {
    const { sceneTitle, originalScript, tone, context } = req.body;
    try {
      if (!ai) {
        return res.json({
          script: `Here is our updated voiceover highlighting the workspace customization settings, optimized for a ${tone} impression.`
        });
      }

      const prompt = `You are a video script consultant. Refine or rewrite the following narration slice for a product walkthrough slot.
Scene title: "${sceneTitle || "SaaS Demo"}"
Original Text: "${originalScript}"
Desired Tone: "${tone || "Friendly"}"
Extra Context: "${context || ""}"

Write EXACTLY one single, compelling, natural sentence which fits the scene, written for standard voiceover recording. Do not provide any conversational prefacing or headers.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ script: response.text?.trim() || originalScript });
    } catch (err: any) {
      res.json({ script: originalScript || "", error: err.message });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Product Walkthrough creator server running on http://localhost:${PORT}`);
  });
}

function generateMockTimeline(title: string, duration: number, tone: string) {
  const segmentDuration = Number(duration) || 30;
  const loadingStart = Math.max(3, Math.floor(segmentDuration * 0.35));
  const loadingEnd = Math.min(segmentDuration - 4, loadingStart + Math.max(5, Math.floor(segmentDuration * 0.25)));

  return [
    {
      title: "Hero Introduction",
      start: 0,
      end: loadingStart,
      playbackSpeed: 1.0,
      actionType: "intro",
      script: `Hello and welcome! In this quick walkthrough, I will show you how to set up your ${title} setup and get your system operational within seconds.`
    },
    {
      title: "Compiling Assets & Loading",
      start: loadingStart,
      end: loadingEnd,
      playbackSpeed: 4.0,
      actionType: "loading",
      script: `Let's speed through this loading bar. Behind the scenes, we're securely provisioning clusters, reducing standard waiting loops.`
    },
    {
      title: "Dashboard Overview & Finish",
      start: loadingEnd,
      end: segmentDuration,
      playbackSpeed: 1.0,
      actionType: "conclusion",
      script: `Fantastic! Our environment is up and running. Look at this pristine real-time layout. Thanks for watching, and enjoy the power of ${title}.`
    }
  ];
}

function sanitizeTimeline(scenes: any[], duration: number, title: string, tone: string): any[] {
  if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
    return generateMockTimeline(title, duration, tone);
  }

  // Sort by start
  scenes.sort((a, b) => a.start - b.start);

  const sanitized: any[] = [];
  let currentStart = 0;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    let start = currentStart;
    let end = Math.max(start + 1.5, Number(scene.end) || (start + 5));

    if (i === scenes.length - 1 || end >= duration) {
      end = duration;
    }

    sanitized.push({
      title: scene.title || `Scene ${i + 1}`,
      start: Number(start.toFixed(1)),
      end: Number(end.toFixed(1)),
      playbackSpeed: Number(scene.playbackSpeed) || (scene.actionType === "loading" ? 4.0 : 1.0),
      actionType: scene.actionType || "features",
      script: scene.script || "Let's explore this layout segment."
    });

    currentStart = end;
    if (currentStart >= duration) break;
  }

  // Double check ending constraints
  if (sanitized.length > 0) {
    sanitized[sanitized.length - 1].end = duration;
  } else {
    return generateMockTimeline(title, duration, tone);
  }

  return sanitized;
}

startServer();
