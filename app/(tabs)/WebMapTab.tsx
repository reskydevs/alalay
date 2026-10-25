import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView, WebViewMessageEvent, WebViewNavigation } from "react-native-webview";

const DEFAULT_MAP_URL =
  "https://www.google.com/maps/@14.5995,120.9842,15z?hl=en&entry=ml&utm_campaign=ml-sr";

export default function WebMapTab() {
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

  // Request high-accuracy GPS and initialize map centered directly on user's location
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
          const initialUrl = `https://www.google.com/maps/@${latitude},${longitude},16z?hl=en&entry=ml&utm_campaign=ml-sr`;
          lastMapsUrlRef.current = initialUrl;
          currentWebUrlRef.current = initialUrl;
          setMapUrl(initialUrl);
        }
      } catch {}
    })();
  }, []);

  const buildDirectionsUrl = useCallback(
    (destQuery: string, origQuery?: string) => {
      const start = origQuery?.trim() || (userCoords ? `${userCoords.lat},${userCoords.lng}` : "");
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
      return `https://www.google.com/maps/dir/${encodeURIComponent(
        start
      )}/?hl=en&entry=ml&utm_campaign=ml-sr`;
    },
    [userCoords]
  );

  // Runs BEFORE Google Maps scripts load: sets internal flags for native web routing
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

  // Runs after page load: auto-clicks "Your location", auto-expands Directions drawer (Drive, Two-wheeler, Walk),
  // suppresses app banners, and hooks intent links
  const INJECTED_JS = `
    (function() {
      if (window.__parapoNavHooked) return;
      window.__parapoNavHooked = true;

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

      // Auto-trigger "Your location" and expand "Directions: Drive, Two-wheeler, Walk"
      function triggerLocationAndDirectionsDrawer() {
        var buttons = document.querySelectorAll('button, div[role="button"], a, span');

        // 1. Activate "Your location" GPS button
        for (var i = 0; i < buttons.length; i++) {
          var aria = (buttons[i].getAttribute('aria-label') || '').toLowerCase();
          var dataTip = (buttons[i].getAttribute('data-tooltip') || '').toLowerCase();
          var jsact = (buttons[i].getAttribute('jsaction') || '').toLowerCase();
          if (
            aria.indexOf('your location') !== -1 ||
            dataTip.indexOf('your location') !== -1 ||
            jsact.indexOf('my_location') !== -1 ||
            aria === 're-center' ||
            aria.indexOf('lokasyon mo') !== -1
          ) {
            buttons[i].click();
            break;
          }
        }

        // 2. Expand "Quick actions / Directions: Drive, Two-wheeler, Walk" drawer if collapsed
        for (var j = 0; j < buttons.length; j++) {
          var txt = (buttons[j].innerText || buttons[j].textContent || '').trim().toLowerCase();
          if (
            txt.indexOf('quick actions') !== -1 ||
            txt.indexOf('tap to see') !== -1 ||
            txt === 'directions' ||
            txt.indexOf('mga direksyon') !== -1
          ) {
            buttons[j].click();
            break;
          }
        }
      }

      // Execute on startup with retries as map DOM stabilizes
      setTimeout(triggerLocationAndDirectionsDrawer, 800);
      setTimeout(triggerLocationAndDirectionsDrawer, 1800);
      setTimeout(triggerLocationAndDirectionsDrawer, 3200);

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
      setInterval(cleanGoogleMapsDom, 600);

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
        setTimeout(function() {
          if (window.location.href.indexOf('/maps/dir/') !== -1 && label === 'start') {
            expandRouteStepsInPage();
            return;
          }
          if (window.location.href.indexOf('/maps/dir/') === -1 && window.location.href === urlBefore) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'FORCE_DIRECTIONS',
                action: label,
                currentUrl: window.location.href
              }));
            }
          }
        }, 320);
      }, true);
    })();
    true;
  `;

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

      const start = userCoords ? `${userCoords.lat},${userCoords.lng}` : "";

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

      // 5. If the intent is already /maps/dir/..., strip dir_action=navigate
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

      // 6. Bare camera link fallback
      if (candidate.includes("google.com/maps") || candidate.includes("maps.google.com")) {
        return buildDirectionsUrl("", start);
      }

      return null;
    },
    [buildDirectionsUrl, userCoords]
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
        const currentUrl = payload.currentUrl || "";
        const target = resolveMapsIntentToWebUrl(currentUrl);
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
    <View className="flex-1 bg-[#000000] pt-10">
      <StatusBar barStyle="light-content" />

      {/* Sleek Minimal Header (Back button only when needed, no black input boxes) */}
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

      {/* Full-Bleed Interactive Google Maps Canvas */}
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
