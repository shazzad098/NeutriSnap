import type { Timestamp } from "firebase/firestore";

export interface NutritionData {
  foodName: string;
  nutritionInformation: string; // This is a string from the AI
}

export interface ScanData extends NutritionData {
  id: string; // Firestore document ID
  timestamp: Timestamp;
  userId: string;
}

// For data being sent to Firestore, timestamp might be FieldValue (serverTimestamp)
export interface ScanDataFirestore extends Omit<ScanData, 'id' | 'timestamp'> {
  timestamp: any; // firebase.firestore.FieldValue for serverTimestamp
}
