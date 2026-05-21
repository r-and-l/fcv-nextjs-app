'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  mode: 'select' | 'view';
  initialLat?: number | null;
  initialLng?: number | null;
  onChange?: (lat: number, lng: number, address?: string) => void;
  height?: string;
}

export default function MapComponent({
  mode,
  initialLat,
  initialLng,
  onChange,
  height = '350px',
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  // 1. Detect dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Inject CSS for custom pulsing marker
  useEffect(() => {
    const styleId = 'leaflet-custom-marker-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @keyframes leaflet-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .marker-pulse-ring {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid var(--primary, #10b981);
          animation: leaflet-pulse 1.8s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
          top: -3px;
          left: -3px;
          pointer-events: none;
        }
        .leaflet-container {
          font-family: inherit;
          border-radius: 12px;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // 2. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const defaultLat = initialLat || 55.7558;
    const defaultLng = initialLng || 37.6173;
    const zoomLevel = (initialLat && initialLng) ? 15 : 12;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: zoomLevel,
      zoomControl: true,
    });

    mapRef.current = map;

    // Add Tile Layer (Dynamic dark/light tile layer)
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Add Marker if coordinates are provided, or in select mode (we can let user click)
    const icon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background-color: var(--primary, #10b981);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
          <div class="marker-pulse-ring"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    if (initialLat && initialLng) {
      const marker = L.marker([initialLat, initialLng], { icon }).addTo(map);
      markerRef.current = marker;
    }

    // Handlers
    if (mode === 'select') {
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          const marker = L.marker([lat, lng], { icon }).addTo(map);
          markerRef.current = marker;
        }

        // Reverse geocoding (optional address suggestion)
        let address = '';
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { 'User-Agent': 'FCV-WebApp/1.0 (contact: info@fcv.ru)' }
          });
          const data = await res.json();
          if (data && data.display_name) {
            address = data.display_name;
            setSelectedAddress(address);
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
        }

        if (onChange) {
          onChange(lat, lng, address);
        }
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [isDark]); // Reinitialize if dark/light theme changes

  // Update map center/marker if initial coordinates change externally (useful when selecting address from search)
  const setLocation = (lat: number, lng: number, address: string) => {
    if (!mapRef.current) return;
    mapRef.current.setView([lat, lng], 15);

    const icon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background-color: var(--primary, #10b981);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
          <div class="marker-pulse-ring"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { icon }).addTo(mapRef.current);
      markerRef.current = marker;
    }

    setSelectedAddress(address);
    if (onChange) {
      onChange(lat, lng, address);
    }
  };

  const handleSearchResultClick = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setLocation(lat, lng, result.display_name);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'User-Agent': 'FCV-WebApp/1.0 (contact: info@fcv.ru)'
        }
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Nominatim geocoding error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {mode === 'select' && (
        <div className="relative">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Поиск адреса (например, Москва, Лужники)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-sm font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {searchLoading ? 'Поиск...' : 'Найти'}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="absolute z-[1000] w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg divide-y divide-zinc-100 dark:divide-zinc-800">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSearchResultClick(result)}
                  className="w-full text-left px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors line-clamp-2 cursor-pointer"
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full border border-zinc-200 dark:border-zinc-700 shadow-inner z-0 rounded-xl overflow-hidden"
      />

      {selectedAddress && mode === 'select' && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50">
          📍 <span className="font-semibold text-zinc-700 dark:text-zinc-300">Адрес:</span> {selectedAddress}
        </p>
      )}
    </div>
  );
}
