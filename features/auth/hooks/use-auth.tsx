"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { AuthUser } from "../types/auth-user";
import {
  getStoredAuthState,
  loginWithCredentials,
  registerWithCredentials,
  clearAuthState,
  storeAuthState,
} from "../services/auth.service";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
};

type AuthContextValue = AuthState & {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isReady: false,
  });

  useEffect(() => {
    const stored = getStoredAuthState();
    setState({
      user: stored.user,
      token: stored.token,
      isReady: true,
    });
  }, []);

  async function login(username: string, password: string) {
    const nextState = await loginWithCredentials(username, password);
    setState({
      user: nextState.user,
      token: nextState.token,
      isReady: true,
    });
  }

  async function register(username: string, password: string) {
    const nextState = await registerWithCredentials(username, password);
    setState({
      user: nextState.user,
      token: nextState.token,
      isReady: true,
    });
  }

  function signOut() {
    const clearedState = clearAuthState();
    storeAuthState(clearedState);
    setState({
      user: null,
      token: null,
      isReady: true,
    });
  }

  const value: AuthContextValue = {
    user: state.user,
    token: state.token,
    isReady: state.isReady,
    login,
    register,
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
