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

    motionLoop.start();
    return () => {
      motionLoop.stop();
    };
  }, [isSpeaking, primaryMotion, sceneType]);

  const translateY = primaryMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const translateX = primaryMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 12],
  });

  return (
    <View className="w-full h-56 items-center justify-center overflow-hidden my-2">
      {/* Flat Background Canvas — Zero Glow on Visuals */}
      <View
        style={{
          position: "absolute",
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: "#111113",
        }}
      />

      {/* 1. STOP HERE (PARA PO!) — Raised Hand Gesture + Curbside Marker */}
      {sceneType === "stop" && (
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Svg width="260" height="190" viewBox="0 0 240 175">
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
          <Svg width="280" height="190" viewBox="0 0 260 175">
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
          <Svg width="280" height="190" viewBox="0 0 260 175">
            {/* ID Pass Card */}
            <Rect x="30" y="32" width="140" height="90" rx="10" fill="#1E293B" />
            <Rect x="40" y="42" width="120" height="70" rx="6" fill="#334155" />
            {/* ID Avatar Outline */}
            <Circle cx="64" cy="68" r="14" fill="#64748B" />
            <Rect x="48" y="86" width="32" height="14" rx="4" fill="#64748B" />
            {/* ID Card Lines */}
            <Rect x="88" y="58" width="60" height="6" rx="3" fill="#94A3B8" />
            <Rect x="88" y="70" width="45" height="6" rx="3" fill="#94A3B8" />
            <Rect x="88" y="82" width="52" height="6" rx="3" fill="#94A3B8" />

            {/* Radiant 20% Discount Badge */}
            <Circle cx="185" cy="95" r="38" fill="#0284C7" />
            <Circle cx="185" cy="95" r="30" fill="#38BDF8" />
            <SvgText
              x="185"
              y="92"
              fill="#FFFFFF"
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
            >
              -20%
            </SvgText>
            <SvgText
              x="185"
              y="108"
              fill="#0F172A"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              DISCOUNT
            </SvgText>
          </Svg>
        </Animated.View>
      )}

      {/* 4. CHANGE PLEASE (SUKLI PO!) — Coins Dropping into Open Hand */}
      {sceneType === "change" && (
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Svg width="280" height="190" viewBox="0 0 260 175">
            {/* Receiving Open Hand (Cupped Palm) */}
            <Path
              d="M50 120 C70 120, 85 135, 110 135 L170 135 C185 135, 195 125, 205 110 L215 95 C218 90, 212 85, 207 88 L185 102 L150 115 L105 115 L60 95 Z"
              fill="#FACC15"
            />
            {/* 3 Falling Peso Coins with Drop Shadows */}
            <Circle cx="115" cy="40" r="18" fill="#CA8A04" />
            <Circle cx="115" cy="40" r="14" fill="#EAB308" />
            <SvgText
              x="115"
              y="46"
              fill="#18181B"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
            >
              ₱10
            </SvgText>

            <Circle cx="150" cy="55" r="16" fill="#CA8A04" />
            <Circle cx="150" cy="55" r="12" fill="#FACC15" />
            <SvgText
              x="150"
              y="60"
              fill="#18181B"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              ₱5
            </SvgText>

            <Circle cx="180" cy="72" r="13" fill="#CA8A04" />
            <Circle cx="180" cy="72" r="10" fill="#FEF08A" />
            <SvgText
              x="180"
              y="76"
              fill="#18181B"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              ₱1
            </SvgText>
          </Svg>
        </Animated.View>
      )}

      {/* 5. PULL OVER (SA TABI LANG!) — Vehicle Pulling to Curbside Pin */}
      {sceneType === "curbside" && (
        <Animated.View style={{ transform: [{ translateX }] }}>
          <Svg width="280" height="190" viewBox="0 0 260 175">
            {/* Curbside Sidewalk & Crosswalk Striping */}
            <Rect x="20" y="130" width="220" height="8" rx="4" fill="#475569" />
            <Line x1="40" y1="134" x2="65" y2="134" stroke="#FACC15" strokeWidth="4" />
            <Line x1="85" y1="134" x2="110" y2="134" stroke="#FACC15" strokeWidth="4" />
            <Line x1="130" y1="134" x2="155" y2="134" stroke="#FACC15" strokeWidth="4" />
            <Line x1="175" y1="134" x2="200" y2="134" stroke="#FACC15" strokeWidth="4" />

            {/* Commuter Minibus / PUV Silhouette */}
            <Rect x="40" y="65" width="125" height="55" rx="10" fill="#2563EB" />
            <Rect x="48" y="73" width="30" height="20" rx="4" fill="#93C5FD" />
            <Rect x="86" y="73" width="30" height="20" rx="4" fill="#93C5FD" />
            <Rect x="124" y="73" width="32" height="20" rx="4" fill="#93C5FD" />
            {/* Wheels */}
            <Circle cx="68" cy="120" r="11" fill="#0F172A" />
            <Circle cx="68" cy="120" r="5" fill="#94A3B8" />
            <Circle cx="136" cy="120" r="11" fill="#0F172A" />
            <Circle cx="136" cy="120" r="5" fill="#94A3B8" />

            {/* Location Pin at the Curb */}
            <Path
              d="M195 50 C185 50, 175 60, 175 72 C175 88, 195 110, 195 110 C195 110, 215 88, 215 72 C215 60, 205 50, 195 50 Z"
              fill="#EF4444"
            />
            <Circle cx="195" cy="72" r="7" fill="#FFFFFF" />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}
