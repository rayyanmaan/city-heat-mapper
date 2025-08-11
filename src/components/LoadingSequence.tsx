import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Step {
  label: string;
  durationMs: number;
}

interface LoadingSequenceProps {
  cityName: string;
  phase: "geocoding" | "pre-analysis" | "analysis";
  onComplete?: () => void;
}

const LoadingSequence: React.FC<LoadingSequenceProps> = ({ cityName, phase, onComplete }) => {
  const steps: Step[] = useMemo(() => {
    if (phase === "geocoding") {
      return [
        { label: `Locating ${cityName}...`, durationMs: 1800 },
        { label: "Confirming analysis boundaries...", durationMs: 1200 },
      ];
    }
    if (phase === "pre-analysis") {
      return [
        { label: "Preparing datasets...", durationMs: 1200 },
      ];
    }
    return [
      { label: "Downloading MODIS temperature data...", durationMs: 2200 },
      { label: "Processing vegetation indices...", durationMs: 1800 },
      { label: "Calculating surface reflectivity...", durationMs: 1600 },
      { label: "Identifying heat patterns...", durationMs: 2000 },
      { label: "Validating statistical significance...", durationMs: 1600 },
      { label: "Generating intervention recommendations...", durationMs: 1600 },
    ];
  }, [cityName, phase]);

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setStepIndex(0);
    setProgress(0);
    let cancelled = false;

    const run = async () => {
      let total = steps.reduce((acc, s) => acc + s.durationMs, 0);
      let elapsed = 0;
      for (let i = 0; i < steps.length; i++) {
        if (cancelled) return;
        setStepIndex(i);
        const duration = steps[i].durationMs;
        const interval = 80;
        const ticks = Math.ceil(duration / interval);
        for (let t = 0; t < ticks; t++) {
          if (cancelled) return;
          await new Promise((res) => setTimeout(res, interval));
          elapsed += interval;
          setProgress(Math.min(100, Math.round((elapsed / total) * 100)));
        }
      }
      if (!cancelled) {
        setProgress(100);
        onComplete?.();
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [steps, onComplete]);

  return (
    <Card className="shadow-[var(--shadow-elegant)]">
      <CardHeader>
        <CardTitle className="text-xl">Analysis Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">{steps[stepIndex]?.label}</div>
        <Progress value={progress} />
      </CardContent>
    </Card>
  );
};

export default LoadingSequence;
