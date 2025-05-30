"use client";

import type { User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signInAnonymously as firebaseSignInAnonymously, signOut as firebaseSignOut } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAnonymously: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInAnonymously = async () => {
    setLoading(true);
    try {
      const userCredential = await firebaseSignInAnonymously(auth);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in anonymously:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Attempt anonymous sign-in if no user and not loading
  useEffect(() => {
    if (!user && !loading) {
      signInAnonymously();
    }
  }, [user, loading]);


  return (
    <AuthContext.Provider value={{ user, loading, signInAnonymously, signOutUser }}>
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
