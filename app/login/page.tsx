"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLoadingScreen } from "@/components/loading/app-loading-screen";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";

export default function LoginPage() {
  const router = useRouter();
  const { user, isReady, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  useEffect(() => {
    if (isReady && user) {
      router.replace("/");
    }
  }, [isReady, user, router]);

  if (!isReady) {
    return <AppLoadingScreen message="Loading Vaultix" />;
  }

  if (user) {
    return <AppLoadingScreen message="Redirecting" />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (turnstileSiteKey && !turnstileToken) {
      setError("Please complete the verification");
      return;
    }
    setIsSubmitting(true);
    try {
      await login(username, password, turnstileToken ?? undefined);
      router.replace("/");
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
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/70">
            Vaultix
          </span>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Sign in</h1>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            Sign in to sync your wallets, transactions, and backups
          </p>
        </div>

        <Card className="px-6 py-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="login-username"
                className="text-xs font-medium text-foreground/80"
              >
                Username
              </label>
              <input
                id="login-username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="h-11 w-full rounded-2xl border border-glass-border bg-glass-bg px-4 text-sm text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="login-password"
                className="text-xs font-medium text-foreground/80"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 w-full rounded-2xl border border-glass-border bg-glass-bg px-4 text-sm text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {turnstileSiteKey && (
              <div className="flex justify-center">
                <TurnstileWidget
                  siteKey={turnstileSiteKey}
                  onVerify={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                  theme="dark"
                  size="normal"
                />
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="mt-1 w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-foreground/70">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary-strong"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
