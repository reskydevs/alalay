import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, useWindowDimensions } from "react-native";

export interface CommuterIDCard {
  id: string;
  title: string;
  category: "pwd" | "senior" | "student" | "national" | "other";
  issuer: string;
  discountLabel: string;
  imageUri: string | null;
  accentColor: string;
  gradientTop: string;
  gradientBottom: string;
  idNumberPreview: string;
  holderName: string;
}

const STORAGE_KEY_CARDS = "user_wallet_cards_v2";
const LEGACY_STORAGE_KEY = "user_idcard_image_uri";

export const INITIAL_WALLET_CARDS: CommuterIDCard[] = [
  {
    id: "pwd-pass",
    title: "PWD ID Pass",
    category: "pwd",
    issuer: "REPUBLIC OF THE PHILIPPINES",
    discountLabel: "20% COMMUTER DISCOUNT",
    imageUri: null,
    accentColor: "#38BDF8",
    gradientTop: "#0C1E3A",
    gradientBottom: "#030712",
    idNumberPreview: "PWD-NCR-2026-••••",
    holderName: "REGISTERED PWD COMMUTER",
  },
  {
    id: "senior-pass",
    title: "Senior Citizen Pass",
    category: "senior",
    issuer: "OFFICE FOR SENIOR CITIZENS AFFAIRS",
    discountLabel: "20% STATUTORY DISCOUNT",
    imageUri: null,
    accentColor: "#F59E0B",
    gradientTop: "#2A1805",
    gradientBottom: "#030712",
    idNumberPreview: "OSCA-QC-2026-••••",
    holderName: "SENIOR CITIZEN PASS",
  },
  {
    id: "student-pass",
    title: "Student Commuter ID",
    category: "student",
    issuer: "COMMUTER STUDENT FARE",
    discountLabel: "20% STUDENT DISCOUNT",
    imageUri: null,
    accentColor: "#22C55E",
    gradientTop: "#062817",
    gradientBottom: "#030712",
    idNumberPreview: "STU-UNIV-2026-••••",
    holderName: "VERIFIED STUDENT PASS",
  },
  {
    id: "national-pass",
    title: "National ID (PhilSys)",
    category: "national",
    issuer: "PHILIPPINE IDENTIFICATION SYSTEM",
    discountLabel: "VALID GOVERNMENT ID",
    imageUri: null,
    accentColor: "#A855F7",
    gradientTop: "#230E38",
    gradientBottom: "#030712",
    idNumberPreview: "PHIL-ID-••••-••••-••••",
    holderName: "CITIZEN COMMUTER PASS",
  },
];

export function useIDCard() {
  const [cards, setCards] = useState<CommuterIDCard[]>(INITIAL_WALLET_CARDS);
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
          const parsed: CommuterIDCard[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCards(parsed);
            return;
          }
        }

        // Migrate legacy single ID photo to the first card if exists
        const legacyUri = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyUri) {
          const migrated = [...INITIAL_WALLET_CARDS];
          migrated[0].imageUri = legacyUri;
          setCards(migrated);
          await AsyncStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(migrated));
        }
      } catch (e) {
        console.warn("[useIDCard] Failed to load cards:", e);
      }
    })();
  }, []);

  const saveCards = async (newCards: CommuterIDCard[]) => {
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

  const activeCard = cards[activeCardIndex] || cards[0];

  const handleAttachPhoto = async (cardId: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photos to attach your physical ID card."
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
        const permanentFileName = `wallet_card_${cardId}_${Date.now()}.${fileExt}`;
        const permanentPath = `${FileSystem.documentDirectory}${permanentFileName}`;

        await FileSystem.copyAsync({
          from: sourceUri,
          to: permanentPath,
        });

        const updated = cards.map((c) =>
          c.id === cardId ? { ...c, imageUri: permanentPath } : c
        );
        await saveCards(updated);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      } catch (err) {
        const updated = cards.map((c) =>
          c.id === cardId ? { ...c, imageUri: sourceUri } : c
        );
        await saveCards(updated);
      }
    }
  };

  const handleRemovePhoto = async (cardId: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    const updated = cards.map((c) =>
      c.id === cardId ? { ...c, imageUri: null } : c
    );
    await saveCards(updated);
  };

  const showPrivacyInfo = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    Alert.alert(
      "Google Wallet Style Security",
      "All your commuter discount IDs are stored 100% offline inside your phone's encrypted application sandbox (expo-file-system). Your photos never touch external servers or the cloud."
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
    handleAttachPhoto,
    handleRemovePhoto,
    showPrivacyInfo,
    window,
    minScale,
    maxScale,
  };
}
