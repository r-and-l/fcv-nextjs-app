'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <span className="text-sm text-zinc-500 animate-pulse">Загрузка карты...</span>
    </div>
  )
});

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'select' | 'view';
  initialLat?: number | null;
  initialLng?: number | null;
  onSave?: (lat: number, lng: number) => void;
  title?: string;
}

export function MapModal({
  isOpen,
  onClose,
  mode,
  initialLat,
  initialLng,
  onSave,
  title = 'Выбор местоположения',
}: MapModalProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (initialLat && initialLng) {
      setCoords({ lat: initialLat, lng: initialLng });
    } else {
      setCoords(null);
    }
  }, [initialLat, initialLng, isOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (coords && onSave) {
      onSave(coords.lat, coords.lng);
      onClose();
    }
  };

  const handleMapChange = (lat: number, lng: number) => {
    setCoords({ lat, lng });
  };

  // External routing links
  const yandexUrl = coords ? `https://yandex.ru/maps/?rtext=~${coords.lat},${coords.lng}` : '';
  const googleUrl = coords ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}` : '';
  const doubleGisUrl = coords ? `https://2gis.ru/routeSearch/rsType/car/to/${coords.lng},${coords.lat}` : '';
  const appleUrl = coords ? `https://maps.apple.com/?q=${coords.lat},${coords.lng}&ll=${coords.lat},${coords.lng}` : '';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>{mode === 'select' ? '🗺️' : '📍'}</span>
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <MapComponent
            mode={mode}
            initialLat={initialLat}
            initialLng={initialLng}
            onChange={handleMapChange}
            height="320px"
          />

          {mode === 'view' && coords && (
            <div className="space-y-2 pt-2 border-t border-zinc-150 dark:border-zinc-800/50">
              <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Построить маршрут:
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={yandexUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-600 dark:text-amber-400 text-xs font-semibold transition-all active:scale-[0.98] text-center cursor-pointer"
                >
                  🗺️ Yandex Maps
                </a>
                <a
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-all active:scale-[0.98] text-center cursor-pointer"
                >
                  🌐 Google Maps
                </a>
                <a
                  href={doubleGisUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition-all active:scale-[0.98] text-center cursor-pointer"
                >
                  🟢 2GIS
                </a>
                <a
                  href={appleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-500/10 hover:bg-zinc-500/20 border border-zinc-500/30 hover:border-zinc-500/50 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all active:scale-[0.98] text-center cursor-pointer"
                >
                  🍎 Apple Maps
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer for selection */}
        {mode === 'select' && (
          <div className="px-5 py-4 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-200/50 dark:border-zinc-800/50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-[0.98] cursor-pointer"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={!coords}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold transition-all active:scale-[0.98] cursor-pointer"
            >
              Сохранить координаты
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
