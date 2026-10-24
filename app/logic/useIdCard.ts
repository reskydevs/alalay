import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, useWindowDimensions } from "react-native";

const STORAGE_KEY = "user_idcard_image_uri";

export function useIDCard() {
  const [idImage, setIdImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const window = useWindowDimensions();
  const imageZoomRef = useRef<any>(null);

  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    window.width > window.height ? "landscape" : "portrait"
  );

  const minScale = 0.5;
  const maxScale = 4;

  useEffect(() => {
    (async () => {
      try {
        const uri = await AsyncStorage.getItem(STORAGE_KEY);
        if (uri) {
          const info = await FileSystem.getInfoAsync(uri);
          if (info.exists) {
            setIdImage(info.uri);
          } else {
            setIdImage(uri);
          }
        }
      } catch {
        // If file system check fails, fallback silently
        const uri = await AsyncStorage.getItem(STORAGE_KEY);
        if (uri) setIdImage(uri);
      }
    })();
  }, []);

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window: win }) => {
      setOrientation(win.width > win.height ? "landscape" : "portrait");
    });
    setOrientation(window.width > window.height ? "landscape" : "portrait");
    return () => sub?.remove?.();
  }, [window.width, window.height]);

  useEffect(() => {
    if (!modalVisible) setRotation(0);
  }, [modalVisible]);

  const handleAddID = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photos to add your ID."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const sourceUri = result.assets[0].uri;
      try {
        const fileExt = sourceUri.split(".").pop()?.split("?")[0] || "jpg";
        const permanentFileName = `offline_commuter_id_${Date.now()}.${fileExt}`;
        const permanentPath = `${FileSystem.documentDirectory}${permanentFileName}`;

        await FileSystem.copyAsync({
          from: sourceUri,
          to: permanentPath,
        });

        setIdImage(permanentPath);
        await AsyncStorage.setItem(STORAGE_KEY, permanentPath);
      } catch (err) {
        console.warn("[IDCard] Failed to save to local documentDirectory:", err);
        setIdImage(sourceUri);
        await AsyncStorage.setItem(STORAGE_KEY, sourceUri);
      }
    }
  };

  const showPrivacyInfo = () => {
    Alert.alert(
      "Data Privacy & Offline Storage",
      "Your PWD, Senior Citizen, or Student ID image is saved securely on your device's permanent offline storage (expo-file-system) and is never uploaded to any server or cloud."
    );
  };

  const handleZoomIn = (ref?: React.RefObject<any>) => {
    const zoomRef = ref || imageZoomRef;
    zoomRef.current?.centerOn?.({
      x: 0,
      y: 0,
      scale: Math.min(zoomScale + 0.25, maxScale),
      duration: 100,
    });
    setZoomScale((z) => Math.min(z + 0.25, maxScale));
  };

  const handleZoomOut = (ref?: React.RefObject<any>) => {
    const zoomRef = ref || imageZoomRef;
    zoomRef.current?.centerOn?.({
      x: 0,
      y: 0,
      scale: Math.max(zoomScale - 0.25, minScale),
      duration: 100,
    });
    setZoomScale((z) => Math.max(z - 0.25, minScale));
  };

  return {
    idImage,
    setIdImage,
    modalVisible,
    setModalVisible,
    zoomScale,
    setZoomScale,
    rotation,
    setRotation,
    orientation,
    imageZoomRef,
    handleAddID,
    showPrivacyInfo,
    handleZoomIn,
    handleZoomOut,
    window,
    minScale,
    maxScale,
  };
}
