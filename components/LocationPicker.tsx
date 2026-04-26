'use client';

import { useState, useEffect } from 'react';
import { usePOS } from '@/context/POSContext';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + React
const icon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPos?: [number, number];
}

function LocationMarker({ onSelect, position }: { onSelect: (lat: number, lng: number) => void, position: [number, number] | null }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon} />
  );
}

function MapController({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

export default function LocationPicker({ onLocationSelect, initialPos }: LocationPickerProps) {
  const { t } = usePOS();
  const [position, setPosition] = useState<[number, number] | null>(initialPos || [13.7563, 100.5018]);

  const getMyLocation = (highAccuracy = true) => {
    if (!window.isSecureContext) {
      console.warn("Geolocation requires a secure context (HTTPS)");
    }

    if (!navigator.geolocation) {
      alert(t('geo_unsupported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
        onLocationSelect(newPos[0], newPos[1]);
      },
      (err) => {
        // console.error("Geolocation Error Code:", err.code, "Message:", err.message);
        
        if (highAccuracy && (err.code === 2 || err.code === 3 || err.code === 1)) {
          getMyLocation(false);
          return;
        }

        let message = t('geo_unavailable');
        if (err.code === 1) message = t('geo_denied');
        else if (err.code === 3) message = t('geo_timeout');
        
        alert(message);
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 5000 : 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    if (initialPos) {
      setPosition(initialPos);
    } else {
      getMyLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button 
        type="button"
        className="btn-outline" 
        onClick={() => getMyLocation()}
        style={{ 
          marginBottom: '0.5rem', 
          width: 'auto', 
          fontSize: '0.8rem', 
          padding: '0.4rem 0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        📍 {t('get_my_location')}
      </button>
      <div style={{ height: '300px', width: '100%', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <MapContainer 
          center={position || [13.7563, 100.5018]} 
          zoom={13} 
          scrollWheelZoom={false} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController position={position} />
          {position && <LocationMarker onSelect={handleSelect} position={position} />}
        </MapContainer>
      </div>
    </div>
  );
}
