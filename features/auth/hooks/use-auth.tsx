 "use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { AuthUser } from "../types/auth-user";
import {
  getStoredAuthState,
  initializeGoogleIdentity,
  revokeGoogleSession,
  startGooglePrompt,
  storeAuthState,
} from "../services/google-auth.service";

type AuthState = {
  user: AuthUser | null;
  credential: string | null;
  isReady: boolean;
};

type AuthContextValue = AuthState & {
  signInWithGoogle: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    credential: null,
    isReady: false,
  });

  useEffect(() => {
    const stored = getStoredAuthState();

    setState({
      user: stored.user,
      credential: stored.credential,
      isReady: true,
    });

    initializeGoogleIdentity((nextState) => {
      setState({
        user: nextState.user,
        credential: nextState.credential,
        isReady: true,
      });
    });
  }, []);

  function signInWithGoogle() {
    startGooglePrompt();
  }

  function signOut() {
    const currentEmail = state.user?.email ?? null;

    revokeGoogleSession(currentEmail, () => {
      const clearedState = {
        user: null,
        credential: null,
      };

      storeAuthState(clearedState);

      setState({
        user: null,
        credential: null,
        isReady: true,
      });
    });
  }

  const value: AuthContextValue = {
    user: state.user,
    credential: state.credential,
    isReady: state.isReady,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

