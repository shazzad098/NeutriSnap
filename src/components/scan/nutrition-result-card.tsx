
import type { AnalyzeFoodPhotoOutput } from "@/ai/flows/analyze-food-photo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Leaf } from "lucide-react";

interface NutritionResultCardProps {
  data: AnalyzeFoodPhotoOutput;
}

export default function NutritionResultCard({ data }: NutritionResultCardProps) {
  if (!data) return null;

  return (
    <Card className="w-full border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
           <Leaf className="h-5 w-5 text-primary" />
          Nutrition Insights
        </CardTitle>
        <CardDescription>Analysis for: <span className="font-semibold text-foreground">{data.foodName}</span></CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 w-full rounded-lg border p-4 bg-muted/20 text-sm">
          <h4 className="font-semibold mb-2 text-foreground">Detailed Information:</h4>
          <pre className="whitespace-pre-wrap text-foreground/90 font-sans leading-relaxed text-xs">
            {data.nutritionInformation}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
