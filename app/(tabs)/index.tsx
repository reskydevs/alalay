import usePUVController, { LTFRB_LEGAL_SOURCE } from "@/app/logic/useCommute";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import * as WebBrowser from "expo-web-browser";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Linking,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface FlashcardData {
  id: string;
  badge: string;
  title: string;
  philippinePhrase: string;
  subtext: string;
  speechText: string;
  accentColor: string;
  icon: string;
}

const FLASHCARD_SLIDES: FlashcardData[] = [
  {
    id: "stop",
    badge: "EMERGENCY / STOP",
    title: "STOP HERE",
    philippinePhrase: "PARA PO!",
    subtext: "Unload safely at the nearest curbside or corner",
    speechText: "Para po! Bababa na po ako sa tabi. Salamat po.",
    accentColor: "#E82127",
    icon: "hand-wave",
  },
  {
    id: "payment",
    badge: "FARE TRANSACTION",
    title: "PASSING FARE",
    philippinePhrase: "BAYAD PO!",
    subtext: "Please pass my payment to the driver or conductor",
    speechText: "Bayad po. Pakiabot po sa driver. Salamat po.",
    accentColor: "#FFFFFF",
    icon: "cash-multiple",
  },
  {
    id: "discount",
    badge: "STATUTORY BENEFIT",
    title: "20% DISCOUNT",
    philippinePhrase: "PWD / SENIOR PO!",
    subtext: "Legal discount under Republic Act 9442 & RA 9994",
    speechText: "May discount po ako bilang PWD o Senior Citizen. Bayad po.",
    accentColor: "#FFFFFF",
    icon: "badge-account-horizontal",
  },
  {
    id: "change",
    badge: "FARE CHANGE",
    title: "CHANGE PLEASE",
    philippinePhrase: "SUKLI PO!",
    subtext: "Please pass back my change when available, thank you",
    speechText: "Pakiabot po ang sukli ko. Maraming salamat po.",
    accentColor: "#FFFFFF",
    icon: "hand-coin",
  },
  {
    id: "curbside",
    badge: "SAFE DROP-OFF",
    title: "PULL OVER",
    philippinePhrase: "SA TABI LANG PO!",
    subtext: "Drop-off at the pedestrian crossing or designated stop",
    speechText: "Dito na lang po sa tabi o tawiran. Salamat po.",
    accentColor: "#FFFFFF",
    icon: "bus-stop",
  },
];

const DISTANCE_PRESETS = [
  { label: "4 km", sub: "Base Fare", km: 4.0 },
  { label: "6 km", sub: "Barangay", km: 6.0 },
  { label: "8 km", sub: "Commercial", km: 8.0 },
  { label: "10 km", sub: "City Center", km: 10.0 },
  { label: "15 km", sub: "Express", km: 15.0 },
];

export default function HomeScreen() {
  const router = useRouter();
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
  const [showTrustInfoModal, setShowTrustInfoModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const currentSlide = FLASHCARD_SLIDES[activeSlideIndex] || FLASHCARD_SLIDES[0];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (SCREEN_WIDTH - 24));
    if (index >= 0 && index < FLASHCARD_SLIDES.length && index !== activeSlideIndex) {
      setActiveSlideIndex(index);
    }
  };

  const handleSpeak = (text: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setIsSpeaking(true);
    Speech.stop();
    Speech.speak(text, {
      language: "fil-PH",
      rate: 0.95,
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleOpenFullscreen = (card: FlashcardData) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    setFullscreenCard(card);
  };

  const handleOpenLtfrbWebsite = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await WebBrowser.openBrowserAsync("https://ltfrb.gov.ph/fare-rates/");
    } catch {
      Linking.openURL("https://ltfrb.gov.ph/fare-rates/").catch(() => {});
    }
  };

  return (
    <View className="flex-1 bg-[#000000] pt-10">
      <StatusBar barStyle="light-content" />

      {/* Tesla Telemetry Header */}
      <View className="px-5 pt-3 pb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-white font-extrabold text-2xl tracking-tight">
            ParaPo!
          </Text>
          <View className="flex-row items-center mt-1">
            <View className="w-2 h-2 rounded-full bg-[#10B981] mr-2" />
            <Text className="text-[#8E8E93] text-xs font-medium tracking-wide">
              Commuter Assist • Live GPS Ready
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleOpenLtfrbWebsite}
          activeOpacity={0.7}
          className="flex-row items-center bg-[#18181B] px-3 py-1.5 rounded-full border border-[#27272A]"
        >
          <MaterialCommunityIcons name="shield-check" size={14} color="#FFFFFF" />
          <Text className="text-[#A1A1AA] text-xs font-semibold ml-1.5">
            LTFRB Portal ↗
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* HERO SECTION: SWIPEABLE FULL-SCREEN FLASHCARD CAROUSEL */}
        <View className="mt-4">
          <View className="px-5 flex-row items-center justify-between mb-3">
            <Text className="text-[#8E8E93] text-xs font-bold uppercase tracking-wider">
              Visual Flashcard • Slide Left / Right
            </Text>
            <Text className="text-[#71717A] text-xs font-semibold">
              {activeSlideIndex + 1} of {FLASHCARD_SLIDES.length}
            </Text>
          </View>

          {/* Swipeable Horizontal Paging ScrollView */}
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            snapToInterval={SCREEN_WIDTH - 16}
            decelerationRate="fast"
          >
            {FLASHCARD_SLIDES.map((slide, index) => {
              const isAlert = slide.id === "stop";
              return (
                <View
                  key={slide.id}
                  style={{ width: SCREEN_WIDTH - 32, marginRight: 16 }}
                  className="bg-[#121214] rounded-3xl p-6 border border-[#27272A] justify-between shadow-2xl"
                >
                  {/* Top Badge & Audio Status */}
                  <View className="flex-row items-center justify-between mb-4">
                    <View
                      className={`px-3 py-1 rounded-full ${
                        isAlert ? "bg-[#E82127]/20 border border-[#E82127]/40" : "bg-[#27272A]"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold tracking-wider ${
                          isAlert ? "text-[#E82127]" : "text-[#A1A1AA]"
                        }`}
                      >
                        {slide.badge}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleSpeak(slide.speechText)}
                      className="w-10 h-10 rounded-full bg-[#1C1C1E] items-center justify-center border border-[#27272A]"
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isSpeaking && activeSlideIndex === index ? "volume-high" : "volume-medium-outline"}
                        size={20}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Main Large Visual Text (Optimized for Distance & Low Vision) */}
                  <TouchableOpacity
                    onPress={() => handleOpenFullscreen(slide)}
                    activeOpacity={0.9}
                    className="my-3"
                  >
                    <Text className="text-[#8E8E93] text-sm font-semibold uppercase tracking-wider mb-1">
                      {slide.title}
                    </Text>
                    <Text
                      className="text-4xl font-black tracking-tight"
                      style={{ color: isAlert ? "#FFFFFF" : "#FFFFFF" }}
                    >
                      {slide.philippinePhrase}
                    </Text>
                    <Text className="text-[#A1A1AA] text-sm font-medium mt-2 leading-5">
                      {slide.subtext}
                    </Text>
                  </TouchableOpacity>

                  {/* 1-Tap Action Buttons on Card */}
                  <View className="flex-row items-center gap-3 pt-4 border-t border-[#1C1C1E] mt-2">
                    <TouchableOpacity
                      onPress={() => handleOpenFullscreen(slide)}
                      activeOpacity={0.8}
                      className="flex-1 bg-[#FFFFFF] py-3.5 rounded-2xl items-center justify-center flex-row"
                    >
                      <Ionicons name="expand" size={16} color="#000000" />
                      <Text className="text-[#000000] font-black text-xs uppercase tracking-wider ml-2">
                        Display Fullscreen
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleSpeak(slide.speechText)}
                      activeOpacity={0.8}
                      className="flex-1 bg-[#1C1C1E] py-3.5 rounded-2xl items-center justify-center flex-row border border-[#27272A]"
                    >
                      <Ionicons name="volume-high" size={16} color="#FFFFFF" />
                      <Text className="text-white font-bold text-xs uppercase tracking-wider ml-2">
                        Speak Aloud
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Tesla-Style Carousel Paging Dots Indicator */}
          <View className="flex-row justify-center items-center mt-3 gap-1.5">
            {FLASHCARD_SLIDES.map((_, i) => (
              <View
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  activeSlideIndex === i ? "w-6 bg-[#FFFFFF]" : "w-1.5 bg-[#3F3F46]"
                }`}
              />
            ))}
          </View>
        </View>

        {/* QUICK CONTROL BAR (Modeled directly on Tesla Quick Action Row: Lock, Fan, Lightning, Vent) */}
        <View className="px-5 mt-5">
          <View className="bg-[#121214] rounded-2xl p-3 border border-[#27272A] flex-row justify-around items-center">
            <TouchableOpacity
              onPress={() => handleSpeak(currentSlide.speechText)}
              activeOpacity={0.7}
              className="items-center justify-center p-2"
            >
              <View className="w-12 h-12 rounded-full bg-[#1C1C1E] items-center justify-center mb-1 border border-[#27272A]">
                <Ionicons name="volume-medium" size={22} color="#FFFFFF" />
              </View>
              <Text className="text-[#8E8E93] text-[11px] font-semibold">Speak</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleOpenFullscreen(currentSlide)}
              activeOpacity={0.7}
              className="items-center justify-center p-2"
            >
              <View className="w-12 h-12 rounded-full bg-[#1C1C1E] items-center justify-center mb-1 border border-[#27272A]">
                <Ionicons name="scan-outline" size={22} color="#FFFFFF" />
              </View>
              <Text className="text-[#8E8E93] text-[11px] font-semibold">Fullscreen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/IDCardTab")}
              activeOpacity={0.7}
              className="items-center justify-center p-2"
            >
              <View className="w-12 h-12 rounded-full bg-[#1C1C1E] items-center justify-center mb-1 border border-[#27272A]">
                <Ionicons name="shield-checkmark-outline" size={22} color="#FFFFFF" />
              </View>
              <Text className="text-[#8E8E93] text-[11px] font-semibold">ID Vault</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                const stopCard = FLASHCARD_SLIDES[0];
                handleOpenFullscreen(stopCard);
                handleSpeak(stopCard.speechText);
              }}
              activeOpacity={0.7}
              className="items-center justify-center p-2"
            >
              <View className="w-12 h-12 rounded-full bg-[#E82127]/20 items-center justify-center mb-1 border border-[#E82127]/50">
                <Ionicons name="hand-right" size={22} color="#E82127" />
              </View>
              <Text className="text-[#E82127] text-[11px] font-bold">Stop Alert</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TESLA-STYLE LIST SECTION (Controls, Climate, Location style rows) */}
        <View className="px-5 mt-6">
          <Text className="text-[#8E8E93] text-xs font-bold uppercase tracking-wider mb-2.5">
            Commuter Telemetry & Services
          </Text>

          <View className="bg-[#121214] rounded-3xl border border-[#27272A] overflow-hidden">
            {/* Row 1: Fare Calculator Modal Trigger */}
            <TouchableOpacity
              onPress={() => setShowFareModal(true)}
              activeOpacity={0.7}
              className="p-4 flex-row items-center justify-between border-b border-[#1C1C1E]"
            >
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-10 h-10 rounded-2xl bg-[#1C1C1E] items-center justify-center mr-3.5 border border-[#27272A]">
                  <MaterialCommunityIcons name="calculator-variant" size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-bold">
                    LTFRB Fare Calculator
                  </Text>
                  <Text className="text-[#8E8E93] text-xs font-medium mt-0.5">
                    ₱{fareBreakdown.totalFare.toFixed(2)} • {commuteMode === "traditional" ? "Traditional PUJ" : "Modern PUV"} ({selectedDistanceKm} km)
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#71717A" />
            </TouchableOpacity>

            {/* Row 2: Navigation Shortcut */}
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/WebMapTab")}
              activeOpacity={0.7}
              className="p-4 flex-row items-center justify-between border-b border-[#1C1C1E]"
            >
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-10 h-10 rounded-2xl bg-[#1C1C1E] items-center justify-center mr-3.5 border border-[#27272A]">
                  <Ionicons name="navigate-outline" size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-bold">
                    Transit Navigation
                  </Text>
                  <Text className="text-[#8E8E93] text-xs font-medium mt-0.5">
                    Live GPS Routing & Turn-by-Turn Directions
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#71717A" />
            </TouchableOpacity>

            {/* Row 3: PWD / Senior ID Vault */}
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/IDCardTab")}
              activeOpacity={0.7}
              className="p-4 flex-row items-center justify-between border-b border-[#1C1C1E]"
            >
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-10 h-10 rounded-2xl bg-[#1C1C1E] items-center justify-center mr-3.5 border border-[#27272A]">
                  <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-bold">
                    Digital PWD & Senior ID
                  </Text>
                  <Text className="text-[#8E8E93] text-xs font-medium mt-0.5">
                    Offline Encrypted Card for 20% Discount
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#71717A" />
            </TouchableOpacity>

            {/* Row 4: LTFRB Official Hotlines */}
            <TouchableOpacity
              onPress={() => Linking.openURL("tel:1342").catch(() => {})}
              activeOpacity={0.7}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-10 h-10 rounded-2xl bg-[#1C1C1E] items-center justify-center mr-3.5 border border-[#27272A]">
                  <Ionicons name="call-outline" size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-bold">
                    LTFRB 24/7 Hotline 1342
                  </Text>
                  <Text className="text-[#8E8E93] text-xs font-medium mt-0.5">
                    Report Overcharging & Commuter Rights Violations
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#71717A" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* FULLSCREEN FLASHCARD MODAL (High-Contrast Beacon Mode for PWDs) */}
      <Modal
        visible={fullscreenCard !== null}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setFullscreenCard(null)}
      >
        {fullscreenCard && (
          <View className="flex-1 bg-[#000000] justify-between p-8 pt-12">
            <StatusBar hidden />

            {/* Top Close & Speech Bar */}
            <View className="flex-row justify-between items-center">
              <View className="bg-[#1C1C1E] px-4 py-2 rounded-full border border-[#27272A]">
                <Text className="text-[#A1A1AA] text-xs font-bold uppercase tracking-wider">
                  {fullscreenCard.badge}
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => handleSpeak(fullscreenCard.speechText)}
                  className="w-12 h-12 rounded-full bg-[#1C1C1E] items-center justify-center border border-[#27272A]"
                >
                  <Ionicons name="volume-high" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFullscreenCard(null)}
                  className="w-12 h-12 rounded-full bg-[#FFFFFF] items-center justify-center"
                >
                  <Ionicons name="close" size={24} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Giant Visual Display */}
            <View className="items-center justify-center my-auto">
              <Text className="text-[#8E8E93] text-2xl font-bold uppercase tracking-widest text-center mb-4">
                {fullscreenCard.title}
              </Text>
              <Text className="text-white font-black text-6xl tracking-tight text-center leading-tight">
                {fullscreenCard.philippinePhrase}
              </Text>
              <Text className="text-[#A1A1AA] text-xl font-medium text-center mt-6 max-w-sm">
                {fullscreenCard.subtext}
              </Text>
            </View>

            {/* Bottom Dismiss Prompt */}
            <TouchableOpacity
              onPress={() => setFullscreenCard(null)}
              activeOpacity={0.8}
              className="w-full bg-[#1C1C1E] py-4 rounded-2xl items-center justify-center border border-[#27272A]"
            >
              <Text className="text-white font-bold text-sm uppercase tracking-wider">
                Tap Anywhere or Here to Dismiss
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>

      {/* FARE CALCULATOR TELEMETRY MODAL */}
      <Modal
        visible={showFareModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFareModal(false)}
      >
        <View className="flex-1 bg-[#000000] p-6 pt-8">
          <View className="flex-row items-center justify-between pb-4 border-b border-[#1C1C1E]">
            <View>
              <Text className="text-white text-xl font-extrabold tracking-tight">
                Fare Calculator
              </Text>
              <Text className="text-[#8E8E93] text-xs font-medium">
                Official LTFRB Rate Computation
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowFareModal(false)}
              className="w-9 h-9 rounded-full bg-[#1C1C1E] items-center justify-center border border-[#27272A]"
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
            {/* Mode Switch: Traditional vs Modern PUV */}
            <View className="flex-row bg-[#121214] p-1 rounded-2xl mb-4 border border-[#27272A]">
              <TouchableOpacity
                onPress={() => setCommuteMode("traditional")}
                className={`flex-1 py-3 rounded-xl items-center ${
                  commuteMode === "traditional" ? "bg-[#27272A]" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-xs font-bold uppercase tracking-wide ${
                    commuteMode === "traditional" ? "text-white" : "text-[#71717A]"
                  }`}
                >
                  Traditional PUJ
                </Text>
                <Text className="text-[#8E8E93] text-[10px] mt-0.5">
                  ₱13 base • ₱1.80/km
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCommuteMode("modern")}
                className={`flex-1 py-3 rounded-xl items-center ${
                  commuteMode === "modern" ? "bg-[#27272A]" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-xs font-bold uppercase tracking-wide ${
                    commuteMode === "modern" ? "text-white" : "text-[#71717A]"
                  }`}
                >
                  Modern PUV
                </Text>
                <Text className="text-[#8E8E93] text-[10px] mt-0.5">
                  ₱15 base • ₱2.20/km
                </Text>
              </TouchableOpacity>
            </View>

            {/* Distance Stepper (Tesla Climate-Style) */}
            <View className="bg-[#121214] rounded-3xl p-5 border border-[#27272A] items-center mb-4">
              <Text className="text-[#8E8E93] text-xs font-bold uppercase tracking-wider mb-2">
                Commute Distance
              </Text>
              <View className="flex-row items-center justify-between w-full px-4 my-2">
                <TouchableOpacity
                  onPress={() => adjustDistance(-1)}
                  className="w-12 h-12 rounded-full bg-[#1C1C1E] items-center justify-center border border-[#27272A]"
                >
                  <Ionicons name="remove" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View className="items-center">
                  <Text className="text-white font-black text-4xl tracking-tight">
                    {selectedDistanceKm.toFixed(1)}
                  </Text>
                  <Text className="text-[#71717A] text-xs font-bold uppercase">
                    Kilometers
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => adjustDistance(1)}
                  className="w-12 h-12 rounded-full bg-[#1C1C1E] items-center justify-center border border-[#27272A]"
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Distance Presets */}
              <View className="flex-row gap-2 mt-4">
                {DISTANCE_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.km}
                    onPress={() => setPresetDistance(p.km)}
                    className={`px-3 py-1.5 rounded-xl border ${
                      selectedDistanceKm === p.km
                        ? "bg-white border-white"
                        : "bg-[#1C1C1E] border-[#27272A]"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        selectedDistanceKm === p.km ? "text-black" : "text-[#A1A1AA]"
                      }`}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 20% Discount Toggle */}
            <View className="bg-[#121214] rounded-2xl p-4 border border-[#27272A] flex-row items-center justify-between mb-4">
              <View className="flex-1 mr-3">
                <Text className="text-white font-bold text-sm">
                  20% Statutory Discount
                </Text>
                <Text className="text-[#8E8E93] text-xs mt-0.5">
                  PWD, Senior Citizens, and Students (RA 9442 & 9994)
                </Text>
              </View>
              <Switch
                value={hasDiscount}
                onValueChange={setHasDiscount}
                thumbColor="#FFFFFF"
                trackColor={{ false: "#27272A", true: "#FFFFFF" }}
              />
            </View>

            {/* Calculated Fare Result Card */}
            <View className="bg-[#121214] rounded-3xl p-6 border border-[#27272A] items-center mb-6">
              <Text className="text-[#8E8E93] text-xs font-bold uppercase tracking-wider mb-1">
                Estimated Legal Fare
              </Text>
              <Text className="text-white font-black text-5xl tracking-tight my-1">
                ₱{fareBreakdown.totalFare.toFixed(2)}
              </Text>
              <Text className="text-[#71717A] text-xs font-medium">
                {commuteMode === "traditional" ? "Traditional Jeepney" : "Modern PUV"} •{" "}
                {hasDiscount ? "20% Discount Applied" : "Regular Fare"}
              </Text>
            </View>

            {/* Direct Official Links */}
            <View className="flex-row gap-3 mb-8">
              <TouchableOpacity
                onPress={() => setShowMatrixModal(true)}
                className="flex-1 bg-[#1C1C1E] py-3.5 rounded-2xl items-center justify-center border border-[#27272A]"
              >
                <Text className="text-white font-bold text-xs uppercase tracking-wider">
                  View Full Matrix
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleOpenLtfrbWebsite}
                className="flex-1 bg-[#FFFFFF] py-3.5 rounded-2xl items-center justify-center"
              >
                <Text className="text-black font-bold text-xs uppercase tracking-wider">
                  LTFRB.gov.ph ↗
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* FULL RATE MATRIX MODAL */}
      <Modal
        visible={showMatrixModal}
        animationType="slide"
        onRequestClose={() => setShowMatrixModal(false)}
      >
        <View className="flex-1 bg-[#000000] p-6 pt-8">
          <View className="flex-row items-center justify-between pb-4 border-b border-[#1C1C1E]">
            <View>
              <Text className="text-white text-xl font-bold">
                LTFRB Official Rate Matrix
              </Text>
              <Text className="text-[#8E8E93] text-xs">
                Resolution No. 2023-016
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowMatrixModal(false)}
              className="w-9 h-9 rounded-full bg-[#1C1C1E] items-center justify-center border border-[#27272A]"
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView className="mt-4">
            <View className="bg-[#121214] rounded-2xl border border-[#27272A] overflow-hidden">
              <View className="flex-row bg-[#1C1C1E] p-3 border-b border-[#27272A]">
                <Text className="w-16 text-[#8E8E93] text-xs font-bold">KM</Text>
                <Text className="flex-1 text-[#8E8E93] text-xs font-bold text-center">Traditional</Text>
                <Text className="flex-1 text-[#8E8E93] text-xs font-bold text-center">Modern PUV</Text>
              </View>
              {ltfrbMatrix.map((row) => (
                <View
                  key={row.km}
                  className="flex-row p-3 border-b border-[#1C1C1E] items-center"
                >
                  <Text className="w-16 text-white font-bold text-xs">{row.km} km</Text>
                  <Text className="flex-1 text-white text-xs text-center font-medium">
                    ₱{row.regularTraditional.toFixed(2)}{" "}
                    <Text className="text-[#8E8E93]">({row.discountTraditional.toFixed(2)})</Text>
                  </Text>
                  <Text className="flex-1 text-white text-xs text-center font-medium">
                    ₱{row.regularModern.toFixed(2)}{" "}
                    <Text className="text-[#8E8E93]">({row.discountModern.toFixed(2)})</Text>
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
