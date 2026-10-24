import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Keyboard,
  Linking,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView, WebViewMessageEvent, WebViewNavigation } from "react-native-webview";

const DEFAULT_MAP_URL =
  "https://www.google.com/maps/@14.5995,120.9842,13z?hl=en&entry=ml&utm_campaign=ml-sr";

export default function WebMapTab() {
  const webViewRef = useRef<WebView>(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [inputsVisible, setInputsVisible] = useState(true);
  const [mapUrl, setMapUrl] = useState(DEFAULT_MAP_URL);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isSignInPage, setIsSignInPage] = useState(false);

  const originRef = useRef("");
  originRef.current = origin;

  const destinationRef = useRef("");
  destinationRef.current = destination;

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

  // Hook Android hardware back button/gesture so user is never stuck in Sign-In or subpages
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

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const { latitude, longitude } = loc.coords;
          const initialUrl = `https://www.google.com/maps/@${latitude},${longitude},15z?hl=en&entry=ml&utm_campaign=ml-sr`;
          lastMapsUrlRef.current = initialUrl;
          currentWebUrlRef.current = initialUrl;
          setMapUrl(initialUrl);

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

  const buildDirectionsUrl = useCallback((destQuery: string, origQuery?: string) => {
    const start = (origQuery ?? originRef.current).trim();
    const end = destQuery.trim();
    if (!end && !start) {
      return `https://www.google.com/maps/dir/?hl=en&entry=ml&utm_campaign=ml-sr`;
    }
    if (start && end) {
      return `https://www.google.com/maps/dir/${encodeURIComponent(
        start
      )}/${encodeURIComponent(end)}?hl=en&entry=ml&utm_campaign=ml-sr`;
    }
    if (end) {
      return `https://www.google.com/maps/dir//${encodeURIComponent(
        end
      )}?hl=en&entry=ml&utm_campaign=ml-sr`;
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(
      start
    )}?hl=en&entry=ml&utm_campaign=ml-sr`;
  }, []);

  const handleRouteSearch = () => {
    Keyboard.dismiss();
    try {
      Haptics.selectionAsync();
    } catch {}
    const start = origin.trim();
    const end = destination.trim();
    if (!start && !end) return;
    navigateWebViewTo(buildDirectionsUrl(end, start));
  };

  // Runs BEFORE Google Maps scripts load: sets Google Maps' own internal localStorage flags
  // so it disables app-intent hijacking ("decommissionedagmm") and enables full in-web Directions
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

  // Runs after page load: dismisses any app banners, rewrites intent:// anchors,
  // and ensures Directions & Start buttons always transition smoothly in the WebView
  const INJECTED_JS = `
    (function() {
      if (window.__parapoMapsHooked) return;
      window.__parapoMapsHooked = true;

      try {
        localStorage.setItem('decommissionedagmm', Date.now().toString());
        localStorage.setItem('igmmstate', JSON.stringify({ state: '0', timestamp: Date.now() }));
      } catch (e) {}

      window.open = function(url) {
        if (url) {
          window.location.href = url;
        }
        return window;
      };

      function getCurrentPlaceTitle() {
        var m = window.location.pathname.match(/\\/maps\\/place\\/([^/?#]+)/);
        if (m && m[1]) {
          try {
            return decodeURIComponent(m[1].replace(/\\+/g, ' '));
          } catch (e) {}
        }
        var headings = document.querySelectorAll('h1, [role="heading"]');
        for (var i = 0; i < headings.length; i++) {
          var t = (headings[i].innerText || headings[i].textContent || '').trim();
          if (t && t.toLowerCase() !== 'google maps' && t.toLowerCase() !== 'directions') {
            return t;
          }
        }
        return '';
      }

      function expandRouteStepsInPage() {
        var els = document.querySelectorAll('button, [role="button"], a, span, div');
        for (var i = 0; i < els.length; i++) {
          var txt = (els[i].innerText || els[i].textContent || '').trim().toLowerCase();
          var aria = (els[i].getAttribute && (els[i].getAttribute('aria-label') || '')).toLowerCase();
          if (
            txt === 'steps' ||
            txt === 'preview' ||
            txt === 'steps & more' ||
            txt === 'list' ||
            aria.indexOf('step') !== -1 ||
            aria.indexOf('preview') !== -1
          ) {
            els[i].click();
            return true;
          }
        }
        return false;
      }

      window.__parapoExpandSteps = expandRouteStepsInPage;

      document.addEventListener('click', function(e) {
        var el = e.target;
        var label = '';
        for (var depth = 0; el && depth < 6; depth++, el = el.parentElement) {
          var txt = (el.innerText || el.textContent || '').trim();
          var aria = (el.getAttribute && (el.getAttribute('aria-label') || '')).trim();
          var combined = (aria || txt).toLowerCase();
          if (
            combined === 'directions' ||
            combined === 'start' ||
            combined.indexOf('directions to') === 0 ||
            combined.indexOf('navigate') === 0
          ) {
            label = combined;
            break;
          }
        }
        if (!label) return;

        var urlBefore = window.location.href;
        var placeTitle = getCurrentPlaceTitle();

        setTimeout(function() {
          // If already on /maps/dir/ and user tapped Start, expand the step-by-step route preview
          if (window.location.href.indexOf('/maps/dir/') !== -1 && label === 'start') {
            expandRouteStepsInPage();
            return;
          }
          // If still not on /maps/dir/ after tapping Directions or Start on a place, trigger route in RN
          if (window.location.href.indexOf('/maps/dir/') === -1 && window.location.href === urlBefore) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: ' FORCE_DIRECTIONS',
                action: label,
                placeTitle: placeTitle,
                currentUrl: window.location.href
              }));
            }
          }
        }, 320);
      }, true);

      function cleanGoogleMapsDom() {
        var promo = document.querySelector('.ml-persistent-promo-banner, #CfMG9b');
        if (promo) {
          promo.style.display = 'none';
        }
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
      }
      cleanGoogleMapsDom();
      setInterval(cleanGoogleMapsDom, 500);
    })();
    true;
  `;

  // Converts any Google Maps intent://, maps.app.goo.gl, or comgooglemapsurl:// into an in-WebView /maps/dir/ URL
  const resolveMapsIntentToWebUrl = useCallback(
    (rawUrl: string): string | null => {
      let candidate = rawUrl;

      // 1. Unwrap ?link=... or ?deep_link_id=...
      const linkMatch =
        rawUrl.match(/[?&]link=([^&#;]+)/) ||
        rawUrl.match(/[?&]deep_link_id=([^&#;]+)/);
      if (linkMatch?.[1]) {
        try {
          candidate = decodeURIComponent(linkMatch[1]);
        } catch {}
      } else if (rawUrl.startsWith("intent://")) {
        const beforeIntent = rawUrl.split("#Intent")[0].replace(/^intent:\/\//, "https://");
        const innerLink = beforeIntent.match(/[?&]link=([^&#;]+)/);
        if (innerLink?.[1]) {
          try {
            candidate = decodeURIComponent(innerLink[1]);
          } catch {}
        } else if (
          beforeIntent.includes("google.com/maps") ||
          beforeIntent.includes("maps.google.com")
        ) {
          candidate = beforeIntent;
        } else {
          const fbMatch = rawUrl.match(/S\.browser_fallback_url=([^;]+)/);
          if (fbMatch?.[1]) {
            try {
              const decodedFb = decodeURIComponent(fbMatch[1]);
              const nestedUrl = decodedFb.match(/[?&]url=([^&#;]+)/);
              if (nestedUrl?.[1]) {
                candidate = decodeURIComponent(nestedUrl[1]);
              } else if (!decodedFb.includes("play.google.com")) {
                candidate = decodedFb;
              }
            } catch {}
          }
        }
      }

      const start = originRef.current.trim();

      // 2. Check for google.navigation:q=... or daddr=... or destination=...
      const destParamMatch =
        candidate.match(/[?&]daddr=([^&#;]+)/) ||
        candidate.match(/[?&]destination=([^&#;]+)/) ||
        candidate.match(/google\.navigation:q=([^&#;]+)/) ||
        candidate.match(/[?&]q=([^&#;]+)/);
      if (destParamMatch?.[1]) {
        try {
          const dest = decodeURIComponent(destParamMatch[1].replace(/\+/g, " "));
          return buildDirectionsUrl(dest, start);
        } catch {}
      }

      // 3. If the intent points to /maps/place/PlaceName/..., convert it into a /maps/dir/ route!
      const placeMatch = candidate.match(/\/maps\/place\/([^/?#]+)/);
      if (placeMatch?.[1]) {
        try {
          const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
          return buildDirectionsUrl(placeName, start);
        } catch {}
      }

      // 4. If the intent points to /maps/search/Query/..., convert it into a /maps/dir/ route!
      const searchMatch = candidate.match(/\/maps\/search\/([^/?#]+)/);
      if (searchMatch?.[1]) {
        try {
          const searchName = decodeURIComponent(searchMatch[1].replace(/\+/g, " "));
          return buildDirectionsUrl(searchName, start);
        } catch {}
      }

      // 5. If the intent is already /maps/dir/..., strip dir_action=navigate and inject origin if empty
      if (candidate.includes("/maps/dir/")) {
        let cleanDir = candidate
          .replace(/^intent:\/\//, "https://")
          .split("#Intent")[0]
          .replace(/([?&])dir_action=navigate(&?)/g, "$1")
          .replace(/[?&]$/, "");

        if (cleanDir.includes("/maps/dir//") && start) {
          cleanDir = cleanDir.replace(
            "/maps/dir//",
            `/maps/dir/${encodeURIComponent(start)}/`
          );
        }
        if (!cleanDir.includes("utm_campaign=")) {
          cleanDir += (cleanDir.includes("?") ? "&" : "?") + "entry=ml&utm_campaign=ml-sr";
        }
        return cleanDir;
      }

      // 6. If the intent is a bare camera link (/maps/@lat,lng...) from the Directions button
      if (candidate.includes("google.com/maps") || candidate.includes("maps.google.com")) {
        const dest = destinationRef.current.trim();
        return buildDirectionsUrl(dest, start);
      }

      return null;
    },
    [buildDirectionsUrl]
  );

  const handleShouldStartLoad = (url: string): boolean => {
    // Detect Google Sign-In pages (e.g., when user presses "Save") so we show the Back to Maps bar
    if (
      url.includes("accounts.google.com") ||
      url.includes("ServiceLogin")
    ) {
      currentWebUrlRef.current = url;
      setIsSignInPage(true);
      return true;
    }

    // Intercept maps.app.goo.gl, intent://, comgooglemapsurl://, google.navigation:, geo:
    if (
      url.startsWith("intent://") ||
      url.startsWith("comgooglemapsurl://") ||
      url.startsWith("google.navigation:") ||
      url.startsWith("geo:") ||
      url.includes("maps.app.goo.gl")
    ) {
      const wasAlreadyOnDir = currentWebUrlRef.current.includes("/maps/dir/");
      const resolved = resolveMapsIntentToWebUrl(url);
      if (resolved) {
        if (wasAlreadyOnDir && resolved === currentWebUrlRef.current) {
          // User tapped "Start" while already viewing the route -> expand step-by-step maneuvers
          webViewRef.current?.injectJavaScript(
            `if (window.__parapoExpandSteps) { window.__parapoExpandSteps(); } true;`
          );
        } else {
          navigateWebViewTo(resolved);
          setTimeout(() => {
            webViewRef.current?.injectJavaScript(
              `if (window.__parapoExpandSteps) { window.__parapoExpandSteps(); } true;`
            );
          }, 1200);
        }
      }
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
      if (payload?.type?.trim() === "FORCE_DIRECTIONS") {
        const placeTitle = (payload.placeTitle || "").trim();
        const currentUrl = payload.currentUrl || "";
        const target =
          (placeTitle && buildDirectionsUrl(placeTitle)) ||
          resolveMapsIntentToWebUrl(currentUrl);
        if (target) {
          navigateWebViewTo(target);
        }
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
    <View className="flex-1 bg-[#000000] pt-11">
      <StatusBar barStyle="light-content" />

      {/* Minimal Header with Back Navigation */}
      <View className="px-6 pb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          {(canGoBack || isSignInPage) && (
            <TouchableOpacity
              onPress={handleGoBack}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <Text className="text-white font-bold text-3xl tracking-tight">
            Navigation
          </Text>
        </View>

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

      {/* One-Tap Escape Banner when Google Sign-In opens (e.g. after pressing Save) */}
      {isSignInPage && (
        <TouchableOpacity
          onPress={returnToMapsFromSignIn}
          activeOpacity={0.85}
          className="mx-6 mb-2 py-3 px-4 bg-[#18181B] flex-row items-center justify-between rounded-xl"
        >
          <View className="flex-row items-center">
            <Ionicons name="arrow-back-circle" size={24} color="#3B82F6" />
            <Text className="text-white font-bold text-base ml-2.5">
              Back to Google Maps
            </Text>
          </View>
          <Text className="text-[#8E8E93] font-semibold text-sm">
            Skip Sign-In
          </Text>
        </TouchableOpacity>
      )}

      {/* Editable Starting Location & Destination Inputs */}
      {inputsVisible && !isSignInPage && (
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
            {origin.length > 0 && (
              <TouchableOpacity
                onPress={() => setOrigin("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={20} color="#71717A" />
              </TouchableOpacity>
            )}
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
            {destination.length > 0 && (
              <TouchableOpacity
                onPress={() => setDestination("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="mr-3"
              >
                <Ionicons name="close-circle" size={20} color="#71717A" />
              </TouchableOpacity>
            )}
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
          injectedJavaScriptBeforeContentLoaded={INJECTED_BEFORE_LOAD_JS}
          injectedJavaScript={INJECTED_JS}
          onShouldStartLoadWithRequest={(req) => handleShouldStartLoad(req.url)}
          onNavigationStateChange={handleNavStateChange}
          onMessage={handleWebViewMessage}
          userAgent="Mozilla/5.0 (Linux; Android 15; A059P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36"
          className="flex-1"
        />
      </View>
    </View>
  );
}
