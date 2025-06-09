import usePUVController from "@/app/logic/useCommute";
import MapSection from "@/components/MapSection";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type DrawerParamList = {
  Home: undefined;
  User: undefined;
};

export default function HomeScreen() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  const {
    region,
    setRegion,
    currentLocation,
    destination,
    fromAddress,
    toAddress,
    searchQuery,
    handleSelectSearchResult,
    handleMapPress,
    searchResults,
    searchLoading,
    searchError,
    setSearchQuery,
    handleSearch,
  } = usePUVController();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["10%", "50%"], []);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [activeTab, setActiveTab] = useState<"PUV" | "Transit">("PUV");

  const handleSheetChanges = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const toggleSheet = () => {
    const nextIndex = currentIndex === 0 ? 1 : 0;
    bottomSheetRef.current?.snapToIndex(nextIndex);
  };

  const onSetDestination = () => {
    if (!destination) {
      Alert.alert("Please tap on the map to select your destination.");
      return;
    }
    Alert.alert(
      "Destination Set",
      `Latitude: ${destination.latitude}\nLongitude: ${destination.longitude}`
    );
    bottomSheetRef.current?.snapToIndex(0);
  };

  // TODO: Add logic to fetch/render backend data based on selected mode (PUV or Transit)

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="absolute left-5 top-12 z-50">
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          className="p-2 rounded-full shadow-md"
          style={{
            elevation: 5,
            backgroundColor: "#27ae60",
          }}
        >
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <View
        className="absolute z-50 flex-row"
        style={{
          top: 48,
          right: 20,
          backgroundColor: "#f0f0f0",
          borderRadius: 24,
          overflow: "hidden",
          elevation: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab("PUV")}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: activeTab === "PUV" ? "#27ae60" : "transparent",
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
          }}
        >
          <Text
            style={{
              color: activeTab === "PUV" ? "white" : "#333",
              fontWeight: "bold",
            }}
          >
            PUV
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("Transit")}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor:
              activeTab === "Transit" ? "#27ae60" : "transparent",
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <Text
            style={{
              color: activeTab === "Transit" ? "white" : "#333",
              fontWeight: "bold",
            }}
          >
            Transit
          </Text>
        </TouchableOpacity>
      </View>

      <MapSection
        region={region}
        onRegionChange={setRegion}
        onMapPress={handleMapPress}
        currentLocation={currentLocation}
        destination={destination}
      />

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enableDynamicSizing={false}
        handleStyle={{
          backgroundColor: "#27ae60",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <Pressable onPress={toggleSheet}>
          <View
            className="flex-row justify-between items-center px-4 py-2"
            style={{ backgroundColor: "#27ae60" }}
          >
            <Text className="px-4 py-1 text-2xl font-bold text-white rounded">
              PUV COMMUTE
            </Text>
            <MaterialCommunityIcons
              name="jeepney"
              size={50}
              color="white"
              className="py-2"
            />
          </View>

          <BottomSheetView
            className="px-4 pt-5 pb-10"
            style={{ minHeight: 300 }}
          >
            {/* From Address Input */}
            <Text className="mb-2 font-semibold text-gray-700">From:</Text>
            <TextInput
              className="px-4 py-2 mb-4 text-black bg-white rounded-md border border-gray-300"
              placeholder="Enter pickup location..."
              value={fromAddress}
              // Uncomment if you want editable fromAddress:
              // onChangeText={(text) => setFromAddress(text)}
            />

            <Text className="mb-2 font-semibold text-gray-700">To:</Text>
            <TextInput
              className="px-4 py-2 text-black bg-white rounded-md border border-gray-300"
              placeholder="Enter destination..."
              value={searchQuery}
              onChangeText={handleSearch}
            />

            {searchLoading && (
              <View className="flex items-center mt-2">
                <ActivityIndicator size="small" color="#27ae60" />
              </View>
            )}

            {searchError && (
              <Text className="mt-2 text-red-500">{searchError}</Text>
            )}

            {searchResults.length > 0 && (
              <FlatList
                className="mt-2 max-h-48 bg-white rounded-md border border-gray-300"
                data={searchResults}
                keyExtractor={(item) => `${item.place_id}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectSearchResult(item)}
                    className="p-3 border-b border-gray-200"
                  >
                    <Text className="text-sm text-black">
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <View className="mt-4">
              <TouchableOpacity
                className="items-center py-4 rounded-xl"
                onPress={onSetDestination}
                style={{ backgroundColor: "#27ae60" }}
              >
                <Text className="text-base font-bold text-white">
                  Set Destination
                </Text>
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        </Pressable>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}
