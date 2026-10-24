import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  Image,
  Modal,
  Pressable,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ImageZoom from "react-native-image-pan-zoom";
import { useIDCard } from "../logic/useIdCard";

const ImageZoomViewer = ImageZoom as unknown as React.ComponentType<any>;

export default function IDCardTab() {
  const {
    idImage,
    modalVisible,
    zoomScale,
    setZoomScale,
    rotation,
    setModalVisible,
    showPrivacyInfo,
    handleAddID,
    handleZoomIn,
    handleZoomOut,
    setRotation,
  } = useIDCard();

  const window = useWindowDimensions();
  const imageZoomRef = useRef<any>(null);

  return (
    <View className="flex-1 bg-[#000000] pt-12 px-5">
      <StatusBar barStyle="light-content" />

      {/* Tesla Vault Header */}
      <View className="pb-4 border-b border-[#1C1C1E] mb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-white font-extrabold text-2xl tracking-tight">
            Commuter ID Vault
          </Text>
          <Text className="text-[#8E8E93] text-xs font-medium mt-0.5">
            100% Offline • Encrypted on Local Device
          </Text>
        </View>

        <TouchableOpacity
          onPress={showPrivacyInfo}
          className="bg-[#121214] px-3.5 py-1.5 rounded-full border border-[#27272A] flex-row items-center"
        >
          <MaterialCommunityIcons name="shield-check" size={14} color="#FFFFFF" />
          <Text className="text-[#A1A1AA] text-xs font-semibold ml-1.5">
            RA 10173
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 justify-center items-center">
        {idImage ? (
          <>
            <Pressable
              onPress={() => setModalVisible(true)}
              className="items-center mb-6"
            >
              <View className="p-2 bg-[#121214] rounded-3xl border border-[#27272A] shadow-2xl">
                <Image
                  source={{ uri: idImage }}
                  className="w-[300px] h-[190px] rounded-2xl"
                  resizeMode="cover"
                />
              </View>
              <View className="flex-row items-center mt-3 bg-[#121214] border border-[#27272A] rounded-full px-4 py-2">
                <Ionicons name="expand" size={14} color="#FFFFFF" />
                <Text className="ml-2 text-xs text-[#A1A1AA] font-bold">
                  Tap to view ID fullscreen
                </Text>
              </View>
            </Pressable>

            <Modal
              visible={modalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setModalVisible(false)}
              supportedOrientations={["portrait", "landscape"]}
            >
              <View className="flex-1 justify-center items-center bg-black/95">
                <View className="justify-center items-center w-full h-full">
                  <ImageZoomViewer
                    ref={imageZoomRef}
                    cropWidth={window.width}
                    cropHeight={window.height * 0.85}
                    imageWidth={window.width * 0.9}
                    imageHeight={window.height * 0.7}
                    minScale={0.5}
                    maxScale={4}
                    enableDoubleClickZoom
                    enableCenterFocus={false}
                    panToMove
                    pinchToZoom
                    useNativeDriver
                    scale={zoomScale}
                    onMove={({ scale }: { scale: number }) => setZoomScale(scale)}
                  >
                    <Image
                      source={{ uri: idImage }}
                      style={{
                        width: window.width * 0.9,
                        height: window.height * 0.7,
                        transform: [{ rotate: `${rotation}deg` }],
                      }}
                      resizeMode="contain"
                    />
                  </ImageZoomViewer>

                  {/* Zoom Controls HUD */}
                  <View className="absolute bottom-[70px] left-0 right-0 flex-row justify-center items-center bg-[#121214]/90 rounded-2xl px-4 py-2 border border-[#27272A] z-20 mx-10">
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => handleZoomOut(imageZoomRef)}
                      accessibilityLabel="Zoom out"
                    >
                      <Ionicons name="remove-circle-outline" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text className="text-white mx-3 text-sm font-bold w-[45px] text-center">
                      {zoomScale.toFixed(1)}x
                    </Text>
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => handleZoomIn(imageZoomRef)}
                      accessibilityLabel="Zoom in"
                    >
                      <Ionicons name="add-circle-outline" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-white/10 rounded-xl p-2 ml-3"
                      onPress={() => setRotation((r) => (r + 90) % 360)}
                      accessibilityLabel="Rotate image"
                    >
                      <Ionicons name="refresh-outline" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    className="absolute top-[48px] right-[24px] bg-[#1C1C1E] rounded-full p-2.5 border border-[#27272A]"
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <View className="items-center justify-center mb-8 w-[290px] self-center">
            <View className="w-20 h-20 rounded-3xl bg-[#121214] border border-[#27272A] items-center justify-center mb-4 shadow-xl">
              <MaterialCommunityIcons
                name="card-account-details-outline"
                size={40}
                color="#8E8E93"
              />
            </View>
            <Text className="text-lg font-extrabold text-center text-white mb-1 tracking-tight">
              No ID Card Stored
            </Text>
            <Text className="text-xs text-center text-[#8E8E93] leading-5">
              Securely store a photo of your PWD, Senior Citizen, or Student ID on device to quickly present offline for your legal 20% fare discount.
            </Text>
          </View>
        )}

        <TouchableOpacity
          className="px-8 py-4 bg-[#FFFFFF] rounded-2xl shadow-lg flex-row items-center"
          onPress={handleAddID}
          activeOpacity={0.8}
        >
          <Ionicons name="camera-outline" size={18} color="#000000" />
          <Text className="font-extrabold text-black text-xs uppercase tracking-wider ml-2">
            {idImage ? "Replace ID Photo" : "Upload Valid ID Photo"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
