"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { firestore } from "@/lib/firebase";
import type { ScanData } from "@/types";
import { collection, query, orderBy, onSnapshot, type DocumentData, type QuerySnapshot } from "firebase/firestore";
import ScanHistoryItem from "./scan-history-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListCollapse, Info } from "lucide-react";
import { useQuery, useQueryClient } from '@tanstack/react-query';

async function fetchScanHistory(userId: string): Promise<ScanData[]> {
  const scansCol = collection(firestore, `users/${userId}/scans`);
  const q = query(scansCol, orderBy("timestamp", "desc"));
  
  // This is a simplified fetch for useQuery. For real-time, onSnapshot is better but harder with react-query's default.
  // For this example, we'll use onSnapshot within useEffect for real-time updates and not rely on react-query for this specific real-time part.
  // Or, we can remove real-time for simplicity and use getDocs with react-query.
  // Let's use onSnapshot and manage state locally.
  return new Promise((resolve, reject) => {
    const unsubscribe = onSnapshot(q, 
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const history: ScanData[] = [];
        querySnapshot.forEach((doc) => {
          history.push({ id: doc.id, ...doc.data() } as ScanData);
        });
        resolve(history);
        // Note: In a real app, you might want to manage unsubscribe more carefully
        // or integrate real-time updates differently with a state management library.
        // unsubscribe(); // Don't unsubscribe immediately if you want real-time updates.
      }, 
      (error) => {
        console.error("Error fetching scan history: ", error);
        reject(error);
      }
    );
    // To prevent memory leaks, this promise needs to handle unsubscription,
    // but for simple useQuery, it's easier if it's not a long-lived subscription.
    // For now, this will fetch once effectively, or keep listening if not unsubscribed.
  });
}


export default function ScanHistorySection({ newScanId }: { newScanId?: string }) {
  const { user, loading: authLoading } = useAuthContext();
  const [scanHistory, setScanHistory] = useState<ScanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (newScanId && user?.uid) {
      // Invalidate and refetch when a new scan is added.
      // This is a bit of a workaround for real-time with react-query or manual state.
      // A more robust solution might use websockets or a dedicated real-time library with react-query.
      queryClient.invalidateQueries({ queryKey: ['scanHistory', user.uid] });
    }
  }, [newScanId, user?.uid, queryClient]);
  
  useEffect(() => {
    if (user?.uid) {
      setIsLoading(true);
      const scansCol = collection(firestore, `users/${user.uid}/scans`);
      const q = query(scansCol, orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const history: ScanData[] = [];
          querySnapshot.forEach((doc) => {
            history.push({ id: doc.id, ...doc.data() } as ScanData);
          });
          setScanHistory(history);
          setIsLoading(false);
        }, 
        (error) => {
          console.error("Error fetching scan history: ", error);
          setIsLoading(false);
        }
      );
      return () => unsubscribe(); // Cleanup subscription on component unmount
    } else {
      setScanHistory([]);
      setIsLoading(false);
    }
  }, [user?.uid]);


  if (authLoading || (isLoading && user)) {
    return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListCollapse className="h-6 w-6 text-primary" />
            Scan History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-md space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListCollapse className="h-6 w-6 text-primary" />
            Scan History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Info className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Sign in to view your scan history.</p>
        </CardContent>
      </Card>
    );
  }

  if (scanHistory.length === 0) {
    return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListCollapse className="h-6 w-6 text-primary" />
            Scan History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
           <Info className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No scans found. Start scanning to see your history!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListCollapse className="h-6 w-6 text-primary" />
          Scan History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
          {scanHistory.map((scan) => (
            <ScanHistoryItem key={scan.id} scan={scan} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
