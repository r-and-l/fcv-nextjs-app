'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NominatimResult, OverpassElement } from '@/types';

interface MapComponentProps {
  mode: 'select' | 'view';
  initialLat?: number | null;
  initialLng?: number | null;
  onChange?: (lat: number, lng: number, address?: string) => void;
  height?: string;
}

function getReadableAddress(data: NominatimResult): string {
  if (!data) return '';
  if (!data.address) return data.display_name || '';
  
  const addr = data.address;
  const parts: string[] = [];

  // Ищем конкретное название объекта
  const placeName = addr.amenity || addr.leisure || addr.sport || addr.building || addr.tourism || addr.shop || addr.historic || addr.railway || addr.aeroway;
  if (placeName) {
    parts.push(placeName);
  }

  // Добавляем улицу и дом
  if (addr.road) {
    let roadStr = addr.road;
    if (addr.house_number) {
      roadStr += `, ${addr.house_number}`;
    }
    parts.push(roadStr);
  }

  // Добавляем город или населенный пункт
  const city = addr.city || addr.town || addr.village || addr.hamlet;
  if (city && city !== placeName) {
    parts.push(city);
  }

  if (parts.length > 0) {
    return parts.join(', ');
  }

  return data.display_name || '';
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
  const sportsLayerRef = useRef<L.LayerGroup | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [locating, setLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Keep onChange in a ref to avoid map recreation / fetch loops when onChange is unstable
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 1. Detect dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Inject CSS for custom pulsing marker and soccer fields
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
        .soccer-tooltip {
          background-color: #18181b !important;
          color: #f4f4f5 !important;
          border: 1px solid #3f3f46 !important;
          border-radius: 8px !important;
          padding: 4px 8px !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
        }
        .soccer-tooltip::before {
          border-top-color: #18181b !important;
          border-bottom-color: #18181b !important;
        }
        .soccer-map-marker-inner {
          width: 24px;
          height: 24px;
          background-color: #10b981;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .soccer-map-marker-inner:hover {
          transform: scale(1.2);
          background-color: #059669 !important;
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
      attributionControl: false,
    });

    mapRef.current = map;

    // Add Tile Layer (Dynamic dark/light tile layer)
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);

    // Add custom plain-text attribution control without external hyperlinks
    L.control.attribution({
      prefix: false
    }).addAttribution('© OpenStreetMap contributors, © CARTO').addTo(map);

    tileLayerRef.current = tileLayer;

    // Add Layer Group for sports facilities
    const sportsLayer = L.layerGroup().addTo(map);
    sportsLayerRef.current = sportsLayer;

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
          if (data) {
            address = getReadableAddress(data);
            setSelectedAddress(address);
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
        }

        if (onChangeRef.current) {
          onChangeRef.current(lat, lng, address);
        }
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      sportsLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]); // Reinitialize if dark/light theme changes

  // Update map center/marker if initial coordinates change externally (useful when selecting address from search)
  const setLocation = useCallback((lat: number, lng: number, address: string) => {
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
    if (onChangeRef.current) {
      onChangeRef.current(lat, lng, address);
    }
  }, []);

  // 3. Fetch sports facilities (pitches, stadiums) in the current view using Overpass API
  useEffect(() => {
    const map = mapRef.current;
    if (!map || mode !== 'select') return;

    let debounceTimer: NodeJS.Timeout;

    const queryFacilities = async () => {
      const zoom = map.getZoom();
      if (zoom < 14) {
        // Clear sports layer if user is zoomed out too far
        if (sportsLayerRef.current) {
          sportsLayerRef.current.clearLayers();
        }
        return;
      }

      const bounds = map.getBounds();
      const south = bounds.getSouth();
      const west = bounds.getWest();
      const north = bounds.getNorth();
      const east = bounds.getEast();
      const bbox = `${south},${west},${north},${east}`;

      // Overpass API query for pitches, stadiums, and sports centers
      const query = `[out:json][timeout:25];(node["leisure"="pitch"](${bbox});way["leisure"="pitch"](${bbox});node["leisure"="stadium"](${bbox});way["leisure"="stadium"](${bbox});node["leisure"="sports_centre"](${bbox});way["leisure"="sports_centre"](${bbox}););out center;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Overpass API error');
        const data = await res.json();

        if (!sportsLayerRef.current || !mapRef.current) return;

        // Clear existing markers
        sportsLayerRef.current.clearLayers();

        const soccerIcon = L.divIcon({
          className: 'soccer-map-marker',
          html: `
            <div class="soccer-map-marker-inner">
              <span style="font-size: 13px; line-height: 1; margin-top: -1px;">⚽</span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        data.elements?.forEach((el: OverpassElement) => {
          const lat = el.lat || (el.center && el.center.lat);
          const lon = el.lon || (el.center && el.center.lon);

          if (!lat || !lon) return;

          const tags = el.tags || {};
          const sport = tags.sport;
          const leisure = tags.leisure;

          let typeLabel = 'Спортивная площадка';
          if (leisure === 'stadium') typeLabel = 'Стадион';
          else if (leisure === 'sports_centre') typeLabel = 'Спортивный центр';

          let sportLabel = '';
          if (sport) {
            if (sport === 'soccer' || sport === 'football') sportLabel = 'футбольное';
            else if (sport === 'basketball') sportLabel = 'баскетбольное';
            else if (sport === 'tennis') sportLabel = 'теннисный';
            else if (sport === 'volleyball') sportLabel = 'волейбольное';
          }

          let name = tags.name;
          if (!name) {
            if (sportLabel) {
              name = `${sportLabel.charAt(0).toUpperCase() + sportLabel.slice(1)} поле`;
            } else {
              name = typeLabel;
            }
          }

          const fullLabel = tags.name
            ? `${tags.name} (${sportLabel ? sportLabel + ' ' : ''}${leisure === 'stadium' ? 'стадион' : 'поле'})`
            : `${sportLabel ? sportLabel.charAt(0).toUpperCase() + sportLabel.slice(1) + ' ' : ''}${typeLabel.toLowerCase()}`;

          const marker = L.marker([lat, lon], { icon: soccerIcon });

          // Tooltip
          marker.bindTooltip(fullLabel, {
            direction: 'top',
            offset: [0, -10],
            className: 'soccer-tooltip',
          });

          // Click handler
          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setLocation(lat, lon, name);
          });

          if (sportsLayerRef.current) {
            marker.addTo(sportsLayerRef.current);
          }
        });
      } catch (err) {
        console.error('Failed to fetch sports facilities:', err);
      }
    };

    const handleMapChange = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(queryFacilities, 600);
    };

    map.on('moveend', handleMapChange);
    // Trigger initial query
    queryFacilities();

    return () => {
      clearTimeout(debounceTimer);
      map.off('moveend', handleMapChange);
    };
  }, [mode, isDark, setLocation]);

  const handleSearchResultClick = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const readableName = getReadableAddress(result);
    setLocation(lat, lng, readableName);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(searchQuery)}`;
      
      // Добавляем координаты для приоритезации поиска в текущей области
      if (mapRef.current) {
        const center = mapRef.current.getCenter();
        url += `&lat=${center.lat}&lon=${center.lng}`;
      } else if (userCoords) {
        url += `&lat=${userCoords.lat}&lon=${userCoords.lng}`;
      }

      const res = await fetch(url, {
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

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15);
          
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
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            const marker = L.marker([latitude, longitude], { icon }).addTo(mapRef.current);
            markerRef.current = marker;
          }
        }

        // Выполняем реверс-геокодинг для получения адреса
        let address = '';
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: { 'User-Agent': 'FCV-WebApp/1.0 (contact: info@fcv.ru)' }
          });
          const data = await res.json();
          if (data) {
            address = getReadableAddress(data);
            setSelectedAddress(address);
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
        }

        if (onChangeRef.current) {
          onChangeRef.current(latitude, longitude, address);
        }
        setLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Не удалось получить ваше местоположение. Пожалуйста, разрешите доступ к геопозиции в браузере.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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

      <div className="relative">
        <div
          ref={mapContainerRef}
          style={{ height }}
          className="w-full border border-zinc-200 dark:border-zinc-700 shadow-inner z-0 rounded-xl overflow-hidden"
        />

        {mode === 'select' && (
          <button
            type="button"
            onClick={handleLocateUser}
            disabled={locating}
            className="absolute bottom-4 right-4 z-[400] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-750 dark:text-zinc-200 p-2.5 rounded-full shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            title="Определить мое местоположение"
          >
            {locating ? (
              <span className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {selectedAddress && mode === 'select' && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50">
          📍 <span className="font-semibold text-zinc-700 dark:text-zinc-300">Адрес:</span> {selectedAddress}
        </p>
      )}
    </div>
  );
}
