"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { AppLoadingScreen } from "@/components/loading/app-loading-screen";

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !user) {
      router.replace("/login");
    }
  }, [isReady, user, router]);

  if (!isReady) {
    return <AppLoadingScreen message="Loading Vaultix" />;
  }

  if (!user) {
    return <AppLoadingScreen message="Redirecting" />;
  }

  return <>{children}</>;
}
