import FlashcardScene, { SceneType } from "@/components/FlashcardScene";
import VoiceOrb from "@/components/VoiceOrb";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useVoicePrompts } from "../logic/useVoicePrompts";

const FLASHCARD_PRESETS: {
  id: SceneType;
  label: string;
  phrase: string;
  subtext: string;
  speech: string;
  accent: string;
}[] = [
  {
    id: "stop",
    label: "STOP HERE",
    phrase: "PARA PO!",
    subtext: "Unloading at the curb",
    speech: "Para po! Bababa na po ako sa tabi. Maraming salamat po.",
    accent: "#E82127",
  },
  {
    id: "payment",
    label: "PASSING FARE",
    phrase: "BAYAD PO!",
    subtext: "Please pass to the driver",
    speech: "Bayad po! Pakiabot po sa driver. Maraming salamat po.",
    accent: "#22C55E",
  },
  {
    id: "curbside",
    label: "SAFE DROP-OFF",
    phrase: "SA TABI LANG!",
    subtext: "Drop off at the corner",
    speech: "Dito na lang po sa may tabi o tawiran. Salamat po.",
    accent: "#2563EB",
  },
  {
    id: "discount",
    label: "20% DISCOUNT",
    phrase: "PWD / SENIOR",
    subtext: "Statutory 20% discount",
    speech: "May legal discount po ako bilang P-W-D o Senior Citizen. Bayad po.",
    accent: "#38BDF8",
  },
  {
    id: "change",
    label: "CHANGE PLEASE",
    phrase: "SUKLI PO!",
    subtext: "Waiting for fare change",
    speech: "Pakiabot po ang aking sukli. Maraming salamat po.",
    accent: "#FACC15",
  },
];

export default function VoicePromptsTab() {
  const {
    VOICE_MODELS,
    selectedModel,
    selectVoiceModel,
    customPrompt,
    setCustomPrompt,
    isSpeaking,
    openTtsSettings,
    speak,
    handleCustomPromptPlay,
  } = useVoicePrompts();

  const [flashcardVisible, setFlashcardVisible] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

  const rowScale = useRef(new Animated.Value(1)).current;

  const activePreset = FLASHCARD_PRESETS[selectedPresetIndex];

  const triggerBounce = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    Animated.sequence([
      Animated.timing(rowScale, {
        toValue: 0.95,
        duration: 85,
        useNativeDriver: true,
      }),
      Animated.spring(rowScale, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView
        className="flex-1 bg-[#000000]"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 48,
        }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={90}
      >
        <StatusBar barStyle="light-content" />

        {/* Minimalist Header (Single Settings Icon — Zero Duplicated Expand Buttons) */}
        <View className="px-6 pt-12 pb-3 flex-row items-center justify-between">
          <Text className="text-white font-bold text-3xl tracking-tight">
            Flashcards
          </Text>

          <TouchableOpacity
            onPress={openTtsSettings}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <Ionicons name="options-outline" size={28} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* VOICE MODEL SELECTOR (Voice 1, Voice 2, Voice 3) */}
        <View className="mt-1 mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 28 }}
          >
            {VOICE_MODELS.map((model) => {
              const isSelected = selectedModel.id === model.id;
              return (
                <TouchableOpacity
                  key={model.id}
                  onPress={() => {
                    triggerBounce();
                    selectVoiceModel(model.id);
                    speak("Para po, handa na ang biyahe.");
                  }}
                  activeOpacity={0.7}
                  className="py-2"
                >
                  <Text
                    className={`text-2xl font-bold ${
                      isSelected ? "text-white" : "text-[#52525B]"
                    }`}
                  >
                    {model.name}
                  </Text>
                  <Text
                    className={`text-base font-medium mt-0.5 ${
                      isSelected ? "text-[#A1A1AA]" : "text-[#3F3F46]"
                    }`}
                  >
                    {model.tagline}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Custom Message Input + ChatGPT Voice Mode Glowing Orb */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center border-b border-[#27272A] py-3">
            <TextInput
              value={customPrompt}
              onChangeText={setCustomPrompt}
              placeholder="Type custom message to speak..."
              placeholderTextColor="#52525B"
              className="flex-1 text-white text-2xl font-medium py-1"
              returnKeyType="done"
              onSubmitEditing={() => {
                triggerBounce();
                handleCustomPromptPlay();
              }}
            />
          </View>

          <View className="items-center justify-center mt-5">
            <VoiceOrb
              isSpeaking={isSpeaking}
              onPress={() => {
                triggerBounce();
                if (customPrompt.trim()) {
                  handleCustomPromptPlay();
                } else {
                  speak(activePreset.speech);
                }
              }}
              label={customPrompt.trim() ? "Speak Custom Message" : "Tap to Speak"}
              accentColor="#38BDF8"
              size="normal"
            />
          </View>
        </View>

        {/* Open Commuter Phrases List (Tap Row to Speak with Glow, Single Expand Icon) */}
        <View className="px-6">
          {FLASHCARD_PRESETS.map((preset, index) => {
            const isRowActive = isSpeaking && activeRowIndex === index;
            return (
              <View
                key={preset.label}
                className="py-5 flex-row items-center justify-between border-b border-[#18181B]"
              >
                <TouchableOpacity
                  onPress={() => {
                    setActiveRowIndex(index);
                    triggerBounce();
                    speak(preset.speech);
                  }}
                  activeOpacity={0.65}
                  className="flex-1 mr-4"
                >
                  <Text
                    style={{
                      textShadowColor: isRowActive ? preset.accent : "transparent",
                      textShadowRadius: isRowActive ? 20 : 0,
                    }}
                    className="text-white font-extrabold text-3xl"
                  >
                    {preset.phrase}
                  </Text>
                  <Text className="text-[#8E8E93] text-lg font-medium mt-1">
                    {preset.label}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    triggerBounce();
                    setSelectedPresetIndex(index);
                    setFlashcardVisible(true);
                  }}
                  hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                >
                  <Ionicons name="expand-outline" size={28} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* FULLSCREEN ANIMATED FLASHCARD MODAL + CHATGPT VOICE MODE ORB */}
        <Modal
          visible={flashcardVisible}
          animationType="fade"
          transparent={false}
          onRequestClose={() => setFlashcardVisible(false)}
        >
          <View className="flex-1 bg-[#000000] justify-between px-6 py-12">
            <StatusBar hidden />

            {/* Single Top-Right Close Icon */}
            <View className="flex-row justify-end items-center px-2">
              <TouchableOpacity
                onPress={() => setFlashcardVisible(false)}
                hitSlop={{ top: 18, bottom: 18, left: 18, right: 18 }}
              >
                <Ionicons name="close" size={40} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => {
                triggerBounce();
                speak(activePreset.speech);
              }}
              className="items-center justify-center my-auto"
            >
              <Animated.View
                style={{
                  transform: [{ scale: rowScale }],
                  alignItems: "center",
                }}
              >
                <FlashcardScene
                  sceneType={activePreset.id}
                  accentColor={activePreset.accent}
                  isSpeaking={isSpeaking}
                />

                <Text className="text-[#8E8E93] text-2xl font-bold uppercase tracking-widest text-center mt-6 mb-2">
                  {activePreset.label}
                </Text>
                <Text
                  style={{
                    textShadowColor: isSpeaking ? activePreset.accent : "transparent",
                    textShadowRadius: isSpeaking ? 28 : 0,
                  }}
                  className="text-white font-black text-6xl tracking-tight text-center leading-tight"
                >
                  {activePreset.phrase}
                </Text>
                <Text className="text-[#A1A1AA] text-2xl font-medium text-center mt-4">
                  {activePreset.subtext}
                </Text>
              </Animated.View>
            </TouchableOpacity>

            {/* Glowing Voice Orb + Paging Dots */}
            <View className="items-center gap-5 pb-2">
              <VoiceOrb
                isSpeaking={isSpeaking}
                onPress={() => {
                  triggerBounce();
                  speak(activePreset.speech);
                }}
                label="Tap to Speak"
                accentColor={activePreset.accent}
                size="large"
              />

              <View className="flex-row justify-center gap-3">
                {FLASHCARD_PRESETS.map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedPresetIndex(i)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className={`h-2.5 rounded-full ${
                      selectedPresetIndex === i ? "w-8 bg-white" : "w-2.5 bg-[#3F3F46]"
                    }`}
                  />
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}
