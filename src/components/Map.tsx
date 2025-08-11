import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { circle as turfCircle } from "@turf/turf";
import type { Feature, Polygon } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";

export type LngLat = [number, number];

interface MapProps {
  center: LngLat;
  radiusKm: number;
  draggableCenter?: boolean;
  onCenterChange?: (center: LngLat) => void;
  className?: string;
}

const Map: React.FC<MapProps> = ({
  center,
  radiusKm,
  draggableCenter = false,
  onCenterChange,
  className,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = localStorage.getItem("mapbox_token") || "";
    if (!token) {
      return; // Token prompt handled by parent UI
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center,
      zoom: 9,
      pitch: 0,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

    map.current.on("load", () => {
      // Circle source and layer
      const poly = turfCircle(center, radiusKm, { steps: 128, units: "kilometers" }) as Feature<Polygon>;
      map.current?.addSource("uhi-selection", {
        type: "geojson",
        data: poly,
      });

      map.current?.addLayer({
        id: "uhi-selection-fill",
        type: "fill",
        source: "uhi-selection",
        paint: {
          "fill-color": "#f97316",
          "fill-opacity": 0.2,
        },
      });

      map.current?.addLayer({
        id: "uhi-selection-outline",
        type: "line",
        source: "uhi-selection",
        paint: {
          "line-color": "#f97316",
          "line-width": 2,
        },
      });
    });

    // Center marker (optional draggable)
    const marker = new mapboxgl.Marker({ draggable: draggableCenter })
      .setLngLat(center)
      .addTo(map.current);
    markerRef.current = marker;

    if (draggableCenter && onCenterChange) {
      marker.on("dragend", () => {
        const ll = marker.getLngLat();
        onCenterChange([ll.lng, ll.lat]);
      });
    }

    return () => {
      marker.remove();
      map.current?.remove();
    };
  }, []);

  // Update circle when center or radius changes
  useEffect(() => {
    const src = map.current?.getSource("uhi-selection") as mapboxgl.GeoJSONSource | undefined;
    if (src) {
      const poly = turfCircle(center, radiusKm, { steps: 128, units: "kilometers" }) as Feature<Polygon>;
      src.setData(poly as any);
    }

    // Update marker
    if (markerRef.current) {
      markerRef.current.setLngLat(center);
    }

    // Recenter smoothly
    map.current?.easeTo({ center, duration: 600 });
  }, [center, radiusKm]);

  return (
    <div className={className}>
      <div ref={mapContainer} className="h-full w-full rounded-lg border" />
    </div>
  );
};

export default Map;
