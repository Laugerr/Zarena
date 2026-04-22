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
  const [expanded, setExpanded] = useState(false);

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
    <>
      {/* Expanded overlay (mobile) */}
      {expanded && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 p-3 lg:hidden">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <span className="text-sm font-bold text-foreground/50">🗺️ Place your pin</span>
            <button
              onClick={() => setExpanded(false)}
              className="rounded-xl bg-surface-lighter px-3 py-1.5 text-xs font-bold hover:bg-surface-light transition-all"
            >
              ✕ Close
            </button>
          </div>
          <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-surface-lighter">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              className="w-full h-full"
              style={{ background: "#14142b" }}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {!hasGuessed && !disabled && <ClickHandler onSelect={setSelected} />}
              {selected && <Marker position={[selected.lat, selected.lng]} icon={guessIcon} />}
            </MapContainer>
          </div>
          {!hasGuessed && !disabled && (
            <button
              onClick={() => { if (selected) { onGuess(selected); setExpanded(false); } }}
              disabled={!selected}
              className="mt-2 w-full rounded-xl bg-gradient-main py-3 text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100"
            >
              {selected ? "CONFIRM GUESS" : "Tap the map to place your pin"}
            </button>
          )}
          {hasGuessed && (
            <div className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-success/20 py-3">
              <span className="text-success font-bold text-sm">✓ Guess locked in!</span>
            </div>
          )}
        </div>
      )}

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

          {/* Expand button (mobile only) */}
          <button
            onClick={() => setExpanded(true)}
            className="absolute top-2 right-2 z-[400] lg:hidden rounded-lg bg-background/80 border border-surface-lighter/50 px-2 py-1.5 text-xs font-bold text-foreground/60 hover:text-foreground/90 transition-all backdrop-blur-sm"
          >
            ⛶ Expand
          </button>
        </div>

        {/* Confirm button */}
        {!hasGuessed && !disabled && (
          <button
            onClick={() => { if (selected) onGuess(selected); }}
            disabled={!selected}
            className="mt-2 w-full rounded-xl bg-gradient-main py-3 text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100"
          >
            {selected ? "CONFIRM GUESS" : "Click the map to place your pin"}
          </button>
        )}

        {hasGuessed && (
          <div className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-success/20 py-3">
            <span className="text-success font-bold text-sm">✓ Guess locked in!</span>
          </div>
        )}
      </div>
    </>
  );
}
