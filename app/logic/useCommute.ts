import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useRef, useState } from "react";

export type CommuteMode = "traditional" | "modern";

export interface FareBreakdown {
  baseDistanceKm: number;
  baseFare: number;
  perKmRate: number;
  totalDistanceKm: number;
  succeedingDistanceKm: number;
  succeedingFare: number;
  subtotalFare: number;
  discountAmount: number;
  totalFare: number;
  roundedFare: number;
}

export interface MatrixEntry {
  km: number;
  regularTraditional: number;
  discountTraditional: number;
  regularModern: number;
  discountModern: number;
}

// LTFRB Official Legal Source & Policy Metadata
export const LTFRB_LEGAL_SOURCE = {
  orderTitle: "LTFRB Board Resolution No. 2023-016 & Memorandum Circular 2024",
  policyName: "Official PUJ & PUV Fare Matrix Guide",
  officialUrl: "https://ltfrb.gov.ph/fare-rates/",
  lastUpdatedDate: "October 2024 (Effective 2024–2026)",
  hotline: "1342",
  dotrActionCenter: "8888",
  laws: [
    { code: "RA 9442", beneficiary: "Persons with Disabilities (PWD)", discount: "20% Statutory Discount" },
    { code: "RA 9994", beneficiary: "Senior Citizens", discount: "20% Statutory Discount" },
    { code: "RA 11314", beneficiary: "Students", discount: "20% Statutory Discount" },
  ],
  traditionalJeep: {
    baseFare: 13.0,
    baseDistanceKm: 4.0,
    perKmRate: 1.8,
  },
  modernPUV: {
    baseFare: 15.0,
    baseDistanceKm: 4.0,
    perKmRate: 2.2,
  },
};

// LTFRB Official Matrix Generation (Up to 25 km)
export function getLTFRBMatrix(): MatrixEntry[] {
  const entries: MatrixEntry[] = [];
  for (let km = 4; km <= 20; km++) {
    const succKm = Math.max(0, km - 4);
    // Traditional: 13 + succKm * 1.80
    const regTrad = Math.round((13 + succKm * 1.8) * 100) / 100;
    const discTrad = Math.round(regTrad * 0.8 * 100) / 100;

    // Modern: 15 + succKm * 2.20
    const regMod = Math.round((15 + succKm * 2.2) * 100) / 100;
    const discMod = Math.round(regMod * 0.8 * 100) / 100;

    entries.push({
      km,
      regularTraditional: regTrad,
      discountTraditional: discTrad,
      regularModern: regMod,
      discountModern: discMod,
    });
  }
  return entries;
}

// Manila Urban Road Detour Multiplier (real road distance vs straight-line)
const ROAD_DETOUR_FACTOR = 1.28;

export const getHaversineDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export default function usePUVController() {
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [fromAddress, setFromAddress] = useState("Current Location (GPS)");
  const [toAddress, setToAddress] = useState("");

  // Commuter Fare Configuration
  const [commuteMode, setCommuteMode] = useState<CommuteMode>("traditional");
  const [hasDiscount, setHasDiscount] = useState<boolean>(false);
  const [selectedDistanceKm, setSelectedDistanceKm] = useState<number>(4.0);
  const [isGpsDistanceActive, setIsGpsDistanceActive] = useState<boolean>(false);

  // Proximity Alert State
  const [proximityAlertStatus, setProximityAlertStatus] = useState<
    "idle" | "approaching_350m" | "arriving_100m"
  >("idle");
  const alert350Triggered = useRef(false);
  const alert100Triggered = useRef(false);

  // Initialize live GPS tracking for proximity and drop-off alerts
  useEffect(() => {
    let subscriber: Location.LocationSubscription | null = null;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const initial = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setCurrentLocation(initial.coords);

          subscriber = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 2500,
              distanceInterval: 10,
            },
            (loc) => {
              setCurrentLocation(loc.coords);
            }
          );
        } else {
          setFromAddress("GPS permission required for proximity alerts.");
        }
      } catch (err) {
        console.warn("[Location] Could not acquire GPS position:", err);
      }
    })();

    return () => {
      subscriber?.remove();
    };
  }, []);

  // Update origin address display when current location changes
  useEffect(() => {
    if (currentLocation) {
      Location.reverseGeocodeAsync(currentLocation)
        .then((res) => {
          if (res?.[0]) setFromAddress(formatAddress(res[0]));
        })
        .catch(() => {});
    }
  }, [currentLocation]);

  // Compute live GPS distance if destination is set
  const liveGpsDistanceKm = useMemo(() => {
    if (!currentLocation || !destinationCoords) return null;
    const directKm = getHaversineDistanceKm(
      currentLocation.latitude,
      currentLocation.longitude,
      destinationCoords.latitude,
      destinationCoords.longitude
    );
    // Apply road detour factor for Manila urban street network
    return Math.round(directKm * ROAD_DETOUR_FACTOR * 10) / 10;
  }, [currentLocation, destinationCoords]);

  // Effective distance used in calculation
  const effectiveDistanceKm = useMemo(() => {
    if (isGpsDistanceActive && liveGpsDistanceKm !== null) {
      return liveGpsDistanceKm;
    }
    return selectedDistanceKm;
  }, [isGpsDistanceActive, liveGpsDistanceKm, selectedDistanceKm]);

  // Proximity meters for drop-off alert
  const remainingMeters = useMemo(() => {
    if (!currentLocation || !destinationCoords) return null;
    const directKm = getHaversineDistanceKm(
      currentLocation.latitude,
      currentLocation.longitude,
      destinationCoords.latitude,
      destinationCoords.longitude
    );
    return Math.round(directKm * 1000);
  }, [currentLocation, destinationCoords]);

  // Dynamic Official LTFRB Fare Calculation
  // Traditional Jeepney: ₱13 base (first 4.0 km) / ₱1.80 per succeeding km
  // Modern PUV: ₱15 base (first 4.0 km) / ₱2.20 per succeeding km
  // 20% discount for PWD, Senior Citizens, and Students (RA 9442, RA 9994, RA 11314)
  const fareBreakdown = useMemo<FareBreakdown>(() => {
    const baseDistanceKm = 4.0;
    const baseFare = commuteMode === "traditional" ? 13.0 : 15.0;
    const perKmRate = commuteMode === "traditional" ? 1.8 : 2.2;

    const succeedingDistanceKm = Math.max(0, effectiveDistanceKm - baseDistanceKm);
    const succeedingFare = Math.round(succeedingDistanceKm * perKmRate * 100) / 100;
    const subtotalFare = Math.round((baseFare + succeedingFare) * 100) / 100;

    const discountAmount = hasDiscount
      ? Math.round(subtotalFare * 0.2 * 100) / 100
      : 0;
    const totalFare = Math.round((subtotalFare - discountAmount) * 100) / 100;
    const roundedFare = Math.round(totalFare);

    return {
      baseDistanceKm,
      baseFare,
      perKmRate,
      totalDistanceKm: effectiveDistanceKm,
      succeedingDistanceKm,
      succeedingFare,
      subtotalFare,
      discountAmount,
      totalFare,
      roundedFare,
    };
  }, [effectiveDistanceKm, commuteMode, hasDiscount]);

  // Proximity Alerts at 350m and 100m
  useEffect(() => {
    if (remainingMeters === null) return;

    if (remainingMeters <= 100 && !alert100Triggered.current) {
      alert100Triggered.current = true;
      setProximityAlertStatus("arriving_100m");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Speech.speak("Para po! Bababa na po dito sa tabi. Isang daang metro na lang po.", {
        language: "fil-PH",
        rate: 0.95,
        pitch: 1.1,
      });
    } else if (
      remainingMeters <= 350 &&
      remainingMeters > 100 &&
      !alert350Triggered.current
    ) {
      alert350Triggered.current = true;
      setProximityAlertStatus("approaching_350m");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      Speech.speak("Malapit na po sa inyong babaan. Tatlong daan at limampung metro na lang po.", {
        language: "fil-PH",
        rate: 0.95,
        pitch: 1.0,
      });
    }
  }, [remainingMeters]);

  const testProximityAlert = (type: 350 | 100) => {
    if (type === 100) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Speech.speak("Para po! Bababa na po dito sa tabi. Isang daang metro na lang po.", {
        language: "fil-PH",
        rate: 0.95,
        pitch: 1.1,
      });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      Speech.speak("Malapit na po sa inyong babaan. Tatlong daan at limampung metro na lang po.", {
        language: "fil-PH",
        rate: 0.95,
        pitch: 1.0,
      });
    }
  };

  const adjustDistance = (delta: number) => {
    setIsGpsDistanceActive(false);
    setSelectedDistanceKm((prev) => Math.max(1.0, Math.round((prev + delta) * 10) / 10));
  };

  const setPresetDistance = (km: number) => {
    setIsGpsDistanceActive(false);
    setSelectedDistanceKm(km);
  };

  return {
    currentLocation,
    destinationCoords,
    setDestinationCoords,
    fromAddress,
    toAddress,
    setToAddress,
    commuteMode,
    setCommuteMode,
    hasDiscount,
    setHasDiscount,
    selectedDistanceKm: effectiveDistanceKm,
    adjustDistance,
    setPresetDistance,
    isGpsDistanceActive,
    setIsGpsDistanceActive,
    liveGpsDistanceKm,
    remainingMeters,
    fareBreakdown,
    proximityAlertStatus,
    testProximityAlert,
    ltfrbMatrix: getLTFRBMatrix(),
  };
}

function formatAddress(addr: Partial<Location.LocationGeocodedAddress>) {
  const {
    streetNumber,
    street,
    district,
    city,
    subregion,
    region,
    postalCode,
  } = addr;
  const parts = [
    streetNumber && street ? `${streetNumber} ${street}` : street,
    district,
    city,
    subregion,
    region,
    postalCode,
  ];
  return parts.filter(Boolean).join(", ") || "Metro Manila, Philippines";
}
