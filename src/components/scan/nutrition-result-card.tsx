
import type { AnalyzeFoodPhotoOutput } from "@/ai/flows/analyze-food-photo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Leaf } from "lucide-react";

interface NutritionResultCardProps {
  data: AnalyzeFoodPhotoOutput;
}

export default function NutritionResultCard({ data }: NutritionResultCardProps) {
  if (!data) return null;

  // Parse the nutrition information string into a list of items
  // Assumes nutritionInformation is a string with facts separated by newlines
  const nutritionItems = data.nutritionInformation
    .split('\n')
    .map(item => item.trim())
    .filter(item => item.length > 0);

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
        <ScrollArea className="h-48 w-full rounded-lg border p-4 bg-muted/20">
          <h4 className="font-semibold mb-2 text-foreground text-sm">Detailed Information:</h4>
          {nutritionItems.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90 font-sans leading-relaxed">
              {nutritionItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">No detailed nutrition information available.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
