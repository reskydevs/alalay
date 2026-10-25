import usePUVController from "@/app/logic/useCommute";
import naturalVoiceService from "@/app/services/naturalVoiceService";
import FlashcardScene, { SceneType } from "@/components/FlashcardScene";
import VoiceOrb from "@/components/VoiceOrb";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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
import { WebView } from "react-native-webview";

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
    subtext: "Statutory 20% discount",
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
    <View className="flex-1 bg-[#000000] pt-8">
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36, paddingTop: 4 }}
      >
        {/* HERO: SWIPEABLE FLASHCARDS (UNBOXED FULL CANVAS) */}
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
                activeOpacity={0.92}
                onPress={() => handleOpenFullscreen(slide)}
                style={{ width: SCREEN_WIDTH }}
                className="px-6 py-2 justify-center items-center"
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

                  <Text className="text-[#8E8E93] text-lg font-bold uppercase tracking-widest mt-4">
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

        {/* LARGE CHATGPT VOICE MODE ORB + GLOWING SPEAK TRIGGER */}
        <View className="items-center justify-center mt-6 mb-4">
          <VoiceOrb
            isSpeaking={isSpeaking}
            onPress={() => handleSpeak(currentSlide.speechText)}
            label="Tap to Speak"
            accentColor={currentSlide.accent}
            size="large"
          />
        </View>

        {/* SINGLE UNIQUE TELEMETRY ROW (Zero Duplicated Tab Links) */}
        <View className="px-6 mt-4">
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setShowFareModal(true);
            }}
            activeOpacity={0.6}
            className="py-5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="speedometer" size={32} color="#8E8E93" />
              <View className="ml-5">
                <Text className="text-white text-2xl font-bold">
                  Fare Guide
                </Text>
                <Text className="text-[#8E8E93] text-lg font-medium mt-0.5">
                  ₱{fareBreakdown.totalFare.toFixed(0)} • {selectedDistanceKm} km
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={26} color="#636366" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* FULLSCREEN ANIMATED FLASHCARD + CHATGPT VOICE MODE ORB */}
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

            {/* Large Glowing Voice Orb at Bottom */}
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

      {/* FARE GUIDE MODAL */}
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
              <Ionicons name="close" size={34} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View className="items-center my-auto">
            <Text className="text-[#8E8E93] text-lg font-semibold uppercase tracking-widest mb-2">
              {commuteMode === "traditional" ? "Traditional Jeepney" : "Modern PUV"}
            </Text>

            <Text className="text-white font-black text-7xl tracking-tight my-2">
              ₱{fareBreakdown.totalFare.toFixed(2)}
            </Text>

            <View className="flex-row items-center justify-center gap-12 mt-6">
              <TouchableOpacity
                onPress={() => adjustDistance(-1)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Ionicons name="chevron-back" size={40} color="#8E8E93" />
              </TouchableOpacity>

              <Text className="text-white font-bold text-4xl">
                {selectedDistanceKm.toFixed(0)} km
              </Text>

              <TouchableOpacity
                onPress={() => adjustDistance(1)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Ionicons name="chevron-forward" size={40} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-6 mt-8">
              {DISTANCE_PRESETS.map((km) => (
                <TouchableOpacity
                  key={km}
                  onPress={() => setPresetDistance(km)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text
                    className={`text-xl font-bold ${
                      selectedDistanceKm === km ? "text-white" : "text-[#52525B]"
                    }`}
                  >
                    {km} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
                <Text className="text-[#8E8E93] font-bold text-lg">
                  Rate Table
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowLtfrbWebViewModal(true)}>
                <Text className="text-white font-bold text-lg">
                  Official LTFRB Portal
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
            <Text className="text-white text-3xl font-bold">
              Rate Table
            </Text>
            <TouchableOpacity onPress={() => setShowMatrixModal(false)}>
              <Ionicons name="close" size={34} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row py-3 border-b border-[#27272A]">
              <Text className="w-20 text-[#8E8E93] text-lg font-bold">KM</Text>
              <Text className="flex-1 text-[#8E8E93] text-lg font-bold text-center">
                Traditional
              </Text>
              <Text className="flex-1 text-[#8E8E93] text-lg font-bold text-center">
                Modern
              </Text>
            </View>
            {ltfrbMatrix.map((row) => (
              <View
                key={row.km}
                className="flex-row py-4 border-b border-[#18181B] items-center"
              >
                <Text className="w-20 text-white font-bold text-lg">{row.km} km</Text>
                <Text className="flex-1 text-white text-lg text-center font-semibold">
                  ₱{row.regularTraditional.toFixed(2)}
                </Text>
                <Text className="flex-1 text-white text-lg text-center font-semibold">
                  ₱{row.regularModern.toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* IN-APP LTFRB WEBVIEW MODAL (Seamless Embedded WebView — No External Browser) */}
      <Modal
        visible={showLtfrbWebViewModal}
        animationType="slide"
        onRequestClose={() => setShowLtfrbWebViewModal(false)}
      >
        <View className="flex-1 bg-[#000000] pt-11">
          <View className="px-6 pb-3 flex-row items-center justify-between">
            <Text className="text-white font-bold text-2xl">
              LTFRB Fare Rates
            </Text>
            <TouchableOpacity
              onPress={() => setShowLtfrbWebViewModal(false)}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="close" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View className="flex-1 bg-[#000000]">
            <WebView
              source={{ uri: "https://ltfrb.gov.ph/fare-rates/" }}
              startInLoadingState={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mixedContentMode="always"
              className="flex-1"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
