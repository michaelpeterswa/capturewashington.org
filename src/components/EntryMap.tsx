"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const TILE_LIGHT =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

function pinIcon(L: typeof import("leaflet"), dark: boolean) {
  return L.divIcon({
    className: "",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -32],
    html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${dark ? "#5cb85c" : "#2d5f2e"}"/>
      <circle cx="14" cy="13" r="5.5" fill="${dark ? "#1a1a1a" : "#fffdf8"}"/>
    </svg>`,
  });
}

export function EntryMap({
  lat,
  lng,
  title,
}: {
  lat: number;
  lng: number;
  title: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;
    const isDark = resolvedTheme === "dark";

    async function initMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current).setView([lat, lng], 14);
      mapInstanceRef.current = map;

      L.tileLayer(isDark ? TILE_DARK : TILE_LIGHT, {
        attribution: TILE_ATTR,
        maxZoom: 19,
      }).addTo(map);

      L.marker([lat, lng], { icon: pinIcon(L, isDark) })
        .addTo(map)
        .bindPopup(title);
    }

    initMap();

    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng, title, resolvedTheme]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[300px] rounded-lg overflow-hidden mb-6 isolate z-0"
      aria-label={`Map showing location of ${title}`}
    />
  );
}
