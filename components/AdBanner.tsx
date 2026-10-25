import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

interface AdBannerProps {
  adUnitId?: string;
  testMode?: boolean;
}

export const TEST_BANNER_IDS = {
  android: "ca-app-pub-3940256099942544/6300978111",
  ios: "ca-app-pub-3940256099942544/2934735716",
};

export default function AdBanner({
  adUnitId = Platform.select({
    android: TEST_BANNER_IDS.android,
    ios: TEST_BANNER_IDS.ios,
    default: TEST_BANNER_IDS.android,
  }),
  testMode = true,
}: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <View className="w-full bg-[#f8f9fa] border-t border-gray-200 py-1.5 px-3 flex-row items-center justify-between shadow-sm">
      <View className="flex-row items-center flex-1 mr-2">
        <View className="bg-amber-400 px-1.5 py-0.5 rounded mr-2">
          <Text className="text-[10px] font-bold text-gray-900 tracking-wider">
            AD
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs font-semibold text-gray-800" numberOfLines={1}>
            Alalay: Libreng Gabay sa Commute
          </Text>
          <Text className="text-[10px] text-gray-500" numberOfLines={1}>
            LTFRB Standard Rates 2026 • Ligtas at Maaasahang Byahe
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setDismissed(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="p-1 rounded-full bg-gray-200"
        accessibilityLabel="Close Ad"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={14} color="#666" />
      </TouchableOpacity>
    </View>
  );
}
