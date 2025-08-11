import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ContextPanelProps {
  cityOfficialName: string;
}

const ContextPanel: React.FC<ContextPanelProps> = ({ cityOfficialName }) => {
  return (
    <Card className="shadow-[var(--shadow-elegant)]">
      <CardHeader>
        <CardTitle className="text-xl">{cityOfficialName} Context</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <ul className="space-y-2">
          <li>• Climate: Humid subtropical</li>
          <li>• Avg Summer Temp: 28°C</li>
          <li>• Urban Green Space: 7.5%</li>
          <li>• Heat Vulnerability: High</li>
        </ul>
        <Separator />
        <div>
          <div className="font-medium mb-1">Compared to Region:</div>
          <ul className="space-y-2">
            <li>+3.2°C hotter than rural areas</li>
            <li>42% less vegetation than countryside</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContextPanel;
