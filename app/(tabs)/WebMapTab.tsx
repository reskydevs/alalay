import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Station, TRANSIT_LINES, TransitLine } from "../data/transitLines";

export default function TransitHubTab() {
  const insets = useSafeAreaInsets();
  const [selectedLineId, setSelectedLineId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedStationId, setExpandedStationId] = useState<string | null>(null);

  // Sanitize search input
  const sanitizedQuery = useMemo(() => {
    return searchQuery
      .replace(/[^\w\s-]/gi, "")
      .trim()
      .toLowerCase()
      .slice(0, 50);
  }, [searchQuery]);

  // Filter stations across lines
  const filteredData = useMemo(() => {
    let lines = TRANSIT_LINES;
    if (selectedLineId !== "all") {
      lines = lines.filter((l) => l.id === selectedLineId);
    }

    const results: { line: TransitLine; station: Station }[] = [];
    for (const line of lines) {
      for (const station of line.stations) {
        if (!sanitizedQuery) {
          results.push({ line, station });
        } else {
          const matchName = station.name.toLowerCase().includes(sanitizedQuery);
          const matchCity = station.city.toLowerCase().includes(sanitizedQuery);
          const matchInterchange = station.interchangeWith?.some((i) =>
            i.toLowerCase().includes(sanitizedQuery)
          );
          const matchNotes = station.notes?.toLowerCase().includes(sanitizedQuery);
          if (matchName || matchCity || matchInterchange || matchNotes) {
            results.push({ line, station });
          }
        }
      }
    }
    return results;
  }, [selectedLineId, sanitizedQuery]);

  const activeLine = useMemo(() => {
    return TRANSIT_LINES.find((l) => l.id === selectedLineId);
  }, [selectedLineId]);

  // Turn-by-Turn GPS intent
  const handleNavigateStation = async (station: Station, line: TransitLine) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const lat = station.lat;
    const lng = station.lng;
    const label = encodeURIComponent(`${station.name} (${line.shortName})`);

    const androidNavUrl = `google.navigation:q=${lat},${lng}&mode=d`;
    const geoUrl = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
    const webFallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    try {
      if (Platform.OS === "android") {
        const canNav = await Linking.canOpenURL(androidNavUrl);
        if (canNav) {
          await Linking.openURL(androidNavUrl);
          return;
        }
      }

      const canGeo = await Linking.canOpenURL(geoUrl);
      if (canGeo) {
        await Linking.openURL(geoUrl);
        return;
      }

      await Linking.openURL(webFallbackUrl);
    } catch {
      Alert.alert(
        "Navigation",
        `Could not open map app. Coordinates: ${lat}, ${lng}`,
        [{ text: "OK" }]
      );
    }
  };

  const handleCallHotline = (phoneString: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    const digits = phoneString.replace(/[^\d+]/g, "");
    if (digits) {
      Linking.openURL(`tel:${digits}`).catch(() => {
        Alert.alert("Operator Hotline", phoneString);
      });
    }
  };

  const handleSelectLine = (id: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedLineId(id);
  };

  const toggleStationExpand = (id: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setExpandedStationId((prev) => (prev === id ? null : id));
  };

  return (
    <View
      className="flex-1 bg-black"
      style={{
        paddingTop: Math.max(insets.top, 24),
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Clean Unboxed Mobile-First Header */}
      <View className="px-5 pt-2 pb-3">
        <Text className="text-white text-3xl font-black tracking-tight">
          Transit
        </Text>
        <Text className="text-zinc-500 text-xs font-semibold tracking-wider mt-0.5">
          Metro Rail Lines & Stations
        </Text>
      </View>

      {/* Seamless Search Bar */}
      <View className="px-5 mb-3">
        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 flex-row items-center">
          <Ionicons name="search" size={18} color="#71717A" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search station, landmark, or city..."
            placeholderTextColor="#71717A"
            className="flex-1 text-white text-base ml-3 py-0"
            autoCorrect={false}
            maxLength={50}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Rail Line Filter Scroll Pills */}
      <View className="pb-3 border-b border-zinc-900">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => handleSelectLine("all")}
            className={`px-4 py-2 rounded-full border ${
              selectedLineId === "all"
                ? "bg-white border-white"
                : "bg-zinc-900 border-zinc-800"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                selectedLineId === "all" ? "text-black" : "text-zinc-400"
              }`}
            >
              All Lines
            </Text>
          </TouchableOpacity>

          {TRANSIT_LINES.map((line) => {
            const isSelected = selectedLineId === line.id;
            const isFuture = line.status === "Under Construction";
            return (
              <TouchableOpacity
                key={line.id}
                onPress={() => handleSelectLine(line.id)}
                className="px-3.5 py-2 rounded-full border flex-row items-center gap-1.5"
                style={{
                  backgroundColor: isSelected ? line.accentBg : "#18181b",
                  borderColor: isSelected ? line.badgeBorder : "#27272a",
                }}
              >
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: line.color }}
                />
                <Text
                  className="text-xs font-bold"
                  style={{
                    color: isSelected ? "#FFFFFF" : isFuture ? "#A1A1AA" : "#D4D4D8",
                  }}
                >
                  {line.shortName}
                  {isFuture ? " (Future)" : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active Line Overview Banner (if single line selected) */}
      {activeLine && (
        <View className="px-5 pt-3">
          <View
            className="p-4 rounded-2xl border"
            style={{
              backgroundColor: activeLine.accentBg,
              borderColor: activeLine.badgeBorder,
            }}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-white font-black text-lg">
                {activeLine.name}
              </Text>
              <View
                className="px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor:
                    activeLine.status === "Active" ? "#22c55e" : "#ef4444",
                }}
              >
                <Text className="text-[10px] font-black text-black uppercase">
                  {activeLine.status === "Active" ? "Operating" : "Under Construction"}
                </Text>
              </View>
            </View>

            {/* Construction Fact-Check Callout */}
            {activeLine.constructionNotice ? (
              <Text className="text-amber-300 text-xs font-medium mt-1 leading-relaxed">
                ℹ️ {activeLine.constructionNotice}
              </Text>
            ) : (
              <Text className="text-zinc-300 text-xs mb-2">
                {activeLine.terminalFrom} ⇄ {activeLine.terminalTo}
              </Text>
            )}

            {/* Operating Line Metrics */}
            {activeLine.status === "Active" && (
              <View className="flex-row items-center justify-between border-t border-white/10 pt-2.5 mt-2">
                <View>
                  <Text className="text-zinc-400 text-[10px] font-semibold uppercase">
                    First / Last Train
                  </Text>
                  <Text className="text-white text-xs font-bold mt-0.5">
                    {activeLine.firstTrain} - {activeLine.lastTrain.split(" ")[0]}
                  </Text>
                </View>

                <View>
                  <Text className="text-zinc-400 text-[10px] font-semibold uppercase">
                    Headway
                  </Text>
                  <Text className="text-white text-xs font-bold mt-0.5">
                    {activeLine.headwayMinutes}
                  </Text>
                </View>

                <View>
                  <Text className="text-zinc-400 text-[10px] font-semibold uppercase">
                    Fare (Beep)
                  </Text>
                  <Text className="text-white text-xs font-bold mt-0.5">
                    {activeLine.fareBeep}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Stations List Header */}
      <View className="px-5 pt-3 pb-2 flex-row items-center justify-between">
        <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
          Stations ({filteredData.length})
        </Text>
        <Text className="text-zinc-600 text-xs">
          Tap station to expand
        </Text>
      </View>

      {/* Generous Full-Bleed Station List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => `${item.line.id}-${item.station.id}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        initialNumToRender={10}
        maxToRenderPerBatch={15}
        windowSize={7}
        renderItem={({ item }) => {
          const { line, station } = item;
          const isExpanded = expandedStationId === station.id;
          const isFuture = line.status === "Under Construction";

          return (
            <View className="bg-zinc-950 border border-zinc-900 rounded-2xl mb-2.5 overflow-hidden">
              <TouchableOpacity
                onPress={() => toggleStationExpand(station.id)}
                activeOpacity={0.8}
                className="p-4 flex-row items-center justify-between"
              >
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center gap-2 mb-1.5">
                    <View
                      className="px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: line.badgeBorder }}
                    >
                      <Text className="text-[10px] font-black text-black">
                        {line.shortName}
                      </Text>
                    </View>

                    <Text className="text-zinc-500 text-xs font-medium">
                      {station.city}
                    </Text>

                    {station.isExtension && (
                      <View className="bg-cyan-950 border border-cyan-500/40 px-1.5 py-0.2 rounded">
                        <Text className="text-cyan-300 text-[9px] font-bold">
                          OPEN 2024
                        </Text>
                      </View>
                    )}

                    {isFuture && (
                      <View className="bg-amber-950 border border-amber-500/40 px-1.5 py-0.2 rounded">
                        <Text className="text-amber-300 text-[9px] font-bold">
                          FUTURE
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text className="text-white text-lg font-bold tracking-tight">
                    {station.name}
                  </Text>

                  {/* Interchanges preview */}
                  {station.interchangeWith && station.interchangeWith.length > 0 && (
                    <View className="flex-row flex-wrap gap-1.5 mt-2">
                      {station.interchangeWith.map((ic, idx) => (
                        <View
                          key={idx}
                          className="bg-zinc-900 px-2.5 py-1 rounded-full flex-row items-center gap-1"
                        >
                          <Ionicons name="git-merge" size={11} color="#38BDF8" />
                          <Text className="text-sky-300 text-[11px] font-semibold">
                            {ic}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#71717A"
                />
              </TouchableOpacity>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <View className="px-4 pb-4 pt-2 border-t border-zinc-900 bg-zinc-900/30">
                  {station.notes && (
                    <Text className="text-zinc-300 text-xs mb-3 leading-relaxed">
                      📍 {station.notes}
                    </Text>
                  )}

                  {/* Grounded Fact-Checked Accessibility Info */}
                  <View className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 mb-3">
                    <View className="flex-row items-center gap-1.5 mb-1">
                      <Ionicons
                        name={station.hasElevator ? "body" : "information-circle"}
                        size={14}
                        color={station.hasElevator ? "#34D399" : "#A1A1AA"}
                      />
                      <Text
                        className={`text-xs font-bold ${
                          station.hasElevator ? "text-emerald-400" : "text-zinc-400"
                        }`}
                      >
                        {station.hasElevator
                          ? "Elevator Equipped per Directory"
                          : "Standard Access Station"}
                      </Text>
                    </View>
                    <Text className="text-zinc-400 text-[11px] leading-relaxed">
                      {line.accessibilityNotice}
                    </Text>

                    {/* Operator Hotline Touchpoint */}
                    <TouchableOpacity
                      onPress={() => handleCallHotline(line.hotline)}
                      activeOpacity={0.7}
                      className="flex-row items-center gap-1.5 mt-2 pt-2 border-t border-zinc-800/80"
                    >
                      <Ionicons name="call-outline" size={12} color="#38BDF8" />
                      <Text className="text-sky-400 text-xs font-semibold">
                        {line.operator.split(" ")[0]} Hotline: {line.hotline}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* 1-Tap Google Maps Turn-by-Turn GPS Button */}
                  <TouchableOpacity
                    onPress={() => handleNavigateStation(station, line)}
                    activeOpacity={0.85}
                    className="bg-sky-500 py-3 px-4 rounded-xl flex-row items-center justify-center gap-2"
                  >
                    <Ionicons name="navigate" size={16} color="#FFFFFF" />
                    <Text className="text-white text-xs font-black tracking-wider uppercase">
                      Navigate with Google Maps (Turn-by-Turn)
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}
