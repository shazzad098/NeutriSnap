
"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import ImageUploadForm from "@/components/scan/image-upload-form";
import NutritionResultCard from "@/components/scan/nutrition-result-card";
import ScanHistorySection from "@/components/scan/scan-history-section";
import type { AnalyzeFoodPhotoOutput } from "@/ai/flows/analyze-food-photo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeFoodPhotoOutput | null>(null);
  const [analysisError, setAnalysisError] = useState<string>("");
  const [newScanId, setNewScanId] = useState<string | undefined>(undefined);
  const [currentYear, setCurrentYear] = useState<number | string>("");

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);


  const handleAnalysisComplete = (data: AnalyzeFoodPhotoOutput, scanId?: string) => {
    setAnalysisResult(data);
    setAnalysisError("");
    if (scanId) setNewScanId(scanId); // Trigger history refresh
  };

  const handleAnalysisError = (error: string) => {
    setAnalysisError(error);
    setAnalysisResult(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <ImageUploadForm 
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisError={handleAnalysisError}
            />
          </div>
          <div className="space-y-6">
            {analysisError && (
              <Alert variant="destructive" className="shadow-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Analysis Error</AlertTitle>
                <AlertDescription>{analysisError}</AlertDescription>
              </Alert>
            )}
            {analysisResult && <NutritionResultCard data={analysisResult} />}
          </div>
        </div>
        <ScanHistorySection newScanId={newScanId} />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        <p>&copy; {currentYear || " "} NutriSnap. Your AI Powered Nutrition Analyzer.</p>
      </footer>
    </div>
  );
}
