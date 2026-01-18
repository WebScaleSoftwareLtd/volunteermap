'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useGeoSearch, useInstantSearch } from 'react-instantsearch';
import { useGoogleMaps } from '@/components/map';
import Link from 'next/link';

interface GeoHit {
  objectID: string;
  uuid: string;
  title: string;
  category: string;
  _geoloc: {
    lat: number;
    lng: number;
  };
  __position: number;
  __queryID?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

export function GeoSearch() {
  const { isLoaded, loadError } = useGoogleMaps();
  const { items, refine } = useGeoSearch<GeoHit>();
  const { status } = useInstantSearch();

  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedHit, setSelectedHit] = useState<GeoHit | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
          setCenter(loc);
        },
        async () => {
          // Try geo-ip fallback
          try {
            const res = await fetch('https://geo-ip.astrids.workers.dev');
            const data = await res.json();
            if (data.lat && data.lng) {
              const loc = { lat: data.lat, lng: data.lng };
              setUserLocation(loc);
              setCenter(loc);
            }
          } catch {
            // Use default
          }
        }
      );
    }
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onBoundsChanged = useCallback(() => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        refine({
          northEast: { lat: ne.lat(), lng: ne.lng() },
          southWest: { lat: sw.lat(), lng: sw.lng() },
        });
      }
    }
  }, [refine]);

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[300px] bg-gray-100 flex items-center justify-center">
        <p className="text-red-600">Error loading Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[300px] bg-gray-100 flex items-center justify-center animate-pulse">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {status === 'loading' && (
        <div className="absolute top-2 right-2 z-10 bg-white px-3 py-1 rounded-md shadow text-sm text-gray-600">
          Loading...
        </div>
      )}

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        onLoad={onMapLoad}
        onBoundsChanged={onBoundsChanged}
        options={{
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          },
          fullscreenControl: false,
          zoomControl: true,
          streetViewControl: false,
        }}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            title="Your location"
          />
        )}

        {/* Opportunity markers */}
        {items.map((hit) => (
          <Marker
            key={hit.objectID}
            position={hit._geoloc}
            onClick={() => setSelectedHit(hit)}
          />
        ))}

        {/* Info window for selected marker */}
        {selectedHit && (
          <InfoWindow
            position={selectedHit._geoloc}
            onCloseClick={() => setSelectedHit(null)}
          >
            <div className="max-w-xs p-2">
              <h3 className="font-semibold text-gray-900">{selectedHit.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedHit.category}</p>
              <Link
                href={`/opportunities/${selectedHit.uuid}`}
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                View details
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
