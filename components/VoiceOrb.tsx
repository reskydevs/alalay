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
  accentColor = "#E82127",
  size = "large",
}: VoiceOrbProps) {
  // Fluid breathing aura animations
  const outerAuraScale = useRef(new Animated.Value(1)).current;
  const outerAuraOpacity = useRef(new Animated.Value(0)).current;
  const midAuraScale = useRef(new Animated.Value(1)).current;
  const midAuraOpacity = useRef(new Animated.Value(0)).current;
  const coreScale = useRef(new Animated.Value(1)).current;

  // Soundwave harmonic frequency bars (ChatGPT Voice Mode style)
  const bar1 = useRef(new Animated.Value(0.35)).current;
  const bar2 = useRef(new Animated.Value(0.65)).current;
  const bar3 = useRef(new Animated.Value(0.95)).current;
  const bar4 = useRef(new Animated.Value(0.55)).current;
  const bar5 = useRef(new Animated.Value(0.4)).current;

  // Idle gentle breathing pulse
  const idlePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let idleLoop: Animated.CompositeAnimation | null = null;
    let speakingLoop: Animated.CompositeAnimation | null = null;
    let barLoops: Animated.CompositeAnimation[] = [];

    if (isSpeaking) {
      idlePulse.setValue(1);

      // Outer Bloom Aura
      const outerLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(outerAuraScale, {
              toValue: 1.75,
              duration: 900,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(outerAuraScale, {
              toValue: 1.15,
              duration: 900,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(outerAuraOpacity, {
              toValue: 0.45,
              duration: 900,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(outerAuraOpacity, {
              toValue: 0.1,
              duration: 900,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      // Mid Corona Aura (harmonic offset)
      const midLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(midAuraScale, {
              toValue: 1.4,
              duration: 650,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(midAuraScale, {
              toValue: 1.05,
              duration: 650,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(midAuraOpacity, {
              toValue: 0.7,
              duration: 650,
              useNativeDriver: true,
            }),
            Animated.timing(midAuraOpacity, {
              toValue: 0.25,
              duration: 650,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      // Core Sphere organic breathing
      const coreLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(coreScale, {
            toValue: 1.08,
            duration: 450,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(coreScale, {
            toValue: 0.96,
            duration: 450,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );

      // 5-bar voice frequency equalizer
      const animateBar = (bar: Animated.Value, speed: number, minH: number, maxH: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: maxH,
              duration: speed,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(bar, {
              toValue: minH,
              duration: speed,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );

      const b1 = animateBar(bar1, 240, 0.25, 0.85);
      const b2 = animateBar(bar2, 310, 0.35, 1.0);
      const b3 = animateBar(bar3, 210, 0.45, 1.15);
      const b4 = animateBar(bar4, 280, 0.3, 0.95);
      const b5 = animateBar(bar5, 230, 0.2, 0.8);

      barLoops = [b1, b2, b3, b4, b5];
      speakingLoop = Animated.parallel([outerLoop, midLoop, coreLoop]);

      speakingLoop.start();
      barLoops.forEach((b) => b.start());
    } else {
      // Idle state: gentle celestial pulse
      outerAuraScale.setValue(1);
      outerAuraOpacity.setValue(0);
      midAuraScale.setValue(1);
      midAuraOpacity.setValue(0);
      coreScale.setValue(1);

      idleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(idlePulse, {
            toValue: 1.04,
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(idlePulse, {
            toValue: 1.0,
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      idleLoop.start();
    }

    return () => {
      idleLoop?.stop();
      speakingLoop?.stop();
      barLoops.forEach((b) => b.stop());
    };
  }, [
    isSpeaking,
    bar1,
    bar2,
    bar3,
    bar4,
    bar5,
    coreScale,
    idlePulse,
    midAuraOpacity,
    midAuraScale,
    outerAuraOpacity,
    outerAuraScale,
  ]);

  const orbDiameter = size === "large" ? 82 : 60;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      className="items-center justify-center my-3"
      hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }}
    >
      <View
        style={{
          width: orbDiameter * 1.8,
          height: orbDiameter * 1.8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Layer 1: Outermost Ethereal Bloom Halo */}
        <Animated.View
          style={{
            position: "absolute",
            width: orbDiameter * 1.7,
            height: orbDiameter * 1.7,
            borderRadius: (orbDiameter * 1.7) / 2,
            backgroundColor: accentColor,
            opacity: outerAuraOpacity,
            transform: [{ scale: outerAuraScale }],
          }}
        />

        {/* Layer 2: Mid-Tier Radiant Corona */}
        <Animated.View
          style={{
            position: "absolute",
            width: orbDiameter * 1.35,
            height: orbDiameter * 1.35,
            borderRadius: (orbDiameter * 1.35) / 2,
            backgroundColor: accentColor,
            opacity: midAuraOpacity,
            transform: [{ scale: midAuraScale }],
          }}
        />

        {/* Layer 3: Central Ethereal Orb */}
        <Animated.View
          style={{
            width: orbDiameter,
            height: orbDiameter,
            borderRadius: orbDiameter / 2,
            backgroundColor: isSpeaking ? "#111113" : "#18181B",
            borderWidth: 2,
            borderColor: isSpeaking ? accentColor : "#27272A",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: accentColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isSpeaking ? 0.95 : 0.3,
            shadowRadius: isSpeaking ? 28 : 10,
            elevation: isSpeaking ? 20 : 6,
            transform: [{ scale: isSpeaking ? coreScale : idlePulse }],
          }}
        >
          {isSpeaking ? (
            /* Equalizer bars inside active glowing orb */
            <View className="flex-row items-center justify-center gap-1.5 px-3">
              {[bar1, bar2, bar3, bar4, bar5].map((bar, idx) => (
                <Animated.View
                  key={idx}
                  style={{
                    width: size === "large" ? 4.5 : 3.5,
                    height: size === "large" ? 34 : 24,
                    borderRadius: 3,
                    backgroundColor: "#FFFFFF",
                    shadowColor: accentColor,
                    shadowRadius: 8,
                    shadowOpacity: 1,
                    transform: [{ scaleY: bar }],
                  }}
                />
              ))}
            </View>
          ) : (
            /* Sleek speaker glyph when idle */
            <Ionicons
              name="volume-high"
              size={size === "large" ? 34 : 26}
              color="#FFFFFF"
            />
          )}
        </Animated.View>
      </View>

      {/* Label with dynamic glow when active */}
      {label ? (
        <Text
          style={{
            textShadowColor: isSpeaking ? accentColor : "transparent",
            textShadowRadius: isSpeaking ? 16 : 0,
            textShadowOffset: { width: 0, height: 0 },
          }}
          className={`font-bold uppercase tracking-widest mt-1 text-sm ${
            isSpeaking ? "text-white" : "text-[#71717A]"
          }`}
        >
          {isSpeaking ? "Speaking..." : label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}
