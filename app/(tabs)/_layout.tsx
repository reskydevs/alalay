import "@/global.css";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16);
  const tabHeight = 56 + bottomPadding;

  useEffect(() => {
    Speech.speak(" ", {
      language: "en-US",
      rate: 1,
      volume: 0,
      onError: () => {},
    });
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#FFFFFF",
          tabBarInactiveTintColor: "#71717A",
          tabBarStyle: {
            backgroundColor: "#000000",
            borderTopColor: "#1C1C1E",
            borderTopWidth: 1,
            height: tabHeight,
            paddingBottom: bottomPadding,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            letterSpacing: 0.2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Commute",
            tabBarLabel: "Commute",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "speedometer" : "speedometer-outline"}
                size={22}
                color={focused ? "#FFFFFF" : color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="VoicePromptsTab"
          options={{
            title: "Communicate",
            tabBarLabel: "Communicate",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                size={22}
                color={focused ? "#FFFFFF" : color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="WebMapTab"
          options={{
            title: "Transit",
            tabBarLabel: "Transit",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "subway" : "subway-outline"}
                size={22}
                color={focused ? "#FFFFFF" : color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="IDCardTab"
          options={{
            title: "My ID",
            tabBarLabel: "My ID",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "wallet" : "wallet-outline"}
                size={22}
                color={focused ? "#FFFFFF" : color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
