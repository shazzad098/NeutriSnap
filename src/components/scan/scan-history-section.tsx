
"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { firestore } from "@/lib/firebase";
import type { ScanData } from "@/types";
import { collection, query, orderBy, onSnapshot, type DocumentData, type QuerySnapshot } from "firebase/firestore";
import ScanHistoryItem from "./scan-history-item";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListCollapse, Info } from "lucide-react";
import { useQueryClient } from '@tanstack/react-query'; // Removed useQuery as it wasn't fully utilized for real-time

export default function ScanHistorySection({ newScanId }: { newScanId?: string }) {
  const { user, loading: authLoading } = useAuthContext();
  const [scanHistory, setScanHistory] = useState<ScanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (newScanId && user?.uid) {
      // Instead of direct invalidation, the onSnapshot listener will update the history.
      // However, if you were using react-query for the initial fetch, invalidation would be correct.
      // For this setup, newScanId mainly serves as a trigger for a potential UI update if needed elsewhere.
      // queryClient.invalidateQueries({ queryKey: ['scanHistory', user.uid] }); // Not strictly needed with onSnapshot for this component's state
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
          // Optionally, show a toast or error message to the user
        }
      );
      return () => unsubscribe(); // Cleanup subscription on component unmount
    } else {
      setScanHistory([]);
      if (!authLoading) { // Only set isLoading to false if auth is not also loading
        setIsLoading(false);
      }
    }
  }, [user?.uid, authLoading]);


  if (authLoading || (isLoading && user)) {
    return (
      <Card className="mt-8 border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ListCollapse className="h-5 w-5 text-primary" />
            Scan History
          </CardTitle>
           <CardDescription>Loading your previous scans...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-2 bg-background">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="mt-8 border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ListCollapse className="h-5 w-5 text-primary" />
            Scan History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Sign in to view your scan history.</p>
        </CardContent>
      </Card>
    );
  }

  if (scanHistory.length === 0) {
    return (
      <Card className="mt-8 border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ListCollapse className="h-5 w-5 text-primary" />
            Scan History
          </CardTitle>
           <CardDescription>Your scanned items will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
           <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No scans found. Start scanning to see your history!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ListCollapse className="h-5 w-5 text-primary" />
          Scan History
        </CardTitle>
        <CardDescription>A log of your previously analyzed food items.</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3">
          {scanHistory.map((scan) => (
            <ScanHistoryItem key={scan.id} scan={scan} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
