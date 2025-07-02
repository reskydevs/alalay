import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
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
  const [tempMarker, setTempMarker] = useState<any>(null);
  const tempMarkerRef = useRef<any>(null);
  const [showDestinationPrompt, setShowDestinationPrompt] = useState(false);
  const [showRemovePrompt, setShowRemovePrompt] = useState(false);
  const [pendingCoordinate, setPendingCoordinate] = useState<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  // Handle map tap to show temporary marker with feedback
  const handleMapPress = (event: any) => {
    // If any overlay is currently showing, hide it first
    if (showDestinationPrompt || showRemovePrompt) {
      hidePrompts();
      return;
    }

    const coordinate = event.nativeEvent.coordinate;
    setTempMarker(coordinate);
    setPendingCoordinate(coordinate);
    setShowDestinationPrompt(true);
    
    // Animate in the overlay
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Confirm the temporary marker as destination
  const confirmDestination = () => {
    if (pendingCoordinate) {
      onMapPress({ nativeEvent: { coordinate: pendingCoordinate } });
    }
    hidePrompts();
  };

  // Cancel destination setting
  const cancelDestination = () => {
    hidePrompts();
  };

  // Show remove destination prompt
  const showRemoveDestinationPrompt = () => {
    // If destination prompt is showing, hide it first
    if (showDestinationPrompt) {
      hidePrompts();
      // Wait for the hide animation to complete before showing remove prompt
      setTimeout(() => {
        setShowRemovePrompt(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 200);
    } else {
      setShowRemovePrompt(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // Confirm remove destination
  const confirmRemoveDestination = () => {
    onMapPress({ nativeEvent: { coordinate: null } });
    hidePrompts();
  };

  // Hide all prompts with animation
  const hidePrompts = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowDestinationPrompt(false);
      setShowRemovePrompt(false);
      setTempMarker(null);
      setPendingCoordinate(null);
    });
  };

  // Remove/clear the current destination
  const removeDestination = () => {
    // Prevent showing remove prompt if destination prompt is already showing
    if (showDestinationPrompt) {
      return;
    }
    showRemoveDestinationPrompt();
  };

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1, minHeight: 500 }}
        className="flex-1 min-h-[500px]"
        initialRegion={region}
        onRegionChangeComplete={handleRegionChange}
        onPress={handleMapPress}
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
          <Marker 
            coordinate={destination} 
            title="Destination" 
            pinColor="#FF3333"
            onPress={removeDestination}
          />
        )}
        {/* Temporary marker for tap feedback */}
        {tempMarker && (
          <Marker
            coordinate={tempMarker}
            pinColor="#FFA500"
            title="Potential Destination"
          />
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

      {/* Custom Seamless Overlay for Destination Prompt */}
      {(showDestinationPrompt || showRemovePrompt) && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 140,
            left: 20,
            right: 20,
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            }],
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 16,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            {showDestinationPrompt && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <Ionicons name="location" size={32} color="#FFA500" style={{ marginBottom: 8 }} />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
                    Set as Destination?
                  </Text>
                  <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
                    {pendingCoordinate && 
                      `${pendingCoordinate.latitude.toFixed(4)}, ${pendingCoordinate.longitude.toFixed(4)}`
                    }
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={cancelDestination}
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(128, 128, 128, 0.1)',
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(128, 128, 128, 0.2)',
                    }}
                  >
                    <Text style={{ color: '#666', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmDestination}
                    style={{
                      flex: 1,
                      backgroundColor: '#27ae60',
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: 'center',
                      shadowColor: '#27ae60',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {showRemovePrompt && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <Ionicons name="trash" size={32} color="#FF3333" style={{ marginBottom: 8 }} />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
                    Remove Destination?
                  </Text>
                  <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
                    This will clear your current destination
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={hidePrompts}
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(128, 128, 128, 0.1)',
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(128, 128, 128, 0.2)',
                    }}
                  >
                    <Text style={{ color: '#666', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmRemoveDestination}
                    style={{
                      flex: 1,
                      backgroundColor: '#FF3333',
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: 'center',
                      shadowColor: '#FF3333',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}
