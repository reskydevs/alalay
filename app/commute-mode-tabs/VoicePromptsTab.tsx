// VoicePromptsTab: Placeholder for voice prompts UI
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const DEFAULT_PROMPTS = [
  "Para po!",
  "Bayad po!",
  "Bayad po, bababa po ako.",
  "Pakiabot po ng bayad",
  "Pakiabot po ng sukli",
  "Salamat po!",
];

export default function VoicePromptsTab() {
  const [customPrompt, setCustomPrompt] = React.useState("");
  const handlePlayPrompt = (text: string) => {
    Speech.speak(text, {
      language: "fil-PH",
      rate: 0.9,
      pitch: 1.1,
      volume: 1.0,
      onStart: () => console.log("Speech started"),
      onDone: () => console.log("Speech finished"),
      onError: (err) => console.log("Speech error", err),
    });
  };

  return (
    // Dismiss keyboard when tapping outside input
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: '#fff' }}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={100} // Ensure input is visible above keyboard
        extraHeight={100} // Also try extraHeight for more robust avoidance
        enableAutomaticScroll={true}
      >
        <View style={styles.container}>
          {/* 2-column grid of default prompts as BUTTONS */}
          <View style={styles.promptGrid}>
            {DEFAULT_PROMPTS.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.promptButton}
                onPress={() => handlePlayPrompt(prompt)}
                accessibilityRole="button"
                accessibilityLabel={`Play prompt: ${prompt}`}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="volume-high"
                  size={32}
                  color="#0a7ea4"
                  style={{ marginBottom: 8 }}
                />
                <Text style={styles.promptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Custom prompt input row as last item in scroll view */}
        <View style={styles.customPromptRowWrapper}>
          <View style={styles.customPromptRow}>
            <TextInput
              style={styles.customPromptInput}
              placeholder="Custom Voice Prompt"
              value={customPrompt}
              onChangeText={setCustomPrompt}
              returnKeyType="done"
              blurOnSubmit={true}
            />
            <TouchableOpacity
              style={styles.customPromptPlay}
              onPress={() => customPrompt.trim() && handlePlayPrompt(customPrompt)}
              disabled={!customPrompt.trim()}
              accessibilityRole="button"
              accessibilityLabel="Play custom prompt"
              activeOpacity={0.7}
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

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 24, // More padding to avoid last grid row being hidden
  },
  container: {
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "flex-start",
  },
  promptGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  promptButton: {
    width: "48%",
    backgroundColor: "#f4f8fb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  promptText: {
    fontSize: 16,
    color: "#222",
    textAlign: "center",
  },
  customPromptRowWrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 6,
  },
  customPromptRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  customPromptInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
    marginRight: 12,
  },
  customPromptPlay: {
    justifyContent: "center",
    alignItems: "center",
  },
});