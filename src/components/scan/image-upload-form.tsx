"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { analyzeImageAction } from "@/app/actions";
import { useAuthContext } from "@/contexts/auth-context";
import type { AnalyzeFoodPhotoOutput } from "@/ai/flows/analyze-food-photo";
import { Camera, Loader2, RefreshCw } from "lucide-react";

interface ImageUploadFormProps {
  onAnalysisComplete: (data: AnalyzeFoodPhotoOutput, scanId?: string) => void;
  onAnalysisError: (error: string) => void;
}

export default function ImageUploadForm({ onAnalysisComplete, onAnalysisError }: ImageUploadFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const { user } = useAuthContext();
  const { toast } = useToast();

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri); // For previewing the image
        setImageDataUri(dataUri); // For sending to the server action
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setImageDataUri(null);
      setFileName(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageDataUri) {
      toast({
        title: "No Image Selected",
        description: "Please select an image to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    onAnalysisError(""); // Clear previous errors

    try {
      const result = await analyzeImageAction(imageDataUri, user?.uid);
      if (result.success && result.data) {
        onAnalysisComplete(result.data, result.scanId);
        toast({
          title: "Analysis Complete",
          description: `Identified: ${result.data.foodName}`,
        });
      } else {
        onAnalysisError(result.error || "Analysis failed.");
        toast({
          title: "Analysis Failed",
          description: result.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      onAnalysisError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setImagePreview(null);
    setImageDataUri(null);
    setFileName(null);
    onAnalysisError(""); // Clear any displayed error related to analysis
    const fileInput = document.getElementById('food-image-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ""; // Reset file input
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary" />
          Scan Your Food
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="food-image-input" className="text-base">Upload Food Image</Label>
            <Input
              id="food-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file:text-primary file:font-semibold hover:file:bg-primary/10"
              disabled={isLoading}
            />
            {fileName && <p className="text-sm text-muted-foreground mt-1">Selected: {fileName}</p>}
          </div>

          {imagePreview && (
            <div className="mt-4 border border-dashed border-border rounded-md p-4 flex justify-center items-center max-h-72 overflow-hidden bg-muted/20">
              <Image
                src={imagePreview}
                alt="Food preview"
                width={300}
                height={300}
                className="rounded-md object-contain max-h-64 w-auto"
                data-ai-hint="food meal"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
          <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading || !imagePreview} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button type="submit" disabled={isLoading || !imageDataUri} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Camera className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Analyzing..." : "Analyze Food"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
