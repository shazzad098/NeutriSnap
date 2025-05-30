
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
import { useQueryClient } from '@tanstack/react-query';

export default function ScanHistorySection({ newScanId }: { newScanId?: string }) {
  const { user, loading: authLoading } = useAuthContext();
  const [scanHistory, setScanHistory] = useState<ScanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (newScanId && user?.uid) {
      // onSnapshot handles updates, so direct invalidation might not be strictly needed here for this component's own state
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
      return () => unsubscribe(); 
    } else {
      setScanHistory([]);
      if (!authLoading) { 
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
            স্ক্যান ইতিহাস {/* Scan History */}
          </CardTitle>
           <CardDescription>আপনার পূর্ববর্তী স্ক্যানগুলি লোড হচ্ছে...</CardDescription> {/* Loading your previous scans... */}
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
            স্ক্যান ইতিহাস {/* Scan History */}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">আপনার স্ক্যান ইতিহাস দেখতে সাইন ইন করুন।</p> {/* Sign in to view your scan history. */}
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
            স্ক্যান ইতিহাস {/* Scan History */}
          </CardTitle>
           <CardDescription>আপনার স্ক্যান করা আইটেমগুলি এখানে প্রদর্শিত হবে।</CardDescription> {/* Your scanned items will appear here. */}
        </CardHeader>
        <CardContent className="text-center py-10">
           <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">কোন স্ক্যান পাওয়া যায়নি। আপনার ইতিহাস দেখতে স্ক্যান করা শুরু করুন!</p> {/* No scans found. Start scanning to see your history! */}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ListCollapse className="h-5 w-5 text-primary" />
          স্ক্যান ইতিহাস {/* Scan History */}
        </CardTitle>
        <CardDescription>আপনার পূর্বে বিশ্লেষণ করা খাদ্য আইটেমগুলির একটি লগ।</CardDescription> {/* A log of your previously analyzed food items. */}
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
