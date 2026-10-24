import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, G, Line, Path, Polygon, Rect } from "react-native-svg";

interface FlashcardSceneProps {
  accentColor?: string;
}

export default function FlashcardScene({ accentColor = "#E82127" }: FlashcardSceneProps) {
  const carSlide = useRef(new Animated.Value(-45)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.spring(carSlide, {
      toValue: 0,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -3.5,
          duration: 550,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 550,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    bounceLoop.start();
    pulseLoop.start();

    return () => {
      bounceLoop.stop();
      pulseLoop.stop();
    };
  }, [bounce, carSlide, pulse]);

  return (
    <View className="w-full h-52 items-center justify-center overflow-hidden my-2">
      {/* Static Curbside Station & Attendant Backdrop */}
      <Svg width="340" height="190" viewBox="0 0 340 190">
        {/* Station Wall */}
        <Rect x="20" y="25" width="260" height="125" rx="6" fill="#18181B" />
        {/* Station Awning Roof */}
        <Polygon points="10,25 275,25 295,62 10,62" fill="#27272A" />
        <Line x1="15" y1="37" x2="282" y2="37" stroke="#3F3F46" strokeWidth="2" />
        <Line x1="15" y1="49" x2="288" y2="49" stroke="#3F3F46" strokeWidth="2" />

        {/* Station Signboard */}
        <Rect x="45" y="20" width="115" height="44" rx="4" fill="#14532D" />
        <Rect x="18" y="20" width="27" height="44" rx="4" fill="#FAFAFA" />
        {/* Transit Emblem M/P */}
        <Path
          d="M25 50 V34 L31.5 44 L38 34 V50"
          stroke="#FACC15"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Attendant Window */}
        <Rect x="175" y="72" width="76" height="52" rx="4" fill="#27272A" />
        {/* Driver / Conductor Figure in Window */}
        <Circle cx="213" cy="88" r="8" fill="#FACC15" />
        <Path d="M196 124 C196 104 230 104 230 124 Z" fill="#E82127" />
        {/* Waving Hand */}
        <Path
          d="M192 98 Q186 88 193 85"
          stroke="#FACC15"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Curbside Yellow Line & Bollards */}
        <Rect x="0" y="148" width="340" height="6" fill="#FACC15" />
        {/* Left Bollard */}
        <Rect x="95" y="112" width="10" height="42" fill="#FACC15" />
        <Rect x="95" y="118" width="10" height="7" fill="#09090B" />
        <Rect x="95" y="132" width="10" height="7" fill="#09090B" />
        {/* Right Bollard */}
        <Rect x="255" y="112" width="10" height="42" fill="#FACC15" />
        <Rect x="255" y="118" width="10" height="7" fill="#09090B" />
        <Rect x="255" y="132" width="10" height="7" fill="#09090B" />
      </Svg>

      {/* Animated Commuter Vehicle Pulling Up */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 6,
          transform: [{ translateX: carSlide }, { translateY: bounce }],
        }}
      >
        <Svg width="240" height="115" viewBox="0 0 240 115">
          {/* Commuter Passenger Figure Inside */}
          <Circle cx="112" cy="34" r="9" fill="#FACC15" />
          <Circle cx="101" cy="31" r="6" fill="#09090B" />
          <Path d="M98 62 C98 45 126 45 128 62 Z" fill="#2563EB" />
          {/* Extended Arm Signaling */}
          <Line
            x1="120"
            y1="50"
            x2="145"
            y2="46"
            stroke="#FACC15"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Convertible / Modern Transit Body */}
          <Path
            d="M25 56 L75 56 L92 42 L135 56 L198 56 C212 56 222 68 222 82 L22 82 C18 70 20 56 25 56 Z"
            fill={accentColor}
          />
          {/* Windshield Frame */}
          <Line
            x1="132"
            y1="30"
            x2="156"
            y2="58"
            stroke="#FAFAFA"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Headlight & Taillight */}
          <Path d="M214 63 L222 72 L212 72 Z" fill="#FACC15" />
          <Rect x="21" y="62" width="6" height="12" rx="2" fill="#FACC15" />

          {/* Rear Wheel */}
          <G>
            <Circle cx="64" cy="84" r="20" fill="#18181B" />
            <Circle cx="64" cy="84" r="11" fill="#71717A" />
            <Circle cx="64" cy="84" r="4" fill="#18181B" />
          </G>

          {/* Front Wheel */}
          <G>
            <Circle cx="176" cy="84" r="20" fill="#18181B" />
            <Circle cx="176" cy="84" r="11" fill="#71717A" />
            <Circle cx="176" cy="84" r="4" fill="#18181B" />
          </G>
        </Svg>
      </Animated.View>

      {/* Animated Signal Pulse Indicator */}
      <Animated.View
        style={{
          position: "absolute",
          top: 14,
          right: 42,
          opacity: pulse,
        }}
      >
        <View className="w-3.5 h-3.5 rounded-full bg-[#FACC15]" />
      </Animated.View>
    </View>
  );
}
