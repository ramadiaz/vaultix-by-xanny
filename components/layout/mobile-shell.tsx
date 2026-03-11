"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useSync } from "@/features/sync/context/sync-provider";
import { useHasPendingSync } from "@/features/sync/hooks/use-has-pending-sync";
import { DesktopSidebar } from "./desktop-sidebar";

type MobileTab = "wallets" | "transactions" | "stats" | "settings";

type MobileShellProps = {
  title: string;
  activeTab: MobileTab;
  children: ReactNode;
  /** Optional action element shown in the desktop top bar */
  desktopAction?: ReactNode;
};

export function MobileShell({ title, activeTab, children, desktopAction }: MobileShellProps) {
  const { user } = useAuth();
  const { sync, state: syncState } = useSync();
  const hasPendingSync = useHasPendingSync();
  const isSyncing = syncState.status === "syncing";

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/*
       * Desktop sidebar — hidden on mobile via CSS inside DesktopSidebar.
       * Always mounted so it doesn't cause layout shift, but invisible < lg.
       */}
      <DesktopSidebar activeTab={activeTab} />

      {/* ── Mobile-only header ── */}
      <header className="relative flex items-center justify-between border-b border-glass-border bg-glass-bg/80 px-4 py-3 backdrop-blur-[var(--glass-blur)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:[background:linear-gradient(90deg,transparent_0%,var(--primary)_50%,transparent_100%)] after:opacity-40 after:content-[''] lg:hidden">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-soft">
            Vaultix
          </span>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
        {user && (
          <div className="relative shrink-0">
            {hasPendingSync && (
              <span
                className="absolute -left-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500"
                aria-hidden
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 shrink-0 p-0"
              onClick={() => sync()}
              disabled={isSyncing}
              aria-label="Sync"
            >
              {isSyncing ? (
                <RefreshCw className="h-5 w-5 animate-[spinner-rotate_0.8s_linear_infinite]" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}
            </Button>
          </div>
        )}
      </header>

      {/* ── Desktop-only top bar ── */}
      <header className="relative hidden items-center justify-between border-b border-glass-border bg-glass-bg/60 px-6 py-3 backdrop-blur-[var(--glass-blur)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:[background:linear-gradient(90deg,transparent_0%,var(--primary)_50%,transparent_100%)] after:opacity-30 after:content-[''] lg:flex lg:pl-[calc(15rem+1.5rem)]">
        <div className="flex flex-col gap-0">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-soft">
            Vaultix
          </span>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
        {desktopAction && <div>{desktopAction}</div>}
      </header>

      {/*
       * ── Main content — rendered ONCE ──
       * On mobile: normal flow below mobile header.
       * On desktop: offset left for sidebar (pl-60), fills remaining height.
       */}
      <main className="flex-1 overflow-y-auto bg-background-soft px-4 py-4 lg:bg-background-soft/50 lg:pl-[calc(15rem+1.5rem)] lg:pr-6 lg:py-5">
        {children}
      </main>

      {/* ── Mobile-only bottom nav ── */}
      <nav className="relative sticky bottom-0 z-10 border-t border-glass-border bg-glass-bg-strong backdrop-blur-[var(--glass-blur-strong)] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:[background:linear-gradient(90deg,transparent_0%,var(--primary)_30%,var(--success)_70%,transparent_100%)] before:opacity-30 before:content-[''] lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between px-6 py-2.5 text-xs">
          <Button
            asChild
            variant={activeTab === "wallets" ? "default" : "ghost"}
            size="sm"
            className="flex-1 rounded-full text-[11px] font-medium"
          >
            <Link href="/">Wallets</Link>
          </Button>
          <Button
            asChild
            variant={activeTab === "transactions" ? "default" : "ghost"}
            size="sm"
            className="flex-1 rounded-full text-[11px] font-medium"
          >
            <Link href="/transactions">Transactions</Link>
          </Button>
          <Button
            asChild
            variant={activeTab === "stats" ? "default" : "ghost"}
            size="sm"
            className="flex-1 rounded-full text-[11px] font-medium"
          >
            <Link href="/stats">Stats</Link>
          </Button>
          <Button
            asChild
            variant={activeTab === "settings" ? "default" : "ghost"}
            size="sm"
            className="flex-1 rounded-full text-[11px] font-medium"
          >
            <Link href="/settings">Settings</Link>
          </Button>
        </div>
      </nav>
    </div>
  );
}
