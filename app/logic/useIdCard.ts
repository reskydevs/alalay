import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
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
    AsyncStorage.getItem(STORAGE_KEY).then((uri) => {
      if (uri) setIdImage(uri);
    });
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
      const uri = result.assets[0].uri;
      setIdImage(uri);
      await AsyncStorage.setItem(STORAGE_KEY, uri);
    }
  };

  const showPrivacyInfo = () => {
    Alert.alert(
      "Data Privacy",
      "Your ID image stays on your phone and is never uploaded to the cloud."
    );
  };

  const handleZoomIn = () => {
    imageZoomRef.current?.centerOn?.({
      x: 0,
      y: 0,
      scale: Math.min(zoomScale + 0.25, maxScale),
      duration: 100,
    });
    setZoomScale((z) => Math.min(z + 0.25, maxScale));
  };

  const handleZoomOut = () => {
    imageZoomRef.current?.centerOn?.({
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
