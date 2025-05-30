"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/auth-context";
import { Leaf, LogIn, LogOut, User } from "lucide-react";

export default function Header() {
  const { user, loading, signInAnonymously, signOutUser } = useAuthContext();

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          <Leaf className="h-7 w-7" />
          <span>NutriSnap</span>
        </Link>
        <div className="flex items-center gap-3">
          {loading ? (
            <Button variant="ghost" size="sm" disabled>Loading...</Button>
          ) : user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                <User className="inline h-4 w-4 mr-1" />
                Anonymous User
              </span>
              <Button variant="outline" size="sm" onClick={signOutUser}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={signInAnonymously}>
              <LogIn className="mr-2 h-4 w-4" /> Sign In Anonymously
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
