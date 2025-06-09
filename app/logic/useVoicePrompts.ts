// hooks/useVoicePrompts.ts
import { useState } from "react";
import * as Speech from "expo-speech";

export const DEFAULT_PROMPTS = [
  "Para po!",
  "Bayad po!",
  "Bayad po, bababa po ako.",
  "Pakiabot po ng bayad",
  "Pakiabot po ng sukli",
  "Salamat po!",
];

export function useVoicePrompts() {
  const [customPrompt, setCustomPrompt] = useState("");

  const speak = (text: string) => {
    if (!text.trim()) return;
    Speech.speak(text, {
      language: "fil-PH",
      rate: 0.9,
      pitch: 1.1,
      volume: 1.0,
      onStart: () => console.log("Speech started"),
      onDone: () => console.log("Speech finished"),
      onError: (err) => console.error("Speech error", err),
    });
  };

  const handleCustomPromptPlay = () => {
    if (customPrompt.trim()) {
      speak(customPrompt);
    }
  };

  return {
    DEFAULT_PROMPTS,
    customPrompt,
    setCustomPrompt,
    speak,
    handleCustomPromptPlay,
  };
}
