"use client";

import { useEffect, useRef, useState } from "react";

export function LocationPicker({
  initialLat,
  initialLng,
  onLocationChange,
}: {
  initialLat?: number;
  initialLng?: number;
  onLocationChange: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [lat, setLat] = useState(initialLat ?? 47.5);
  const [lng, setLng] = useState(initialLng ?? -120.5);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    async function initMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current) return;

      const map = L.map(mapRef.current).setView(
        [lat, lng],
        initialLat ? 14 : 7,
      );
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      if (initialLat && initialLng) {
        markerRef.current = L.marker([initialLat, initialLng], {
          icon: DefaultIcon,
        }).addTo(map);
      }

      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        setLat(newLat);
        setLng(newLng);
        onLocationChange(newLat, newLng);

        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
        } else {
          markerRef.current = L.marker([newLat, newLng], {
            icon: DefaultIcon,
          }).addTo(map);
        }
      });
    }

    initMap();

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "300px",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          marginBottom: "var(--space-2)",
          border: "1px solid var(--color-border)",
        }}
        aria-label="Click to select location"
      />
      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-muted)",
        }}
      >
        Click the map to set location ({lat.toFixed(4)}, {lng.toFixed(4)})
      </p>
    </div>
  );
}
