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
    <div className="relative w-full h-full rounded-3xl overflow-hidden glass">
      <iframe
        src={src}
        className="w-full h-full border-0"
        allowFullScreen
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {/* Overlay to block Google Maps UI interactions that could reveal location */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
    </div>
  );
}
