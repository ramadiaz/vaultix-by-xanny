 "use client";

import { ReactNode } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useBackupSync } from "@/features/backup/hooks/use-backup-sync";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type MobileTab = "wallets" | "transactions" | "stats" | "settings";

type MobileShellProps = {
  title: string;
  activeTab: MobileTab;
  children: ReactNode;
};

export function MobileShell({ title, activeTab, children }: MobileShellProps) {
  const { user } = useAuth();
  const { sync, state: syncState } = useBackupSync();
  const isSyncing =
    syncState.status === "syncing" ||
    syncState.status === "listing" ||
    syncState.status === "restoring";

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="relative flex items-center justify-between border-b border-glass-border bg-glass-bg/80 px-4 py-3 backdrop-blur-[var(--glass-blur)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:[background:linear-gradient(90deg,transparent_0%,var(--primary)_50%,transparent_100%)] after:opacity-40 after:content-['']">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-soft">
            Vaultix
          </span>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
        {user && (
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
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
          </Button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto bg-background-soft px-4 py-4">
        {children}
      </main>

      <nav className="relative sticky bottom-0 z-10 border-t border-glass-border bg-glass-bg-strong backdrop-blur-[var(--glass-blur-strong)] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:[background:linear-gradient(90deg,transparent_0%,var(--primary)_30%,var(--success)_70%,transparent_100%)] before:opacity-30 before:content-['']">
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

