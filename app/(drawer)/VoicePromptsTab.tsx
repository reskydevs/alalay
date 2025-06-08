import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useVoicePrompts } from "../logic/useVoicePrompts";

export default function VoicePromptsTab() {
  const {
    DEFAULT_PROMPTS,
    customPrompt,
    setCustomPrompt,
    speak,
    handleCustomPromptPlay,
  } = useVoicePrompts();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-start",
          paddingBottom: 24,
        }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={100}
        extraHeight={100}
        enableAutomaticScroll={true}
      >
        <View className="px-6 pt-6 bg-white">
          <View className="flex-row flex-wrap justify-between mb-3">
            {DEFAULT_PROMPTS.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => speak(prompt)}
                accessibilityRole="button"
                accessibilityLabel={`Play prompt: ${prompt}`}
                activeOpacity={0.7}
                className="w-[48%] bg-[#f4f8fb] rounded-xl p-4 mb-6 items-center shadow-sm"
                style={{
                  elevation: 1,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  shadowOffset: { width: 0, height: 1 },
                }}
              >
                <MaterialCommunityIcons
                  name="volume-high"
                  size={32}
                  color="#0a7ea4"
                  style={{ marginBottom: 8 }}
                />
                <Text className="text-[16px] text-[#222] text-center">
                  {prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="bg-white border-t border-gray-200 px-6 pb-6 pt-1.5">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-gray-50 mr-3"
              placeholder="Custom Voice Prompt"
              value={customPrompt}
              onChangeText={setCustomPrompt}
              returnKeyType="done"
              blurOnSubmit
            />
            <TouchableOpacity
              onPress={handleCustomPromptPlay}
              disabled={!customPrompt.trim()}
              accessibilityRole="button"
              accessibilityLabel="Play custom prompt"
              activeOpacity={0.7}
              className="justify-center items-center"
            >
              <MaterialCommunityIcons
                name="play-circle"
                size={40}
                color={customPrompt.trim() ? "#0a7ea4" : "#ccc"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}
