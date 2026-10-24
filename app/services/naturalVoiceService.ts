import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { Linking, Platform } from "react-native";

export type VoiceModelId = "juan" | "amihan" | "tala" | "bagwis" | "sinag";

export interface VoiceModelProfile {
  id: VoiceModelId;
  name: string;
  tagline: string;
  rate: number;
  pitch: number;
  voiceIndexPreference: number;
}

export const VOICE_MODELS: VoiceModelProfile[] = [
  {
    id: "juan",
    name: "Juan",
    tagline: "Composed and direct",
    rate: 0.94,
    pitch: 0.98,
    voiceIndexPreference: 0,
  },
  {
    id: "amihan",
    name: "Amihan",
    tagline: "Easygoing and versatile",
    rate: 0.93,
    pitch: 1.03,
    voiceIndexPreference: 1,
  },
  {
    id: "tala",
    name: "Tala",
    tagline: "Bright and expressive",
    rate: 0.98,
    pitch: 1.08,
    voiceIndexPreference: 2,
  },
  {
    id: "bagwis",
    name: "Bagwis",
    tagline: "Calm and affirming",
    rate: 0.88,
    pitch: 0.92,
    voiceIndexPreference: 3,
  },
  {
    id: "sinag",
    name: "Sinag",
    tagline: "Confident and natural",
    rate: 0.96,
    pitch: 1.0,
    voiceIndexPreference: 4,
  },
];

class NaturalVoiceService {
  private availableVoices: Speech.Voice[] = [];
  private filipinoVoices: Speech.Voice[] = [];
  private selectedModelId: VoiceModelId = "juan";
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    try {
      this.availableVoices = await Speech.getAvailableVoicesAsync();
      // Prioritize neural/network and enhanced local Filipino models on Android 15 (Google TTS Conformer/WaveNet)
      const rawFil = this.availableVoices.filter((v) => {
        const lang = (v.language || "").toLowerCase();
        const id = (v.identifier || "").toLowerCase();
        const name = (v.name || "").toLowerCase();
        return (
          lang.startsWith("fil") ||
          lang.startsWith("tl") ||
          id.includes("fil") ||
          name.includes("filipino") ||
          name.includes("tagalog") ||
          lang.includes("en-ph")
        );
      });

      // Sort so enhanced/local high-density neural models come first
      this.filipinoVoices = rawFil.sort((a, b) => {
        const aScore =
          (a.quality === Speech.VoiceQuality.Enhanced ? 4 : 0) +
          (a.identifier.toLowerCase().includes("local") ? 2 : 0) +
          (a.language.toLowerCase().startsWith("fil") ? 3 : 0);
        const bScore =
          (b.quality === Speech.VoiceQuality.Enhanced ? 4 : 0) +
          (b.identifier.toLowerCase().includes("local") ? 2 : 0) +
          (b.language.toLowerCase().startsWith("fil") ? 3 : 0);
        return bScore - aScore;
      });

      this.initialized = true;
    } catch (err) {
      console.warn("[NaturalVoiceService] Failed to load voices:", err);
    }
  }

  setVoiceModel(id: VoiceModelId) {
    this.selectedModelId = id;
  }

  getVoiceModel(): VoiceModelProfile {
    return VOICE_MODELS.find((m) => m.id === this.selectedModelId) || VOICE_MODELS[0];
  }

  getFilipinoVoicesCount(): number {
    return this.filipinoVoices.length;
  }

  normalizeTagalogText(rawText: string): string {
    let text = rawText.trim();
    if (!text) return "";

    text = text.replace(/\bPWD\b/gi, "P-W-D");
    text = text.replace(/\bKM\b/gi, "kilometro");
    text = text.replace(/\bRA\s*([0-9]+)/gi, "Republic Act $1");
    text = text.replace(/\bPUV\b/gi, "P-U-V");
    text = text.replace(/\bPUJ\b/gi, "jeep");
    text = text.replace(/\bLTFRB\b/gi, "L-T-F-R-B");

    if (!text.endsWith(".") && !text.endsWith("!") && !text.endsWith("?")) {
      text += ".";
    }

    return text;
  }

  async speakNatural(
    text: string,
    options?: {
      onStart?: () => void;
      onDone?: () => void;
      onError?: (err: any) => void;
    }
  ): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const processedText = this.normalizeTagalogText(text);
    const model = this.getVoiceModel();

    await Speech.stop();

    const speechOptions: Speech.SpeechOptions = {
      language: "fil",
      pitch: model.pitch,
      rate: model.rate,
      volume: 1.0,
      onStart: options?.onStart,
      onDone: options?.onDone,
      onError: options?.onError,
    };

    if (this.filipinoVoices.length > 0) {
      const targetVoice =
        this.filipinoVoices[model.voiceIndexPreference % this.filipinoVoices.length] ||
        this.filipinoVoices[0];
      speechOptions.voice = targetVoice.identifier;
    }

    Speech.speak(processedText, speechOptions);
  }

  async openTtsSettings(): Promise<void> {
    if (Platform.OS === "android") {
      try {
        await Linking.sendIntent("com.android.settings.TTS_SETTINGS");
      } catch {
        Linking.openSettings();
      }
    } else {
      Linking.openSettings();
    }
  }
}

export const naturalVoiceService = new NaturalVoiceService();
export default naturalVoiceService;
