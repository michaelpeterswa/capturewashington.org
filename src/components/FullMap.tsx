"use client";

import { useEffect, useRef } from "react";
import type { EntryListItem } from "@/types";

export function FullMap({ entries }: { entries: EntryListItem[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    async function initMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current) return;

      // Center on Washington state
      const map = L.map(mapRef.current).setView([47.5, -120.5], 7);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Fix default marker icon paths
      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      for (const entry of entries) {
        const popupHtml = `
          <div style="max-width:200px">
            ${entry.thumbnailUrl ? `<img src="${entry.thumbnailUrl}" alt="" style="width:100%;height:80px;object-fit:cover;border-radius:4px;margin-bottom:4px" />` : ""}
            <h3 style="font-size:14px;font-weight:600;margin:0 0 4px">${entry.title}</h3>
            <p style="font-size:12px;color:#666;margin:0 0 4px">${entry.locationName}</p>
            <a href="/entry/${entry.slug}" style="font-size:12px;color:#1d4ed8">View entry →</a>
          </div>
        `;

        L.marker([entry.lat, entry.lng], { icon: DefaultIcon })
          .addTo(map)
          .bindPopup(popupHtml);
      }

      // Fit bounds if entries exist
      if (entries.length > 0) {
        const bounds = L.latLngBounds(
          entries.map((e) => [e.lat, e.lng] as [number, number]),
        );
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }

    initMap();

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [entries]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "calc(100vh - 120px)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
      aria-label="Map of historic buildings in Washington state"
    />
  );
}
