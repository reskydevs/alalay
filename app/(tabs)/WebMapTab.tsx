import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

export default function WebMapTab() {
  const webViewRef = useRef<WebView>(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [mapUrl, setMapUrl] = useState(
    "https://www.google.com/maps/@14.5995,120.9842,13z?hl=en"
  );

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const { latitude, longitude } = loc.coords;
          setMapUrl(`https://www.google.com/maps/@${latitude},${longitude},15z?hl=en`);

          Location.reverseGeocodeAsync(loc.coords)
            .then((res) => {
              if (res?.[0]) {
                const label = [res[0].name || res[0].street, res[0].city]
                  .filter(Boolean)
                  .join(", ");
                if (label) setOrigin(label);
              }
            })
            .catch(() => {});
        }
      } catch {}
    })();
  }, []);

  const handleRouteSearch = () => {
    Keyboard.dismiss();
    const start = origin.trim();
    const end = destination.trim();

    if (start && end) {
      setMapUrl(
        `https://www.google.com/maps/dir/${encodeURIComponent(start)}/${encodeURIComponent(
          end
        )}?hl=en`
      );
    } else if (end) {
      setMapUrl(
        `https://www.google.com/maps/search/${encodeURIComponent(end)}?hl=en`
      );
    } else if (start) {
      setMapUrl(
        `https://www.google.com/maps/search/${encodeURIComponent(start)}?hl=en`
      );
    }
  };

  // Auto-dismiss Google Maps promotional banners and keep web browsing smooth
  const INJECTED_JS = `
    (function() {
      function cleanPromos() {
        var els = document.querySelectorAll('button, a, div[role="button"]');
        for (var i = 0; i < els.length; i++) {
          var txt = (els[i].innerText || '').toLowerCase();
          if (txt === 'stay on web' || txt === 'use the web' || txt === 'not now' || txt === 'no thanks') {
            els[i].click();
          }
        }
      }
      setInterval(cleanPromos, 1000);
    })();
    true;
  `;

  return (
    <View className="flex-1 bg-[#000000] pt-11">
      <StatusBar barStyle="light-content" />

      {/* Minimal Header + Frameless Toggle */}
      <View className="px-6 pb-3 flex-row items-center justify-between">
        <Text className="text-white font-bold text-2xl tracking-tight">
          Navigation
        </Text>

        <View className="flex-row items-center gap-6">
          <TouchableOpacity
            onPress={() => webViewRef.current?.reload()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setControlsCollapsed(!controlsCollapsed)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={controlsCollapsed ? "search-outline" : "chevron-up"}
              size={26}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Editable Starting Location & Destination Inputs (Unboxed, Clean Lines) */}
      {!controlsCollapsed && (
        <View className="px-6 pb-4">
          {/* Starting Location User Input */}
          <View className="flex-row items-center py-2.5 border-b border-[#27272A]">
            <Ionicons name="radio-button-on" size={18} color="#8E8E93" />
            <TextInput
              value={origin}
              onChangeText={setOrigin}
              placeholder="Starting location"
              placeholderTextColor="#71717A"
              className="flex-1 ml-3 text-white text-lg font-medium py-0"
              returnKeyType="next"
            />
            {origin.length > 0 && (
              <TouchableOpacity
                onPress={() => setOrigin("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#71717A" />
              </TouchableOpacity>
            )}
          </View>

          {/* Destination User Input */}
          <View className="flex-row items-center py-2.5 border-b border-[#27272A] mt-1">
            <Ionicons name="location-outline" size={20} color="#E82127" />
            <TextInput
              value={destination}
              onChangeText={setDestination}
              placeholder="Destination"
              placeholderTextColor="#71717A"
              className="flex-1 ml-3 text-white text-lg font-medium py-0"
              returnKeyType="search"
              onSubmitEditing={handleRouteSearch}
            />
            {destination.length > 0 && (
              <TouchableOpacity
                onPress={() => setDestination("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="mr-3"
              >
                <Ionicons name="close" size={20} color="#71717A" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleRouteSearch}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Full-Bleed Interactive Google Maps Browser View */}
      <View className="flex-1 bg-[#000000]">
        <WebView
          ref={webViewRef}
          source={{ uri: mapUrl }}
          startInLoadingState={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          geolocationEnabled={true}
          mixedContentMode="always"
          originWhitelist={["*"]}
          setSupportMultipleWindows={false}
          injectedJavaScript={INJECTED_JS}
          onShouldStartLoadWithRequest={(req) => {
            // Prevent intent:// or market:// redirects from breaking WebView
            if (req.url.startsWith("http://") || req.url.startsWith("https://")) {
              return true;
            }
            return false;
          }}
          userAgent="Mozilla/5.0 (Linux; Android 15; A059P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36"
          className="flex-1"
        />
      </View>
    </View>
  );
}
