import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";

export type SceneType = "stop" | "payment" | "discount" | "change" | "curbside";

interface FlashcardSceneProps {
  sceneType?: SceneType;
  accentColor?: string;
  isSpeaking?: boolean;
}

export default function FlashcardScene({
  sceneType = "stop",
  accentColor = "#E82127",
  isSpeaking = false,
}: FlashcardSceneProps) {
  const primaryMotion = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    primaryMotion.setValue(0);
    const motionLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(primaryMotion, {
          toValue: 1,
          duration: isSpeaking ? 420 : 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(primaryMotion, {
          toValue: 0,
          duration: isSpeaking ? 420 : 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: isSpeaking ? 1.28 : 1.14,
            duration: isSpeaking ? 450 : 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: isSpeaking ? 450 : 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: isSpeaking ? 0.75 : 0.45,
            duration: isSpeaking ? 450 : 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.15,
            duration: isSpeaking ? 450 : 900,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    motionLoop.start();
    pulseLoop.start();

    return () => {
      motionLoop.stop();
      pulseLoop.stop();
    };
  }, [isSpeaking, primaryMotion, pulseOpacity, pulseScale, sceneType]);

  const translateY = primaryMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const translateX = primaryMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 12],
  });

  return (
    <View className="w-full h-48 items-center justify-center overflow-hidden my-1">
      {/* Radiant Background Pulse */}
      <Animated.View
        style={{
          position: "absolute",
          width: 156,
          height: 156,
          borderRadius: 78,
          backgroundColor: accentColor,
          opacity: pulseOpacity,
          transform: [{ scale: pulseScale }],
        }}
      />

      {/* 1. STOP HERE (PARA PO!) — Raised Hand Gesture + Braking Beacon */}
      {sceneType === "stop" && (
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Svg width="240" height="175" viewBox="0 0 240 175">
            {/* Outer Stop Octagon Badge */}
            <Polygon
              points="88,18 152,18 182,48 182,112 152,142 88,142 58,112 58,48"
              fill="#E82127"
            />
            {/* Bold Flat-Art Raised Open Hand (PARA Gesture) */}
            <G>
              {/* Palm */}
              <Rect x="94" y="74" width="52" height="46" rx="14" fill="#FACC15" />
              {/* 4 Raised Fingers */}
              <Rect x="94" y="36" width="10" height="46" rx="5" fill="#FACC15" />
              <Rect x="108" y="28" width="10" height="52" rx="5" fill="#FACC15" />
              <Rect x="122" y="31" width="10" height="50" rx="5" fill="#FACC15" />
              <Rect x="136" y="40" width="10" height="42" rx="5" fill="#FACC15" />
              {/* Extended Thumb */}
              <Path
                d="M96 92 L74 78 C70 75 72 68 78 70 L98 80 Z"
                fill="#FACC15"
              />
              {/* Wrist Cuff */}
              <Rect x="102" y="116" width="36" height="16" rx="4" fill="#2563EB" />
            </G>
            {/* Curbside Road Line */}
            <Rect x="30" y="156" width="180" height="6" rx="3" fill="#FACC15" />
          </Svg>
        </Animated.View>
      )}

      {/* 2. PASSING FARE (BAYAD PO!) — Cash Bill + Peso Coins Passing Forward */}
      {sceneType === "payment" && (
        <Animated.View style={{ transform: [{ translateX }] }}>
          <Svg width="260" height="175" viewBox="0 0 260 175">
            {/* Crisp Peso Banknote */}
            <Rect x="42" y="42" width="145" height="78" rx="10" fill="#16A34A" />
            <Rect x="52" y="52" width="125" height="58" rx="6" fill="#22C55E" />
            <Circle cx="114" cy="81" r="20" fill="#15803D" />
            <SvgText
              x="114"
              y="89"
              fill="#FAFAFA"
              fontSize="24"
              fontWeight="bold"
              textAnchor="middle"
            >
              ₱
            </SvgText>

            {/* Golden Peso Coin Overlapping */}
            <Circle cx="186" cy="105" r="30" fill="#EAB308" />
            <Circle cx="186" cy="105" r="23" fill="#FACC15" />
            <SvgText
              x="186"
              y="114"
              fill="#18181B"
              fontSize="24"
              fontWeight="bold"
              textAnchor="middle"
            >
              ₱
            </SvgText>

            {/* Forward Motion Chevrons */}
            <Path
              d="M225 65 L238 78 L225 91"
              stroke="#FACC15"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
      )}

      {/* 3. 20% DISCOUNT (PWD / SENIOR) — Verified ID Card & -20% Badge */}
      {sceneType === "discount" && (
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Svg width="260" height="175" viewBox="0 0 260 175">
            {/* ID Pass Card */}
            <Rect x="36" y="34" width="164" height="104" rx="14" fill="#1E293B" />
            <Rect x="36" y="34" width="164" height="28" rx="10" fill="#2563EB" />
            {/* Avatar Silhouette */}
            <Circle cx="74" cy="92" r="16" fill="#FACC15" />
            <Path d="M54 124 C54 108 94 108 94 124 Z" fill="#38BDF8" />
            {/* ID Lines */}
            <Rect x="106" y="78" width="74" height="10" rx="5" fill="#F8FAFC" />
            <Rect x="106" y="96" width="52" height="8" rx="4" fill="#94A3B8" />

            {/* Bold -20% Discount Pill Badge */}
            <Circle cx="198" cy="112" r="34" fill="#16A34A" />
            <SvgText
              x="198"
              y="119"
              fill="#FFFFFF"
              fontSize="21"
              fontWeight="bold"
              textAnchor="middle"
            >
              -20%
            </SvgText>
          </Svg>
        </Animated.View>
      )}

      {/* 4. CHANGE PLEASE (SUKLI PO!) — Golden Coins Dropping Into Open Hand */}
      {sceneType === "change" && (
        <View className="items-center justify-center">
          <Animated.View style={{ transform: [{ translateY }] }}>
            <Svg width="240" height="95" viewBox="0 0 240 95">
              {/* 3 Gleaming Coins */}
              <Circle cx="82" cy="48" r="22" fill="#FACC15" />
              <SvgText
                x="82"
                y="55"
                fill="#18181B"
                fontSize="18"
                fontWeight="bold"
                textAnchor="middle"
              >
                ₱5
              </SvgText>

              <Circle cx="126" cy="30" r="25" fill="#EAB308" />
              <SvgText
                x="126"
                y="38"
                fill="#18181B"
                fontSize="20"
                fontWeight="bold"
                textAnchor="middle"
              >
                ₱10
              </SvgText>

              <Circle cx="168" cy="52" r="20" fill="#FACC15" />
              <SvgText
                x="168"
                y="59"
                fill="#18181B"
                fontSize="17"
                fontWeight="bold"
                textAnchor="middle"
              >
                ₱1
              </SvgText>
            </Svg>
          </Animated.View>

          {/* Open Receiving Hand Underneath */}
          <Svg width="240" height="70" viewBox="0 0 240 70">
            <Path
              d="M52 28 C72 48 168 48 190 24 C196 18 204 26 196 36 C172 62 68 62 44 36 C38 28 46 22 52 28 Z"
              fill="#FACC15"
            />
            <Rect x="34" y="20" width="22" height="26" rx="6" fill="#2563EB" />
          </Svg>
        </View>
      )}

      {/* 5. PULL OVER (SA TABI LANG!) — Curbside Pin + Vehicle Gliding to Sidewalk */}
      {sceneType === "curbside" && (
        <Animated.View style={{ transform: [{ translateX }] }}>
          <Svg width="260" height="175" viewBox="0 0 260 175">
            {/* Crosswalk Stripes & Sidewalk */}
            <Rect x="20" y="138" width="220" height="8" rx="4" fill="#FACC15" />
            <Rect x="45" y="152" width="28" height="8" rx="2" fill="#FAFAFA" />
            <Rect x="95" y="152" width="28" height="8" rx="2" fill="#FAFAFA" />
            <Rect x="145" y="152" width="28" height="8" rx="2" fill="#FAFAFA" />
            <Rect x="195" y="152" width="28" height="8" rx="2" fill="#FAFAFA" />

            {/* Curbside Drop-Off Location Pin */}
            <Path
              d="M204 24 C188 24 176 36 176 52 C176 74 204 102 204 102 C204 102 232 74 232 52 C232 36 220 24 204 24 Z"
              fill="#E82127"
            />
            <Circle cx="204" cy="52" r="10" fill="#FACC15" />

            {/* Modern Commuter Vehicle Pulling to the Curb */}
            <Path
              d="M32 82 L118 82 L138 102 L156 106 L156 124 L28 124 L28 92 Z"
              fill="#2563EB"
            />
            <Rect x="44" y="88" width="30" height="16" rx="3" fill="#BAE6FD" />
            <Rect x="82" y="88" width="32" height="16" rx="3" fill="#BAE6FD" />
            <Circle cx="56" cy="126" r="14" fill="#18181B" />
            <Circle cx="56" cy="126" r="7" fill="#94A3B8" />
            <Circle cx="128" cy="126" r="14" fill="#18181B" />
            <Circle cx="128" cy="126" r="7" fill="#94A3B8" />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}
