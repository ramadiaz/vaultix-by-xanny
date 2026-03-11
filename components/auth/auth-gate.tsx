"use client";

import { ReactNode } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLoadingScreen } from "@/components/loading/app-loading-screen";

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const { user, isReady, signInWithGoogle } = useAuth();

  if (!isReady) {
    return <AppLoadingScreen message="Loading Vaultix" />;
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background-soft px-6">
        <Card className="w-full max-w-xs">
          <div className="mb-6 flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-soft">
              Vaultix
            </span>
            <h1 className="text-lg font-semibold text-foreground">
              Sign in to continue
            </h1>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              Use your Google account to keep your wallets, transactions, and backups
              synced across devices.
            </p>
          </div>

          <Button type="button" onClick={signInWithGoogle} className="w-full">
            <span>Continue with Google</span>
          </Button>

          <p className="mt-4 text-[10px] leading-relaxed text-muted">
            Vaultix only uses your Google identity and Drive access for backup, sync,
            and restore. You stay in full control of your data.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

