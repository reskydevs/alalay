import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import MaterialCommunityIcons from "react-native-paper/src/components/MaterialCommunityIcon";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <PaperProvider theme={MD3LightTheme}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: "absolute",
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="CommuteModeScreen"
          options={{
            title: "Commute Mode",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="bus"
                color={color}
                size={size ?? 28}
                direction="ltr"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="InstructionsScreen"
          options={{
            title: "Instructions",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="book-open-variant"
                color={color}
                size={size ?? 28}
                direction="ltr"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="SettingsScreen"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="cog"
                color={color}
                size={size ?? 28}
                direction="ltr"
              />
            ),
          }}
        />
      </Tabs>
    </PaperProvider>
  );
}
