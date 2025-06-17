import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useRef } from "react";
import {
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import ImageZoom from "react-native-image-pan-zoom";
import { useIDCard } from "../logic/useIdCard";

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

  const navigation = useNavigation();
  const window = useWindowDimensions();
  const imageZoomRef = useRef<any>(null);

  return (
    <View className="flex-1 p-6 pt-12">
      <TouchableOpacity
        onPress={() => navigation.navigate("index" as never)}
        className="absolute left-4 top-6 z-50 flex-row items-center"
      >
        <MaterialCommunityIcons name="chevron-left" size={28} color="#007b83" />
        <Text className="text-lg font-medium text-teal-800">Back</Text>
      </TouchableOpacity>

      <View className="flex-1 justify-center items-center">
        {idImage && (
          <View className="mb-4">
            <Text className="text-center text-gray-500">
              Add a photo of your Valid ID.
            </Text>
            <Text className="text-center text-gray-500">
              <Text className="font-bold" onPress={showPrivacyInfo}>
                Your ID stays on your phone for your privacy.
              </Text>
            </Text>
          </View>
        )}
        
        {idImage ? (
          <>
            <Pressable
              onPress={() => setModalVisible(true)}
              className="items-center mb-4"
              android_ripple={{ color: "#e0e0e0" }}
            >
              <Image
                source={{ uri: idImage }}
                className="w-[240px] h-[160px] rounded-xl border border-teal-700"
                resizeMode="contain"
              />
              <View className="flex-row items-center mt-1.5 bg-teal-50 rounded-md px-2 py-0.5">
                <MaterialCommunityIcons
                  name="fullscreen"
                  size={20}
                  color="#0a7ea4"
                />
                <Text className="ml-1 text-sm text-teal-700">
                  Tap to view full screen
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
              <View className="flex-1 justify-center items-center bg-black/90">
                <View className="justify-center items-center w-full h-full">
                  <ImageZoom
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
                    onMove={({ scale }) => setZoomScale(scale)}
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
                  </ImageZoom>

                  <View className="absolute bottom-[70px] left-0 right-0 flex-row justify-center items-center bg-black/30 rounded-2xl px-3 py-1.5 z-20">
                    <TouchableOpacity
                      className="p-3 mx-3"
                      onPress={() => handleZoomOut(imageZoomRef)}
                      accessibilityLabel="Zoom out"
                    >
                      <MaterialCommunityIcons
                        name="minus-circle"
                        size={36}
                        color="#fff"
                      />
                    </TouchableOpacity>
                    <Text className="text-white mx-2 text-lg w-[40px] text-center">
                      {zoomScale.toFixed(2)}x
                    </Text>
                    <TouchableOpacity
                      className="p-3 mx-3"
                      onPress={() => handleZoomIn(imageZoomRef)}
                      accessibilityLabel="Zoom in"
                    >
                      <MaterialCommunityIcons
                        name="plus-circle"
                        size={36}
                        color="#fff"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-black/50 rounded-full p-1.5 ml-4 items-center justify-center min-w-[44px] min-h-[44px]"
                      onPress={() => setRotation((r) => (r + 90) % 360)}
                      accessibilityLabel="Rotate image"
                    >
                      <MaterialCommunityIcons
                        name="rotate-right"
                        size={32}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    className="absolute top-[40px] right-[24px] bg-black/50 rounded-full p-1"
                    onPress={() => setModalVisible(false)}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={32}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  
                  <Text className="px-3 py-1 mt-3 text-sm font-normal text-center text-white rounded-md bg-black/30">
                    Pinch or double tap to zoom. Drag to move. Use the rotate button to rotate image.
                  </Text>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <View className="items-center justify-center mb-6 w-[260px] self-center">
            <View className="mb-3">
              <MaterialCommunityIcons
                name="card-account-details-outline"
                size={56}
                color="#b0b0b0"
              />
            </View>
            <Text className="mb-1 text-lg font-bold text-center text-gray-500">
              No ID Added
            </Text>
            <Text className="text-base leading-5 text-center text-gray-400">
              Add a photo of your valid ID to keep it handy and secure.
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          className="px-6 py-3 bg-teal-700 rounded-lg"
          onPress={handleAddID}
        >
          <Text className="font-bold text-white">
            {idImage ? "Change ID Image" : "Add Valid ID"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
