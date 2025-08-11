import React, { useMemo, useState } from "react";
import Map, { type LngLat } from "@/components/Map";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface CityConfirmationMapProps {
  coordinates: LngLat; // [lng, lat]
  officialName: string;
  areaKm2?: number;
  population?: number;
  defaultRadiusKm?: number;
  onConfirm: (config: { center: LngLat; radiusKm: number }) => void;
}

const CityConfirmationMap: React.FC<CityConfirmationMapProps> = ({
  coordinates,
  officialName,
  areaKm2,
  population,
  defaultRadiusKm = 25,
  onConfirm,
}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("mapbox_token") : "";
  const [center, setCenter] = useState<LngLat>(coordinates);
  const [radius, setRadius] = useState<number>(defaultRadiusKm);
  const [draggable, setDraggable] = useState<boolean>(false);

  const areaText = areaKm2 ? areaKm2.toLocaleString() + " km²" : "—";
  const popText = population ? (population/1_000_000).toFixed(1) + "M" : "—";

  const handleReset = () => {
    setCenter(coordinates);
    setRadius(defaultRadiusKm);
  };

  const handleConfirm = () => {
    if (!token) {
      toast({ title: "Mapbox token required", description: "Enter a public token to preview the map.", });
    }
    onConfirm({ center, radiusKm: radius });
  };

  return (
    <Card className="shadow-[var(--shadow-elegant)]">
      <CardHeader className="flex items-start justify-between">
        <div>
          <CardTitle>Confirm Analysis Area</CardTitle>
          <div className="mt-1 text-sm text-muted-foreground">
            Detected: {officialName} • Area: {areaText} • Population: {popText}
          </div>
        </div>
        {!token && (
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline">No Mapbox token</Badge>
            <span>Enter token below to enable map preview</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!token ? (
          <div className="space-y-3">
            <input
              placeholder="Paste Mapbox public token (pk....)"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              onChange={(e) => localStorage.setItem("mapbox_token", e.target.value)}
            />
            <div className="text-xs text-muted-foreground">Your token is stored locally in this browser only.</div>
          </div>
        ) : (
          <div className="h-[360px]">
            <Map
              center={center}
              radiusKm={radius}
              draggableCenter={draggable}
              onCenterChange={setCenter}
              className="h-[360px]"
            />
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Analysis Radius: {radius} km</div>
            <Slider
              min={5}
              max={50}
              step={1}
              value={[radius]}
              onValueChange={(v) => setRadius(v[0])}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" type="button" onClick={() => setDraggable((d) => !d)}>
              {draggable ? "Lock Center" : "Edit Boundaries"}
            </Button>
            <Button variant="secondary" type="button" onClick={handleReset}>Reset to Default</Button>
            <Button variant="hero" type="button" onClick={handleConfirm}>Confirm & Proceed</Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Drag the center marker to refine the analysis area. Reset to restore defaults.
      </CardFooter>
    </Card>
  );
};

export default CityConfirmationMap;
