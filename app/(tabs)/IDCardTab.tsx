import { Ionicons } from "@expo/vector-icons";
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
    <View className="flex-1 bg-[#000000] pt-12 px-6">
      <StatusBar barStyle="light-content" />

      {/* Minimalist Header */}
      <View className="pb-4 flex-row items-center justify-between">
        <Text className="text-white font-bold text-3xl tracking-tight">
          ID Vault
        </Text>

        <View className="flex-row items-center gap-6">
          <TouchableOpacity
            onPress={handleAddID}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="camera-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={showPrivacyInfo}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="shield-checkmark-outline" size={26} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 justify-center items-center">
        {idImage ? (
          <>
            <Pressable
              onPress={() => setModalVisible(true)}
              className="items-center w-full"
            >
              <Image
                source={{ uri: idImage }}
                className="w-full h-[240px] rounded-3xl"
                resizeMode="cover"
              />
              <Text className="mt-5 text-base text-[#8E8E93] font-semibold">
                Tap ID to expand
              </Text>
            </Pressable>

            <Modal
              visible={modalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setModalVisible(false)}
              supportedOrientations={["portrait", "landscape"]}
            >
              <View className="flex-1 justify-center items-center bg-black">
                <ImageZoomViewer
                  ref={imageZoomRef}
                  cropWidth={window.width}
                  cropHeight={window.height * 0.85}
                  imageWidth={window.width * 0.92}
                  imageHeight={window.height * 0.72}
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
                      width: window.width * 0.92,
                      height: window.height * 0.72,
                      transform: [{ rotate: `${rotation}deg` }],
                    }}
                    resizeMode="contain"
                  />
                </ImageZoomViewer>

                {/* Frameless Zoom & Rotate Icons */}
                <View className="absolute bottom-14 left-0 right-0 flex-row justify-center items-center gap-10 z-20">
                  <TouchableOpacity
                    onPress={() => handleZoomOut(imageZoomRef)}
                    hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                  >
                    <Ionicons name="remove" size={32} color="#FFFFFF" />
                  </TouchableOpacity>

                  <Text className="text-white text-xl font-bold">
                    {zoomScale.toFixed(1)}x
                  </Text>

                  <TouchableOpacity
                    onPress={() => handleZoomIn(imageZoomRef)}
                    hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                  >
                    <Ionicons name="add" size={32} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setRotation((r) => (r + 90) % 360)}
                    hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                  >
                    <Ionicons name="refresh" size={28} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  className="absolute top-12 right-6"
                  onPress={() => setModalVisible(false)}
                  hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                >
                  <Ionicons name="close" size={36} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </Modal>
          </>
        ) : (
          <TouchableOpacity
            onPress={handleAddID}
            activeOpacity={0.7}
            className="items-center justify-center py-12"
          >
            <Ionicons name="card-outline" size={64} color="#8E8E93" />
            <Text className="text-2xl font-bold text-center text-white mt-4">
              Add ID Card
            </Text>
            <Text className="text-base text-center text-[#8E8E93] mt-2">
              Tap to store PWD, Senior, or Student ID offline
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
