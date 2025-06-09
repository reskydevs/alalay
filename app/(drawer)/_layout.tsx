import "@/global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // const [loaded] = useFonts({
  //   SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  // });

  // if (!loaded) return null;

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
