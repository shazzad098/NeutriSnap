"use server";

import { analyzeFoodPhoto, type AnalyzeFoodPhotoOutput } from "@/ai/flows/analyze-food-photo";
import { firestore } from "@/lib/firebase";
import type { ScanDataFirestore } from "@/types";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface AnalyzeImageResult {
  success: boolean;
  data?: AnalyzeFoodPhotoOutput;
  error?: string;
  scanId?: string;
}

export async function analyzeImageAction(
  photoDataUri: string,
  userId?: string
): Promise<AnalyzeImageResult> {
  if (!photoDataUri) {
    return { success: false, error: "No photo data provided." };
  }

  try {
    const analysisResult = await analyzeFoodPhoto({ photoDataUri });

    if (userId && analysisResult.foodName) {
      const scanData: ScanDataFirestore = {
        userId,
        foodName: analysisResult.foodName,
        nutritionInformation: analysisResult.nutritionInformation,
        timestamp: serverTimestamp(),
      };
      const docRef = await addDoc(collection(firestore, `users/${userId}/scans`), scanData);
      return { success: true, data: analysisResult, scanId: docRef.id };
    }
    
    return { success: true, data: analysisResult };
  } catch (error) {
    console.error("Error in analyzeImageAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during analysis.";
    return { success: false, error: errorMessage };
  }
}
