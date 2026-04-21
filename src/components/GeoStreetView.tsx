"use client";

import { useEffect, useRef } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";

type GeoStreetViewProps = {
  lat: number;
  lng: number;
  heading: number;
  apiKey: string;
};

function StreetViewPane({ lat, lng, heading }: Omit<GeoStreetViewProps, "apiKey">) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const panorama = new google.maps.StreetViewPanorama(ref.current, {
      position: { lat, lng },
      heading,
      pitch: 0,
      zoom: 0,
      addressControl: false,
      showRoadLabels: false,
      fullscreenControl: false,
      zoomControl: false,
      panControl: false,
      motionTracking: false,
      motionTrackingControl: false,
      linksControl: false,
    });

    return () => {
      // No explicit destroy needed — unmount clears the div
      panorama.setVisible(false);
    };
  }, [lat, lng, heading]);

  return <div ref={ref} className="w-full h-full rounded-3xl overflow-hidden glass" />;
}

export default function GeoStreetView({ lat, lng, heading, apiKey }: GeoStreetViewProps) {
  return (
    <APIProvider apiKey={apiKey}>
      <StreetViewPane lat={lat} lng={lng} heading={heading} />
    </APIProvider>
  );
}
