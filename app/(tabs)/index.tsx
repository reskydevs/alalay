import usePUVController, { computeVehicleFare, formatFare } from "@/app/logic/useCommute";
import naturalVoiceService from "@/app/services/naturalVoiceService";
import FlashcardScene, { SceneType } from "@/components/FlashcardScene";
import VoiceOrb from "@/components/VoiceOrb";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Linking,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface FlashcardData {
  id: SceneType;
  label: string;
  phrase: string;
  subtext: string;
  speechText: string;
  accent: string;
}

const FLASHCARD_SLIDES: FlashcardData[] = [
  {
    id: "stop",
    label: "STOP HERE",
    phrase: "PARA PO!",
    subtext: "Unloading at the curb",
    speechText: "Para po! Bababa na po ako sa tabi. Salamat po.",
    accent: "#E82127",
  },
  {
    id: "payment",
    label: "PASSING FARE",
    phrase: "BAYAD PO!",
    subtext: "Please pass to the driver",
    speechText: "Bayad po. Pakiabot po sa driver. Salamat po.",
    accent: "#22C55E",
  },
  {
    id: "discount",
    label: "20% DISCOUNT",
    phrase: "PWD / SENIOR",
    subtext: "20% discount (PWD, Senior, Student)",
    speechText: "May discount po ako bilang PWD o Senior Citizen. Bayad po.",
    accent: "#38BDF8",
  },
  {
    id: "change",
    label: "CHANGE PLEASE",
    phrase: "SUKLI PO!",
    subtext: "Waiting for fare change",
    speechText: "Pakiabot po ang sukli ko. Maraming salamat po.",
    accent: "#FACC15",
  },
  {
    id: "curbside",
    label: "PULL OVER",
    phrase: "SA TABI LANG!",
    subtext: "Drop off at the corner",
    speechText: "Dito na lang po sa tabi o tawiran. Salamat po.",
    accent: "#2563EB",
  },
];

const DISTANCE_PRESETS = [4, 6, 8, 10, 15];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    commuteMode,
    setCommuteMode,
    hasDiscount,
    setHasDiscount,
    selectedDistanceKm,
    adjustDistance,
    setPresetDistance,
    fareBreakdown,
    ltfrbMatrix,
  } = usePUVController();

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [fullscreenCard, setFullscreenCard] = useState<FlashcardData | null>(null);
  const [showFareModal, setShowFareModal] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [showLtfrbWebViewModal, setShowLtfrbWebViewModal] = useState(false);
  const [ltfrbTableTab, setLtfrbTableTab] = useState<"traditional" | "modern" | "uv">("traditional");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const cardScale = useRef(new Animated.Value(1)).current;

  const currentSlide = FLASHCARD_SLIDES[activeSlideIndex] || FLASHCARD_SLIDES[0];

  const triggerBounceAndHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.94,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index >= 0 && index < FLASHCARD_SLIDES.length && index !== activeSlideIndex) {
      setActiveSlideIndex(index);
      try {
        Haptics.selectionAsync();
      } catch {}
    }
  };

  const handleSpeak = (text: string) => {
    triggerBounceAndHaptic();
    setIsSpeaking(true);
    naturalVoiceService.speakNatural(text, {
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleOpenFullscreen = (card: FlashcardData) => {
    triggerBounceAndHaptic();
    setFullscreenCard(card);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000000",
        paddingTop: Math.max(insets.top, 24),
      }}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 4 }}
      >
        {/* HERO: SWIPEABLE FLASHCARDS (GENEROUS FULL CANVAS) */}
        <View className="mt-1">
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
          >
            {FLASHCARD_SLIDES.map((slide) => (
              <TouchableOpacity
                key={slide.id}
                activeOpacity={0.92}
                onPress={() => handleOpenFullscreen(slide)}
                style={{ width: SCREEN_WIDTH }}
                className="px-6 py-1 justify-center items-center"
              >
                <Animated.View
                  style={{
                    transform: [{ scale: cardScale }],
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <FlashcardScene
                    sceneType={slide.id}
                    accentColor={slide.accent}
                    isSpeaking={isSpeaking}
                  />

                  <Text className="text-[#8E8E93] text-lg font-bold uppercase tracking-widest mt-2">
                    {slide.label}
                  </Text>

                  {/* Luminous Glow ONLY on Uppercase TEXT when Speaking */}
                  <Text
                    style={{
                      textShadowColor: isSpeaking ? slide.accent : "transparent",
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: isSpeaking ? 36 : 0,
                    }}
                    className="text-white font-black text-6xl tracking-tight text-center mt-1"
                  >
                    {slide.phrase}
                  </Text>

                  <Text className="text-[#A1A1AA] text-xl font-medium text-center mt-2">
                    {slide.subtext}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Paging Dots */}
          <View className="flex-row justify-center items-center mt-3 gap-2.5">
            {FLASHCARD_SLIDES.map((_, i) => (
              <View
                key={i}
                className={`h-2 rounded-full ${
                  activeSlideIndex === i ? "w-8 bg-white" : "w-2 bg-[#3F3F46]"
                }`}
              />
            ))}
          </View>
        </View>

        {/* CHATGPT / GEMINI LIVE VOICE MODE ORB */}
        <View className="items-center justify-center mt-4 mb-2">
          <VoiceOrb
            isSpeaking={isSpeaking}
            onPress={() => handleSpeak(currentSlide.speechText)}
            label="Tap to Speak"
            accentColor={currentSlide.accent}
            size="large"
          />
        </View>

        {/* FARE GUIDE & PUV COMMUTE QUICK PANEL (UTILIZING SCREEN SPACE) */}
        <View className="px-6 mt-2">
          {/* Main Fare Header Row */}
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setShowFareModal(true);
            }}
            activeOpacity={0.6}
            className="py-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="speedometer" size={30} color="#8E8E93" />
              <View className="ml-4">
                <Text className="text-white text-2xl font-bold">
                  Fare Guide
                </Text>
                <Text className="text-[#8E8E93] text-base font-medium mt-0.5">
                  ₱{formatFare(fareBreakdown.totalFare)} • {selectedDistanceKm} km
                  {hasDiscount ? " (-20% discount)" : ""}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#636366" />
          </TouchableOpacity>

          {/* Quick Vehicle Type Selector with Dynamic Real-Time Distance Fares */}
          <View className="flex-row items-center justify-between mt-3 gap-2">
            {[
              { id: "traditional", matchIds: ["traditional", "traditional_puj"], label: "Jeepney" },
              { id: "modern", matchIds: ["modern", "modern_puj"], label: "Modern PUV" },
              { id: "uv", matchIds: ["uv", "uv_express"], label: "UV Express" },
            ].map((v) => {
              const isSelected = v.matchIds.includes(commuteMode);
              const computedFare = computeVehicleFare(v.id, selectedDistanceKm, hasDiscount);
              return (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                    setCommuteMode(v.id as any);
                  }}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: isSelected ? "#27272A" : "#141416",
                    borderColor: isSelected ? "#FFFFFF" : "#27272A",
                  }}
                  className="flex-1 py-3 px-2 rounded-2xl border items-center justify-center"
                >
                  <Text
                    className={`font-bold text-sm ${
                      isSelected ? "text-white" : "text-[#A1A1AA]"
                    }`}
                  >
                    {v.label}
                  </Text>
                  <Text
                    className={`text-base font-black mt-0.5 ${
                      isSelected ? "text-amber-400" : "text-white"
                    }`}
                  >
                    ₱{formatFare(computedFare)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Transparency & Majority Fleet Standard Disclosure */}
          <View className="flex-row items-center mt-2.5 px-1 justify-between">
            <View className="flex-row items-center flex-1 mr-2">
              <Ionicons name="information-circle-outline" size={14} color="#71717A" />
              <Text className="text-[#71717A] text-xs font-medium ml-1.5" numberOfLines={1}>
                LTFRB Sept 28, 2026 Guide • Traditional Road Majority Reference
              </Text>
            </View>
          </View>

          {/* Quick Distance Selector Pills */}
          <View className="flex-row items-center justify-between mt-3 gap-2">
            {DISTANCE_PRESETS.map((d) => {
              const isSelected = selectedDistanceKm === d;
              return (
                <TouchableOpacity
                  key={d}
                  onPress={() => {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                    setPresetDistance(d);
                  }}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: isSelected ? "#FFFFFF" : "#141416",
                    borderColor: isSelected ? "#FFFFFF" : "#27272A",
                  }}
                  className="flex-1 py-2 rounded-xl border items-center justify-center"
                >
                  <Text
                    className={`font-bold text-sm ${
                      isSelected ? "text-black" : "text-[#A1A1AA]"
                    }`}
                  >
                    {d}km
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Discount Switch Bar */}
          <View className="flex-row items-center justify-between py-3 px-1 mt-2">
            <View className="flex-row items-center">
              <Ionicons
                name="shield-checkmark"
                size={20}
                color={hasDiscount ? "#38BDF8" : "#71717A"}
              />
              <Text className="text-[#A1A1AA] text-sm font-semibold ml-2.5">
                20% PWD / Senior / Student Discount
              </Text>
            </View>
            <Switch
              value={hasDiscount}
              onValueChange={(val) => {
                try {
                  Haptics.selectionAsync();
                } catch {}
                setHasDiscount(val);
              }}
              trackColor={{ false: "#27272A", true: "#0284C7" }}
              thumbColor={hasDiscount ? "#38BDF8" : "#A1A1AA"}
            />
          </View>
        </View>
      </ScrollView>

      {/* FULLSCREEN ANIMATED FLASHCARD */}
      <Modal
        visible={fullscreenCard !== null}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setFullscreenCard(null)}
      >
        {fullscreenCard && (
          <View className="flex-1 bg-[#000000] justify-between px-6 py-12">
            <StatusBar hidden />

            {/* Single Top-Right Close Icon */}
            <View className="flex-row justify-end items-center px-2">
              <TouchableOpacity
                onPress={() => setFullscreenCard(null)}
                hitSlop={{ top: 18, bottom: 18, left: 18, right: 18 }}
              >
                <Ionicons name="close" size={40} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Animated Custom Scene + Giant Text */}
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => handleSpeak(fullscreenCard.speechText)}
              className="items-center justify-center my-auto"
            >
              <Animated.View
                style={{
                  transform: [{ scale: cardScale }],
                  alignItems: "center",
                }}
              >
                <FlashcardScene
                  sceneType={fullscreenCard.id}
                  accentColor={fullscreenCard.accent}
                  isSpeaking={isSpeaking}
                />

                <Text className="text-[#8E8E93] text-2xl font-bold uppercase tracking-widest text-center mt-6 mb-2">
                  {fullscreenCard.label}
                </Text>
                <Text
                  style={{
                    textShadowColor: isSpeaking ? fullscreenCard.accent : "transparent",
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: isSpeaking ? 44 : 0,
                  }}
                  className="text-white font-black text-6xl tracking-tight text-center leading-tight"
                >
                  {fullscreenCard.phrase}
                </Text>
                <Text className="text-[#A1A1AA] text-2xl font-medium text-center mt-4">
                  {fullscreenCard.subtext}
                </Text>
              </Animated.View>
            </TouchableOpacity>

            {/* Glowing Voice Orb at Bottom */}
            <View className="items-center pb-2">
              <VoiceOrb
                isSpeaking={isSpeaking}
                onPress={() => handleSpeak(fullscreenCard.speechText)}
                label="Tap to Speak"
                accentColor={fullscreenCard.accent}
                size="large"
              />
            </View>
          </View>
        )}
      </Modal>

      {/* FARE GUIDE DETAILED MODAL */}
      <Modal
        visible={showFareModal}
        animationType="slide"
        onRequestClose={() => setShowFareModal(false)}
      >
        <View className="flex-1 bg-[#000000] px-6 pt-12 pb-8 justify-between">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-3xl font-bold">
              Fare Guide
            </Text>
            <TouchableOpacity
              onPress={() => setShowFareModal(false)}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="close" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View className="my-auto">
            <View className="flex-row items-baseline justify-between mb-8">
              <Text className="text-[#8E8E93] text-xl font-medium">Estimated Fare</Text>
              <Text className="text-white font-black text-6xl">
                ₱{formatFare(fareBreakdown.totalFare)}
              </Text>
            </View>

            {/* Vehicle Mode Selector */}
            <View className="flex-row gap-3 mb-6">
              {[
                { id: "traditional", matchIds: ["traditional", "traditional_puj"], label: "Jeepney" },
                { id: "modern", matchIds: ["modern", "modern_puj"], label: "Modern PUV" },
                { id: "uv", matchIds: ["uv", "uv_express"], label: "UV Express" },
              ].map((v) => {
                const isSelected = v.matchIds.includes(commuteMode);
                return (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => setCommuteMode(v.id as any)}
                    className={`flex-1 py-3 rounded-2xl items-center border ${
                      isSelected
                        ? "bg-[#27272A] border-white"
                        : "bg-[#141416] border-[#27272A]"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        isSelected ? "text-white font-bold" : "text-[#8E8E93]"
                      }`}
                    >
                      {v.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Distance Adjuster */}
            <View className="flex-row items-center justify-between py-6 border-y border-[#27272A]">
              <Text className="text-white text-xl font-bold">Distance</Text>
              <View className="flex-row items-center gap-6">
                <TouchableOpacity
                  onPress={() => adjustDistance(-1)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="remove-circle-outline" size={38} color="#FFFFFF" />
                </TouchableOpacity>
                <Text className="text-white font-bold text-3xl min-w-[70px] text-center">
                  {selectedDistanceKm} km
                </Text>
                <TouchableOpacity
                  onPress={() => adjustDistance(1)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="add-circle-outline" size={38} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Distance Presets */}
            <View className="flex-row justify-between mt-6">
              {DISTANCE_PRESETS.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setPresetDistance(d)}
                  className={`px-4 py-2 rounded-xl ${
                    selectedDistanceKm === d ? "bg-white" : "bg-[#1C1C1E]"
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      selectedDistanceKm === d ? "text-black" : "text-[#8E8E93]"
                    }`}
                  >
                    {d}km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Statutory Discount Toggle */}
            <View className="flex-row items-center justify-between mt-8 py-2">
              <View>
                <Text className="text-white text-lg font-bold">20% Discount</Text>
                <Text className="text-[#8E8E93] text-sm">PWD, Senior, Student</Text>
              </View>
              <Switch
                value={hasDiscount}
                onValueChange={setHasDiscount}
                trackColor={{ false: "#3F3F46", true: "#22C55E" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Official LTFRB Matrix Button */}
          <TouchableOpacity
            onPress={() => setShowLtfrbWebViewModal(true)}
            className="py-4 rounded-2xl bg-[#1C1C1E] items-center"
          >
            <Text className="text-white font-bold text-lg">
              Official LTFRB Rate Table
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* NATIVE OFFLINE LTFRB RATE TABLE MODAL */}
      <Modal
        visible={showLtfrbWebViewModal}
        animationType="slide"
        onRequestClose={() => setShowLtfrbWebViewModal(false)}
      >
        <View className="flex-1 bg-[#000000] pt-12">
          {/* Modal Header */}
          <View className="px-6 pb-4 flex-row items-center justify-between border-b border-[#27272A]">
            <View className="flex-1 mr-4">
              <Text className="text-white text-2xl font-black">LTFRB Official Rates</Text>
              <Text className="text-[#A1A1AA] text-xs mt-0.5 font-medium">
                General Fare Guide • Effective Sept 28, 2026
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowLtfrbWebViewModal(false)}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              className="p-1.5 rounded-full bg-[#1C1C1E]"
            >
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Vehicle Category Tabs */}
          <View className="px-6 pt-4 pb-2">
            <View className="flex-row bg-[#141416] p-1 rounded-2xl border border-[#27272A]">
              {[
                { id: "traditional", label: "Jeepney (PUJ)" },
                { id: "modern", label: "Modern PUV" },
                { id: "uv", label: "UV Express" },
              ].map((tab) => {
                const isActive = ltfrbTableTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => {
                      try {
                        Haptics.selectionAsync();
                      } catch {}
                      setLtfrbTableTab(tab.id as any);
                    }}
                    className={`flex-1 py-2.5 rounded-xl items-center ${
                      isActive ? "bg-white" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`font-bold text-xs ${
                        isActive ? "text-black" : "text-[#A1A1AA]"
                      }`}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Official Formula Summary & Policy Rule */}
            <View className="bg-[#141416] p-3.5 rounded-2xl border border-[#27272A] mt-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-white text-xs font-bold uppercase tracking-wider">
                  {ltfrbTableTab === "traditional" && "Traditional PUJ (Road Majority Standard)"}
                  {ltfrbTableTab === "modern" && "Aircon Modern & Electric PUJ Standard"}
                  {ltfrbTableTab === "uv" && "Traditional UV Express Standard"}
                </Text>
                <Text className="text-amber-400 text-xs font-semibold">25¢ Rounding</Text>
              </View>
              <Text className="text-[#A1A1AA] text-xs leading-relaxed">
                {ltfrbTableTab === "traditional" &&
                  "Base Fare: ₱14.00 (First 4.0 km) + ₱2.00/succeeding km. 20% Discount (PWD/Senior/Student): ₱11.25 base + ₱1.60/km."}
                {ltfrbTableTab === "modern" &&
                  "Base Fare: ₱17.00 (First 4.0 km) + ₱2.40/succeeding km. 20% Discount: ₱13.50 base + ₱1.92/km."}
                {ltfrbTableTab === "uv" &&
                  "Flat Rate: ₱2.60 per kilometer (No 4km base). 20% Discount: ₱2.08 per kilometer. Reflects standard road fleet."}
              </Text>
            </View>
          </View>

          {/* Table Header */}
          <View className="px-6 py-2.5 flex-row items-center border-b border-[#27272A] bg-[#0A0A0C]">
            <Text className="text-[#8E8E93] text-xs font-bold flex-1">DISTANCE</Text>
            <Text className="text-[#8E8E93] text-xs font-bold w-24 text-right">REGULAR</Text>
            <Text className="text-[#38BDF8] text-xs font-bold w-28 text-right">20% DISCOUNT</Text>
          </View>

          {/* Scrollable Matrix Rows (1 to 25 km) */}
          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            {ltfrbMatrix.map((row) => {
              const isCurrentSelected = row.km === selectedDistanceKm;
              let reg = row.regularTraditional;
              let disc = row.discountTraditional;
              if (ltfrbTableTab === "modern") {
                reg = row.regularModern;
                disc = row.discountModern;
              } else if (ltfrbTableTab === "uv") {
                reg = row.regularUV;
                disc = row.discountUV;
              }

              return (
                <View
                  key={row.km}
                  className={`flex-row items-center py-3.5 border-b border-[#1C1C1E] ${
                    isCurrentSelected ? "bg-[#1C1C1E] px-2 rounded-xl my-0.5 border-amber-400/40" : ""
                  }`}
                >
                  <View className="flex-1 flex-row items-center">
                    <Text className={`font-bold text-sm ${isCurrentSelected ? "text-amber-400" : "text-white"}`}>
                      {row.km} km
                    </Text>
                    {isCurrentSelected && (
                      <View className="ml-2 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/50">
                        <Text className="text-amber-400 text-[10px] font-bold">SELECTED</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-white font-bold text-sm w-24 text-right">
                    ₱{formatFare(reg)}
                  </Text>
                  <Text className="text-[#38BDF8] font-black text-sm w-28 text-right">
                    ₱{formatFare(disc)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Bottom Official Hotline & Source Links */}
          <View className="px-6 py-4 border-t border-[#27272A] bg-[#0A0A0C]">
            <View className="flex-row items-center justify-between gap-3">
              <TouchableOpacity
                onPress={() => Linking.openURL("tel:1342").catch(() => {})}
                className="flex-1 py-3 px-3 rounded-xl bg-[#1C1C1E] flex-row items-center justify-center border border-[#27272A]"
              >
                <Ionicons name="call" size={16} color="#22C55E" />
                <Text className="text-white text-xs font-bold ml-2">Hotline 1342</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("https://ltfrb.gov.ph/fare-rates/").catch(() => {})
                }
                className="flex-1 py-3 px-3 rounded-xl bg-[#1C1C1E] flex-row items-center justify-center border border-[#27272A]"
              >
                <Ionicons name="open-outline" size={16} color="#38BDF8" />
                <Text className="text-white text-xs font-bold ml-2">LTFRB Portal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
