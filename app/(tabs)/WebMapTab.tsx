import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Linking,
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
  const [inputsVisible, setInputsVisible] = useState(true);
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
    try {
      Haptics.selectionAsync();
    } catch {}
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
        `https://www.google.com/maps/dir//${encodeURIComponent(end)}?hl=en`
      );
    } else if (start) {
      setMapUrl(
        `https://www.google.com/maps/search/${encodeURIComponent(start)}?hl=en`
      );
    }
  };

  // Automatically dismiss "Open the Google Maps app?" modal by clicking "Keep using web"
  // and rewrite intent:// links in-place so Directions & Start work seamlessly inside WebView
  const INJECTED_JS = `
    (function() {
      function handleGoogleMapsInterstitials() {
        var buttons = document.querySelectorAll('button, a, div[role="button"], span');
        for (var i = 0; i < buttons.length; i++) {
          var txt = (buttons[i].innerText || buttons[i].textContent || '').trim().toLowerCase();
          if (
            txt === 'keep using web' ||
            txt === 'stay on web' ||
            txt === 'use the web' ||
            txt === 'manatili sa web' ||
            txt === 'gamitin ang web'
          ) {
            buttons[i].click();
          }
        }

        var links = document.querySelectorAll('a[href^="intent://"]');
        for (var j = 0; j < links.length; j++) {
          var href = links[j].getAttribute('href') || '';
          var fbMatch = href.match(/S\\.browser_fallback_url=([^;]+)/);
          if (fbMatch && fbMatch[1]) {
            links[j].setAttribute('href', decodeURIComponent(fbMatch[1]));
          } else if (href.indexOf('maps.google.com') !== -1 || href.indexOf('google.com/maps') !== -1) {
            var clean = href.replace(/^intent:\\/\\//, 'https://').split('#Intent')[0];
            links[j].setAttribute('href', clean);
          }
        }
      }
      handleGoogleMapsInterstitials();
      setInterval(handleGoogleMapsInterstitials, 450);
    })();
    true;
  `;

  const handleIntentOrCustomUrl = (url: string): boolean => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return true;
    }

    if (url.startsWith("intent://")) {
      // 1. Check for S.browser_fallback_url inside the intent
      const fallbackMatch = url.match(/S\.browser_fallback_url=([^;]+)/);
      if (fallbackMatch && fallbackMatch[1]) {
        const decoded = decodeURIComponent(fallbackMatch[1]);
        if (
          decoded.startsWith("https://") &&
          !decoded.includes("play.google.com")
        ) {
          setMapUrl(decoded);
          return false;
        }
      }

      // 2. Convert intent://maps.google.com/... directly into https://
      const beforeIntent = url.split("#Intent")[0];
      if (
        beforeIntent.includes("google.com/maps") ||
        beforeIntent.includes("maps.google.com") ||
        beforeIntent.includes("maps.app.goo.gl")
      ) {
        const httpsUrl = beforeIntent.replace(/^intent:\/\//, "https://");
        setMapUrl(httpsUrl);
        return false;
      }

      // 3. If it's a pure turn-by-turn navigation start intent, allow native Maps fallback if available
      const navMatch = url.match(/daddr=([^&;#]+)/) || url.match(/q=([^&;#]+)/);
      if (navMatch && navMatch[1]) {
        const target = decodeURIComponent(navMatch[1]);
        const start = origin.trim();
        if (start) {
          setMapUrl(
            `https://www.google.com/maps/dir/${encodeURIComponent(
              start
            )}/${encodeURIComponent(target)}?hl=en`
          );
        } else {
          setMapUrl(
            `https://www.google.com/maps/dir//${encodeURIComponent(target)}?hl=en`
          );
        }
        return false;
      }
    }

    if (url.startsWith("google.navigation:") || url.startsWith("geo:")) {
      Linking.openURL(url).catch(() => {});
      return false;
    }

    return false;
  };

  return (
    <View className="flex-1 bg-[#000000] pt-11">
      <StatusBar barStyle="light-content" />

      {/* Minimal Header */}
      <View className="px-6 pb-2 flex-row items-center justify-between">
        <Text className="text-white font-bold text-3xl tracking-tight">
          Navigation
        </Text>

        <TouchableOpacity
          onPress={() => setInputsVisible(!inputsVisible)}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
        >
          <Ionicons
            name={inputsVisible ? "chevron-up" : "search-outline"}
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* Editable Starting Location & Destination Inputs */}
      {inputsVisible && (
        <View className="px-6 pb-3">
          <View className="flex-row items-center py-2.5 border-b border-[#27272A]">
            <Ionicons name="radio-button-on" size={18} color="#8E8E93" />
            <TextInput
              value={origin}
              onChangeText={setOrigin}
              placeholder="Starting location"
              placeholderTextColor="#71717A"
              className="flex-1 ml-3 text-white text-xl font-medium py-0"
              returnKeyType="next"
              onSubmitEditing={handleRouteSearch}
            />
          </View>

          <View className="flex-row items-center py-2.5 border-b border-[#27272A] mt-1">
            <Ionicons name="location-outline" size={20} color="#E82127" />
            <TextInput
              value={destination}
              onChangeText={setDestination}
              placeholder="Destination"
              placeholderTextColor="#71717A"
              className="flex-1 ml-3 text-white text-xl font-medium py-0"
              returnKeyType="search"
              onSubmitEditing={handleRouteSearch}
            />
            <TouchableOpacity
              onPress={handleRouteSearch}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            >
              <Ionicons name="arrow-forward" size={26} color="#FFFFFF" />
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
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          mixedContentMode="always"
          originWhitelist={["*"]}
          setSupportMultipleWindows={false}
          injectedJavaScript={INJECTED_JS}
          onShouldStartLoadWithRequest={(req) => handleIntentOrCustomUrl(req.url)}
          userAgent="Mozilla/5.0 (Linux; Android 15; A059P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36"
          className="flex-1"
        />
      </View>
    </View>
  );
}
