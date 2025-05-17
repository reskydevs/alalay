import axios from "axios";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";

// For OpenStreetMap tiles, we use custom tile URL
const OSM_TILE_URL = "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png";

export default function PUVScreen() {
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [region, setRegion] = useState({
    latitude: 14.5995, // Manila default
    longitude: 120.9842,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObjectCoords | null>(null);

  // Helper to reverse geocode coordinates to address string
  const [fromAddress, setFromAddress] = useState<string>("Detecting...");
  const [toAddress, setToAddress] = useState<string>(
    "Tap on map to set destination"
  );

  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
      setRegion((region) => ({
        ...region,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));
    })();
  }, []);

  // Helper to format address from reverse geocode result
  function formatAddress(
    result: Partial<Location.LocationGeocodedAddress>
  ): string {
    // Prefer street + city + region, fallback to name or country
    const { name, street, city, region, country, postalCode } = result;
    let parts = [street, city, region, country].filter(Boolean);
    if (parts.length === 0 && name) parts = [name];
    if (postalCode && !parts.includes(postalCode)) parts.push(postalCode);
    return parts.length > 0 ? parts.join(", ") : "Unknown location";
  }

  // Update FROM address when currentLocation changes
  React.useEffect(() => {
    if (currentLocation) {
      Location.reverseGeocodeAsync({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      })
        .then((results) => {
          if (results && results.length > 0) {
            setFromAddress(formatAddress(results[0]));
          } else {
            setFromAddress("Unknown location");
          }
        })
        .catch(() => setFromAddress("Unable to get address"));
    }
  }, [currentLocation]);

  // Update TO address when destination changes
  React.useEffect(() => {
    if (destination) {
      Location.reverseGeocodeAsync({
        latitude: destination.latitude,
        longitude: destination.longitude,
      })
        .then((results) => {
          if (results && results.length > 0) {
            setToAddress(formatAddress(results[0]));
          } else {
            setToAddress("Unknown location");
          }
        })
        .catch(() => setToAddress("Unable to get address"));
    } else {
      setToAddress("Tap on map to set destination");
    }
  }, [destination]);

  // Nominatim search for destination autocomplete
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=5`;
      const response = await axios.get(url, {
        headers: { "Accept-Language": "en" },
      });
      setSearchResults(response.data);
    } catch (e) {
      setSearchError("No results found");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSearchResult = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setDestination({ latitude: lat, longitude: lon });
    setRegion((region) => ({ ...region, latitude: lat, longitude: lon }));
    setSearchQuery("");
    setSearchResults([]);
    Keyboard.dismiss();
  };

  const handleMapPress = (e: {
    nativeEvent: { coordinate: { latitude: number; longitude: number } };
  }) => {
    setDestination(e.nativeEvent.coordinate);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={styles.tabText}>PUV (Jeep, Bus)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, styles.disabledTab]} disabled>
            <Text style={[styles.tabText, styles.disabledText]}>
              Transit (LRT, MRT)
            </Text>
          </TouchableOpacity>
        </View>
        {/* Map or Placeholder */}
        {Platform.OS === "web" ? (
          <View
            style={[
              styles.map,
              { justifyContent: "center", alignItems: "center" },
            ]}
          >
            <Text style={{ color: "#888", textAlign: "center" }}>
              Map view is only available on mobile devices (iOS/Android).
            </Text>
          </View>
        ) : (
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={handleMapPress}
            provider={PROVIDER_DEFAULT}
            customMapStyle={[]}
            showsUserLocation={true}
          >
            <UrlTile urlTemplate={OSM_TILE_URL} zIndex={1} />
            {/* Current location marker */}
            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title="You are here"
                pinColor="#007AFF"
              />
            )}
            {/* Destination marker */}
            {destination && (
              <Marker
                coordinate={destination}
                pinColor="#FF3333"
                title="Destination"
              />
            )}
          </MapView>
        )}
        {/* FROM/TO fields */}
        <View style={{ marginHorizontal: 20, marginTop: 16, marginBottom: 8 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>FROM</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 8 }}>○</Text>
            <Text
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                backgroundColor: "#fafafa",
              }}
            >
              {fromAddress}
            </Text>
          </View>
          {/* TO field with autocomplete */}
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>TO</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 8 }}>📍</Text>
            <TextInput
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                backgroundColor: "#fafafa",
              }}
              placeholder="Enter destination..."
              value={searchQuery}
              onChangeText={handleSearch}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>
          {searchLoading && (
            <ActivityIndicator
              size="small"
              color="#222"
              style={{ marginBottom: 8 }}
            />
          )}
          {searchError && (
            <Text style={{ color: "red", marginBottom: 8 }}>{searchError}</Text>
          )}
          {searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 10,
                    borderBottomWidth: 1,
                    borderColor: "#eee",
                    backgroundColor: "#fff",
                  }}
                  onPress={() => handleSelectSearchResult(item)}
                >
                  <Text numberOfLines={2}>{item.display_name}</Text>
                </TouchableOpacity>
              )}
              style={{
                maxHeight: 120,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: "#eee",
                borderRadius: 8,
              }}
              keyboardShouldPersistTaps="handled"
            />
          )}
          {/* Show selected destination address if not searching */}
          {searchQuery === "" && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 20, marginRight: 8, opacity: 0 }}>
                📍
              </Text>
              <Text
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  padding: 8,
                  backgroundColor: "#fafafa",
                }}
              >
                {toAddress}
              </Text>
            </View>
          )}
        </View>
        {/* Set Destination Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (!destination) {
              alert("Please tap on the map to select your destination.");
              return;
            }
            alert(
              `Destination set to:\nLatitude: ${destination.latitude}\nLongitude: ${destination.longitude}`
            );
          }}
        >
          <Text style={styles.buttonText}>Set Destination</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  tabSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: "#222",
  },
  disabledTab: {
    backgroundColor: "#eee",
  },
  tabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledText: {
    color: "#888",
  },
  map: {
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 10,
    minHeight: 300,
  },
  button: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 8,
    margin: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
