 "use client";

import { ReactNode } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const { user, isReady, signInWithGoogle } = useAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background-soft text-xs text-muted">
        Loading Vaultix
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background-soft px-6">
        <div className="w-full max-w-xs rounded-3xl bg-background px-5 py-6 shadow-sm shadow-black/40">
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

          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-background transition active:scale-[0.98]"
          >
            <span>Continue with Google</span>
          </button>

          <p className="mt-4 text-[10px] leading-relaxed text-muted">
            Vaultix only uses your Google identity and Drive access for backup, sync,
            and restore. You stay in full control of your data.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

