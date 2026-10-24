import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { Linking, Platform } from "react-native";

export interface NaturalVoiceModel {
  id: string;
  name: string;
  label: string;
  gender: "female" | "male" | "auto";
  language: string;
  isNeural: boolean;
}

// Commuter phrase dictionary with human conversational prosody
export const NATURAL_COMMUTER_PHRASES: Record<string, string> = {
  "para": "Para po! Bababa na po ako sa tabi. Maraming salamat po.",
  "bayad": "Bayad po! Pakiabot po sa driver o konduktor. Salamat po.",
  "sukli": "Pakiabot po ang aking sukli. Maraming salamat po.",
  "discount": "May legal discount po ako bilang P-W-D o Senior Citizen. Bayad po.",
  "tabi": "Dito na lang po sa may tabi o kanto. Salamat po.",
};

class NaturalVoiceService {
  private availableVoices: Speech.Voice[] = [];
  private filipinoVoices: Speech.Voice[] = [];
  private selectedVoiceId: string | null = null;
  private selectedGender: "female" | "male" | "auto" = "female";
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    try {
      this.availableVoices = await Speech.getAvailableVoicesAsync();
      this.filipinoVoices = this.availableVoices.filter((v) => {
        const lang = (v.language || "").toLowerCase();
        const id = (v.identifier || "").toLowerCase();
        const name = (v.name || "").toLowerCase();
        return (
          lang.startsWith("fil") ||
          lang.startsWith("tl") ||
          id.includes("fil") ||
          name.includes("filipino") ||
          name.includes("tagalog") ||
          lang === "fil-ph" ||
          lang === "tl-ph"
        );
      });

      // Auto-select best neural voice
      this.autoSelectBestVoice();
      this.initialized = true;
    } catch (err) {
      console.warn("[NaturalVoiceService] Failed to load voices:", err);
    }
  }

  private autoSelectBestVoice() {
    if (this.filipinoVoices.length === 0) {
      // Check for Philippine English as secondary natural fallback
      const phEn = this.availableVoices.find((v) =>
        (v.language || "").toLowerCase().includes("en-ph")
      );
      this.selectedVoiceId = phEn?.identifier || null;
      return;
    }

    if (this.selectedGender === "female") {
      // Prioritize female neural/network voice
      const femaleNeural = this.filipinoVoices.find(
        (v) =>
          (v.identifier.toLowerCase().includes("fie") ||
            v.name.toLowerCase().includes("female")) &&
          v.identifier.toLowerCase().includes("network")
      );
      const femaleLocal = this.filipinoVoices.find(
        (v) =>
          v.identifier.toLowerCase().includes("fie") ||
          v.name.toLowerCase().includes("female")
      );
      this.selectedVoiceId = (femaleNeural || femaleLocal || this.filipinoVoices[0]).identifier;
    } else if (this.selectedGender === "male") {
      // Prioritize male neural/network voice
      const maleNeural = this.filipinoVoices.find(
        (v) =>
          (v.identifier.toLowerCase().includes("fid") ||
            v.name.toLowerCase().includes("male")) &&
          v.identifier.toLowerCase().includes("network")
      );
      const maleLocal = this.filipinoVoices.find(
        (v) =>
          v.identifier.toLowerCase().includes("fid") ||
          v.name.toLowerCase().includes("male")
      );
      this.selectedVoiceId = (maleNeural || maleLocal || this.filipinoVoices[0]).identifier;
    } else {
      // Any enhanced or network voice
      const best =
        this.filipinoVoices.find((v) => v.identifier.toLowerCase().includes("network")) ||
        this.filipinoVoices.find((v) => v.quality === Speech.VoiceQuality.Enhanced) ||
        this.filipinoVoices[0];
      this.selectedVoiceId = best?.identifier || null;
    }
  }

  setGender(gender: "female" | "male" | "auto") {
    this.selectedGender = gender;
    this.autoSelectBestVoice();
  }

  getGender(): "female" | "male" | "auto" {
    return this.selectedGender;
  }

  getFilipinoVoicesCount(): number {
    return this.filipinoVoices.length;
  }

  getAvailableFilipinoVoices(): Speech.Voice[] {
    return this.filipinoVoices;
  }

  // Pre-processes Tagalog text for human prosody and natural pauses
  normalizeTagalogText(rawText: string): string {
    let text = rawText.trim();
    if (!text) return "";

    // Replace uppercase acronyms with hyphenated pronunciation
    text = text.replace(/\bPWD\b/gi, "P-W-D");
    text = text.replace(/\bKM\b/gi, "kilometro");
    text = text.replace(/\bRA\s*([0-9]+)/gi, "Republic Act $1");
    text = text.replace(/\bPUV\b/gi, "P-U-V");
    text = text.replace(/\bPUJ\b/gi, "jeep");
    text = text.replace(/\bLTFRB\b/gi, "L-T-F-R-B");

    // Ensure polite and natural sentence endings
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

    // Stop any existing speech playback cleanly
    await Speech.stop();

    // Natural human speech options
    const speechOptions: Speech.SpeechOptions = {
      language: "fil", // Clean ISO code without hyphen to avoid Android Locale constructor bugs
      pitch: 1.0, // Human conversational fundamental frequency
      rate: 0.92, // Natural human conversational tempo (prevents mechanical rushing)
      volume: 1.0,
      onStart: options?.onStart,
      onDone: options?.onDone,
      onError: options?.onError,
    };

    if (this.selectedVoiceId) {
      speechOptions.voice = this.selectedVoiceId;
    }

    Speech.speak(processedText, speechOptions);
  }

  // Opens device TTS Settings so users can download Google's Filipino Neural Voice pack
  async openTtsSettings(): Promise<void> {
    if (Platform.OS === "android") {
      try {
        await Linking.sendIntent("android.settings.VOICE_INPUT_SETTINGS");
      } catch {
        try {
          await Linking.sendIntent("com.android.settings.TTS_SETTINGS");
        } catch {
          Linking.openSettings();
        }
      }
    } else {
      Linking.openSettings();
    }
  }
}

export const naturalVoiceService = new NaturalVoiceService();
export default naturalVoiceService;
