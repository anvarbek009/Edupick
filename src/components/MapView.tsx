import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getDictionary } from '../i18n';
import { formatUzs } from '../utils/format';

export interface MapMarkerItem {
  id: string;
  slug: string;
  type: 'center' | 'tutor';
  name: string;
  lat: number;
  lng: number;
  priceUzs: number;
  rating: number;
  outcomeText: string;
  districtLabel: string;
}

interface MapViewProps {
  items: MapMarkerItem[];
  userCoords: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
  heightClass?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const MapView: React.FC<MapViewProps> = React.memo(
  ({ items, userCoords, onRequestLocation, heightClass = 'h-[480px] lg:h-[640px]' }) => {
    const mapElRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const layerRef = useRef<L.LayerGroup | null>(null);
    const lastFitKeyRef = useRef<string>('');
    const language = useAppStore((s) => s.language);
    const t = getDictionary(language);

    const itemsKey = useMemo(() => items.map((i) => i.id).join('|'), [items]);
    const userCoordsKey = userCoords ? `${userCoords.lat.toFixed(4)},${userCoords.lng.toFixed(4)}` : '';

    useEffect(() => {
      const container = mapElRef.current;
      if (!container || mapRef.current) return;

      const map = L.map(container, {
        center: userCoords ? [userCoords.lat, userCoords.lng] : [41.3111, 69.2797],
        zoom: 12,
        scrollWheelZoom: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      const resizeTimer = window.setTimeout(() => {
        map.invalidateSize();
      }, 120);

      let ro: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(() => {
          map.invalidateSize();
        });
        ro.observe(container);
      }

      return () => {
        window.clearTimeout(resizeTimer);
        ro?.disconnect();
        map.remove();
        mapRef.current = null;
        layerRef.current = null;
        lastFitKeyRef.current = '';
      };
    }, []);

    useEffect(() => {
      const map = mapRef.current;
      const layer = layerRef.current;
      if (!map || !layer) return;

      const nearMeLabel = t.common.nearMe;
      const viewAllLabel = t.common.viewAll;

      const addSingleMarker = (item: MapMarkerItem, targetLayer: L.LayerGroup) => {
        const shortPrice = `${Math.round(item.priceUzs / 1000)}k`;
        const icon = L.divIcon({
          className: 'edupick-price-pin',
          html: `<div style="background:#3B4CCA;color:#fff;padding:4px 8px;border-radius:10px;font-size:11px;font-weight:700;white-space:nowrap;border:2px solid #fff;box-shadow:0 3px 10px rgba(15,23,42,0.25);">${shortPrice}</div>`,
          iconSize: [52, 26],
          iconAnchor: [26, 13],
        });
        const href = item.type === 'center' ? `/center/${item.slug}` : `/tutor/${item.slug}`;
        const safeName = escapeHtml(item.name);
        const safeOutcome = escapeHtml(item.outcomeText);
        const safeDistrict = escapeHtml(item.districtLabel);

        L.marker([item.lat, item.lng], { icon })
          .bindPopup(
            `<div style="min-width:190px;font-family:inherit;">
              <div style="font-weight:700;font-size:13px;color:#0f172a;">${safeName}</div>
              <div style="font-size:11px;color:#64748b;margin-top:2px;">${safeDistrict} · ★ ${item.rating.toFixed(1)}</div>
              <div style="font-size:11px;color:#15803d;font-weight:600;margin-top:5px;">${safeOutcome}</div>
              <div style="font-size:12px;font-weight:700;color:#1e293b;margin-top:5px;">${formatUzs(item.priceUzs, language)}</div>
              <a href="${href}" style="display:inline-block;margin-top:8px;background:#3B4CCA;color:#fff;text-decoration:none;padding:5px 10px;border-radius:8px;font-size:11px;font-weight:600;">${escapeHtml(viewAllLabel)} →</a>
            </div>`
          )
          .addTo(targetLayer);
      };

      const renderMarkers = () => {
        layer.clearLayers();
        const zoom = map.getZoom();

        if (userCoords) {
          const meIcon = L.divIcon({
            className: 'edupick-user-pin',
            html: `<div style="width:16px;height:16px;border-radius:9999px;background:#16A34A;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          L.marker([userCoords.lat, userCoords.lng], { icon: meIcon })
            .bindPopup(`<strong>${escapeHtml(nearMeLabel)}</strong>`)
            .addTo(layer);
        }

        // Lightweight spatial grid clustering when zoomed out (< 13)
        if (zoom < 13 && items.length > 8) {
          const cellSize = zoom < 9 ? 0.8 : zoom < 11 ? 0.14 : 0.035;
          const clusters = new Map<string, MapMarkerItem[]>();
          for (const item of items) {
            const key = `${Math.floor(item.lat / cellSize)}:${Math.floor(item.lng / cellSize)}`;
            const arr = clusters.get(key) || [];
            arr.push(item);
            clusters.set(key, arr);
          }

          clusters.forEach((group) => {
            if (group.length === 1) {
              addSingleMarker(group[0], layer);
            } else {
              const avgLat = group.reduce((s, g) => s + g.lat, 0) / group.length;
              const avgLng = group.reduce((s, g) => s + g.lng, 0) / group.length;
              const clusterIcon = L.divIcon({
                className: 'edupick-cluster-pin',
                html: `<div style="width:36px;height:36px;border-radius:9999px;background:#3B4CCA;color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 4px 12px rgba(59,76,202,0.38);">${group.length}</div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
              });
              const m = L.marker([avgLat, avgLng], { icon: clusterIcon }).addTo(layer);
              m.on('click', () => {
                map.setView([avgLat, avgLng], Math.min(15, zoom + 2));
              });
            }
          });
        } else {
          items.forEach((item) => addSingleMarker(item, layer));
        }
      };

      renderMarkers();
      map.on('zoomend', renderMarkers);

      const fitFingerprint = `${itemsKey}#${userCoordsKey}`;
      if (fitFingerprint !== lastFitKeyRef.current) {
        lastFitKeyRef.current = fitFingerprint;
        if (userCoords) {
          map.setView([userCoords.lat, userCoords.lng], 13);
        } else if (items.length === 1) {
          map.setView([items[0].lat, items[0].lng], 14);
        } else if (items.length > 1) {
          const bounds = L.latLngBounds(
            items.map((i) => [i.lat, i.lng] as [number, number])
          );
          map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
        }
      }

      return () => {
        map.off('zoomend', renderMarkers);
      };
    }, [items, itemsKey, userCoords, userCoordsKey, language, t.common.nearMe, t.common.viewAll]);

    return (
      <div
        className={`relative w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 ${heightClass}`}
      >
        <div ref={mapElRef} className="h-full w-full" />
        <button
          type="button"
          onClick={onRequestLocation}
          className="absolute right-3 top-3 z-[400] inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <LocateFixed className="h-4 w-4 text-[#3B4CCA]" aria-hidden="true" />
          <span>{t.common.nearMe}</span>
        </button>
      </div>
    );
  }
);

MapView.displayName = 'MapView';
