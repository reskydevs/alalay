import { useEffect, useState } from "react";
import naturalVoiceService, {
  VOICE_MODELS,
  VoiceModelId,
  VoiceModelProfile,
} from "../services/naturalVoiceService";

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
  const [selectedModel, setSelectedModel] = useState<VoiceModelProfile>(VOICE_MODELS[0]);

  useEffect(() => {
    naturalVoiceService.initialize().then(() => {
      setSelectedModel(naturalVoiceService.getVoiceModel());
    });
  }, []);

  const selectVoiceModel = (id: VoiceModelId) => {
    naturalVoiceService.setVoiceModel(id);
    setSelectedModel(naturalVoiceService.getVoiceModel());
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
    VOICE_MODELS,
    selectedModel,
    selectVoiceModel,
    customPrompt,
    setCustomPrompt,
    isSpeaking,
    openTtsSettings: () => naturalVoiceService.openTtsSettings(),
    speak,
    handleCustomPromptPlay,
  };
}
