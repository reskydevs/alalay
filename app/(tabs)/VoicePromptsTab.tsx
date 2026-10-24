import FlashcardScene from "@/components/FlashcardScene";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
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

const FLASHCARD_PRESETS = [
  {
    label: "STOP HERE",
    phrase: "PARA PO!",
    subtext: "Unloading at the curb",
    speech: "Para po! Bababa na po ako sa tabi. Maraming salamat po.",
    accent: "#E82127",
  },
  {
    label: "PASSING FARE",
    phrase: "BAYAD PO!",
    subtext: "Please pass to the driver",
    speech: "Bayad po! Pakiabot po sa driver. Maraming salamat po.",
    accent: "#2563EB",
  },
  {
    label: "SAFE DROP-OFF",
    phrase: "SA TABI LANG!",
    subtext: "Drop off at the corner",
    speech: "Dito na lang po sa may tabi o tawiran. Salamat po.",
    accent: "#E82127",
  },
  {
    label: "20% DISCOUNT",
    phrase: "PWD / SENIOR",
    subtext: "Statutory 20% discount",
    speech: "May legal discount po ako bilang P-W-D o Senior Citizen. Bayad po.",
    accent: "#16A34A",
  },
  {
    label: "CHANGE PLEASE",
    phrase: "SUKLI PO!",
    subtext: "Waiting for fare change",
    speech: "Pakiabot po ang aking sukli. Maraming salamat po.",
    accent: "#D97706",
  },
];

export default function VoicePromptsTab() {
  const {
    VOICE_MODELS,
    selectedModel,
    selectVoiceModel,
    customPrompt,
    setCustomPrompt,
    openTtsSettings,
    speak,
    handleCustomPromptPlay,
  } = useVoicePrompts();

  const [flashcardVisible, setFlashcardVisible] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  const activePreset = FLASHCARD_PRESETS[selectedPresetIndex];

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

        {/* Minimalist Header */}
        <View className="px-6 pt-12 pb-4 flex-row items-center justify-between">
          <Text className="text-white font-bold text-3xl tracking-tight">
            Flashcards
          </Text>

          <View className="flex-row items-center gap-6">
            <TouchableOpacity
              onPress={() => setFlashcardVisible(true)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="expand-outline" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openTtsSettings}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="options-outline" size={26} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>

        {/* VOICE PERSONALITY SELECTOR (Juan, Amihan, Tala, Bagwis, Sinag) */}
        <View className="mt-2 mb-6">
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
                    className={`text-sm font-medium mt-0.5 ${
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

        {/* Custom Speech Input (Clean Bottom Line — No Box) */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center border-b border-[#27272A] py-3">
            <TextInput
              value={customPrompt}
              onChangeText={setCustomPrompt}
              placeholder="Type custom phrase to speak..."
              placeholderTextColor="#52525B"
              className="flex-1 text-white text-xl font-medium py-1"
              returnKeyType="done"
              onSubmitEditing={handleCustomPromptPlay}
            />
            <TouchableOpacity
              onPress={handleCustomPromptPlay}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              className="ml-4"
            >
              <Ionicons name="volume-high" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Open Commuter Phrases List (Large Typography, Frameless Icons) */}
        <View className="px-6">
          {FLASHCARD_PRESETS.map((preset, index) => (
            <View
              key={preset.label}
              className="py-5 flex-row items-center justify-between border-b border-[#18181B]"
            >
              <TouchableOpacity
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  speak(preset.speech);
                }}
                activeOpacity={0.6}
                className="flex-1 mr-4"
              >
                <Text className="text-white font-extrabold text-2xl">
                  {preset.phrase}
                </Text>
                <Text className="text-[#8E8E93] text-base font-medium mt-1">
                  {preset.label}
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center gap-6">
                <TouchableOpacity
                  onPress={() => speak(preset.speech)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons name="volume-medium-outline" size={28} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setSelectedPresetIndex(index);
                    setFlashcardVisible(true);
                  }}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons name="expand-outline" size={26} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* FULLSCREEN ANIMATED FLASHCARD MODAL */}
        <Modal
          visible={flashcardVisible}
          animationType="fade"
          transparent={false}
          onRequestClose={() => setFlashcardVisible(false)}
        >
          <View className="flex-1 bg-[#000000] justify-between px-6 py-12">
            <StatusBar hidden />

            <View className="flex-row justify-between items-center px-2">
              <TouchableOpacity
                onPress={() => speak(activePreset.speech)}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              >
                <Ionicons name="volume-high" size={36} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFlashcardVisible(false)}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              >
                <Ionicons name="close" size={38} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => speak(activePreset.speech)}
              className="items-center justify-center my-auto"
            >
              <FlashcardScene accentColor={activePreset.accent} />

              <Text className="text-[#8E8E93] text-2xl font-bold uppercase tracking-widest text-center mt-6 mb-2">
                {activePreset.label}
              </Text>
              <Text className="text-white font-black text-6xl tracking-tight text-center leading-tight">
                {activePreset.phrase}
              </Text>
              <Text className="text-[#A1A1AA] text-2xl font-medium text-center mt-4">
                {activePreset.subtext}
              </Text>
            </TouchableOpacity>

            {/* Paging Dots */}
            <View className="flex-row justify-center gap-3 pb-4">
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
        </Modal>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}
