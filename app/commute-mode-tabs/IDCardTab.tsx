// IDCardTab: Add and view a Valid ID image, stored only on device

import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";

const STORAGE_KEY = "user_idcard_image_uri";

export default function IDCardTab() {
  const [idImage, setIdImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const lastDistance = React.useRef<number | null>(null);
  const window = useWindowDimensions(); // Get current window size for orientation

  // Load persisted image URI on mount
  useEffect(() => {
    (async () => {
      const uri = await AsyncStorage.getItem(STORAGE_KEY);
      if (uri) setIdImage(uri);
    })();
  }, []);

  // Pick image from device gallery
  const handleAddID = async () => {
    // Request permission before picking
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photos to add your ID.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Use correct API for your version
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setIdImage(uri);
      await AsyncStorage.setItem(STORAGE_KEY, uri);
    }
  };

  // Show privacy info
  const showPrivacyInfo = () => {
    Alert.alert(
      "Data Privacy",
      "Your ID image stays on your phone and is never uploaded to the cloud."
    );
  };

  // Pinch-to-zoom gesture handler
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // No-op for offset, use scale state
      },
      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2) {
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];
          const dx = touch1.pageX - touch2.pageX;
          const dy = touch1.pageY - touch2.pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (lastDistance.current == null) {
            lastDistance.current = distance;
          } else {
            const scaleChange = distance / lastDistance.current;
            let newScale = scale * scaleChange;
            newScale = Math.max(1, Math.min(newScale, 5));
            scaleAnim.setValue(newScale);
          }
        }
      },
      onPanResponderRelease: () => {
        scaleAnim.stopAnimation((value) => {
          setScale(value);
        });
        lastDistance.current = null;
      },
      onPanResponderTerminationRequest: () => true,
    })
  ).current;

  // Zoom in/out button handlers
  const handleZoomIn = () => {
    let newScale = Math.min(scale + 0.5, 5);
    setScale(newScale);
    Animated.timing(scaleAnim, {
      toValue: newScale,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };
  const handleZoomOut = () => {
    let newScale = Math.max(scale - 0.5, 1);
    setScale(newScale);
    Animated.timing(scaleAnim, {
      toValue: newScale,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.infoText}>
        Add a photo of your Valid ID.{"\n"}
        <Text style={{ fontWeight: "bold" }} onPress={showPrivacyInfo}>
          Your ID stays on your phone for your privacy.
        </Text>
      </Text>
      {idImage ? (
        <>
          <Pressable
            onPress={() => {
              setModalVisible(true);
              setScale(1);
              scaleAnim.setValue(1);
            }}
            style={styles.imagePressable}
            android_ripple={{ color: "#e0e0e0" }}
          >
            <Image
              source={{ uri: idImage }}
              style={styles.idImage}
              resizeMode="contain"
            />
            <View style={styles.fullscreenHint}>
              <MaterialCommunityIcons
                name="fullscreen"
                size={20}
                color="#0a7ea4"
              />
              <Text style={styles.fullscreenHintText}>
                Tap to view full screen
              </Text>
            </View>
          </Pressable>
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
            supportedOrientations={["portrait", "landscape"]}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                <Animated.View
                  style={{
                    width: window.width,
                    height: window.height * 0.85,
                    backgroundColor: "#222",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: [{ scale: scaleAnim }],
                  }}
                  {...panResponder.panHandlers}
                >
                  <Image
                    source={{ uri: idImage }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                </Animated.View>
                <View style={styles.zoomControls}>
                  <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
                    <MaterialCommunityIcons name="magnify-minus-outline" size={32} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
                    <MaterialCommunityIcons name="magnify-plus-outline" size={32} color="#fff" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <MaterialCommunityIcons name="close" size={32} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.landscapeHint}>
                  Pinch or use buttons to zoom. Rotate your phone for landscape view
                </Text>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <View style={styles.placeholder}>
          <Text style={{ color: "#aaa" }}>No ID added yet.</Text>
        </View>
      )}
      <TouchableOpacity style={styles.addButton} onPress={handleAddID}>
        <Text style={styles.addButtonText}>
          {idImage ? "Change ID Image" : "Add Valid ID"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  infoText: { color: "#888", textAlign: "center", marginBottom: 16 },
  idImage: {
    width: 240,
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0a7ea4",
  },
  imagePressable: { marginBottom: 16, alignItems: "center" },
  fullscreenHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    backgroundColor: "#e6f7fb",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  fullscreenHintText: { color: "#0a7ea4", marginLeft: 4, fontSize: 13 },
  placeholder: {
    width: 240,
    height: 160,
    borderRadius: 12,
    backgroundColor: "#f4f4f4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  addButton: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "100%",
    height: "80%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#222",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 4,
  },
  landscapeHint: {
    color: "#fff",
    marginTop: 16,
    fontSize: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    textAlign: "center",
  },
  zoomControls: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    justifyContent: 'center',
    zIndex: 10,
  },
  zoomButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 8,
  },
});
