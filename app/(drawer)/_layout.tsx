import "@/global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // const [loaded] = useFonts({
  //   SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  // });

  // if (!loaded) return null;

  useEffect(() => {
    console.log("[TTS] Warming up Expo Speech engine...");
    Speech.speak(" ", {
      language: "fil-PH",
      rate: 1,
      volume: 0,
      onDone: () => console.log("[TTS] Speech engine warm-up complete."),
      onError: (err) => console.error("[TTS] Speech engine warm-up error:", err),
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerType: "slide",
          drawerActiveTintColor: "#27ae60",
        }}
        // dark={colorScheme === "dark"}
        // theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <Drawer.Screen name="index" options={{ title: "PUV" }} />
        <Drawer.Screen name="IDCardTab" options={{ title: "ID Card" }} />
        <Drawer.Screen
          name="VoicePromptsTab"
          options={{ title: "Voice Prompts" }}
        />
      </Drawer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
