import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useRef, useState } from "react";

export type CommuteMode =
  | "traditional"
  | "modern"
  | "uv"
  | "traditional_puj"
  | "modern_puj"
  | "uv_express";

export function roundTo25Centavos(val: number): number {
  return Math.round(val * 4) / 4;
}

export function formatFare(fare: number): string {
  if (fare % 1 === 0) {
    return fare.toFixed(0);
  }
  return fare.toFixed(2);
}

// LTFRB Official General Fare Guide (Effective September 28, 2026)
// Traditional PUJ: P14.00 base (first 4.0 km) + P2.00 per succeeding km (Discount: P11.20 base + P1.60/km)
// Aircon Modern & Electric PUJ: P17.00 base (first 4.0 km) + P2.40 per succeeding km (Discount: P13.60 base + P1.92/km)
// Traditional UV Express: P2.60 per km flat rate (Discount: P2.08/km)
// Rule: Fares are rounded off to the nearest 25 centavos (P0.25)
export function computeVehicleFare(
  mode: CommuteMode | string,
  distanceKm: number,
  discount: boolean = false
): number {
  const isUV = mode === "uv" || mode === "uv_express" || mode === "traditional_uv";
  const isModernUV = mode === "uv_modern" || mode === "modern_uv";
  const isModernPUV = mode === "modern" || mode === "modern_puj";

  if (isUV) {
    // Traditional UV Express: P2.60 per km flat rate (20% discount = P2.08/km)
    const ratePerKm = discount ? 2.08 : 2.60;
    const raw = distanceKm * ratePerKm;
    return roundTo25Centavos(raw);
  }

  if (isModernUV) {
    // Modern UV Express: P3.00 per km flat rate (20% discount = P2.40/km)
    const ratePerKm = discount ? 2.40 : 3.00;
    const raw = distanceKm * ratePerKm;
    return roundTo25Centavos(raw);
  }

  if (isModernPUV) {
    // Aircon Modern & Electric PUJ: P17.00 base (4km), P2.40 per succeeding km
    // 20% Discount: P13.60 base (4km), P1.92 per succeeding km
    const baseKm = 4.0;
    const baseRate = discount ? 13.60 : 17.00;
    const perKmRate = discount ? 1.92 : 2.40;
    const succKm = Math.max(0, distanceKm - baseKm);
    const raw = baseRate + succKm * perKmRate;
    return roundTo25Centavos(raw);
  }

  // Traditional PUJ (Jeepney - Majority road fleet): P14.00 base (4km), P2.00 per succeeding km
  // 20% Discount: P11.20 base (4km), P1.60 per succeeding km
  const baseKm = 4.0;
  const baseRate = discount ? 11.20 : 14.00;
  const perKmRate = discount ? 1.60 : 2.00;
  const succKm = Math.max(0, distanceKm - baseKm);
  const raw = baseRate + succKm * perKmRate;
  return roundTo25Centavos(raw);
}

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
  regularUV: number;
  discountUV: number;
}

// LTFRB Official Legal Source & Policy Metadata
export const LTFRB_LEGAL_SOURCE = {
  orderTitle: "LTFRB General Fare Guide",
  effectiveDate: "September 28, 2026",
  policyName: "Official PUJ, Modern PUV & UV Express Fare Matrix Guide",
  officialUrl: "https://ltfrb.gov.ph/fare-rates/",
  hotline: "1342",
  dotrActionCenter: "8888",
  referenceStandard: "Traditional PUJ (P14 base) & Traditional UV Express (P2.60/km) Standard",
  laws: [
    { code: "RA 9442", beneficiary: "Persons with Disabilities (PWD)", discount: "Official 20% Discount" },
    { code: "RA 9994", beneficiary: "Senior Citizens", discount: "Official 20% Discount" },
    { code: "RA 11314", beneficiary: "Students", discount: "Official 20% Discount (including weekends & holidays)" },
  ],
  traditionalJeep: {
    title: "Traditional PUJ (Jeepney)",
    baseFare: 14.0,
    baseDistanceKm: 4.0,
    perKmRate: 2.0,
    discountBaseFare: 11.20,
    discountPerKmRate: 1.60,
    googleDriveId: "15IcGdAKFdlSAqaCy8SHh759e6OP8mIZF",
  },
  modernPUV: {
    title: "Aircon Modern & Electric PUJ",
    baseFare: 17.0,
    baseDistanceKm: 4.0,
    perKmRate: 2.4,
    discountBaseFare: 13.60,
    discountPerKmRate: 1.92,
    googleDriveId: "1xBNN-_KPeCwPeeYd4cAx1UtB2wMbA9NO",
  },
  traditionalUV: {
    title: "Traditional UV Express",
    perKmRate: 2.60,
    discountPerKmRate: 2.08,
    googleDriveId: "1qFBNNoU90kBBc65tiBMHIvBee_c41JL_",
  },
};

// Official LTFRB Matrix Generation (1 to 25 km) with 25-centavo precision
export function getLTFRBMatrix(): MatrixEntry[] {
  const entries: MatrixEntry[] = [];
  for (let km = 1; km <= 25; km++) {
    entries.push({
      km,
      regularTraditional: computeVehicleFare("traditional", km, false),
      discountTraditional: computeVehicleFare("traditional", km, true),
      regularModern: computeVehicleFare("modern", km, false),
      discountModern: computeVehicleFare("modern", km, true),
      regularUV: computeVehicleFare("uv", km, false),
      discountUV: computeVehicleFare("uv", km, true),
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
    const isUV =
      commuteMode === "uv" ||
      (commuteMode as string) === "uv_express" ||
      (commuteMode as string) === "traditional_uv";
    const isModernUV =
      (commuteMode as string) === "uv_modern" ||
      (commuteMode as string) === "modern_uv";
    const isModernPUV =
      commuteMode === "modern" || (commuteMode as string) === "modern_puj";

    let baseDistanceKm = 4.0;
    let baseFare = 14.0;
    let perKmRate = 2.0;

    if (isUV) {
      baseDistanceKm = 0;
      baseFare = 0;
      perKmRate = 2.60;
    } else if (isModernUV) {
      baseDistanceKm = 0;
      baseFare = 0;
      perKmRate = 3.00;
    } else if (isModernPUV) {
      baseDistanceKm = 4.0;
      baseFare = 17.0;
      perKmRate = 2.40;
    }

    const totalFare = computeVehicleFare(commuteMode, effectiveDistanceKm, hasDiscount);
    const regularFare = computeVehicleFare(commuteMode, effectiveDistanceKm, false);
    const discountAmount = hasDiscount ? roundTo25Centavos(regularFare - totalFare) : 0;
    const succeedingDistanceKm =
      isUV || isModernUV
        ? effectiveDistanceKm
        : Math.max(0, effectiveDistanceKm - baseDistanceKm);
    const succeedingFare =
      isUV || isModernUV
        ? regularFare
        : roundTo25Centavos(succeedingDistanceKm * perKmRate);
    const subtotalFare = regularFare;

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
      roundedFare: totalFare,
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
