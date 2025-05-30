
"use client";

import type { User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signInAnonymously as firebaseSignInAnonymously, signOut as firebaseSignOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAnonymously: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // True until initial auth state is resolved
  const { toast } = useToast();

  useEffect(() => {
    // Handles the initial determination of auth state.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Auth state now determined (user may be null or an object)
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    // Handles automatic anonymous sign-in if no user is found after the initial check.
    // This runs after `loading` becomes false and if `user` is still null.
    if (!user && !loading) {
      firebaseSignInAnonymously(auth).catch((error) => {
        console.error("Automatic anonymous sign-in failed:", error);
        // If auto sign-in fails, user remains null.
        // The UI (e.g., Header) will reflect this based on the 'user' state.
        // No toast here for automatic attempts to avoid being intrusive.
      });
      // Importantly, this automatic process does not toggle the global `loading` state
      // to prevent UI flicker. The `user` state will update via `onAuthStateChanged`
      // if the anonymous sign-in is successful.
    }
  }, [user, loading]); // Runs when user or loading state changes

  // Function for UI-initiated anonymous sign-in
  const signInAnonymouslyHandler = async () => {
    try {
      const userCredential = await firebaseSignInAnonymously(auth);
      // `onAuthStateChanged` will update the `user` state and `loading` is already false.
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in anonymously (manual):", error);
      let errorMessage = "An unknown error occurred during sign-in.";
      if (error instanceof Error) {
        // Attempt to get a more specific message from Firebase error
        // Common Firebase error codes: 'auth/invalid-api-key', 'auth/network-request-failed', 'auth/operation-not-allowed'
        // @ts-ignore
        if (error.code) {
        // @ts-ignore
          errorMessage = `Sign-in failed: ${error.code}. Please check your Firebase configuration, ensure anonymous sign-in is enabled in your Firebase console, and verify your network connection.`;
        // @ts-ignore
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      toast({
        title: "Sign-In Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  // Function for UI-initiated sign-out
  const signOutUserHandler = async () => {
    try {
      await firebaseSignOut(auth);
      // `onAuthStateChanged` will set `user` to null. `loading` remains false.
    } catch (error) {
      console.error("Error signing out:", error);
      let errorMessage = "An unknown error occurred during sign-out.";
       if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Sign-Out Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInAnonymously: signInAnonymouslyHandler, signOutUser: signOutUserHandler }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
