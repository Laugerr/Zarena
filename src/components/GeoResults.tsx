"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import type { GeoGuessResult, GeoLocation } from "@/lib/types";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";

const actualIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "hue-rotate-[120deg] brightness-150",
});

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}

type GeoResultsProps = {
  results: GeoGuessResult[];
  location: GeoLocation;
  scores: Record<string, number>;
  myId: string;
};

export default function GeoResults({ results, location, scores, myId }: GeoResultsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-game overflow-hidden">
      {/* Location name reveal + home button */}
      <div className="glass rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-center animate-slide-up shrink-0 relative">
        <Link
          href="/"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg bg-surface-lighter/60 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-foreground/40 hover:text-foreground/70 hover:bg-surface-lighter transition-all"
        >
          ← Home
        </Link>
        <span className="text-[10px] sm:text-xs text-foreground/40 uppercase tracking-wider">The location was</span>
        <h2 className="text-lg sm:text-xl font-black bg-gradient-to-r from-cyan via-accent-light to-pink bg-clip-text text-transparent mt-0.5 sm:mt-1">
          {location.name}
        </h2>
      </div>

      {/* Main area: Map + Leaderboard */}
      <div className="flex flex-1 gap-2 sm:gap-3 min-h-0 flex-col lg:flex-row overflow-hidden">
        {/* Results map */}
        <div className="flex-1 min-h-[200px] sm:min-h-0 glass rounded-2xl overflow-hidden">
          {mounted ? (
            <MapContainer
              center={[location.position.lat, location.position.lng]}
              zoom={3}
              className="w-full h-full"
              style={{ background: "#14142b", minHeight: "250px" }}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

              {/* Actual location marker */}
              <Marker
                position={[location.position.lat, location.position.lng]}
                icon={actualIcon}
              >
                <Popup>{location.name}</Popup>
              </Marker>

              {/* Player guess markers + lines */}
              {results.map((r) => {
                if (r.distance >= 20000) return null; // no guess
                const guessIcon = new L.DivIcon({
                  html: `<div style="background:${r.playerId === myId ? '#7c3aed' : '#ec4899'};width:12px;height:12px;border-radius:50%;border:2px solid white;"></div>`,
                  iconSize: [12, 12],
                  iconAnchor: [6, 6],
                  className: "",
                });

                return (
                  <Fragment key={r.playerId}>
                    <Marker position={[r.guess.lat, r.guess.lng]} icon={guessIcon}>
                      <Popup>
                        {r.playerName}: {formatDistance(r.distance)} ({r.points} pts)
                      </Popup>
                    </Marker>
                    <Polyline
                      positions={[
                        [r.guess.lat, r.guess.lng],
                        [location.position.lat, location.position.lng],
                      ]}
                      color={r.playerId === myId ? "#7c3aed" : "#ec4899"}
                      weight={2}
                      opacity={0.5}
                      dashArray="5,10"
                    />
                  </Fragment>
                );
              })}
            </MapContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-foreground/30">Loading map...</span>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="glass rounded-2xl p-3 sm:p-4 lg:w-72 shrink-0 overflow-y-auto max-h-48 sm:max-h-60 lg:max-h-none">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3">
            Round Results
          </h3>
          <div className="flex flex-col gap-2 stagger">
            {results.map((r, i) => (
              <div
                key={r.playerId}
                className={`animate-slide-up flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                  r.playerId === myId
                    ? "bg-accent/20 border border-accent/30"
                    : "bg-surface-light/50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm shrink-0">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{r.playerName}</p>
                    <p className="text-[10px] text-foreground/40">
                      {r.distance >= 20000 ? "No guess" : formatDistance(r.distance)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="font-mono font-black text-accent-light text-sm">+{r.points}</p>
                  <p className="text-[10px] text-foreground/30">Total: {scores[r.playerId] ?? 0}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-foreground/30">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs">Next round loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
