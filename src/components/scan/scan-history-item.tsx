import type { ScanData } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Utensils, CalendarDays } from "lucide-react";

interface ScanHistoryItemProps {
  scan: ScanData;
}

export default function ScanHistoryItem({ scan }: ScanHistoryItemProps) {
  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow duration-200 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary"/>
          {scan.foodName}
        </CardTitle>
        <CardDescription className="text-xs flex items-center gap-1 pt-1">
          <CalendarDays className="h-3.5 w-3.5"/>
          Scanned on: {format(scan.timestamp.toDate(), "PPPp")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium mb-1 text-muted-foreground">Nutrition Details:</p>
        <pre className="text-xs whitespace-pre-wrap bg-muted/30 p-3 rounded-md font-sans">
          {scan.nutritionInformation}
        </pre>
      </CardContent>
    </Card>
  );
}
