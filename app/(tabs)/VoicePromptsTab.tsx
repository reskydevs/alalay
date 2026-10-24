import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Keyboard,
  Modal,
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
  { english: "STOP HERE", phrase: "PARA PO!", subtext: "Drop-off at the nearest curbside", speech: "Para po! Bababa na po ako sa tabi. Maraming salamat po." },
  { english: "PASSING FARE", phrase: "BAYAD PO!", subtext: "Please pass payment to the driver", speech: "Bayad po! Pakiabot po sa driver. Maraming salamat po." },
  { english: "SAFE DROP-OFF", phrase: "SA TABI LANG PO!", subtext: "Pull over at the corner or stop", speech: "Dito na lang po sa may tabi o tawiran. Salamat po." },
  { english: "20% DISCOUNT", phrase: "PWD / SENIOR PO!", subtext: "Statutory Republic Act 9442 & 9994", speech: "May legal discount po ako bilang P-W-D o Senior Citizen. Bayad po." },
  { english: "CHANGE PLEASE", phrase: "SUKLI PO!", subtext: "Please pass back my change", speech: "Pakiabot po ang aking sukli. Maraming salamat po." },
];

export default function VoicePromptsTab() {
  const {
    customPrompt,
    setCustomPrompt,
    isSpeaking,
    voiceGender,
    setVoiceGender,
    filipinoVoicesCount,
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
          justifyContent: "flex-start",
          paddingBottom: 48,
        }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={100}
        extraHeight={100}
        enableAutomaticScroll={true}
      >
        <StatusBar barStyle="light-content" />

        {/* Top Header */}
        <View className="px-5 pt-12 pb-4 bg-[#000000] border-b border-[#1C1C1E]">
          <Text className="text-white font-extrabold text-2xl tracking-tight">
            Flashcards & Voice
          </Text>
          <Text className="text-[#8E8E93] text-xs font-medium mt-0.5">
            Neural Human Speech Engine • Visual Beacon Flashcards
          </Text>
        </View>

        <View className="px-5 pt-4">
          {/* TESLA VOICE MODEL TELEMETRY CARD */}
          <View className="bg-[#121214] rounded-3xl p-4 border border-[#27272A] shadow-xl mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="account-voice" size={18} color="#FFFFFF" />
                <Text className="text-white text-xs font-bold uppercase tracking-wider ml-2">
                  Human Voice Model
                </Text>
              </View>

              <TouchableOpacity
                onPress={openTtsSettings}
                className="bg-[#1C1C1E] px-2.5 py-1 rounded-full border border-[#27272A] flex-row items-center"
              >
                <View
                  className={`w-2 h-2 rounded-full mr-1.5 ${
                    filipinoVoicesCount > 0 ? "bg-[#10B981]" : "bg-[#F59E0B]"
                  }`}
                />
                <Text className="text-[#A1A1AA] text-[10px] font-semibold">
                  {filipinoVoicesCount > 0 ? "Neural Voice Ready" : "TTS Settings ↗"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Gender Toggle: Maria (Female) vs Juan (Male) */}
            <View className="flex-row bg-[#1C1C1E] p-1 rounded-2xl border border-[#27272A]">
              <TouchableOpacity
                onPress={() => setVoiceGender("female")}
                activeOpacity={0.7}
                className={`flex-1 py-2.5 rounded-xl items-center ${
                  voiceGender === "female" ? "bg-white" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-xs font-bold uppercase tracking-wider ${
                    voiceGender === "female" ? "text-black" : "text-[#71717A]"
                  }`}
                >
                  👩 Maria (Natural Female)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setVoiceGender("male")}
                activeOpacity={0.7}
                className={`flex-1 py-2.5 rounded-xl items-center ${
                  voiceGender === "male" ? "bg-white" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-xs font-bold uppercase tracking-wider ${
                    voiceGender === "male" ? "text-black" : "text-[#71717A]"
                  }`}
                >
                  👨 Juan (Natural Male)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Flashcard Launcher */}
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch {}
              setFlashcardVisible(true);
            }}
            activeOpacity={0.85}
            className="bg-[#121214] rounded-3xl p-5 flex-row items-center justify-between mb-6 border border-[#27272A] shadow-xl"
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View className="bg-[#1C1C1E] p-3 rounded-2xl mr-3.5 border border-[#27272A]">
                <MaterialCommunityIcons name="card-text-outline" size={26} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-extrabold text-base tracking-tight">
                  Visual Beacon Flashcard
                </Text>
                <Text className="text-[#8E8E93] text-xs font-medium mt-0.5">
                  High-contrast fullscreen view for drivers
                </Text>
              </View>
            </View>
            <View className="bg-[#FFFFFF] px-3.5 py-2 rounded-xl">
              <Text className="text-[#000000] font-black text-xs uppercase tracking-wider">
                Open
              </Text>
            </View>
          </TouchableOpacity>

          {/* Audio Commuter Prompts */}
          <Text className="text-[#8E8E93] text-xs font-bold uppercase tracking-wider mb-3">
            Natural Audio Prompts (Tap to Speak)
          </Text>

          <View className="bg-[#121214] rounded-3xl border border-[#27272A] overflow-hidden mb-6">
            {FLASHCARD_PRESETS.map((preset, index) => (
              <TouchableOpacity
                key={preset.english}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  speak(preset.speech);
                }}
                activeOpacity={0.7}
                className={`p-4 flex-row items-center justify-between ${
                  index < FLASHCARD_PRESETS.length - 1 ? "border-b border-[#1C1C1E]" : ""
                }`}
              >
                <View className="flex-1 mr-3">
                  <Text className="text-[#8E8E93] text-[10px] font-bold uppercase tracking-wider">
                    {preset.english}
                  </Text>
                  <Text className="text-white font-bold text-base mt-0.5">
                    {preset.phrase}
                  </Text>
                  <Text className="text-[#71717A] text-xs mt-0.5">
                    {preset.subtext}
                  </Text>
                </View>

                <View className="w-10 h-10 rounded-full bg-[#1C1C1E] items-center justify-center border border-[#27272A]">
                  <Ionicons name="volume-high" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Speech Synthesizer */}
          <Text className="text-[#8E8E93] text-xs font-bold uppercase tracking-wider mb-3">
            Custom Message Synthesizer
          </Text>

          <View className="bg-[#121214] rounded-3xl p-5 border border-[#27272A]">
            <TextInput
              value={customPrompt}
              onChangeText={setCustomPrompt}
              placeholder="Type any message to speak aloud in natural Filipino..."
              placeholderTextColor="#71717A"
              className="bg-[#1C1C1E] text-white p-4 rounded-2xl text-sm border border-[#27272A] min-h-[90px] mb-4"
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              onPress={handleCustomPromptPlay}
              activeOpacity={0.8}
              className="w-full bg-[#FFFFFF] py-4 rounded-2xl items-center justify-center flex-row shadow-lg"
            >
              <Ionicons name="volume-medium" size={20} color="#000000" />
              <Text className="text-[#000000] font-black text-sm uppercase tracking-wider ml-2">
                Speak Custom Message
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FULLSCREEN FLASHCARD MODAL */}
        <Modal
          visible={flashcardVisible}
          animationType="fade"
          transparent={false}
          onRequestClose={() => setFlashcardVisible(false)}
        >
          <View className="flex-1 bg-[#000000] justify-between p-8 pt-12">
            <StatusBar hidden />

            <View className="flex-row justify-between items-center">
              <View className="bg-[#1C1C1E] px-4 py-2 rounded-full border border-[#27272A]">
                <Text className="text-[#A1A1AA] text-xs font-bold uppercase tracking-wider">
                  {activePreset.english}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setFlashcardVisible(false)}
                className="w-12 h-12 rounded-full bg-[#FFFFFF] items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <View className="items-center justify-center my-auto">
              <Text className="text-[#8E8E93] text-xl font-bold uppercase tracking-widest text-center mb-3">
                {activePreset.english}
              </Text>
              <Text className="text-white font-black text-6xl tracking-tight text-center leading-tight">
                {activePreset.phrase}
              </Text>
              <Text className="text-[#A1A1AA] text-lg font-medium text-center mt-6">
                {activePreset.subtext}
              </Text>
            </View>

            {/* Bottom Slider & Actions */}
            <View className="gap-3">
              <View className="flex-row justify-center gap-2 mb-2">
                {FLASHCARD_PRESETS.map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedPresetIndex(i)}
                    className={`h-2 rounded-full ${
                      selectedPresetIndex === i ? "w-8 bg-white" : "w-2 bg-[#3F3F46]"
                    }`}
                  />
                ))}
              </View>

              <TouchableOpacity
                onPress={() => speak(activePreset.speech)}
                className="w-full bg-[#FFFFFF] py-4 rounded-2xl items-center justify-center flex-row"
              >
                <Ionicons name="volume-high" size={20} color="#000000" />
                <Text className="text-black font-black text-sm uppercase tracking-wider ml-2">
                  Speak This Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFlashcardVisible(false)}
                className="w-full bg-[#1C1C1E] py-4 rounded-2xl items-center justify-center border border-[#27272A]"
              >
                <Text className="text-white font-bold text-sm uppercase tracking-wider">
                  Dismiss
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}
