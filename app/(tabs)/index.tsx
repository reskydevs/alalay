import usePUVController from "@/app/logic/useCommute";
import naturalVoiceService from "@/app/services/naturalVoiceService";
import FlashcardScene from "@/components/FlashcardScene";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useRef, useState } from "react";
import {
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface FlashcardData {
  id: string;
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
    accent: "#2563EB",
  },
  {
    id: "discount",
    label: "20% DISCOUNT",
    phrase: "PWD / SENIOR",
    subtext: "Statutory 20% discount",
    speechText: "May discount po ako bilang PWD o Senior Citizen. Bayad po.",
    accent: "#16A34A",
  },
  {
    id: "change",
    label: "CHANGE PLEASE",
    phrase: "SUKLI PO!",
    subtext: "Waiting for fare change",
    speechText: "Pakiabot po ang sukli ko. Maraming salamat po.",
    accent: "#D97706",
  },
  {
    id: "curbside",
    label: "PULL OVER",
    phrase: "SA TABI LANG!",
    subtext: "Drop off at the corner",
    speechText: "Dito na lang po sa tabi o tawiran. Salamat po.",
    accent: "#E82127",
  },
];

const DISTANCE_PRESETS = [4, 6, 8, 10, 15];

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
  const [isSpeaking, setIsSpeaking] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const currentSlide = FLASHCARD_SLIDES[activeSlideIndex] || FLASHCARD_SLIDES[0];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index >= 0 && index < FLASHCARD_SLIDES.length && index !== activeSlideIndex) {
      setActiveSlideIndex(index);
    }
  };

  const handleSpeak = (text: string) => {
    setIsSpeaking(true);
    naturalVoiceService.speakNatural(text, {
      onStart: () => setIsSpeaking(true),
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
      await WebBrowser.openBrowserAsync("https://ltfrb.gov.ph/fare-rates/");
    } catch {
      Linking.openURL("https://ltfrb.gov.ph/fare-rates/").catch(() => {});
    }
  };

  return (
    <View className="flex-1 bg-[#000000] pt-12">
      <StatusBar barStyle="light-content" />

      {/* Minimalist Tesla Header — Large Text, Zero Clutter */}
      <View className="px-6 pb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-white font-bold text-3xl tracking-tight">
            ParaPo!
          </Text>
          <Text className="text-[#8E8E93] text-sm font-medium mt-0.5">
            Ready
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleSpeak(currentSlide.speechText)}
          activeOpacity={0.6}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={isSpeaking ? "volume-high" : "volume-medium-outline"}
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HERO: EDGE-TO-EDGE SWIPEABLE FLASHCARDS (NO NESTED BOXES) */}
        <View className="mt-2">
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
                activeOpacity={0.9}
                onPress={() => handleOpenFullscreen(slide)}
                style={{ width: SCREEN_WIDTH }}
                className="px-6 py-8 justify-center items-center"
              >
                <FlashcardScene accentColor={slide.accent} />

                <Text className="text-[#8E8E93] text-base font-bold uppercase tracking-widest mt-4">
                  {slide.label}
                </Text>

                <Text className="text-white font-black text-5xl tracking-tight text-center mt-1">
                  {slide.phrase}
                </Text>

                <Text className="text-[#A1A1AA] text-lg font-medium text-center mt-2">
                  {slide.subtext}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Minimalist Paging Dots */}
          <View className="flex-row justify-center items-center mt-1 gap-2">
            {FLASHCARD_SLIDES.map((_, i) => (
              <View
                key={i}
                className={`h-2 rounded-full ${
                  activeSlideIndex === i ? "w-7 bg-white" : "w-2 bg-[#3F3F46]"
                }`}
              />
            ))}
          </View>
        </View>

        {/* TESLA FRAMELESS ICON BAR (Pure Icons — No Rectangular or Circular Button Boxes) */}
        <View className="flex-row justify-around items-center px-8 py-7 mt-2">
          <TouchableOpacity
            onPress={() => handleSpeak(currentSlide.speechText)}
            activeOpacity={0.6}
            className="items-center"
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons
              name={isSpeaking ? "volume-high" : "volume-medium-outline"}
              size={30}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleOpenFullscreen(currentSlide)}
            activeOpacity={0.6}
            className="items-center"
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="expand-outline" size={30} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/IDCardTab")}
            activeOpacity={0.6}
            className="items-center"
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="card-outline" size={30} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              const stopCard = FLASHCARD_SLIDES[0];
              handleOpenFullscreen(stopCard);
              handleSpeak(stopCard.speechText);
            }}
            activeOpacity={0.6}
            className="items-center"
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="hand-right-outline" size={30} color="#E82127" />
          </TouchableOpacity>
        </View>

        {/* TESLA OPEN LIST ROWS (No Outer Box, No Icon Boxes, Large Readable Text) */}
        <View className="px-6 mt-2">
          <TouchableOpacity
            onPress={() => setShowFareModal(true)}
            activeOpacity={0.6}
            className="py-5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="speedometer" size={28} color="#8E8E93" />
              <View className="ml-5">
                <Text className="text-white text-xl font-bold">
                  Fare Guide
                </Text>
                <Text className="text-[#8E8E93] text-base font-medium mt-0.5">
                  ₱{fareBreakdown.totalFare.toFixed(0)} • {selectedDistanceKm} km
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#636366" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/WebMapTab")}
            activeOpacity={0.6}
            className="py-5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="navigate-outline" size={28} color="#8E8E93" />
              <View className="ml-5">
                <Text className="text-white text-xl font-bold">
                  Navigation
                </Text>
                <Text className="text-[#8E8E93] text-base font-medium mt-0.5">
                  Google Maps
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#636366" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/VoicePromptsTab")}
            activeOpacity={0.6}
            className="py-5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="mic-outline" size={28} color="#8E8E93" />
              <View className="ml-5">
                <Text className="text-white text-xl font-bold">
                  Voice
                </Text>
                <Text className="text-[#8E8E93] text-base font-medium mt-0.5">
                  {naturalVoiceService.getVoiceModel().name} • Local TTS
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#636366" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/IDCardTab")}
            activeOpacity={0.6}
            className="py-5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark-outline" size={28} color="#8E8E93" />
              <View className="ml-5">
                <Text className="text-white text-xl font-bold">
                  ID Vault
                </Text>
                <Text className="text-[#8E8E93] text-base font-medium mt-0.5">
                  Offline Pass
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#636366" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* FULLSCREEN ANIMATED FLASHCARD MODAL */}
      <Modal
        visible={fullscreenCard !== null}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setFullscreenCard(null)}
      >
        {fullscreenCard && (
          <View className="flex-1 bg-[#000000] justify-between px-6 py-12">
            <StatusBar hidden />

            {/* Frameless Top Icons */}
            <View className="flex-row justify-between items-center px-2">
              <TouchableOpacity
                onPress={() => handleSpeak(fullscreenCard.speechText)}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              >
                <Ionicons name="volume-high" size={36} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFullscreenCard(null)}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              >
                <Ionicons name="close" size={38} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Animated Illustration + Giant High-Contrast Text */}
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => handleSpeak(fullscreenCard.speechText)}
              className="items-center justify-center my-auto"
            >
              <FlashcardScene accentColor={fullscreenCard.accent} />

              <Text className="text-[#8E8E93] text-2xl font-bold uppercase tracking-widest text-center mt-6 mb-2">
                {fullscreenCard.label}
              </Text>
              <Text className="text-white font-black text-6xl tracking-tight text-center leading-tight">
                {fullscreenCard.phrase}
              </Text>
              <Text className="text-[#A1A1AA] text-2xl font-medium text-center mt-4">
                {fullscreenCard.subtext}
              </Text>
            </TouchableOpacity>

            <View className="items-center pb-4">
              <Text className="text-[#636366] text-sm font-semibold uppercase tracking-widest">
                Tap card to speak
              </Text>
            </View>
          </View>
        )}
      </Modal>

      {/* FARE GUIDE MODAL (Clean, Unboxed, Tesla Climate-Style Controls) */}
      <Modal
        visible={showFareModal}
        animationType="slide"
        onRequestClose={() => setShowFareModal(false)}
      >
        <View className="flex-1 bg-[#000000] px-6 pt-12 pb-8 justify-between">
          {/* Header */}
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

          {/* Center Giant Fare Readout & Distance Stepper (Like Tesla 68° Climate Screen) */}
          <View className="items-center my-auto">
            <Text className="text-[#8E8E93] text-base font-semibold uppercase tracking-widest mb-2">
              {commuteMode === "traditional" ? "Traditional Jeepney" : "Modern PUV"}
            </Text>

            <Text className="text-white font-black text-7xl tracking-tight my-2">
              ₱{fareBreakdown.totalFare.toFixed(2)}
            </Text>

            {/* Frameless Distance Stepper `< 4.0 km >` */}
            <View className="flex-row items-center justify-center gap-10 mt-6">
              <TouchableOpacity
                onPress={() => adjustDistance(-1)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Ionicons name="chevron-back" size={36} color="#8E8E93" />
              </TouchableOpacity>

              <Text className="text-white font-bold text-4xl">
                {selectedDistanceKm.toFixed(0)} km
              </Text>

              <TouchableOpacity
                onPress={() => adjustDistance(1)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Ionicons name="chevron-forward" size={36} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            {/* Quick KM Numbers */}
            <View className="flex-row gap-6 mt-8">
              {DISTANCE_PRESETS.map((km) => (
                <TouchableOpacity
                  key={km}
                  onPress={() => setPresetDistance(km)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text
                    className={`text-lg font-bold ${
                      selectedDistanceKm === km ? "text-white" : "text-[#52525B]"
                    }`}
                  >
                    {km} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom Controls */}
          <View className="gap-6">
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-white font-bold text-xl">
                Modern PUV
              </Text>
              <Switch
                value={commuteMode === "modern"}
                onValueChange={(v) => setCommuteMode(v ? "modern" : "traditional")}
                thumbColor="#FFFFFF"
                trackColor={{ false: "#27272A", true: "#52525B" }}
              />
            </View>

            <View className="flex-row items-center justify-between py-2">
              <Text className="text-white font-bold text-xl">
                20% Discount (PWD / Senior)
              </Text>
              <Switch
                value={hasDiscount}
                onValueChange={setHasDiscount}
                thumbColor="#FFFFFF"
                trackColor={{ false: "#27272A", true: "#52525B" }}
              />
            </View>

            <View className="flex-row justify-between items-center pt-4">
              <TouchableOpacity onPress={() => setShowMatrixModal(true)}>
                <Text className="text-[#8E8E93] font-bold text-base">
                  Rate Table
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleOpenLtfrbWebsite}>
                <Text className="text-white font-bold text-base">
                  ltfrb.gov.ph ↗
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* RATE MATRIX MODAL */}
      <Modal
        visible={showMatrixModal}
        animationType="slide"
        onRequestClose={() => setShowMatrixModal(false)}
      >
        <View className="flex-1 bg-[#000000] px-6 pt-12">
          <View className="flex-row items-center justify-between pb-6">
            <Text className="text-white text-2xl font-bold">
              LTFRB Fare Table
            </Text>
            <TouchableOpacity onPress={() => setShowMatrixModal(false)}>
              <Ionicons name="close" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row py-3 border-b border-[#27272A]">
              <Text className="w-20 text-[#8E8E93] text-base font-bold">KM</Text>
              <Text className="flex-1 text-[#8E8E93] text-base font-bold text-center">
                Traditional
              </Text>
              <Text className="flex-1 text-[#8E8E93] text-base font-bold text-center">
                Modern
              </Text>
            </View>
            {ltfrbMatrix.map((row) => (
              <View
                key={row.km}
                className="flex-row py-4 border-b border-[#18181B] items-center"
              >
                <Text className="w-20 text-white font-bold text-base">{row.km} km</Text>
                <Text className="flex-1 text-white text-base text-center font-semibold">
                  ₱{row.regularTraditional.toFixed(2)}
                </Text>
                <Text className="flex-1 text-white text-base text-center font-semibold">
                  ₱{row.regularModern.toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
