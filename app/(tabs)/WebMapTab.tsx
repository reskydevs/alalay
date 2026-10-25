import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Linking,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent, WebViewNavigation } from "react-native-webview";

const DEFAULT_MAP_URL =
  "https://www.google.com/maps/@14.5995,120.9842,15z?hl=en";

export default function WebMapTab() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [mapUrl, setMapUrl] = useState(DEFAULT_MAP_URL);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isSignInPage, setIsSignInPage] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const currentWebUrlRef = useRef(DEFAULT_MAP_URL);
  const lastMapsUrlRef = useRef(DEFAULT_MAP_URL);

  const navigateWebViewTo = useCallback((targetUrl: string) => {
    currentWebUrlRef.current = targetUrl;
    if (
      targetUrl.includes("google.com/maps") ||
      targetUrl.includes("maps.google.com")
    ) {
      lastMapsUrlRef.current = targetUrl;
      setIsSignInPage(false);
    }
    setMapUrl(targetUrl);
    setTimeout(() => {
      webViewRef.current?.injectJavaScript(
        `window.location.assign(${JSON.stringify(targetUrl)}); true;`
      );
    }, 15);
  }, []);

  const returnToMapsFromSignIn = useCallback(() => {
    try {
      Haptics.selectionAsync();
    } catch {}
    const fallbackMap = lastMapsUrlRef.current || DEFAULT_MAP_URL;
    setIsSignInPage(false);
    setMapUrl(fallbackMap);
    webViewRef.current?.injectJavaScript(
      `window.location.replace(${JSON.stringify(fallbackMap)}); true;`
    );
  }, []);

  const handleGoBack = useCallback(() => {
    try {
      Haptics.selectionAsync();
    } catch {}
    if (
      isSignInPage ||
      currentWebUrlRef.current.includes("accounts.google.com") ||
      currentWebUrlRef.current.includes("ServiceLogin")
    ) {
      returnToMapsFromSignIn();
      return true;
    }
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, [canGoBack, isSignInPage, returnToMapsFromSignIn]);

  // Hook Android hardware back gesture
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (
        isSignInPage ||
        currentWebUrlRef.current.includes("accounts.google.com") ||
        canGoBack
      ) {
        return handleGoBack();
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack, isSignInPage, handleGoBack]);

  // Request high-accuracy GPS on startup
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          const { latitude, longitude } = loc.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          const initialUrl = `https://www.google.com/maps/@${latitude},${longitude},16z?hl=en`;
          lastMapsUrlRef.current = initialUrl;
          currentWebUrlRef.current = initialUrl;
          setMapUrl(initialUrl);
        }
      } catch {}
    })();
  }, []);

  // Open native Google Maps app for turn-by-turn GPS navigation
  const openNativeMapsApp = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    const currentUrl = currentWebUrlRef.current;
    if (currentUrl.includes("/maps/dir/")) {
      Linking.openURL(currentUrl).catch(() => {
        const fallback = userCoords
          ? `google.navigation:q=${userCoords.lat},${userCoords.lng}`
          : "geo:0,0?q=transit";
        Linking.openURL(fallback).catch(() => {});
      });
    } else if (userCoords) {
      Linking.openURL(`geo:${userCoords.lat},${userCoords.lng}?q=transit`).catch(() => {});
    } else {
      Linking.openURL("https://www.google.com/maps").catch(() => {});
    }
  }, [userCoords]);

  // Injected JS before content loads
  const INJECTED_BEFORE_LOAD_JS = `
    (function() {
      try {
        var now = Date.now().toString();
        localStorage.setItem('decommissionedagmm', now);
        localStorage.setItem('igmmstate', JSON.stringify({ state: '0', timestamp: Date.now() }));
        localStorage.setItem('reengagementlinkpromodismissed', '1');
      } catch (e) {}
      window.open = function(url) {
        if (url) {
          window.location.href = url;
        }
        return window;
      };
    })();
    true;
  `;

  // Injected JS: cleans banners and hooks the "Start" button to launch native turn-by-turn navigation
  const INJECTED_JS = `
    (function() {
      if (window.__parapoNavHooked) return;
      window.__parapoNavHooked = true;

      // Clean annoying promo popups without triggering blank search overlays
      function cleanGoogleMapsDom() {
        var promo = document.querySelector('.ml-persistent-promo-banner, #CfMG9b, .ml-app-promo-banner');
        if (promo) {
          promo.style.display = 'none';
        }
      }
      cleanGoogleMapsDom();
      setInterval(cleanGoogleMapsDom, 800);

      // Listen for "Start" navigation clicks to launch the native Google Maps app
      document.addEventListener('click', function(e) {
        var el = e.target;
        for (var depth = 0; el && depth < 6; depth++, el = el.parentElement) {
          var txt = (el.innerText || el.textContent || '').trim().toLowerCase();
          var aria = (el.getAttribute && (el.getAttribute('aria-label') || '')).toLowerCase();
          if (
            txt === 'start' ||
            aria === 'start' ||
            txt === 'simulan' ||
            txt.indexOf('start navigation') !== -1
          ) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'START_NAVIGATION',
                currentUrl: window.location.href
              }));
            }
            break;
          }
        }
      }, true);
    })();
    true;
  `;

  const handleShouldStartLoad = (url: string): boolean => {
    // Detect Google Sign-In
    if (
      url.includes("accounts.google.com") ||
      url.includes("ServiceLogin")
    ) {
      currentWebUrlRef.current = url;
      setIsSignInPage(true);
      return true;
    }

    // Launch native navigation when google.navigation: or dir_action=navigate is requested
    if (
      url.startsWith("google.navigation:") ||
      url.includes("dir_action=navigate") ||
      (url.startsWith("intent://") && (url.includes("google.navigation") || url.includes("dir_action=navigate")))
    ) {
      let launchTarget = url;
      if (url.startsWith("intent://")) {
        const clean = url.split("#Intent")[0].replace(/^intent:\/\//, "https://");
        launchTarget = clean;
      }
      Linking.openURL(launchTarget).catch(() => {});
      return false;
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      currentWebUrlRef.current = url;
      if (
        url.includes("google.com/maps") ||
        url.includes("maps.google.com")
      ) {
        lastMapsUrlRef.current = url;
        setIsSignInPage(false);
      }
      return true;
    }

    return false;
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      if (payload?.type === "START_NAVIGATION") {
        const targetUrl = payload.currentUrl || currentWebUrlRef.current;
        Linking.openURL(targetUrl).catch(() => {});
      }
    } catch {}
  };

  const handleNavStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    const url = navState.url || "";
    if (!url) return;
    currentWebUrlRef.current = url;

    if (url.includes("accounts.google.com") || url.includes("ServiceLogin")) {
      setIsSignInPage(true);
    } else if (
      url.includes("google.com/maps") ||
      url.includes("maps.google.com")
    ) {
      lastMapsUrlRef.current = url;
      setIsSignInPage(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000000",
        paddingTop: Math.max(insets.top, 24),
      }}
    >
      <StatusBar barStyle="light-content" />

      {/* Top Header Bar (Back button when needed) */}
      {(canGoBack || isSignInPage) && (
        <View className="px-5 pb-2 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleGoBack}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            className="flex-row items-center"
          >
            <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
            <Text className="text-white font-semibold text-lg ml-2">
              Back
            </Text>
          </TouchableOpacity>

          {isSignInPage && (
            <TouchableOpacity
              onPress={returnToMapsFromSignIn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text className="text-[#38BDF8] font-bold text-base">
                Skip Sign-In
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Map Canvas */}
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
          injectedJavaScriptBeforeContentLoaded={INJECTED_BEFORE_LOAD_JS}
          injectedJavaScript={INJECTED_JS}
          onShouldStartLoadWithRequest={(req) => handleShouldStartLoad(req.url)}
          onNavigationStateChange={handleNavStateChange}
          onMessage={handleWebViewMessage}
          userAgent="Mozilla/5.0 (Linux; Android 15; A059P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36"
          className="flex-1"
        />

        {/* Floating Turn-by-Turn GPS Launcher Pill */}
        <View
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            zIndex: 10,
          }}
        >
          <TouchableOpacity
            onPress={openNativeMapsApp}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#1D4ED8",
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
              elevation: 8,
            }}
            className="flex-row items-center px-4 py-3 rounded-full gap-2 border border-blue-400"
          >
            <Ionicons name="navigate" size={18} color="#FFFFFF" />
            <Text className="text-white font-bold text-xs tracking-wider uppercase">
              Start Turn-by-Turn
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
