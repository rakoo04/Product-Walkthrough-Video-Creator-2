export type ActionType = "intro" | "features" | "loading" | "conclusion";

export interface Scene {
  id: string;
  title: string;
  start: number;
  end: number;
  playbackSpeed: number; // e.g. 1.0, 4.0
  actionType: ActionType;
  script: string;
}

export interface VideoProfile {
  id: string;
  name: string;
  duration: number;
  description: string;
  category: string;
  thumbnailColor: string;
}

export interface VoiceProfile {
  voiceName: string;
  displayName: string;
  gender: "Male" | "Female" | "Neural";
  lang: string;
}
