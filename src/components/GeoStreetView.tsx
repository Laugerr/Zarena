"use client";

import { useEffect, useRef } from "react";
import { APIProvider, useApiIsLoaded } from "@vis.gl/react-google-maps";

type GeoStreetViewProps = {
  lat: number;
  lng: number;
  heading: number;
  apiKey: string;
};

const HIDE_CARD_STYLE = `
  .gm-iv-address,
  .gm-iv-address-link,
  .gm-iv-marker { display: none !important; }
`;

function StreetViewPane({ lat, lng, heading }: Omit<GeoStreetViewProps, "apiKey">) {
  const ref = useRef<HTMLDivElement>(null);
  const isLoaded = useApiIsLoaded();

  useEffect(() => {
    if (!isLoaded || !ref.current) return;

    new google.maps.StreetViewPanorama(ref.current, {
      position: { lat, lng },
      pov: { heading, pitch: 0 },
      addressControl: false,
      showRoadLabels: false,
      fullscreenControl: false,
      zoomControl: false,
      panControl: false,
      motionTracking: false,
      motionTrackingControl: false,
      linksControl: false,
    });
  }, [isLoaded, lat, lng, heading]);

  return <div ref={ref} className="w-full h-full rounded-3xl overflow-hidden glass" />;
}

export default function GeoStreetView({ lat, lng, heading, apiKey }: GeoStreetViewProps) {
  return (
    <APIProvider apiKey={apiKey}>
      <style>{HIDE_CARD_STYLE}</style>
      <StreetViewPane lat={lat} lng={lng} heading={heading} />
    </APIProvider>
  );
}
