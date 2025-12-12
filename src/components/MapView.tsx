'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Bakery, BAKERY_TYPE_LABELS, isOpenNow } from '@/types';
import { Star, MapPin, Clock, ExternalLink } from 'lucide-react';

// Custom marker icons
const createCustomIcon = (color: string, isFavorite: boolean) => {
  const svg = `
    <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 26 16 26s16-15 16-26c0-8.837-7.163-16-16-16z" fill="${color}"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
      ${isFavorite ? '<path d="M16 12l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L11 15.5l3.5-.5L16 12z" fill="#EF4444"/>' : ''}
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

// Get marker color based on bakery type
const getMarkerColor = (type: Bakery['type']) => {
  switch (type) {
    case 'bakery':
      return '#C45B24';
    case 'farmers_market':
      return '#16A34A';
    case 'home_baker':
      return '#9333EA';
    default:
      return '#C45B24';
  }
};

// Component to handle map center changes
function MapCenterUpdater({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center, map]);

  return null;
}

// Popup content component
function BakeryPopup({
  bakery,
  onSelect,
}: {
  bakery: Bakery;
  onSelect: () => void;
}) {
  const openNow = isOpenNow(bakery.hours);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${bakery.latitude},${bakery.longitude}`;

  return (
    <div className="min-w-[240px] max-w-[280px]">
      {/* Photo */}
      {bakery.photos.length > 0 && (
        <div className="w-full h-32 -mx-3 -mt-3 mb-3 rounded-t-lg overflow-hidden">
          <img
            src={bakery.photos[0]}
            alt={bakery.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 text-base">{bakery.name}</h3>

        <div className="flex items-center gap-2 text-sm">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            bakery.type === 'bakery' ? 'bg-orange-100 text-orange-700' :
            bakery.type === 'farmers_market' ? 'bg-green-100 text-green-700' :
            'bg-purple-100 text-purple-700'
          }`}>
            {BAKERY_TYPE_LABELS[bakery.type]}
          </span>
          {openNow && (
            <span className="flex items-center gap-1 text-green-600 text-xs">
              <Clock className="w-3 h-3" />
              Open
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.round(bakery.rating)
                    ? 'fill-[#FFD700] text-[#FFD700]'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700">{bakery.rating}</span>
          <span className="text-xs text-gray-500">({bakery.review_count})</span>
        </div>

        <p className="text-xs text-gray-500 flex items-start gap-1">
          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{bakery.address}, {bakery.city}</span>
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onSelect}
            className="flex-1 px-3 py-1.5 bg-[#C45B24] text-white text-xs font-medium rounded-md hover:bg-[#a84d1e] transition-colors"
          >
            View Details
          </button>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            Directions
          </a>
        </div>
      </div>
    </div>
  );
}

interface MapViewProps {
  bakeries: Bakery[];
  center: { lat: number; lng: number };
  onSelectBakery: (bakery: Bakery) => void;
  favorites: string[];
}

export default function MapView({
  bakeries,
  center,
  onSelectBakery,
  favorites,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Calculate bounds to fit all markers
  useEffect(() => {
    if (mapRef.current && bakeries.length > 0) {
      const bounds = L.latLngBounds(
        bakeries.map((b) => [b.latitude, b.longitude] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bakeries]);

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterUpdater center={center} />

        {bakeries.map((bakery) => (
          <Marker
            key={bakery.id}
            position={[bakery.latitude, bakery.longitude]}
            icon={createCustomIcon(
              getMarkerColor(bakery.type),
              favorites.includes(bakery.id)
            )}
          >
            <Popup>
              <BakeryPopup
                bakery={bakery}
                onSelect={() => onSelectBakery(bakery)}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-[1000]">
        <p className="text-xs font-medium text-gray-700 mb-2">Legend</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#C45B24]" />
            <span className="text-xs text-gray-600">Bakery</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#16A34A]" />
            <span className="text-xs text-gray-600">Farmers Market</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#9333EA]" />
            <span className="text-xs text-gray-600">Home Baker</span>
          </div>
        </div>
      </div>
    </div>
  );
}
