import "@/global.css";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform } from "react-native";

export default function TabLayout() {
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
            height: Platform.OS === "android" ? 64 : 80,
            paddingBottom: Platform.OS === "android" ? 10 : 20,
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
          name="WebMapTab"
          options={{
            title: "Navigation",
            tabBarLabel: "Navigation",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "navigate" : "navigate-outline"}
                size={22}
                color={focused ? "#FFFFFF" : color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="VoicePromptsTab"
          options={{
            title: "Flashcards",
            tabBarLabel: "Flashcards",
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
          name="IDCardTab"
          options={{
            title: "ID Vault",
            tabBarLabel: "ID Vault",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "shield-checkmark" : "shield-checkmark-outline"}
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
