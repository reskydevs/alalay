import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
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
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ImageZoom from "react-native-image-pan-zoom";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIDCard } from "../logic/useIdCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 14;
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 52, 380);
const CARD_HEIGHT = Math.round(CARD_WIDTH / 1.586); // Standard ID-1 / CR80 card aspect ratio
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const SIDE_SPACING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

const ImageZoomViewer = ImageZoom as unknown as React.ComponentType<any>;

export default function IDCardTab() {
  const insets = useSafeAreaInsets();
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
    handleCaptureCamera,
    handleAttachGallery,
    handleRemovePhoto,
    handleRenameCard,
    handleAddCard,
    handleDeleteCard,
  } = useIDCard();

  const window = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  // Rename Dialog State
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");

  // Modern Tesla/Apple Style Privacy Sheet State
  const [showPrivacySheet, setShowPrivacySheet] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / SNAP_INTERVAL);
    if (idx >= 0 && idx < cards.length && idx !== activeCardIndex) {
      setActiveCardIndex(idx);
      try {
        Haptics.selectionAsync();
      } catch {}
    }
  };

  const openRenameModal = (cardId: string, currentName: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setEditingCardId(cardId);
    setRenameText(currentName);
  };

  const submitRename = () => {
    if (editingCardId && renameText.trim()) {
      handleRenameCard(editingCardId, renameText.trim());
    }
    setEditingCardId(null);
  };

  const handleCardPress = (hasPhoto: boolean) => {
    if (!hasPhoto) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    setModalVisible(true);
  };

  const openPrivacySheet = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setShowPrivacySheet(true);
  };

  return (
    <View
      className="flex-1 bg-black"
      style={{
        paddingTop: Math.max(insets.top, 24),
      }}
    >
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View className="px-6 py-3 flex-row items-center justify-between">
        <View>
          <Text className="text-white font-black text-3xl tracking-tight">
            My ID
          </Text>
          <Text className="text-zinc-500 text-xs font-semibold tracking-wider mt-0.5">
            On-Device Commuter Passes
          </Text>
        </View>

        <View className="flex-row items-center gap-4">
          {/* Add New ID Card */}
          <TouchableOpacity
            onPress={() => handleAddCard()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Modern Privacy Sheet Trigger */}
          <TouchableOpacity
            onPress={openPrivacySheet}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="shield-checkmark-outline" size={22} color="#34D399" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        {/* Real Peeking Card Deck Carousel */}
        <View className="my-auto py-2">
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            snapToAlignment="center"
            contentContainerStyle={{
              paddingHorizontal: SIDE_SPACING,
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {cards.map((card, index) => {
              const hasPhoto = Boolean(card.imageUri);
              const isSelected = activeCardIndex === index;

              return (
                <View
                  key={card.id}
                  style={{
                    width: CARD_WIDTH,
                    marginRight: index < cards.length - 1 ? CARD_GAP : 0,
                  }}
                >
                  <Pressable
                    onPress={() => handleCardPress(hasPhoto)}
                    style={{
                      width: CARD_WIDTH,
                      height: CARD_HEIGHT,
                      borderRadius: 22,
                      backgroundColor: "#18181B",
                      overflow: "hidden",
                      borderWidth: isSelected ? 1.5 : 1,
                      borderColor: isSelected ? "#38BDF8" : "#27272A",
                    }}
                    className="justify-between"
                  >
                    {/* Full Card Face: Photo or Empty Trigger */}
                    {hasPhoto ? (
                      <View className="w-full h-full relative">
                        <Image
                          source={{ uri: card.imageUri! }}
                          style={{
                            width: "100%",
                            height: "100%",
                          }}
                          resizeMode="cover"
                        />

                        {/* Top-Left Floating Name Pill with Pencil */}
                        <View className="absolute top-3 left-3 flex-row items-center gap-1.5 bg-black/70 px-3 py-1.5 rounded-full border border-white/10 z-10">
                          <TouchableOpacity
                            onPress={() => openRenameModal(card.id, card.name)}
                            className="flex-row items-center gap-1.5"
                            activeOpacity={0.7}
                          >
                            <Text
                              numberOfLines={1}
                              className="text-white font-bold text-sm tracking-tight max-w-[180px]"
                            >
                              {card.name}
                            </Text>
                            <Ionicons name="pencil" size={13} color="#94A3B8" />
                          </TouchableOpacity>
                        </View>

                        {/* Bottom Fullscreen Hint Icon */}
                        <View className="absolute bottom-3 right-3 bg-black/60 p-1.5 rounded-full border border-white/10">
                          <Ionicons name="expand" size={14} color="#E2E8F0" />
                        </View>
                      </View>
                    ) : (
                      <View className="w-full h-full justify-between p-5 bg-gradient-to-br from-zinc-900 to-zinc-950">
                        {/* Name at top */}
                        <View className="flex-row items-center justify-between">
                          <TouchableOpacity
                            onPress={() => openRenameModal(card.id, card.name)}
                            className="flex-row items-center gap-2"
                            activeOpacity={0.7}
                          >
                            <Text
                              numberOfLines={1}
                              className="text-white font-bold text-xl tracking-tight"
                            >
                              {card.name}
                            </Text>
                            <Ionicons name="pencil" size={15} color="#71717A" />
                          </TouchableOpacity>
                        </View>

                        {/* Center Frameless Action Triggers */}
                        <View className="flex-row items-center justify-center gap-8 py-2">
                          <TouchableOpacity
                            onPress={() => handleCaptureCamera(card.id)}
                            activeOpacity={0.7}
                            className="items-center gap-2"
                          >
                            <View className="w-14 h-14 rounded-full bg-zinc-800/80 items-center justify-center border border-zinc-700/60">
                              <Ionicons name="camera" size={24} color="#38BDF8" />
                            </View>
                            <Text className="text-zinc-300 font-semibold text-xs">
                              Camera
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleAttachGallery(card.id)}
                            activeOpacity={0.7}
                            className="items-center gap-2"
                          >
                            <View className="w-14 h-14 rounded-full bg-zinc-800/80 items-center justify-center border border-zinc-700/60">
                              <Ionicons name="images" size={24} color="#FACC15" />
                            </View>
                            <Text className="text-zinc-300 font-semibold text-xs">
                              Photos
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* Subtitle bottom */}
                        <Text className="text-zinc-500 text-xs text-center font-medium">
                          Attach PWD, Senior, or Student pass photo
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>

          {/* Peeking Carousel Paging Dots */}
          <View className="flex-row justify-center items-center mt-6 gap-2">
            {cards.map((_, i) => (
              <View
                key={i}
                className={`h-1.5 rounded-full ${
                  activeCardIndex === i ? "w-6 bg-white" : "w-1.5 bg-zinc-800"
                }`}
              />
            ))}
          </View>

          {/* Frameless Quick Actions Below Carousel */}
          {Boolean(activeCard?.imageUri) && (
            <View className="flex-row justify-center items-center gap-10 mt-6">
              <TouchableOpacity
                onPress={() => handleCaptureCamera(activeCard.id)}
                className="items-center gap-1.5"
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
                <Text className="text-zinc-400 text-[11px] font-semibold">
                  Retake
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleAttachGallery(activeCard.id)}
                className="items-center gap-1.5"
                activeOpacity={0.7}
              >
                <Ionicons name="image-outline" size={22} color="#FFFFFF" />
                <Text className="text-zinc-400 text-[11px] font-semibold">
                  Photos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteCard(activeCard.id)}
                className="items-center gap-1.5"
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={22} color="#EF4444" />
                <Text className="text-red-400 text-[11px] font-semibold">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODERN TESLA/APPLE STYLE PRIVACY BOTTOM SHEET */}
      <Modal
        visible={showPrivacySheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPrivacySheet(false)}
      >
        <Pressable
          onPress={() => setShowPrivacySheet(false)}
          className="flex-1 bg-black/80 justify-end"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-zinc-950 border-t border-zinc-800 rounded-t-[32px] px-6 pt-4 pb-8"
          >
            {/* Grab Handle */}
            <View className="w-10 h-1 rounded-full bg-zinc-700 self-center mb-6" />

            {/* Radiant Verified Shield */}
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/30 items-center justify-center mb-3">
                <Ionicons name="shield-checkmark" size={32} color="#34D399" />
              </View>
              <Text className="text-white text-2xl font-black text-center tracking-tight">
                Stored Only on Your Device
              </Text>
              <Text className="text-zinc-400 text-xs text-center mt-1">
                Zero Cloud Transmission • 100% Private Offline Storage
              </Text>
            </View>

            {/* Feature Points */}
            <View className="gap-3.5 my-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80">
              <View className="flex-row items-center gap-3">
                <Ionicons name="phone-portrait-outline" size={20} color="#38BDF8" />
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm">
                    100% Local Sandboxed Storage
                  </Text>
                  <Text className="text-zinc-400 text-xs">
                    Your ID photos stay inside your phone's isolated app directory.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <Ionicons name="cloud-offline-outline" size={20} color="#FACC15" />
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm">
                    No Cloud Servers or Tracking
                  </Text>
                  <Text className="text-zinc-400 text-xs">
                    Never uploaded to online databases or shared with third parties.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <Ionicons name="trash-bin-outline" size={20} color="#34D399" />
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm">
                    Instant Disk Erasure
                  </Text>
                  <Text className="text-zinc-400 text-xs">
                    Deleting an ID card permanently removes its image from your disk.
                  </Text>
                </View>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowPrivacySheet(false)}
              className="bg-white py-3.5 rounded-full items-center mt-2"
              activeOpacity={0.85}
            >
              <Text className="text-black font-black text-sm tracking-wider uppercase">
                Got it
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* RENAME MODAL */}
      <Modal
        visible={editingCardId !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditingCardId(null)}
      >
        <View className="flex-1 bg-black/80 items-center justify-center px-6">
          <View className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <Text className="text-white text-xl font-bold mb-3">
              Rename ID Card
            </Text>
            <TextInput
              value={renameText}
              onChangeText={setRenameText}
              placeholder="e.g. PWD ID, Senior ID, School ID"
              placeholderTextColor="#71717A"
              className="bg-zinc-800 text-white px-4 py-3 rounded-2xl text-base mb-5"
              autoFocus
              selectTextOnFocus
              maxLength={40}
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setEditingCardId(null)}
                className="py-2.5 px-4 rounded-xl"
              >
                <Text className="text-zinc-400 font-semibold text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitRename}
                className="bg-white py-2.5 px-6 rounded-full"
              >
                <Text className="text-black font-bold text-base">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FULLSCREEN ZOOMABLE INSPECTOR MODAL */}
      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black">
          <StatusBar hidden />

          {/* Top Bar */}
          <View className="px-6 pt-12 pb-4 flex-row items-center justify-between z-20">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            >
              <Ionicons name="close" size={30} color="#FFFFFF" />
            </TouchableOpacity>

            <Text className="text-white font-bold text-lg">
              {activeCard?.name || "My ID"}
            </Text>

            <TouchableOpacity
              onPress={() => setRotation((prev) => (prev + 90) % 360)}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            >
              <Ionicons name="refresh" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Interactive Zoomable Photo */}
          <View className="flex-1 items-center justify-center">
            {activeCard?.imageUri && (
              <ImageZoomViewer
                ref={imageZoomRef}
                cropWidth={window.width}
                cropHeight={window.height - 100}
                imageWidth={window.width - 32}
                imageHeight={window.height - 180}
                minScale={0.8}
                maxScale={4}
                enableSwipeDown={true}
                onSwipeDown={() => setModalVisible(false)}
              >
                <Image
                  source={{ uri: activeCard.imageUri }}
                  style={{
                    width: window.width - 32,
                    height: window.height - 180,
                    transform: [{ rotate: `${rotation}deg` }],
                  }}
                  resizeMode="contain"
                />
              </ImageZoomViewer>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
