"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import type { EntryListItem } from "@/types";

const TILE_LIGHT =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png";
const TILE_DARK =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://stadiamaps.com/">Stadia Maps</a>';

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

export function FullMap({ entries }: { entries: EntryListItem[] }) {
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

      const map = L.map(mapRef.current).setView([47.5, -120.5], 7);
      mapInstanceRef.current = map;

      L.tileLayer(isDark ? TILE_DARK : TILE_LIGHT, {
        attribution: TILE_ATTR,
        maxZoom: 19,
      }).addTo(map);

      const icon = pinIcon(L, isDark);

      for (const entry of entries) {
        const popupHtml = `
          <div style="max-width:200px;font-family:system-ui,sans-serif">
            ${entry.thumbnailUrl ? `<img src="${entry.thumbnailUrl}" alt="" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:6px" />` : ""}
            <h3 style="font-size:14px;font-weight:600;margin:0 0 4px;color:#1c1814">${entry.title}</h3>
            <p style="font-size:12px;color:#6b635a;margin:0 0 6px">${entry.locationName}</p>
            <a href="/entry/${entry.slug}" style="font-size:12px;color:#2d5f2e;font-weight:500">View entry &rarr;</a>
          </div>
        `;

        L.marker([entry.lat, entry.lng], { icon })
          .addTo(map)
          .bindPopup(popupHtml);
      }

      if (entries.length > 0) {
        const bounds = L.latLngBounds(
          entries.map((e) => [e.lat, e.lng] as [number, number]),
        );
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }

    initMap();

    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [entries, resolvedTheme]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[calc(100vh-120px)] rounded-lg overflow-hidden isolate z-0 dark:filter-none"
      style={{ filter: resolvedTheme === "dark" ? "none" : "sepia(0.25) hue-rotate(-30deg) saturate(0.85) brightness(0.93) contrast(0.95)" }}
      aria-label="Map of historic buildings in Washington state"
    />
  );
}
