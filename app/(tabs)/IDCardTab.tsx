import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ImageZoom from "react-native-image-pan-zoom";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useIDCard } from "../logic/useIdCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ImageZoomViewer = ImageZoom as unknown as React.ComponentType<any>;

export default function IDCardTab() {
  const {
    cards,
    activeCardIndex,
    setActiveCardIndex,
    activeCard,
    modalVisible,
    setModalVisible,
    rotation,
    setRotation,
    imageZoomRef,
    handleAttachPhoto,
    handleRemovePhoto,
    showPrivacyInfo,
  } = useIDCard();

  const window = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / SCREEN_WIDTH);
    if (idx >= 0 && idx < cards.length && idx !== activeCardIndex) {
      setActiveCardIndex(idx);
      try {
        Haptics.selectionAsync();
      } catch {}
    }
  };

  const handleCardPress = (cardId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    setModalVisible(true);
  };

  return (
    <View className="flex-1 bg-[#000000] pt-12">
      <StatusBar barStyle="light-content" />

      {/* Minimalist Google Wallet Header */}
      <View className="px-6 pb-3 flex-row items-center justify-between">
        <Text className="text-white font-bold text-3xl tracking-tight">
          My ID
        </Text>

        <View className="flex-row items-center gap-5">
          <TouchableOpacity
            onPress={() => handleAttachPhoto(activeCard.id)}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <Ionicons name="camera-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={showPrivacyInfo}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <Ionicons name="shield-checkmark-outline" size={26} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48, flexGrow: 1 }}
      >
        {/* Subtitle / Google Wallet Quick Description */}
        <View className="px-6 pb-4">
          <Text className="text-[#8E8E93] text-base font-medium">
            Swipe between your transit passes. Tap to expand for conductor inspection.
          </Text>
        </View>

        {/* HORIZONTAL SWIPEABLE WALLET CARDS CAROUSEL */}
        <View className="my-2">
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
          >
            {cards.map((card, index) => {
              const hasPhoto = Boolean(card.imageUri);
              return (
                <View
                  key={card.id}
                  style={{ width: SCREEN_WIDTH }}
                  className="px-6 justify-center items-center"
                >
                  <Pressable
                    onPress={() => handleCardPress(card.id)}
                    style={{
                      backgroundColor: card.gradientTop,
                      borderColor: "#27272A",
                    }}
                    className="w-full h-[225px] rounded-3xl border p-5 justify-between overflow-hidden shadow-2xl"
                  >
                    {/* If user attached physical ID photo */}
                    {hasPhoto ? (
                      <>
                        <Image
                          source={{ uri: card.imageUri! }}
                          className="absolute inset-0 w-full h-full opacity-90"
                          resizeMode="cover"
                        />
                        <View className="absolute inset-0 bg-black/35" />

                        <View className="flex-row justify-between items-start z-10">
                          <View>
                            <Text className="text-[#A1A1AA] text-xs font-bold tracking-widest uppercase">
                              {card.issuer}
                            </Text>
                            <Text className="text-white text-2xl font-black tracking-tight mt-0.5">
                              {card.title}
                            </Text>
                          </View>
                          <View
                            style={{ backgroundColor: card.accentColor }}
                            className="px-2.5 py-1 rounded-full"
                          >
                            <Text className="text-black font-extrabold text-xs">
                              VERIFIED
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row justify-between items-end z-10">
                          <View>
                            <Text className="text-white/80 font-bold text-sm tracking-wider">
                              {card.idNumberPreview}
                            </Text>
                            <Text className="text-white/60 text-xs font-semibold mt-0.5">
                              Tap to inspect fullscreen
                            </Text>
                          </View>
                          <Ionicons name="expand" size={24} color="#FFFFFF" />
                        </View>
                      </>
                    ) : (
                      /* Realistic Digital Pass Template */
                      <>
                        {/* Top Row: Issuer & Discount Badge */}
                        <View className="flex-row justify-between items-start">
                          <View className="flex-1 mr-2">
                            <Text className="text-[#8E8E93] text-xs font-bold tracking-widest uppercase">
                              {card.issuer}
                            </Text>
                            <Text className="text-white text-2xl font-black tracking-tight mt-0.5">
                              {card.title}
                            </Text>
                          </View>
                          <View
                            style={{ backgroundColor: card.accentColor }}
                            className="px-2.5 py-1 rounded-full"
                          >
                            <Text className="text-black font-extrabold text-xs">
                              {card.discountLabel.split(" ")[0]}
                            </Text>
                          </View>
                        </View>

                        {/* Center: Smart Chip Glyph & Transit Symbol */}
                        <View className="flex-row items-center justify-between my-auto py-1">
                          {/* Microchip vector icon */}
                          <Svg width="44" height="34" viewBox="0 0 44 34">
                            <Rect
                              x="1"
                              y="1"
                              width="42"
                              height="32"
                              rx="6"
                              fill="#D97706"
                              stroke="#FDE047"
                              strokeWidth="2"
                            />
                            <Path
                              d="M1 12 L14 12 M1 22 L14 22 M30 12 L43 12 M30 22 L43 22 M22 1 L22 10 M22 24 L22 33"
                              stroke="#FDE047"
                              strokeWidth="1.5"
                            />
                            <Circle cx="22" cy="17" r="5" fill="#B45309" />
                          </Svg>

                          <View className="flex-row items-center gap-1.5 opacity-80">
                            <Ionicons name="wifi" size={20} color="#FFFFFF" />
                            <Text className="text-white text-xs font-bold tracking-widest">
                              NFC PASS
                            </Text>
                          </View>
                        </View>

                        {/* Bottom Row: Holder & Attach Prompt */}
                        <View className="flex-row justify-between items-end">
                          <View>
                            <Text className="text-white/90 font-bold text-sm tracking-wider">
                              {card.idNumberPreview}
                            </Text>
                            <Text className="text-[#8E8E93] text-xs font-medium mt-0.5">
                              {card.holderName}
                            </Text>
                          </View>

                          <TouchableOpacity
                            onPress={() => handleAttachPhoto(card.id)}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            className="flex-row items-center bg-white/10 px-3 py-1.5 rounded-xl border border-white/15"
                          >
                            <Ionicons name="camera" size={16} color="#FFFFFF" />
                            <Text className="text-white text-xs font-bold ml-1.5">
                              Attach ID
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>

          {/* Google Wallet Paging Dots */}
          <View className="flex-row justify-center items-center mt-4 gap-2">
            {cards.map((_, i) => (
              <View
                key={i}
                className={`h-2 rounded-full ${
                  activeCardIndex === i ? "w-7 bg-white" : "w-2 bg-[#3F3F46]"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Action Controls for Selected Card */}
        <View className="px-6 mt-6 gap-3">
          <TouchableOpacity
            onPress={() => handleCardPress(activeCard.id)}
            activeOpacity={0.85}
            className="py-4 px-5 rounded-2xl bg-[#18181B] flex-row items-center justify-between border border-[#27272A]"
          >
            <View className="flex-row items-center">
              <Ionicons name="scan-outline" size={24} color="#FFFFFF" />
              <View className="ml-3.5">
                <Text className="text-white font-bold text-lg">
                  Present {activeCard.title}
                </Text>
                <Text className="text-[#8E8E93] text-sm font-medium mt-0.5">
                  High-contrast inspection mode for conductors
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#71717A" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleAttachPhoto(activeCard.id)}
            activeOpacity={0.85}
            className="py-4 px-5 rounded-2xl bg-[#18181B] flex-row items-center justify-between border border-[#27272A]"
          >
            <View className="flex-row items-center">
              <Ionicons name="camera-reverse-outline" size={24} color={activeCard.accentColor} />
              <View className="ml-3.5">
                <Text className="text-white font-bold text-lg">
                  {activeCard.imageUri ? "Update Card Photo" : "Add Physical ID Photo"}
                </Text>
                <Text className="text-[#8E8E93] text-sm font-medium mt-0.5">
                  Capture or choose front of ID card
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#71717A" />
          </TouchableOpacity>

          {activeCard.imageUri && (
            <TouchableOpacity
              onPress={() => handleRemovePhoto(activeCard.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="py-2.5 items-center justify-center mt-1"
            >
              <Text className="text-[#EF4444] font-semibold text-sm">
                Remove Attached Photo
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* FULLSCREEN CONDUCOTR INSPECTION MODAL */}
      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
        supportedOrientations={["portrait", "landscape"]}
      >
        <View className="flex-1 bg-black justify-between px-6 pt-12 pb-8">
          <StatusBar hidden />

          {/* Top Bar: Close, Title & Rotate */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            >
              <Ionicons name="close" size={36} color="#FFFFFF" />
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-white font-bold text-xl">
                {activeCard.title}
              </Text>
              <Text
                style={{ color: activeCard.accentColor }}
                className="text-xs font-extrabold uppercase tracking-widest mt-0.5"
              >
                {activeCard.discountLabel}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch {}
                setRotation((r) => (r + 90) % 360);
              }}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            >
              <Ionicons name="refresh-outline" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Interactive Zoomable ID View */}
          <View className="flex-1 justify-center items-center my-4">
            {activeCard.imageUri ? (
              <ImageZoomViewer
                ref={imageZoomRef}
                cropWidth={window.width}
                cropHeight={window.height * 0.72}
                imageWidth={window.width * 0.94}
                imageHeight={window.height * 0.62}
                minScale={0.5}
                maxScale={4}
                enableDoubleClickZoom
                enableCenterFocus={false}
                panToMove
                pinchToZoom
                useNativeDriver
              >
                <Image
                  source={{ uri: activeCard.imageUri }}
                  style={{
                    width: window.width * 0.94,
                    height: window.height * 0.62,
                    transform: [{ rotate: `${rotation}deg` }],
                    borderRadius: 20,
                  }}
                  resizeMode="contain"
                />
              </ImageZoomViewer>
            ) : (
              <View
                style={{
                  width: window.width * 0.9,
                  height: 240,
                  backgroundColor: activeCard.gradientTop,
                  borderColor: activeCard.accentColor,
                  transform: [{ rotate: `${rotation}deg` }],
                }}
                className="rounded-3xl border-2 p-6 justify-between"
              >
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-[#8E8E93] text-xs font-bold uppercase tracking-wider">
                      {activeCard.issuer}
                    </Text>
                    <Text className="text-white text-3xl font-black tracking-tight mt-1">
                      {activeCard.title}
                    </Text>
                  </View>
                  <View
                    style={{ backgroundColor: activeCard.accentColor }}
                    className="px-3 py-1 rounded-full"
                  >
                    <Text className="text-black font-extrabold text-sm">
                      -20%
                    </Text>
                  </View>
                </View>

                <View className="items-center justify-center py-4">
                  <Ionicons name="shield-checkmark" size={48} color={activeCard.accentColor} />
                  <Text className="text-white text-base font-bold mt-2 text-center">
                    Statutory Commuter Discount
                  </Text>
                  <Text className="text-[#8E8E93] text-xs font-semibold text-center mt-1">
                    Republic Act 7277 / 9442 (PWD) & RA 9994 (Senior)
                  </Text>
                </View>

                <View className="flex-row justify-between items-center border-t border-white/10 pt-3">
                  <Text className="text-white/80 font-bold text-sm">
                    {activeCard.idNumberPreview}
                  </Text>
                  <Text className="text-[#8E8E93] text-xs">
                    OFFICIAL PASS
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Bottom Zoom / Help Hint */}
          <View className="items-center pb-2">
            <Text className="text-[#71717A] text-sm font-semibold">
              Pinch or double-tap to zoom • Rotate button on top right
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
