import React, { useCallback, useState } from "react";
import CitySearchForm, { type CitySearchValues } from "@/components/CitySearchForm";
import LoadingSequence from "@/components/LoadingSequence";
import CityConfirmationMap from "@/components/CityConfirmationMap";
import ContextPanel from "@/components/ContextPanel";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

type Stage = "form" | "geocoding" | "confirm" | "analysis" | "results";

interface GeocodeResult {
  status: "success" | "error";
  coordinates: [number, number]; // [lat, lng] per spec, but we'll convert to [lng, lat] for map
  bounding_box?: [number, number, number, number];
  official_name: string;
  area_km2?: number;
  population?: number;
}

const FALLBACK_DATA: Record<string, { coords: [number, number]; bbox: [number, number, number, number]; area_km2: number; population: number; official: string; }> = {
  "Tokyo, Japan": { coords: [35.6762, 139.6503], bbox: [35.5, 139.0, 35.8, 140.0], area_km2: 2194, population: 37400000, official: "Tokyo Metropolis, Japan" },
  "New York, NY": { coords: [40.7128, -74.006], bbox: [40.5, -74.3, 40.9, -73.7], area_km2: 1214, population: 19300000, official: "New York-Newark, NY-NJ-PA" },
  "London, United Kingdom": { coords: [51.5072, -0.1276], bbox: [51.3, -0.6, 51.7, 0.3], area_km2: 1572, population: 9304000, official: "Greater London, UK" },
  "Paris, France": { coords: [48.8566, 2.3522], bbox: [48.7, 2.1, 49.0, 2.6], area_km2: 105, population: 11020000, official: "Paris, Île-de-France" },
  "Delhi, India": { coords: [28.6139, 77.209], bbox: [28.4, 76.8, 28.9, 77.5], area_km2: 1484, population: 30290000, official: "Delhi, National Capital Territory" },
};

async function geocodeCity(cityName: string, year: number): Promise<GeocodeResult> {
  const token = localStorage.getItem("mapbox_token");
  try {
    if (token) {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?types=place%2Clocality%2Cregion&limit=1&access_token=${token}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const f = data.features[0];
        const center: [number, number] = [f.center[1], f.center[0]]; // [lat, lng]
        const bbox = f.bbox ? [f.bbox[1], f.bbox[0], f.bbox[3], f.bbox[2]] as [number, number, number, number] : undefined;
        return {
          status: "success",
          coordinates: center,
          bounding_box: bbox,
          official_name: f.place_name,
        };
      }
      return { status: "error", coordinates: [0,0], official_name: "City not found" };
    }
    // Fallback dataset
    const hit = FALLBACK_DATA[cityName];
    if (!hit) return { status: "error", coordinates: [0,0], official_name: "City not found" };
    return {
      status: "success",
      coordinates: hit.coords,
      bounding_box: hit.bbox,
      official_name: hit.official,
      area_km2: hit.area_km2,
      population: hit.population,
    };
  } catch (e) {
    return { status: "error", coordinates: [0,0], official_name: "Error" };
  }
}

const Index: React.FC = () => {
  const [stage, setStage] = useState<Stage>("form");
  const [cityInput, setCityInput] = useState<string>("");
  const [year, setYear] = useState<number>(2023);
  const [geo, setGeo] = useState<GeocodeResult | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null); // [lng, lat]
  const [radiusKm, setRadiusKm] = useState<number>(25);

  const handleSubmit = useCallback(async (values: CitySearchValues) => {
    setCityInput(values.city);
    setYear(values.year);
    setStage("geocoding");
    const result = await geocodeCity(values.city, values.year);
    if (result.status === "success") {
      setGeo(result);
      // Convert [lat, lng] -> [lng, lat] for map
      setMapCenter([result.coordinates[1], result.coordinates[0]]);
      setStage("confirm");
    } else {
      toast({ title: "City not found", description: "Try refining with country/state, e.g., \"Paris, France\"." });
      setStage("form");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="container py-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-glow)))]">
          Urban Heat Island Analyzer
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          City-centric UHI detection with geocoding, interactive boundary confirmation, and data-driven insights.
        </p>
      </header>

      <main className="container pb-16 space-y-8">
        {stage === "form" && (
          <CitySearchForm onSubmit={handleSubmit} />
        )}

        {stage === "geocoding" && (
          <LoadingSequence cityName={cityInput} phase="geocoding" onComplete={() => setStage("confirm")} />
        )}

        {stage === "confirm" && geo && mapCenter && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CityConfirmationMap
                coordinates={mapCenter}
                officialName={geo.official_name}
                areaKm2={geo.area_km2}
                population={geo.population}
                defaultRadiusKm={radiusKm}
                onConfirm={({ center, radiusKm }) => {
                  setMapCenter(center);
                  setRadiusKm(radiusKm);
                  setStage("analysis");
                }}
              />
            </div>
            <div className="lg:col-span-1">
              <ContextPanel cityOfficialName={geo.official_name} />
            </div>
          </div>
        )}

        {stage === "analysis" && (
          <LoadingSequence cityName={cityInput} phase="analysis" onComplete={() => setStage("results")} />
        )}

        {stage === "results" && (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="text-2xl font-semibold">Results View</div>
              <p className="mt-2 text-muted-foreground">Side-by-side maps, timelines, and recommendations will appear here.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Index;
