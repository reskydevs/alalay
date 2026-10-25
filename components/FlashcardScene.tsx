import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

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

            {/* 1. STOP HERE (PARA PO!) — 100% Hands-Free Octagonal Transit Stop Sign & Hazard Beacons */}
      {sceneType === "stop" && (
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Svg width="260" height="190" viewBox="0 0 240 175">
            <Defs>
              <LinearGradient id="stopSignGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#EF4444" />
                <Stop offset="100%" stopColor="#B91C1C" />
              </LinearGradient>
              <LinearGradient id="postGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#64748B" />
                <Stop offset="50%" stopColor="#94A3B8" />
                <Stop offset="100%" stopColor="#475569" />
              </LinearGradient>
            </Defs>

            {/* Curbside Ground Stop Line */}
            <Rect x="20" y="152" width="200" height="8" rx="4" fill="#334155" />
            <Rect x="40" y="152" width="45" height="8" rx="2" fill="#FACC15" />
            <Rect x="100" y="152" width="45" height="8" rx="2" fill="#FACC15" />
            <Rect x="160" y="152" width="45" height="8" rx="2" fill="#FACC15" />

            {/* Sign Post */}
            <Rect x="115" y="106" width="10" height="48" rx="2" fill="url(#postGrad)" />

            {/* Outer Octagon (Bevel/Border) */}
            <Polygon
              points="84,18 156,18 190,52 190,124 156,158 84,158 50,124 50,52"
              fill="#FFFFFF"
            />
            {/* Inner Red Octagon */}
            <Polygon
              points="86,22 154,22 186,54 186,122 154,154 86,154 54,122 54,54"
              fill="url(#stopSignGrad)"
            />
            {/* Inner White Pinstripe */}
            <Polygon
              points="90,28 150,28 178,56 178,120 150,148 90,148 62,120 62,56"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />

            {/* Prominent STOP Typography */}
            <SvgText
              x="120"
              y="97"
              fill="#FFFFFF"
              fontSize="34"
              fontWeight="900"
              fontFamily="sans-serif"
              letterSpacing="2"
              textAnchor="middle"
            >
              STOP
            </SvgText>

            {/* Amber Flashing Hazard Beacons (Left & Right) */}
            <Circle cx="30" cy="88" r="9" fill="#F59E0B" />
            <Circle cx="30" cy="88" r="5" fill="#FEF08A" />
            <Circle cx="210" cy="88" r="9" fill="#F59E0B" />
            <Circle cx="210" cy="88" r="5" fill="#FEF08A" />
          </Svg>
        </Animated.View>
      )}

                  {/* 2. PASSING FARE (BAYAD PO!) — 100% Hands-Free Crisp Peso Banknote & Golden Coins Gliding Forward */}
      {sceneType === "payment" && (
        <Animated.View style={{ transform: [{ translateX }] }}>
          <Svg width="280" height="190" viewBox="0 0 260 175">
            <Defs>
              <LinearGradient id="billGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#22C55E" />
                <Stop offset="50%" stopColor="#16A34A" />
                <Stop offset="100%" stopColor="#15803D" />
              </LinearGradient>
              <LinearGradient id="goldCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FDE047" />
                <Stop offset="50%" stopColor="#EAB308" />
                <Stop offset="100%" stopColor="#CA8A04" />
              </LinearGradient>
              <LinearGradient id="silverCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="100%" stopColor="#94A3B8" />
              </LinearGradient>
            </Defs>

            {/* Forward Passing Chevrons */}
            <G opacity={0.9}>
              <Path
                d="M214 74 L232 88 L214 102"
                stroke="#FACC15"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M232 74 L250 88 L232 102"
                stroke="#FACC15"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.45}
              />
            </G>

            {/* Secondary Banknote (Layered Behind in 3D Perspective) */}
            <G transform="translate(18, 38) rotate(-6)">
              <Rect x="0" y="0" width="145" height="82" rx={10} fill="#14532D" opacity={0.7} />
            </G>

            {/* Primary Philippine Peso Banknote */}
            <G transform="translate(24, 46) rotate(-2)">
              <Rect x="0" y="0" width="150" height="84" rx={10} fill="url(#billGrad)" stroke="#86EFAC" strokeWidth={1.5} />
              <Rect x="6" y="6" width="138" height="72" rx={7} fill="#15803D" stroke="#BBF7D0" strokeWidth={1} strokeOpacity={0.6} />
              
              {/* Central Seal with Peso Symbol */}
              <Circle cx="75" cy="42" r="22" fill="#166534" stroke="#86EFAC" strokeWidth={1.5} />
              <Circle cx="75" cy="42" r="18" fill="none" stroke="#FDE047" strokeWidth={1} strokeDasharray="3,3" />
              <SvgText
                x="75"
                y="52"
                fill="#F0FDF4"
                fontSize={30}
                fontWeight="900"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                ₱
              </SvgText>

              {/* Corner Denomination Markers */}
              <SvgText x="14" y="22" fill="#86EFAC" fontSize={12} fontWeight="bold">₱</SvgText>
              <SvgText x="136" y="22" fill="#86EFAC" fontSize={12} fontWeight="bold" textAnchor="end">₱</SvgText>
              <SvgText x="14" y="72" fill="#86EFAC" fontSize={12} fontWeight="bold">20</SvgText>
              <SvgText x="136" y="72" fill="#86EFAC" fontSize={12} fontWeight="bold" textAnchor="end">20</SvgText>
            </G>

            {/* Overlapping Golden Peso Coin (Floating Front) */}
            <G transform="translate(150, 78)">
              <Circle cx={22} cy={22} r={22} fill="#78350F" />
              <Circle cx={22} cy={22} r={20} fill="url(#goldCoinGrad)" stroke="#FEF08A" strokeWidth={1.5} />
              <Circle cx={22} cy={22} r={16} fill="#EAB308" />
              <SvgText
                x={22}
                y={28}
                fill="#422006"
                fontSize={18}
                fontWeight="900"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                ₱5
              </SvgText>
            </G>

            {/* Bimetallic ₱10 Coin (Overlapping Left Edge) */}
            <G transform="translate(182, 42)">
              <Circle cx={18} cy={18} r={18} fill="#78350F" />
              <Circle cx={18} cy={18} r={16.5} fill="#CA8A04" />
              <Circle cx={18} cy={18} r={12} fill="url(#silverCoinGrad)" />
              <SvgText
                x={18}
                y={23}
                fill="#0F172A"
                fontSize={13}
                fontWeight="900"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                ₱10
              </SvgText>
            </G>
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

                  {/* 4. CHANGE PLEASE (SUKLI PO!) — Pure Philippine Peso Coin Stack (No Dish, No Floating Trails) */}
      {sceneType === "change" && (
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Svg width="280" height="190" viewBox="0 0 260 175">
            <Defs>
              <LinearGradient id="goldCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FDE047" />
                <Stop offset="45%" stopColor="#EAB308" />
                <Stop offset="100%" stopColor="#A16207" />
              </LinearGradient>
              <LinearGradient id="silverCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="50%" stopColor="#CBD5E1" />
                <Stop offset="100%" stopColor="#64748B" />
              </LinearGradient>
              <LinearGradient id="bimetalBronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FBBF24" />
                <Stop offset="50%" stopColor="#D97706" />
                <Stop offset="100%" stopColor="#78350F" />
              </LinearGradient>
            </Defs>

            {/* Subtle Coin Drop Shadow on Canvas */}
            <Ellipse cx="130" cy="142" rx="75" ry="14" fill="#000000" opacity={0.6} />

            {/* --- COIN 1: ₱1 Silver Coin (Bottom Left Underlay) --- */}
            <G transform="translate(68, 88) rotate(-10)">
              <Circle cx={22} cy={22} r={22} fill="#334155" />
              <Circle cx={22} cy={22} r={20.5} fill="url(#silverCoinGrad)" />
              <Circle cx={22} cy={22} r={17} fill="none" stroke="#F1F5F9" strokeWidth={1} strokeDasharray="3,2" />
              <SvgText x={22} y={28} fill="#0F172A" fontSize={16} fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                ₱1
              </SvgText>
            </G>

            {/* --- COIN 2: ₱5 Gold Coin (Bottom Right Underlay) --- */}
            <G transform="translate(152, 85) rotate(12)">
              <Circle cx={25} cy={25} r={25} fill="#78350F" />
              <Circle cx={25} cy={25} r={23.5} fill="url(#goldCoinGrad)" stroke="#FEF08A" strokeWidth={1.2} />
              <Circle cx={25} cy={25} r={19} fill="none" stroke="#CA8A04" strokeWidth={1} strokeDasharray="4,2" />
              <SvgText x={25} y={32} fill="#422006" fontSize={19} fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                ₱5
              </SvgText>
            </G>

            {/* --- COIN 3: ₱20 Bimetallic Coin (Top Right) --- */}
            <G transform="translate(132, 28) rotate(8)">
              <Circle cx={30} cy={30} r={30} fill="#334155" />
              <Circle cx={30} cy={30} r={28.5} fill="url(#silverCoinGrad)" stroke="#FFFFFF" strokeWidth={1.2} />
              <Circle cx={30} cy={30} r={20} fill="url(#bimetalBronzeGrad)" stroke="#CA8A04" strokeWidth={1} />
              <SvgText x={30} y={37} fill="#FEF3C7" fontSize={20} fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                ₱20
              </SvgText>
            </G>

            {/* --- COIN 4: ₱5 Gold Coin (Top Left) --- */}
            <G transform="translate(72, 36) rotate(-8)">
              <Circle cx={26} cy={26} r={26} fill="#78350F" />
              <Circle cx={26} cy={26} r={24.5} fill="url(#goldCoinGrad)" stroke="#FEF08A" strokeWidth={1.2} />
              <Circle cx={26} cy={26} r={20} fill="none" stroke="#CA8A04" strokeWidth={1} strokeDasharray="4,2" />
              <SvgText x={26} y={33} fill="#422006" fontSize={20} fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                ₱5
              </SvgText>
            </G>

            {/* --- COIN 5: ₱10 Bimetallic Coin (Center Masterpiece - Foreground) --- */}
            <G transform="translate(100, 72) rotate(-3)">
              <Circle cx={32} cy={32} r={32} fill="#78350F" />
              <Circle cx={32} cy={32} r={30.5} fill="url(#goldCoinGrad)" stroke="#FEF08A" strokeWidth={1.2} />
              <Circle cx={32} cy={32} r={21.5} fill="url(#silverCoinGrad)" stroke="#CA8A04" strokeWidth={1} />
              <SvgText x={32} y={39.5} fill="#0F172A" fontSize={22} fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                ₱10
              </SvgText>
            </G>

            {/* Specular Highlight Glints */}
            <Path d="M62 48 Q65 48 65 45 Q65 48 68 48 Q65 48 65 51 Q65 48 62 48 Z" fill="#FFFFFF" />
            <Path d="M196 52 Q199 52 199 49 Q199 52 202 52 Q199 52 199 55 Q199 52 196 52 Z" fill="#FEF08A" />
            <Path d="M168 120 Q170 120 170 118 Q170 120 172 120 Q170 120 170 122 Q170 120 168 120 Z" fill="#FFFFFF" opacity={0.8} />
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
