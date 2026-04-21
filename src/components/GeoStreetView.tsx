"use client";

type GeoStreetViewProps = {
  lat: number;
  lng: number;
  heading: number;
  apiKey: string;
};

export default function GeoStreetView({ lat, lng, heading, apiKey }: GeoStreetViewProps) {
  const src = `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${lat},${lng}&heading=${heading}&pitch=0&fov=90&radius=50000`;

  return (
    // overflow-hidden clips anything outside this box
    <div className="relative w-full h-full rounded-3xl overflow-hidden glass">
      {/* Shift iframe so the top-left location card is clipped out of view */}
      <iframe
        src={src}
        className="absolute border-0"
        style={{
          top: -72,
          left: -160,
          width: "calc(100% + 160px)",
          height: "calc(100% + 72px)",
        }}
        allowFullScreen
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
