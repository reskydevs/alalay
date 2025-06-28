import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";

const TILE_URL = "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png";

interface MapSectionProps {
    region: any;
    onRegionChange: (region: any) => void;
    onMapPress: (event: any) => void;
    currentLocation: any;
    destination: any;
}

export default function MapSection({ region, onRegionChange, onMapPress, currentLocation, destination }: MapSectionProps) {
  const mapRef = useRef<MapView>(null);
  const hasAnimatedToUserLocation = useRef(false);

  // Automatically center on user's current location when first detected
  useEffect(() => {
    if (currentLocation && !hasAnimatedToUserLocation.current) {
      const userRegion = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.003, // Closer zoom for better context
        longitudeDelta: 0.003,
      };
      
      // Faster animation (500ms instead of 1000ms) for better UX
      mapRef.current?.animateToRegion(userRegion, 500);
      onRegionChange(userRegion);
      hasAnimatedToUserLocation.current = true;
    }
  }, [currentLocation, onRegionChange]);

  const handleRegionChange = (newRegion: any) => {
    // Only update the region if the latitude/longitude changed significantly
    // This prevents forced centering during tilt/rotate finger gestures
    const latDiff = Math.abs(newRegion.latitude - region.latitude);
    const lonDiff = Math.abs(newRegion.longitude - region.longitude);
    
    // Only call onRegionChange if the user actually moved the map center
    if (latDiff > 0.001 || lonDiff > 0.001) {
      onRegionChange(newRegion);
    }
  };

  const handleLocateUser = () => {
    if (currentLocation && mapRef.current) {
      const userRegion = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      };
      
      mapRef.current.animateToRegion(userRegion, 500);
      onRegionChange(userRegion);
    }
  };

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1, minHeight: 500 }}
        className="flex-1 min-h-[500px]"
        initialRegion={region}
        onRegionChangeComplete={handleRegionChange}
        onPress={onMapPress}
        provider={PROVIDER_DEFAULT}
        // showsUserLocation // Disabled: Using custom GPS button instead, but keeping user location dot
        showsUserLocation={true} // Keep this to show user location dot on map
        showsMyLocationButton={false} // Disabled: Using custom GPS button instead
        // showsMyLocationButton={true} // Disabled: Using custom GPS button instead
        // toolbarEnabled={false} // Disabled: Using custom GPS button instead
      >
        <UrlTile urlTemplate={TILE_URL} zIndex={1} />
        {currentLocation && (
          <Marker coordinate={currentLocation} title="You are here" pinColor="#007AFF" />
        )}
        {destination && (
          <Marker coordinate={destination} title="Destination" pinColor="#FF3333" />
        )}
      </MapView>

      {/* Custom GPS Locate Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 200, // Positioned lower as requested
          right: 20,
          backgroundColor: 'white', // Green background like app theme
          width: 50,
          height: 50,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
        }}
        onPress={handleLocateUser}
        disabled={!currentLocation}
      >
        <Ionicons 
          name="compass" 
          size={50} // Larger size to fill the circle better
          color="#27ae60" // White icon on green background
        />
      </TouchableOpacity>
    </View>
  );
}
