import type { GeoLocation } from "./types";

/**
 * Weighted regions of the world with Street View coverage.
 * Each region has a bounding box and a weight (higher = more likely to be picked).
 * Weights are roughly proportional to Street View coverage density.
 */
const REGIONS = [
  // Europe (great coverage)
  { name: "Western Europe", latMin: 42, latMax: 55, lngMin: -5, lngMax: 15, weight: 15 },
  { name: "Northern Europe", latMin: 55, latMax: 70, lngMin: 5, lngMax: 30, weight: 8 },
  { name: "Southern Europe", latMin: 36, latMax: 44, lngMin: -10, lngMax: 28, weight: 10 },
  { name: "Eastern Europe", latMin: 44, latMax: 56, lngMin: 14, lngMax: 40, weight: 8 },

  // North America
  { name: "US East", latMin: 30, latMax: 45, lngMin: -90, lngMax: -70, weight: 12 },
  { name: "US West", latMin: 32, latMax: 48, lngMin: -125, lngMax: -100, weight: 10 },
  { name: "US Central", latMin: 30, latMax: 48, lngMin: -100, lngMax: -90, weight: 6 },
  { name: "Canada", latMin: 43, latMax: 55, lngMin: -130, lngMax: -60, weight: 5 },
  { name: "Mexico", latMin: 16, latMax: 32, lngMin: -117, lngMax: -87, weight: 6 },

  // South America
  { name: "Brazil", latMin: -30, latMax: 0, lngMin: -55, lngMax: -35, weight: 8 },
  { name: "Argentina/Chile", latMin: -50, latMax: -22, lngMin: -73, lngMax: -55, weight: 5 },
  { name: "Colombia/Peru", latMin: -15, latMax: 10, lngMin: -80, lngMax: -67, weight: 4 },

  // Asia
  { name: "Japan", latMin: 31, latMax: 43, lngMin: 130, lngMax: 145, weight: 8 },
  { name: "South Korea", latMin: 34, latMax: 38, lngMin: 126, lngMax: 130, weight: 4 },
  { name: "Southeast Asia", latMin: -8, latMax: 20, lngMin: 96, lngMax: 120, weight: 7 },
  { name: "India", latMin: 8, latMax: 32, lngMin: 68, lngMax: 90, weight: 6 },
  { name: "Turkey/Middle East", latMin: 30, latMax: 42, lngMin: 26, lngMax: 45, weight: 5 },
  { name: "Russia West", latMin: 50, latMax: 60, lngMin: 30, lngMax: 60, weight: 4 },

  // Africa
  { name: "South Africa", latMin: -35, latMax: -22, lngMin: 17, lngMax: 33, weight: 4 },
  { name: "East Africa", latMin: -10, latMax: 5, lngMin: 28, lngMax: 42, weight: 3 },
  { name: "North Africa", latMin: 25, latMax: 37, lngMin: -10, lngMax: 12, weight: 3 },
  { name: "West Africa", latMin: 4, latMax: 15, lngMin: -17, lngMax: 10, weight: 3 },

  // Oceania
  { name: "Australia East", latMin: -38, latMax: -20, lngMin: 140, lngMax: 155, weight: 6 },
  { name: "Australia West", latMin: -35, latMax: -20, lngMin: 115, lngMax: 140, weight: 3 },
  { name: "New Zealand", latMin: -47, latMax: -35, lngMin: 166, lngMax: 178, weight: 3 },
];

const totalWeight = REGIONS.reduce((sum, r) => sum + r.weight, 0);

/** Generate a random GeoLocation somewhere in the world (biased toward areas with Street View coverage) */
export function generateRandomLocation(): GeoLocation {
  // Pick a weighted random region
  let roll = Math.random() * totalWeight;
  let region = REGIONS[0];
  for (const r of REGIONS) {
    roll -= r.weight;
    if (roll <= 0) {
      region = r;
      break;
    }
  }

  // Random point within the region
  const lat = region.latMin + Math.random() * (region.latMax - region.latMin);
  const lng = region.lngMin + Math.random() * (region.lngMax - region.lngMin);
  const heading = Math.floor(Math.random() * 360);

  return {
    id: `geo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    position: { lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 },
    heading,
    name: region.name,
  };
}
