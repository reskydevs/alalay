import React from "react";
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

  return (
      <MapView
      style={{ flex: 1, minHeight: 500 }}
      className="flex-1 min-h-[500px]"
      region={region}
      onRegionChangeComplete={onRegionChange}
      onPress={onMapPress}
      provider={PROVIDER_DEFAULT}
      showsUserLocation
    >
      <UrlTile urlTemplate={TILE_URL} zIndex={1} />
      {currentLocation && (
        <Marker coordinate={currentLocation} title="You are here" pinColor="#007AFF" />
      )}
      {destination && (
        <Marker coordinate={destination} title="Destination" pinColor="#FF3333" />
      )}
    </MapView>
  );
}
