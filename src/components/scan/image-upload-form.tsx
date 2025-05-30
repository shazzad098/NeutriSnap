
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
        setImagePreview(dataUri); 
        setImageDataUri(dataUri); 
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
        title: "কোন ছবি নির্বাচন করা হয়নি", // No Image Selected
        description: "বিশ্লেষণ করার জন্য অনুগ্রহ করে একটি ছবি নির্বাচন করুন।", // Please select an image to analyze.
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    onAnalysisError(""); 

    try {
      const result = await analyzeImageAction(imageDataUri, user?.uid);
      if (result.success && result.data) {
        onAnalysisComplete(result.data, result.scanId);
        toast({
          title: "বিশ্লেষণ সম্পন্ন", // Analysis Complete
          description: `শনাক্ত করা হয়েছে: ${result.data.foodName}`, // Identified:
        });
      } else {
        onAnalysisError(result.error || "বিশ্লেষণ ব্যর্থ হয়েছে।"); // Analysis failed.
        toast({
          title: "বিশ্লেষণ ব্যর্থ", // Analysis Failed
          description: result.error || "একটি অজানা ত্রুটি ঘটেছে।", // An unknown error occurred.
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।"; // An unexpected error occurred.
      onAnalysisError(errorMessage);
      toast({
        title: "ত্রুটি", // Error
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
    onAnalysisError(""); 
    const fileInput = document.getElementById('food-image-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ""; 
    }
  };

  return (
    <Card className="w-full border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Camera className="h-5 w-5 text-primary" />
          আপনার খাবার স্ক্যান করুন {/* Scan Your Food */}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="food-image-input" className="text-sm font-medium">খাবারের ছবি আপলোড করুন</Label> {/* Upload Food Image */}
            <Input
              id="food-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file:text-primary file:font-semibold hover:file:bg-primary/10 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-primary/20"
              disabled={isLoading}
            />
            {fileName && <p className="text-xs text-muted-foreground mt-1">নির্বাচিত: {fileName}</p>} {/* Selected */}
          </div>

          {imagePreview && (
            <div className="mt-4 border border-dashed border-border rounded-lg p-4 flex justify-center items-center max-h-72 overflow-hidden bg-background">
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
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading || !imagePreview} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" /> রিসেট {/* Reset */}
          </Button>
          <Button type="submit" disabled={isLoading || !imageDataUri} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Camera className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "বিশ্লেষণ করা হচ্ছে..." : "খাবার বিশ্লেষণ করুন"} {/* Analyzing... : Analyze Food */}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
