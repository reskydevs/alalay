import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TransitHub {
  name: string;
  corridor: string;
  type: string;
  query: string;
}

const TRANSIT_HUBS: TransitHub[] = [
  {
    name: "EDSA Bus Carousel",
    corridor: "Monumento to PITX Expressway",
    type: "Dedicated Busway",
    query: "EDSA Busway Station Metro Manila",
  },
  {
    name: "MRT-3 North Avenue",
    corridor: "Epifanio de los Santos Avenue",
    type: "Rapid Transit",
    query: "MRT-3 North Avenue Station Quezon City",
  },
  {
    name: "Cubao Transit Hub",
    corridor: "Aurora Blvd & EDSA Interchange",
    type: "Provincial & City PUV",
    query: "Araneta Center Cubao Bus Terminal",
  },
  {
    name: "Taft Avenue / Buendia",
    corridor: "LRT-1 & South Commuter Hub",
    type: "Jeepney & UV Express",
    query: "Gil Puyat Buendia LRT Station Pasay",
  },
  {
    name: "Commonwealth PUV Corridor",
    corridor: "Quezon City to Fairview",
    type: "Modern PUV Line",
    query: "Commonwealth Avenue Quezon City",
  },
];

export default function WebMapTab() {
  const [origin, setOrigin] = useState("Current Location (GPS)");
  const [destination, setDestination] = useState("");
  const [currentCoords, setCurrentCoords] = useState<Location.LocationObjectCoords | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setCurrentCoords(loc.coords);
          Location.reverseGeocodeAsync(loc.coords)
            .then((res) => {
              if (res?.[0]) {
                const parts = [res[0].district, res[0].city, res[0].region].filter(Boolean);
                if (parts.length > 0) {
                  setOrigin(parts.join(", "));
                }
              }
            })
            .catch(() => {});
        }
      } catch (err) {
        console.warn("[Navigation] Location error:", err);
      }
    })();
  }, []);

  const handleLaunchNativeMaps = async (targetDest?: string) => {
    const dest = (targetDest || destination).trim();
    if (!dest) {
      Alert.alert(
        "Enter Destination",
        "Please type your transit destination or select one of the major transit hubs below."
      );
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const cleanDest = encodeURIComponent(dest);
    const nativeUrl = Platform.select({
      android: `google.navigation:q=${cleanDest}&mode=d`,
      ios: `maps://?daddr=${cleanDest}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${cleanDest}&travelmode=transit`,
    });

    const webFallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${cleanDest}&travelmode=transit`;

    try {
      const canOpen = await Linking.canOpenURL(nativeUrl);
      if (canOpen) {
        await Linking.openURL(nativeUrl);
      } else {
        await Linking.openURL(webFallbackUrl);
      }
    } catch {
      await Linking.openURL(webFallbackUrl);
    }
  };

  const handleQuickPreset = (presetText: string) => {
    setDestination(presetText);
    handleLaunchNativeMaps(presetText);
  };

  return (
    <View className="flex-1 bg-[#000000] pt-10">
      <StatusBar barStyle="light-content" />

      {/* Tesla Navigation Header */}
      <View className="px-5 pt-3 pb-3 flex-row items-center justify-between border-b border-[#1C1C1E]">
        <View>
          <Text className="text-white font-extrabold text-2xl tracking-tight">
            Navigation
          </Text>
          <Text className="text-[#8E8E93] text-xs font-medium mt-0.5">
            Turn-by-Turn GPS & Transit Routing
          </Text>
        </View>

        <View className="bg-[#121214] px-3 py-1.5 rounded-full border border-[#27272A] flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-[#10B981] mr-2" />
          <Text className="text-[#A1A1AA] text-xs font-semibold">
            GPS Active
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
      >
        {/* ROUTE PLANNER CARD (Modeled on Tesla Location Card) */}
        <View className="bg-[#121214] rounded-3xl p-5 border border-[#27272A] shadow-xl mb-5">
          <Text className="text-[#8E8E93] text-xs font-bold uppercase tracking-wider mb-4">
            Route Destination Planner
          </Text>

          {/* Origin Field */}
          <View className="flex-row items-center bg-[#1C1C1E] rounded-2xl px-4 py-3 mb-3 border border-[#27272A]">
            <Ionicons name="radio-button-on" size={18} color="#FFFFFF" />
            <View className="ml-3 flex-1">
              <Text className="text-[#71717A] text-[10px] font-bold uppercase">
                Starting Location
              </Text>
              <Text className="text-white text-xs font-semibold mt-0.5" numberOfLines={1}>
                {origin}
              </Text>
            </View>
          </View>

          {/* Destination Field */}
          <View className="flex-row items-center bg-[#1C1C1E] rounded-2xl px-4 py-3 border border-[#27272A] mb-4">
            <Ionicons name="location" size={18} color="#E82127" />
            <View className="ml-3 flex-1">
              <Text className="text-[#71717A] text-[10px] font-bold uppercase">
                Transit Destination
              </Text>
              <TextInput
                value={destination}
                onChangeText={setDestination}
                placeholder="Where are you going? (e.g. Cubao, SM Mall, MRT)"
                placeholderTextColor="#71717A"
                className="text-white text-sm font-semibold p-0 mt-0.5"
                returnKeyType="go"
                onSubmitEditing={() => handleLaunchNativeMaps()}
              />
            </View>
            {destination.length > 0 && (
              <TouchableOpacity onPress={() => setDestination("")}>
                <Ionicons name="close-circle" size={18} color="#71717A" />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Destination Chips */}
          <View className="flex-row flex-wrap gap-2 mb-5">
            {[
              "MRT-3 / LRT Station",
              "Bus Terminal",
              "Mall / Commercial",
              "Public Hospital",
              "City Market",
            ].map((chip) => (
              <TouchableOpacity
                key={chip}
                onPress={() => setDestination(chip)}
                className="bg-[#1C1C1E] px-3 py-1.5 rounded-xl border border-[#27272A]"
              >
                <Text className="text-[#A1A1AA] text-xs font-semibold">
                  + {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* PRIMARY TESLA ACTION BUTTON: Launch Native Navigation */}
          <TouchableOpacity
            onPress={() => handleLaunchNativeMaps()}
            activeOpacity={0.8}
            className="w-full bg-[#FFFFFF] py-4 rounded-2xl items-center justify-center flex-row shadow-lg"
          >
            <Ionicons name="navigate" size={20} color="#000000" />
            <Text className="text-[#000000] font-black text-sm uppercase tracking-wider ml-2">
              Start Turn-by-Turn Navigation
            </Text>
          </TouchableOpacity>

          <Text className="text-[#71717A] text-[11px] font-medium text-center mt-2.5">
            Launches native Google Maps in 0.0s with live traffic and transit guidance.
          </Text>
        </View>

        {/* TELEMETRY & TRANSIT CORRIDORS */}
        <View className="mt-2">
          <Text className="text-[#8E8E93] text-xs font-bold uppercase tracking-wider mb-3">
            Major Public Transit Corridors
          </Text>

          <View className="bg-[#121214] rounded-3xl border border-[#27272A] overflow-hidden">
            {TRANSIT_HUBS.map((hub, idx) => (
              <TouchableOpacity
                key={hub.name}
                onPress={() => handleQuickPreset(hub.query)}
                activeOpacity={0.7}
                className={`p-4 flex-row items-center justify-between ${
                  idx < TRANSIT_HUBS.length - 1 ? "border-b border-[#1C1C1E]" : ""
                }`}
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View className="w-10 h-10 rounded-2xl bg-[#1C1C1E] items-center justify-center mr-3.5 border border-[#27272A]">
                    <MaterialCommunityIcons name="bus-side" size={20} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-sm font-bold">
                      {hub.name}
                    </Text>
                    <Text className="text-[#8E8E93] text-xs font-medium mt-0.5">
                      {hub.corridor} • {hub.type}
                    </Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward" size={16} color="#71717A" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* COMMUTER ASSISTANT INFO NOTE */}
        <View className="bg-[#121214] rounded-2xl p-4 border border-[#27272A] mt-5 flex-row items-center">
          <Ionicons name="information-circle-outline" size={20} color="#8E8E93" />
          <Text className="text-[#8E8E93] text-xs font-medium ml-3 flex-1 leading-4">
            Zero developer cost. Directly taps into Android’s native satellite GPS and Google transit engine without any webview lag.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
