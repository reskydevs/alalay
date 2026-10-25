import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, useWindowDimensions } from "react-native";

export interface UserIDCard {
  id: string;
  name: string;
  imageUri: string | null;
  createdAt: number;
}

const STORAGE_KEY_CARDS = "user_custom_id_cards_v3";
const LEGACY_CARDS_KEY = "user_wallet_cards_v2";
const LEGACY_STORAGE_KEY = "user_idcard_image_uri";

export const DEFAULT_INITIAL_CARDS: UserIDCard[] = [
  {
    id: "id_card_1",
    name: "My ID",
    imageUri: null,
    createdAt: Date.now(),
  },
];

export function useIDCard() {
  const [cards, setCards] = useState<UserIDCard[]>(DEFAULT_INITIAL_CARDS);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
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
        const stored = await AsyncStorage.getItem(STORAGE_KEY_CARDS);
        if (stored) {
          const parsed: UserIDCard[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCards(parsed);
            return;
          }
        }

        // Check if legacy cards had attached photos and migrate them
        const legacyCardsRaw = await AsyncStorage.getItem(LEGACY_CARDS_KEY);
        if (legacyCardsRaw) {
          try {
            const legacyCards = JSON.parse(legacyCardsRaw);
            if (Array.isArray(legacyCards)) {
              const existingWithPhotos = legacyCards
                .filter((c) => c && c.imageUri)
                .map((c, idx) => ({
                  id: `id_card_${Date.now()}_${idx}`,
                  name: c.title || `ID ${idx + 1}`,
                  imageUri: c.imageUri,
                  createdAt: Date.now() + idx,
                }));
              if (existingWithPhotos.length > 0) {
                setCards(existingWithPhotos);
                await AsyncStorage.setItem(
                  STORAGE_KEY_CARDS,
                  JSON.stringify(existingWithPhotos)
                );
                return;
              }
            }
          } catch {}
        }

        // Migrate original single image if exists
        const legacyUri = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyUri) {
          const migrated: UserIDCard[] = [
            {
              id: "id_card_1",
              name: "My ID",
              imageUri: legacyUri,
              createdAt: Date.now(),
            },
          ];
          setCards(migrated);
          await AsyncStorage.setItem(
            STORAGE_KEY_CARDS,
            JSON.stringify(migrated)
          );
        }
      } catch (e) {
        console.warn("[useIDCard] Failed to load cards:", e);
      }
    })();
  }, []);

  const saveCards = async (newCards: UserIDCard[]) => {
    setCards(newCards);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(newCards));
    } catch {}
  };

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

  const activeCard = cards[activeCardIndex] || cards[0] || DEFAULT_INITIAL_CARDS[0];

  const persistImageLocally = async (sourceUri: string, cardId: string) => {
    try {
      const fileExt = sourceUri.split(".").pop()?.split("?")[0] || "jpg";
      const permanentFileName = `my_id_${cardId}_${Date.now()}.${fileExt}`;
      const permanentPath = `${FileSystem.documentDirectory}${permanentFileName}`;

      await FileSystem.copyAsync({
        from: sourceUri,
        to: permanentPath,
      });
      return permanentPath;
    } catch {
      return sourceUri;
    }
  };

  // 1. Capture Photo with Camera
  const handleCaptureCamera = async (cardId: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Camera Permission Needed",
        "Please grant camera access to take a picture of your ID."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const rawUri = result.assets[0].uri;
      const permanentUri = await persistImageLocally(rawUri, cardId);
      const updated = cards.map((c) =>
        c.id === cardId ? { ...c, imageUri: permanentUri } : c
      );
      await saveCards(updated);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
  };

  // 2. Choose Photo from Gallery
  const handleAttachGallery = async (cardId: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Photo Permission Needed",
        "Please grant photo library access to choose your ID photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const rawUri = result.assets[0].uri;
      const permanentUri = await persistImageLocally(rawUri, cardId);
      const updated = cards.map((c) =>
        c.id === cardId ? { ...c, imageUri: permanentUri } : c
      );
      await saveCards(updated);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
  };

  // 3. Remove Photo from Card
  const handleRemovePhoto = async (cardId: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    const updated = cards.map((c) =>
      c.id === cardId ? { ...c, imageUri: null } : c
    );
    await saveCards(updated);
  };

  // 4. Rename Card
  const handleRenameCard = async (cardId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const updated = cards.map((c) =>
      c.id === cardId ? { ...c, name: trimmed } : c
    );
    await saveCards(updated);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  };

  // 5. Add a New Card
  const handleAddCard = async (initialName?: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    const newCard: UserIDCard = {
      id: `id_card_${Date.now()}`,
      name: initialName?.trim() || `ID ${cards.length + 1}`,
      imageUri: null,
      createdAt: Date.now(),
    };
    const updated = [...cards, newCard];
    await saveCards(updated);
    setActiveCardIndex(updated.length - 1);
  };

  // 6. Delete Card
  const handleDeleteCard = async (cardId: string) => {
    if (cards.length <= 1) {
      // Clear photo instead of deleting last card
      await handleRemovePhoto(cardId);
      return;
    }
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    const updated = cards.filter((c) => c.id !== cardId);
    await saveCards(updated);
    setActiveCardIndex(Math.max(0, activeCardIndex - 1));
  };

  // 7. Privacy Info Dialog (No borrowed names, 100% on-device)
  const showPrivacyInfo = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    Alert.alert(
      "Private On-Device Storage",
      "Your ID photos are stored locally on your device. They are never uploaded online or to the cloud."
    );
  };

  return {
    cards,
    activeCardIndex,
    setActiveCardIndex,
    activeCard,
    modalVisible,
    setModalVisible,
    zoomScale,
    setZoomScale,
    rotation,
    setRotation,
    orientation,
    imageZoomRef,
    handleCaptureCamera,
    handleAttachGallery,
    handleRemovePhoto,
    handleRenameCard,
    handleAddCard,
    handleDeleteCard,
    showPrivacyInfo,
    window,
    minScale,
    maxScale,
  };
}
