'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { useGoogleMaps } from './GoogleMapsProvider';
import { Input } from '@/components/ui';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

// Default center will be set by GeoIP, this is just a fallback (center of US)
const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795,
};

const defaultZoom = 14;

export function LocationPicker({
  initialLat,
  initialLng,
  onLocationChange,
}: LocationPickerProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [center, setCenter] = useState({
    lat: initialLat ?? defaultCenter.lat,
    lng: initialLng ?? defaultCenter.lng,
  });
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Get user's location on mount if no initial position
  useEffect(() => {
    if (initialLat && initialLng) return;

    let mounted = true;

    const initLocation = async () => {
      // First, try GeoIP for quick initial positioning
      try {
        const res = await fetch('https://geo-ip.astrids.workers.dev');
        const data = await res.json();
        if (mounted && data.lat && data.lng) {
          setCenter({ lat: data.lat, lng: data.lng });
        }
      } catch {
        // GeoIP failed, continue to try browser geolocation
      }

      // Then try browser geolocation for more precise location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (mounted) {
              setCenter({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            }
          },
          () => {
            // Browser geolocation denied/failed
          }
        );
      }
    };

    initLocation();

    return () => {
      mounted = false;
    };
  }, [initialLat, initialLng]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onSearchBoxLoad = useCallback((searchBox: google.maps.places.SearchBox) => {
    searchBoxRef.current = searchBox;
  }, []);

  const onPlacesChanged = useCallback(() => {
    const places = searchBoxRef.current?.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const newPosition = { lat, lng };

        setCenter(newPosition);
        setMarkerPosition(newPosition);
        onLocationChange(lat, lng);

        if (mapRef.current && place.geometry.viewport) {
          mapRef.current.fitBounds(place.geometry.viewport);
        }
      }
    }
  }, [onLocationChange]);

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const newPosition = { lat, lng };

        setMarkerPosition(newPosition);
        onLocationChange(lat, lng);
      }
    },
    [onLocationChange]
  );

  const onMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        setMarkerPosition({ lat, lng });
        onLocationChange(lat, lng);
      }
    },
    [onLocationChange]
  );

  if (loadError) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-md flex items-center justify-center dark:bg-gray-800">
        <p className="text-red-600">Error loading Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-md flex items-center justify-center dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StandaloneSearchBox onLoad={onSearchBoxLoad} onPlacesChanged={onPlacesChanged}>
        <Input
          type="text"
          placeholder="Search for a location..."
          className="w-full"
        />
      </StandaloneSearchBox>

      <div className="rounded-md overflow-hidden border border-gray-300 dark:border-gray-800">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={defaultZoom}
          onLoad={onMapLoad}
          onClick={onMapClick}
          options={{
            mapTypeControl: true,
            mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            },
            fullscreenControl: false,
            zoomControl: false,
            streetViewControl: false,
          }}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable
              onDragEnd={onMarkerDragEnd}
            />
          )}
        </GoogleMap>
      </div>

      {markerPosition && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Lat: {markerPosition.lat.toFixed(6)}, Lng: {markerPosition.lng.toFixed(6)}
        </p>
      )}

      {!markerPosition && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Click on the map or search to set a location
        </p>
      )}
    </div>
  );
}
