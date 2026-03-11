"use client";

import { ReactNode, useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { SyncManager } from "@/features/sync/components/sync-manager";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLoadingScreen } from "@/components/loading/app-loading-screen";

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const { user, isReady, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isReady) {
    return <AppLoadingScreen message="Loading Vaultix" />;
  }

  if (user) {
    return (
      <>
        <SyncManager />
        {children}
      </>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, password);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const msg = axiosErr?.response?.data?.error ?? "Something went wrong";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background-soft px-6">
      <Card className="w-full max-w-xs">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/80">
              Vaultix
            </span>
            <h1 className="text-lg font-semibold text-foreground">
              {mode === "login" ? "Sign in" : "Create account"}
            </h1>
            <p className="mt-1 text-[11px] leading-relaxed text-foreground/80">
              Sign in to keep your wallets, transactions, and backups synced.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="h-10 w-full rounded-2xl border border-glass-border bg-glass-bg px-3 text-sm text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="h-10 w-full rounded-2xl border border-glass-border bg-glass-bg px-3 text-sm text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
            {error && (
              <p className="text-xs text-danger">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "login" ? "register" : "login"));
              setError(null);
            }}
            className="text-xs text-foreground/80 hover:text-foreground"
          >
            {mode === "login"
              ? "Don't have an account? Register"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </Card>
    </div>
  );
}
