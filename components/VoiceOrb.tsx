import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";

interface VoiceOrbProps {
  isSpeaking: boolean;
  onPress: () => void;
  label?: string;
  accentColor?: string;
  size?: "normal" | "large";
}

export default function VoiceOrb({
  isSpeaking,
  onPress,
  label = "Tap to Speak",
  accentColor = "#38BDF8",
  size = "large",
}: VoiceOrbProps) {
  const glowScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.25)).current;
  const bar1 = useRef(new Animated.Value(0.3)).current;
  const bar2 = useRef(new Animated.Value(0.6)).current;
  const bar3 = useRef(new Animated.Value(0.9)).current;
  const bar4 = useRef(new Animated.Value(0.5)).current;
  const bar5 = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    if (isSpeaking) {
      const auraLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(glowScale, {
              toValue: 1.38,
              duration: 650,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(glowScale, {
              toValue: 1.0,
              duration: 650,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(glowOpacity, {
              toValue: 0.65,
              duration: 650,
              useNativeDriver: true,
            }),
            Animated.timing(glowOpacity, {
              toValue: 0.18,
              duration: 650,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      const animateBar = (bar: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: 1,
              duration: 260 + delay,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(bar, {
              toValue: 0.25,
              duration: 260 + delay,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );

      const b1 = animateBar(bar1, 0);
      const b2 = animateBar(bar2, 70);
      const b3 = animateBar(bar3, 130);
      const b4 = animateBar(bar4, 50);
      const b5 = animateBar(bar5, 110);

      auraLoop.start();
      b1.start();
      b2.start();
      b3.start();
      b4.start();
      b5.start();

      return () => {
        auraLoop.stop();
        b1.stop();
        b2.stop();
        b3.stop();
        b4.stop();
        b5.stop();
      };
    } else {
      glowScale.setValue(1);
      glowOpacity.setValue(0);
      bar1.setValue(0.3);
      bar2.setValue(0.5);
      bar3.setValue(0.7);
      bar4.setValue(0.5);
      bar5.setValue(0.3);
    }
  }, [isSpeaking, bar1, bar2, bar3, bar4, bar5, glowOpacity, glowScale]);

  const orbDimension = size === "large" ? 76 : 56;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="items-center justify-center my-2"
      hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}
    >
      <View className="items-center justify-center">
        {/* Outer Glowing Aura Ring (ChatGPT Voice Mode Effect) */}
        {isSpeaking && (
          <Animated.View
            style={{
              position: "absolute",
              width: orbDimension * 1.45,
              height: orbDimension * 1.45,
              borderRadius: orbDimension,
              backgroundColor: accentColor,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            }}
          />
        )}

        {/* Core Voice Mode Sphere */}
        <View
          style={{
            width: orbDimension,
            height: orbDimension,
            borderRadius: orbDimension / 2,
            backgroundColor: isSpeaking ? "#FFFFFF" : "#18181B",
            shadowColor: isSpeaking ? accentColor : "#000000",
            shadowOpacity: isSpeaking ? 0.9 : 0,
            shadowRadius: 24,
            elevation: isSpeaking ? 16 : 0,
          }}
          className="items-center justify-center flex-row gap-1.5"
        >
          {isSpeaking ? (
            [bar1, bar2, bar3, bar4, bar5].map((bar, idx) => (
              <Animated.View
                key={idx}
                style={{
                  width: 4.5,
                  height: size === "large" ? 32 : 24,
                  borderRadius: 4,
                  backgroundColor: "#000000",
                  transform: [{ scaleY: bar }],
                }}
              />
            ))
          ) : (
            <Ionicons
              name="volume-high"
              size={size === "large" ? 34 : 26}
              color="#FFFFFF"
            />
          )}
        </View>
      </View>

      {label ? (
        <Text
          className={`font-bold uppercase tracking-widest mt-3 ${
            size === "large" ? "text-base" : "text-xs"
          } ${isSpeaking ? "text-white" : "text-[#A1A1AA]"}`}
        >
          {isSpeaking ? "Speaking..." : label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}
