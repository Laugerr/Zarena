"use client";

import { useState, useEffect } from "react";
import type { LatLng } from "@/lib/types";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet default marker icon issue in Next.js
const guessIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type GeoGuessMapProps = {
  onGuess: (position: LatLng) => void;
  hasGuessed: boolean;
  disabled: boolean;
};

function ClickHandler({ onSelect }: { onSelect: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function GeoGuessMap({ onGuess, hasGuessed, disabled }: GeoGuessMapProps) {
  const [selected, setSelected] = useState<LatLng | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full rounded-2xl bg-surface-light flex items-center justify-center">
        <span className="text-foreground/30 text-sm">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-surface-lighter">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          className="w-full h-full"
          style={{ background: "#14142b" }}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {!hasGuessed && !disabled && <ClickHandler onSelect={setSelected} />}
          {selected && <Marker position={[selected.lat, selected.lng]} icon={guessIcon} />}
        </MapContainer>
      </div>

      {/* Confirm button */}
      {!hasGuessed && !disabled && (
        <button
          onClick={() => {
            if (selected) onGuess(selected);
          }}
          disabled={!selected}
          className="mt-2 w-full rounded-xl bg-gradient-main py-3 text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100"
        >
          {selected ? "CONFIRM GUESS" : "Click the map to place your pin"}
        </button>
      )}

      {hasGuessed && (
        <div className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-success/20 py-3">
          <span className="text-success font-bold text-sm">Guess locked in!</span>
        </div>
      )}
    </div>
  );
}
