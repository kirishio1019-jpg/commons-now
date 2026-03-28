import React, { createContext, useContext, ReactNode } from "react";
import { User, CommitLevel } from "../types";
import { useProfile } from "../hooks/useProfile";
import { useCommitments } from "../hooks/useCommitments";
import { useAuth } from "./AuthContext";

interface AppContextType {
  user: User | null;
  loading: boolean;
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  getCommitLevel: (waveId: string) => CommitLevel;
  updateCommitLevel: (waveId: string, level: CommitLevel) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const {
    profile,
    loading: profileLoading,
    updateProfile,
  } = useProfile();
  const {
    loading: commitmentsLoading,
    getCommitLevel,
    updateCommitLevel,
  } = useCommitments();

  const setIsOnboarded = async (v: boolean) => {
    await updateProfile({ is_onboarded: v });
  };

  // If not authenticated, provide null values
  if (!session) {
    return (
      <AppContext.Provider
        value={{
          user: null,
          loading: false,
          isOnboarded: false,
          setIsOnboarded: () => {},
          getCommitLevel: () => "none",
          updateCommitLevel: () => {},
        }}
      >
        {children}
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider
      value={{
        user: profile,
        loading: profileLoading || commitmentsLoading,
        isOnboarded: profile?.is_onboarded ?? false,
        setIsOnboarded,
        getCommitLevel,
        updateCommitLevel,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
