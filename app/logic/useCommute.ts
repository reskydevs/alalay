import axios from "axios";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  _distance?: number;
}

function debounce(func: (...args: any[]) => void, waitFor: number) {
  let timeout: any;
  return (...args: any[]): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

export default function usePUVController() {
  const [region, setRegion] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [fromAddress, setFromAddress] = useState("Detecting...");
  const [toAddress, setToAddress] = useState("Tap on map to set destination");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [routeCoords, setRouteCoords] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        // Faster location acquisition with optimized settings
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // Good balance of speed vs accuracy
          timeInterval: 1000, // Check every 1 second
          distanceInterval: 10, // Update when moved 10 meters
        });
        setCurrentLocation(location.coords);
        setRegion((prev) => ({
          ...prev,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }));
      } else {
        setFromAddress("Location permission denied.");
        setRegion({
          latitude: 12.8797,
          longitude: 121.774,
          latitudeDelta: 15,
          longitudeDelta: 15,
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      Location.reverseGeocodeAsync(currentLocation)
        .then((res) => {
          setFromAddress(formatAddress(res[0]));
        })
        .catch(() => {
          setFromAddress("Error geocoding origin");
        });
    }
  }, [currentLocation]);

  useEffect(() => {
    if (destination) {
      Location.reverseGeocodeAsync(destination)
        .then((res) => {
          setToAddress(formatAddress(res[0]));
        })
        .catch(() => {
          setToAddress("Error geocoding destination");
        });
    } else {
      setToAddress("Tap on map to set destination");
    }
  }, [destination]);

  const fuzzyMatch = (str: string, query: string) => {
    const q = query.replace(/\s+/g, " ").trim().toLowerCase();
    const s = str.toLowerCase();
    return q
      .split(" ")
      .every(
        (word) =>
          word.length < 2 ||
          s.includes(word) ||
          s
            .split(" ")
            .some((token) => token.startsWith(word) || word.startsWith(token))
      );
  };

  const getDistanceKm = (
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

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=15&countrycodes=ph&accept-language=en`;
      const response = await axios.get<NominatimResult[]>(url, {
        headers: { "User-Agent": "ParaPo/1.0 ralphcajipe@gmail.com" },
      });
      let results = response.data || [];

      if (currentLocation && results.length > 0) {
        const userLat = currentLocation.latitude;
        const userLon = currentLocation.longitude;
        const lowerQuery = query.toLowerCase();

        results = results.map((r) => {
          const distance = getDistanceKm(
            userLat,
            userLon,
            parseFloat(r.lat),
            parseFloat(r.lon)
          );
          const fuzzy = fuzzyMatch(r.display_name, lowerQuery) ? -30 : 0;
          const nameMatch = r.display_name.toLowerCase().includes(lowerQuery)
            ? -20
            : 0;
          return { ...r, _distance: distance + fuzzy + nameMatch };
        });

        const fuzzyResults = results.filter((r) =>
          fuzzyMatch(r.display_name, lowerQuery)
        );
        const toShow = fuzzyResults.length > 0 ? fuzzyResults : results;
        toShow.sort((a, b) => {
          if (a._distance !== undefined && b._distance !== undefined)
            return a._distance - b._distance;
          return a.display_name.localeCompare(b.display_name);
        });

        setSearchResults(toShow.slice(0, 7));
      } else {
        setSearchResults(results.slice(0, 7));
      }

      if (results.length === 0) setSearchError("No results found.");
    } catch {
      setSearchError("Failed to fetch search results.");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(performSearch, 500), [
    currentLocation,
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      debouncedSearch(query);
    } else {
      setSearchResults([]);
      setSearchError(null);
      if (query.trim().length === 0) setSearchLoading(false);
    }
  };

  const handleSelectSearchResult = (item: NominatimResult) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    setDestination({ latitude: lat, longitude: lon });
    setRegion((prev) => ({ ...prev, latitude: lat, longitude: lon }));

    const fullAddress = item.display_name;
    setSearchQuery(fullAddress);
    setToAddress(fullAddress);

    setSearchResults([]);
  };

  const handleMapPress = (e: {
    nativeEvent: { coordinate: { latitude: number; longitude: number } };
  }) => {
    setDestination(e.nativeEvent.coordinate);
    setSearchResults([]);
    setSearchError(null);
  };

  const fetchRoute = async () => {
    if (!currentLocation || !destination) return;
    setRouteLoading(true);
    setRouteError(null);
    setRouteCoords([]);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${currentLocation.longitude},${currentLocation.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
      const response = await axios.get(url);
      const data = response.data;
      if (data?.routes?.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(
          ([lon, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lon,
          })
        );
        setRouteCoords(coords);
      } else {
        setRouteError("No route found.");
      }
    } catch {
      setRouteError("Failed to fetch route.");
    } finally {
      setRouteLoading(false);
    }
  };

  return {
    region,
    setRegion,
    currentLocation,
    destination,
    setDestination,
    fromAddress,
    toAddress,
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleSelectSearchResult,
    handleMapPress,
    searchResults,
    searchLoading,
    searchError,
    routeCoords,
    fetchRoute,
    routeLoading,
    routeError,
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
    country,
    postalCode,
  } = addr;
  const parts = [
    streetNumber && street ? `${streetNumber} ${street}` : street,
    district,
    city,
    subregion,
    region,
    postalCode,
    country,
  ];
  return parts.filter(Boolean).join(", ") || "Unknown location";
}
