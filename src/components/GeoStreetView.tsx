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
      {/* Vignette edges — also hides the top-left location card */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-background to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 bottom-0 w-28 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      {/* Clickable block only over the card area so map interaction still works */}
      <div className="absolute top-0 left-0 w-72 h-24 pointer-events-auto" />
    </div>
  );
}
