import { useEffect, useState } from "react";
import naturalVoiceService, { NATURAL_COMMUTER_PHRASES } from "../services/naturalVoiceService";

export const DEFAULT_PROMPTS = [
  "Para po! Bababa na po ako sa tabi. Salamat po.",
  "Bayad po! Pakiabot po sa driver. Salamat po.",
  "May discount po ako bilang PWD o Senior Citizen. Bayad po.",
  "Pakiabot po ang sukli ko. Salamat po.",
  "Dito na lang po sa may tabi o tawiran. Salamat po.",
];

export function useVoicePrompts() {
  const [customPrompt, setCustomPrompt] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceGender, setVoiceGenderState] = useState<"female" | "male" | "auto">("female");
  const [filipinoVoicesCount, setFilipinoVoicesCount] = useState<number>(0);

  useEffect(() => {
    naturalVoiceService.initialize().then(() => {
      setFilipinoVoicesCount(naturalVoiceService.getFilipinoVoicesCount());
      setVoiceGenderState(naturalVoiceService.getGender());
    });
  }, []);

  const setVoiceGender = (gender: "female" | "male" | "auto") => {
    naturalVoiceService.setGender(gender);
    setVoiceGenderState(gender);
  };

  const speak = (text: string) => {
    if (!text || !text.trim()) return;
    setIsSpeaking(true);
    naturalVoiceService.speakNatural(text, {
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleCustomPromptPlay = () => {
    if (customPrompt.trim()) {
      speak(customPrompt);
    }
  };

  return {
    DEFAULT_PROMPTS,
    NATURAL_COMMUTER_PHRASES,
    customPrompt,
    setCustomPrompt,
    isSpeaking,
    voiceGender,
    setVoiceGender,
    filipinoVoicesCount,
    openTtsSettings: () => naturalVoiceService.openTtsSettings(),
    speak,
    handleCustomPromptPlay,
  };
}
