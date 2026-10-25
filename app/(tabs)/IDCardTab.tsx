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
    showPrivacyInfo,
  } = useIDCard();

  const window = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  // Rename Dialog State
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");

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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000000",
        paddingTop: Math.max(insets.top, 24),
      }}
    >
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View className="px-6 py-3 flex-row items-center justify-between">
        <Text className="text-white font-bold text-3xl tracking-tight">
          My ID
        </Text>

        <View className="flex-row items-center gap-5">
          {/* Add ID Card */}
          <TouchableOpacity
            onPress={() => handleAddCard()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="add" size={30} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Privacy Security Info */}
          <TouchableOpacity
            onPress={showPrivacyInfo}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1, justifyContent: "center" }}
      >
        {/* Horizontal Swiping Cards Carousel */}
        <View className="my-auto">
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
          >
            {cards.map((card) => {
              const hasPhoto = Boolean(card.imageUri);
              return (
                <View
                  key={card.id}
                  style={{ width: SCREEN_WIDTH }}
                  className="px-6 justify-center items-center"
                >
                  <Pressable
                    onPress={() => handleCardPress(hasPhoto)}
                    style={{
                      width: SCREEN_WIDTH - 48,
                      height: 250,
                      borderRadius: 24,
                      backgroundColor: "#141416",
                      borderColor: "#27272A",
                      borderWidth: 1.5,
                      overflow: "hidden",
                    }}
                    className="justify-between p-5"
                  >
                    {/* Card Header: User Defined Name & Actions */}
                    <View className="flex-row items-center justify-between z-10">
                      <TouchableOpacity
                        onPress={() => openRenameModal(card.id, card.name)}
                        className="flex-row items-center gap-2 max-w-[80%]"
                        activeOpacity={0.7}
                      >
                        <Text
                          numberOfLines={1}
                          className="text-white font-bold text-2xl tracking-tight"
                        >
                          {card.name}
                        </Text>
                        <Ionicons name="pencil" size={16} color="#8E8E93" />
                      </TouchableOpacity>

                      {cards.length > 1 && (
                        <TouchableOpacity
                          onPress={() => handleDeleteCard(card.id)}
                          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Card Body: Photo or Minimal Attach Trigger */}
                    {hasPhoto ? (
                      <View className="flex-1 justify-center items-center my-2">
                        <Image
                          source={{ uri: card.imageUri! }}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 14,
                          }}
                          resizeMode="cover"
                        />
                      </View>
                    ) : (
                      <View className="flex-1 items-center justify-center my-3">
                        <View className="flex-row gap-4 mt-2">
                          {/* Take Camera Photo */}
                          <TouchableOpacity
                            onPress={() => handleCaptureCamera(card.id)}
                            activeOpacity={0.7}
                            style={{ backgroundColor: "#27272A" }}
                            className="flex-row items-center py-3 px-4 rounded-xl gap-2"
                          >
                            <Ionicons name="camera" size={20} color="#FFFFFF" />
                            <Text className="text-white font-semibold text-sm">
                              Camera
                            </Text>
                          </TouchableOpacity>

                          {/* Choose From Gallery */}
                          <TouchableOpacity
                            onPress={() => handleAttachGallery(card.id)}
                            activeOpacity={0.7}
                            style={{ backgroundColor: "#27272A" }}
                            className="flex-row items-center py-3 px-4 rounded-xl gap-2"
                          >
                            <Ionicons name="images" size={20} color="#FFFFFF" />
                            <Text className="text-white font-semibold text-sm">
                              Photos
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Card Footer */}
                    <View className="flex-row items-center justify-between z-10 pt-1">
                      {hasPhoto ? (
                        <Text className="text-[#8E8E93] text-xs font-medium">
                          Tap card to view fullscreen
                        </Text>
                      ) : (
                        <Text className="text-[#71717A] text-xs font-medium">
                          Attach photo for conductor inspection
                        </Text>
                      )}
                      {hasPhoto && (
                        <Ionicons name="expand" size={18} color="#8E8E93" />
                      )}
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>

          {/* Minimalist Paging Dots */}
          <View className="flex-row justify-center items-center mt-5 gap-2">
            {cards.map((_, i) => (
              <View
                key={i}
                className={`h-2 rounded-full ${
                  activeCardIndex === i ? "w-6 bg-white" : "w-2 bg-[#3F3F46]"
                }`}
              />
            ))}
          </View>

          {/* Quick Action Bar (Update / Retake Photo) */}
          {Boolean(activeCard?.imageUri) && (
            <View className="flex-row justify-center items-center gap-6 mt-6">
              <TouchableOpacity
                onPress={() => handleCaptureCamera(activeCard.id)}
                className="flex-row items-center gap-2 py-2 px-4 rounded-xl bg-[#18181B] border border-[#27272A]"
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
                <Text className="text-white text-xs font-semibold">Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleAttachGallery(activeCard.id)}
                className="flex-row items-center gap-2 py-2 px-4 rounded-xl bg-[#18181B] border border-[#27272A]"
                activeOpacity={0.7}
              >
                <Ionicons name="image-outline" size={18} color="#FFFFFF" />
                <Text className="text-white text-xs font-semibold">Photos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRemovePhoto(activeCard.id)}
                className="py-2 px-3 rounded-xl bg-[#18181B] border border-[#27272A]"
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* RENAME MODAL */}
      <Modal
        visible={editingCardId !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditingCardId(null)}
      >
        <View className="flex-1 bg-black/80 items-center justify-center px-6">
          <View className="w-full bg-[#18181B] border border-[#27272A] rounded-2xl p-6">
            <Text className="text-white text-xl font-bold mb-4">
              Rename ID Card
            </Text>
            <TextInput
              value={renameText}
              onChangeText={setRenameText}
              placeholder="e.g. PWD ID, Senior ID, School ID"
              placeholderTextColor="#71717A"
              className="bg-[#27272A] text-white px-4 py-3 rounded-xl text-base mb-6"
              autoFocus
              selectTextOnFocus
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setEditingCardId(null)}
                className="py-2.5 px-4 rounded-xl"
              >
                <Text className="text-[#8E8E93] font-semibold text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitRename}
                className="bg-white py-2.5 px-5 rounded-xl"
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
        <View className="flex-1 bg-[#000000]">
          <StatusBar hidden />

          {/* Top Bar */}
          <View className="px-6 pt-12 pb-4 flex-row items-center justify-between z-20">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            >
              <Ionicons name="close" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            <Text className="text-white font-bold text-lg">
              {activeCard?.name || "My ID"}
            </Text>

            <TouchableOpacity
              onPress={() => setRotation((prev) => (prev + 90) % 360)}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            >
              <Ionicons name="refresh" size={28} color="#FFFFFF" />
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
