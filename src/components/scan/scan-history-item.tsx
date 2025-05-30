
import type { ScanData } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Utensils, CalendarDays } from "lucide-react";
// You might need to import a Bangla locale for date-fns if you want to format dates in Bangla
// import { bn } from 'date-fns/locale'; 

interface ScanHistoryItemProps {
  scan: ScanData;
}

export default function ScanHistoryItem({ scan }: ScanHistoryItemProps) {
  return (
    <Card className="mb-4 border hover:bg-muted/30 transition-colors duration-200 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center gap-2 font-semibold">
          <Utensils className="h-4 w-4 text-primary"/>
          {scan.foodName}
        </CardTitle>
        <CardDescription className="text-xs flex items-center gap-1 pt-1 text-muted-foreground">
          <CalendarDays className="h-3 w-3"/>
          স্ক্যান করা হয়েছে: {format(scan.timestamp.toDate(), "MMM d, yyyy 'at' h:mm a" /*, { locale: bn } */)} {/* Scanned on: */}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs font-medium mb-1 text-muted-foreground">পুষ্টির বিবরণ:</p> {/* Nutrition Details: */}
        <pre className="text-xs whitespace-pre-wrap bg-muted/20 p-3 rounded-md font-sans leading-normal">
          {scan.nutritionInformation}
        </pre>
      </CardContent>
    </Card>
  );
}
