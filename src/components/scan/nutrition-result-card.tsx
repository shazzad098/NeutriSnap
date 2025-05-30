
import type { AnalyzeFoodPhotoOutput } from "@/ai/flows/analyze-food-photo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Leaf } from "lucide-react";

interface NutritionResultCardProps {
  data: AnalyzeFoodPhotoOutput;
}

export default function NutritionResultCard({ data }: NutritionResultCardProps) {
  if (!data) return null;

  // Assuming data.nutritionInformation is now in Bangla and newline-separated
  const nutritionItems = data.nutritionInformation
    .split('\n')
    .map(item => item.trim())
    .filter(item => item.length > 0);

  return (
    <Card className="w-full border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
           <Leaf className="h-5 w-5 text-primary" />
           পুষ্টি সম্পর্কিত তথ্য {/* Nutrition Insights */}
        </CardTitle>
        <CardDescription>এর জন্য বিশ্লেষণ: <span className="font-semibold text-foreground">{data.foodName}</span></CardDescription> {/* Analysis for: */}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 w-full rounded-lg border p-4 bg-muted/20">
          <p className="text-sm font-semibold mb-3 text-foreground">খাবারের নাম: {data.foodName}</p> {/* Food Name: */}
          
          <h4 className="font-semibold mb-2 text-foreground text-sm">বিস্তারিত তথ্য:</h4> {/* Detailed Information: */}
          {nutritionItems.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90 font-sans leading-relaxed">
              {nutritionItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">কোন বিস্তারিত পুষ্টি তথ্য পাওয়া যায়নি।</p> /* No detailed nutrition information available. */
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
