import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Search, MapPin } from "lucide-react";

export interface CitySearchValues {
  city: string;
  year: number;
}

interface CitySearchFormProps {
  onSubmit: (values: CitySearchValues) => void;
}

const YEARS = Array.from({ length: 2024 - 2012 + 1 }, (_, i) => 2012 + i).reverse();

// Minimal list for typeahead (extend as needed)
const MAJOR_CITIES = [
  "Tokyo, Japan",
  "New York, NY",
  "London, United Kingdom",
  "Paris, France",
  "Delhi, India",
  "Shanghai, China",
  "Sao Paulo, Brazil",
  "Mexico City, Mexico",
  "Cairo, Egypt",
  "Beijing, China",
  "Dhaka, Bangladesh",
  "Osaka, Japan",
  "Karachi, Pakistan",
  "Chongqing, China",
  "Istanbul, Turkey",
  "Buenos Aires, Argentina",
  "Lagos, Nigeria",
  "Kinshasa, DRC",
  "Moscow, Russia",
  "Jakarta, Indonesia",
  "Los Angeles, CA",
  "Chicago, IL",
  "Toronto, Canada",
  "Sydney, Australia",
  "Seoul, South Korea",
  "Hong Kong, China",
  "Singapore, Singapore",
  "Bangkok, Thailand",
];

const CitySearchForm: React.FC<CitySearchFormProps> = ({ onSubmit }) => {
  const [city, setCity] = useState("");
  const [year, setYear] = useState<number>(2023);
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    if (!city) return [] as string[];
    const q = city.toLowerCase();
    return MAJOR_CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
  }, [city]);

  const validLength = city.trim().length >= 3;
  const hasComma = city.includes(",");
  const isValid = validLength && hasComma;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validLength) {
      toast({ title: "Enter at least 3 characters", description: "Try typing the city name.", });
      return;
    }
    if (!hasComma) {
      toast({ title: "Add a comma for clarity", description: "Use format: City, Country or City, State.", });
      return;
    }
    onSubmit({ city: city.trim(), year });
  };

  return (
    <Card className="shadow-[var(--shadow-elegant)]">
      <CardHeader>
        <Badge variant="secondary" className="w-fit">UHI Analyzer</Badge>
        <CardTitle className="text-3xl">Urban Heat Island Analyzer</CardTitle>
        <CardDescription>Analyze by city with geocoding, boundary confirmation, and satellite data.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="city">City Location</Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <MapPin className="h-4 w-4 opacity-60" />
              </div>
              <Input
                id="city"
                placeholder='e.g., "Tokyo, Japan" or "New York, NY"'
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                className="pl-9"
                aria-invalid={!isValid}
                aria-describedby="city-help"
                autoComplete="off"
              />
              {focused && suggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCity(s)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p id="city-help" className="text-xs text-muted-foreground">
              {(!validLength && city) && "Minimum 3 characters"}
              {validLength && !hasComma && " Add a comma for disambiguation (City, Country/State)."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Analysis Year</Label>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger id="year">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" variant="hero" className="gap-2">
              <Search className="h-4 w-4" />
              Analyze Urban Heat Islands
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CitySearchForm;
